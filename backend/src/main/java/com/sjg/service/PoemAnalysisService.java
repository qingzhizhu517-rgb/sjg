package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sjg.dto.ChatMessage;
import com.sjg.entity.Poem;
import com.sjg.entity.PoemAnalysis;
import com.sjg.mapper.PoemAnalysisMapper;
import com.sjg.mapper.PoemMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * 诗词 AI 赏析服务：缓存 + LLM 生成。
 * <p>
 * 核心流程：{@link #getOrGenerate(Long)} 查缓存 → 版本匹配则直接返回；
 * 否则调 LLM 生成、存缓存、返回。
 */
@Service
public class PoemAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(PoemAnalysisService.class);

    /** 赏析版本号；修改 prompt 或输出格式时递增以使旧缓存失效 */
    static final int CURRENT_VERSION = 1;

    private static final String ANALYSIS_PROMPT = """
            请对以下诗词进行结构化赏析，以JSON格式返回（不要输出其他内容，只输出纯JSON）：
            {
              "lines": [{"line": "诗句", "解读": "解读内容"}],
              "sentiment": "情感分析",
              "background": "创作背景",
              "annotations": [{"word": "字词", "meaning": "释义"}]
            }

            诗词：
            %s
            %s
            """;

    /** JSON 解析兜底：当 LLM 返回非法 JSON 时使用 */
    private static final String FALLBACK_TEMPLATE = """
            {"lines":[],"sentiment":"暂无分析","background":"暂无背景","annotations":[],"raw":"%s"}""";

    private final PoemAnalysisMapper analysisMapper;
    private final PoemMapper poemMapper;
    private final LlmClient llm;
    private final ObjectMapper objectMapper;
    private final ExecutorService executor = Executors.newCachedThreadPool();

    public PoemAnalysisService(PoemAnalysisMapper analysisMapper,
                               PoemMapper poemMapper,
                               LlmClient llm,
                               ObjectMapper objectMapper) {
        this.analysisMapper = analysisMapper;
        this.poemMapper = poemMapper;
        this.llm = llm;
        this.objectMapper = objectMapper;
    }

    /**
     * 获取诗词赏析：优先走缓存，缓存未命中或版本过期则调 LLM 生成。
     *
     * @param poemId 诗词 ID
     * @return 结构化赏析 JSON 字符串，失败时返回 fallback JSON
     */
    public String getOrGenerate(Long poemId) {
        // 1. 查缓存
        PoemAnalysis cached = analysisMapper.selectOne(
                new LambdaQueryWrapper<PoemAnalysis>()
                        .eq(PoemAnalysis::getPoemId, poemId)
                        .last("LIMIT 1"));
        if (cached != null && cached.getVersion() != null
                && cached.getVersion() >= CURRENT_VERSION) {
            log.debug("赏析缓存命中: poemId={}, version={}", poemId, cached.getVersion());
            return cached.getAnalysis();
        }

        // 2. 查诗词
        Poem poem = poemMapper.selectById(poemId);
        if (poem == null) {
            log.warn("诗词不存在: poemId={}", poemId);
            return fallbackJson("诗词不存在");
        }

        // 3. 调 LLM 生成
        String analysisJson = generate(poem);

        // 4. 存缓存（复用已查询的 cached 实体，避免重复查库）
        saveOrUpdateCache(poemId, analysisJson, cached);

        return analysisJson;
    }

    /**
     * 调用 LLM 生成诗词赏析。
     * 拼接 prompt → streamChat 收集全部 delta → 解析 JSON。
     *
     * @param poem 诗词实体
     * @return 结构化赏析 JSON 字符串
     */
    String generate(Poem poem) {
        String prompt = String.format(ANALYSIS_PROMPT,
                poem.getTitle() != null ? poem.getTitle() : "",
                poem.getContent() != null ? poem.getContent() : "");

        List<ChatMessage> messages = List.of(
                new ChatMessage("system", "你是一位古典诗词赏析专家，擅长逐句解读、情感分析、创作背景介绍和字词注解。请严格按照要求的JSON格式输出。"),
                new ChatMessage("user", prompt));

        // streamChat 是同步阻塞的（在调用线程上依次回调），但为了超时保护用 CompletableFuture
        CompletableFuture<String> future = new CompletableFuture<>();
        StringBuilder sb = new StringBuilder();

        executor.submit(() -> {
            try {
                llm.streamChat(messages,
                        delta -> sb.append(delta),
                        error -> {
                            log.error("LLM 调用失败: poemId={}, error={}", poem.getId(), error);
                            future.completeExceptionally(new RuntimeException(error));
                        });
                if (!future.isDone()) {
                    future.complete(sb.toString());
                }
            } catch (Exception e) {
                if (!future.isDone()) {
                    future.completeExceptionally(e);
                }
            }
        });

        try {
            String raw = future.get(120, TimeUnit.SECONDS);
            return parseOrFallback(raw);
        } catch (Exception e) {
            log.error("赏析生成超时或异常: poemId={}", poem.getId(), e);
            return fallbackJson("生成失败: " + e.getMessage());
        }
    }

    /**
     * 尝试从 LLM 原始输出中提取合法 JSON；失败则返回 fallback。
     */
    String parseOrFallback(String raw) {
        if (raw == null || raw.isBlank()) {
            return fallbackJson("LLM 返回为空");
        }
        // 先尝试直接解析
        String trimmed = raw.trim();
        if (isValidAnalysisJson(trimmed)) {
            return trimmed;
        }
        // 尝试提取 ```json ... ``` 代码块
        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) {
            String candidate = trimmed.substring(start, end + 1);
            if (isValidAnalysisJson(candidate)) {
                return candidate;
            }
        }
        log.warn("LLM 返回非合法赏析 JSON，使用 fallback。raw={}", truncate(trimmed, 200));
        return fallbackJson(trimmed);
    }

    /**
     * 校验是否为合法的赏析 JSON（必须包含 lines / sentiment / background 字段）。
     */
    private boolean isValidAnalysisJson(String json) {
        try {
            JsonNode node = objectMapper.readTree(json);
            return node.has("lines") && node.has("sentiment") && node.has("background");
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 保存或更新缓存。
     *
     * @param poemId       诗词 ID
     * @param analysisJson 赏析 JSON
     * @param existing     已查询到的旧缓存（可能为 null，表示首次生成）
     */
    private void saveOrUpdateCache(Long poemId, String analysisJson, PoemAnalysis existing) {
        try {
            if (existing != null) {
                existing.setAnalysis(analysisJson);
                existing.setModel(llm.isConfigured() ? "llm" : "fallback");
                existing.setVersion(CURRENT_VERSION);
                existing.setGeneratedAt(LocalDateTime.now());
                analysisMapper.updateById(existing);
            } else {
                PoemAnalysis entity = new PoemAnalysis();
                entity.setPoemId(poemId);
                entity.setAnalysis(analysisJson);
                entity.setModel(llm.isConfigured() ? "llm" : "fallback");
                entity.setVersion(CURRENT_VERSION);
                entity.setGeneratedAt(LocalDateTime.now());
                analysisMapper.insert(entity);
            }
            log.debug("赏析缓存已保存: poemId={}", poemId);
        } catch (Exception e) {
            log.error("保存赏析缓存失败: poemId={}", poemId, e);
        }
    }

    static String fallbackJson(String detail) {
        String escaped = detail.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");
        return String.format(FALLBACK_TEMPLATE, escaped);
    }

    private String truncate(String s, int n) {
        return s == null ? "" : (s.length() > n ? s.substring(0, n) + "..." : s);
    }
}
