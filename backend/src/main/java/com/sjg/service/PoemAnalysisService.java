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
import java.util.Queue;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

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

    /** 批量生成线程池：2 线程，对 LLM 接口保持克制并发 */
    private final ExecutorService batchExecutor = Executors.newFixedThreadPool(2, r -> {
        Thread t = new Thread(r, "poem-analysis-batch");
        t.setDaemon(true);
        return t;
    });

    /** 当前批量任务（进程内单例；重启后丢失，属一次性运维入口） */
    private volatile BatchJob currentJob;

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
        // 1. 查缓存（含防呆：历史 fallback 脏数据视为未命中，允许重新生成）
        PoemAnalysis cached = analysisMapper.selectOne(
                new LambdaQueryWrapper<PoemAnalysis>()
                        .eq(PoemAnalysis::getPoemId, poemId)
                        .last("LIMIT 1"));
        if (cached != null && cached.getVersion() != null
                && cached.getVersion() >= CURRENT_VERSION
                && !isFallbackAnalysis(cached.getAnalysis())) {
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

        // 4. 仅缓存合法赏析；fallback 不落库，避免污染缓存后永久命中脏数据
        if (!isFallbackAnalysis(analysisJson)) {
            saveOrUpdateCache(poemId, analysisJson, cached);
        }

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
                existing.setModel(llm.getModel());
                existing.setVersion(CURRENT_VERSION);
                existing.setGeneratedAt(LocalDateTime.now());
                analysisMapper.updateById(existing);
            } else {
                PoemAnalysis entity = new PoemAnalysis();
                entity.setPoemId(poemId);
                entity.setAnalysis(analysisJson);
                entity.setModel(llm.getModel());
                entity.setVersion(CURRENT_VERSION);
                entity.setGeneratedAt(LocalDateTime.now());
                analysisMapper.insert(entity);
            }
            log.debug("赏析缓存已保存: poemId={}", poemId);
        } catch (Exception e) {
            log.error("保存赏析缓存失败: poemId={}", poemId, e);
        }
    }

    /**
     * 是否为 fallback 兜底 JSON（非法赏析）：含 {@code raw} 字段即为兜底产物。
     * 合法赏析 JSON 只含 lines/sentiment/background/annotations。
     */
    boolean isFallbackAnalysis(String json) {
        if (json == null || json.isBlank()) {
            return true;
        }
        try {
            JsonNode node = objectMapper.readTree(json);
            return node.has("raw");
        } catch (Exception e) {
            return true;
        }
    }

    /**
     * 是否存在「合法且版本最新」的缓存赏析。
     */
    private boolean hasValidCache(Long poemId) {
        PoemAnalysis cached = analysisMapper.selectOne(
                new LambdaQueryWrapper<PoemAnalysis>()
                        .eq(PoemAnalysis::getPoemId, poemId)
                        .last("LIMIT 1"));
        return cached != null && cached.getVersion() != null
                && cached.getVersion() >= CURRENT_VERSION
                && !isFallbackAnalysis(cached.getAnalysis());
    }

    /**
     * 启动批量赏析生成任务（异步，进程内单任务）。
     *
     * @param startId        起始诗 ID（含，null 表示不限制）
     * @param endId          结束诗 ID（含，null 表示不限制）
     * @param skipSuccessful 已有合法缓存的诗是否跳过
     * @return 任务句柄（含 jobId 与总数）
     */
    public synchronized BatchJob startBatch(Long startId, Long endId, boolean skipSuccessful) {
        if (currentJob != null && currentJob.running) {
            throw new IllegalStateException("已有赏析批量任务运行中: jobId=" + currentJob.jobId);
        }

        LambdaQueryWrapper<Poem> qw = new LambdaQueryWrapper<>();
        if (startId != null) {
            qw.ge(Poem::getId, startId);
        }
        if (endId != null) {
            qw.le(Poem::getId, endId);
        }
        qw.orderByAsc(Poem::getId);
        List<Poem> poems = poemMapper.selectList(qw);
        if (poems.isEmpty()) {
            throw new IllegalArgumentException("指定范围内没有诗词");
        }

        BatchJob job = new BatchJob(UUID.randomUUID().toString().substring(0, 8), poems.size());
        currentJob = job;

        batchExecutor.submit(() -> {
            log.info("赏析批量任务启动: jobId={}, total={}", job.jobId, job.total);
            try {
                for (Poem poem : poems) {
                    Long pid = poem.getId();
                    try {
                        if (skipSuccessful && hasValidCache(pid)) {
                            job.skipped.incrementAndGet();
                            continue;
                        }
                        String json = getOrGenerate(pid);
                        if (isFallbackAnalysis(json)) {
                            job.failed.incrementAndGet();
                            job.failedIds.add(pid);
                            log.warn("赏析批量: 生成失败 poemId={}", pid);
                        } else {
                            job.success.incrementAndGet();
                        }
                    } catch (Exception e) {
                        job.failed.incrementAndGet();
                        job.failedIds.add(pid);
                        log.error("赏析批量: 异常 poemId={}", pid, e);
                    } finally {
                        job.done.incrementAndGet();
                    }
                }
            } finally {
                job.running = false;
                job.finishedAt = LocalDateTime.now();
                log.info("赏析批量任务结束: jobId={}, success={}, skipped={}, failed={}",
                        job.jobId, job.success.get(), job.skipped.get(), job.failed.get());
            }
        });
        return job;
    }

    /** 当前批量任务状态（无任务时返回 null） */
    public BatchJob getBatchJob() {
        return currentJob;
    }

    /**
     * 批量赏析任务状态对象（可直接 JSON 序列化返回前端）。
     */
    public static class BatchJob {
        public final String jobId;
        public final long total;
        public final LocalDateTime startedAt = LocalDateTime.now();
        public volatile boolean running = true;
        public volatile LocalDateTime finishedAt;
        public final AtomicInteger done = new AtomicInteger();
        public final AtomicInteger success = new AtomicInteger();
        public final AtomicInteger skipped = new AtomicInteger();
        public final AtomicInteger failed = new AtomicInteger();
        public final Queue<Long> failedIds = new ConcurrentLinkedQueue<>();

        BatchJob(String jobId, long total) {
            this.jobId = jobId;
            this.total = total;
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
