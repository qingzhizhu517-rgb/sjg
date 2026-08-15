package com.sjg.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.sjg.entity.AiPoem;
import com.sjg.mapper.AiPoemMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiPoemService extends ServiceImpl<AiPoemMapper, AiPoem> {

    private final LlmClient llmClient;

    @Value("${llm.rate-limit.window-seconds:60}") private int windowSeconds;
    @Value("${llm.rate-limit.max-requests:10}") private int maxRequests;

    /** 与 ChatService 同样的内存滑动窗口限流，但计数互相独立 */
    private final Map<String, List<Long>> rateMap = new ConcurrentHashMap<>();

    public AiPoemService(LlmClient llmClient) {
        this.llmClient = llmClient;
    }

    /** 滑动窗口限流：windowSeconds 内同一 key 不超过 maxRequests 次 */
    public boolean checkRate(String key) {
        if (key == null || key.isBlank()) key = "anon";
        long now = System.currentTimeMillis();
        long windowMs = windowSeconds * 1000L;
        List<Long> times = rateMap.computeIfAbsent(key, k -> new ArrayList<>());
        synchronized (times) {
            times.removeIf(t -> now - t > windowMs);
            if (times.size() >= maxRequests) return false;
            times.add(now);
            return true;
        }
    }

    /**
     * 生成AI诗歌
     * @param theme 主题
     * @param style 风格（豪放、婉约等）
     * @param wordCount 字数（五言、七言、不限）
     * @param dynasty 朝代偏好
     * @param clientKey 限流键（调用方传客户端IP）
     * @return 生成的诗歌对象
     */
    public AiPoem generatePoem(String theme, String style, String wordCount, String dynasty, String clientKey) {
        // 入参校验(theme 列 VARCHAR(100), 超长会在落库时报 Data too long)
        String t = theme == null ? "" : theme.trim();
        if (t.isEmpty()) {
            throw new IllegalArgumentException("请输入创作主题");
        }
        if (t.length() > 100) {
            throw new IllegalArgumentException("创作主题过长（最多100字）");
        }
        if (!checkRate(clientKey)) {
            throw new IllegalStateException("创作过于频繁，请稍后再试");
        }

        // 构建prompt
        String prompt = buildPrompt(t, style, wordCount, dynasty);
        
        // 调用LLM生成诗歌
        String response = llmClient.chatSync(prompt);

        // 解析响应
        Map<String, String> poemData = parsePoemResponse(response);
        String content = poemData.getOrDefault("content", "");
        if (!StringUtils.hasText(response) || !StringUtils.hasText(content)) {
            throw new IllegalStateException("AI 服务暂未返回有效内容，请稍后再试");
        }
        
        // 创建实体
        AiPoem poem = new AiPoem();
        poem.setTheme(t);
        poem.setTitle(poemData.getOrDefault("title", "无题"));
        poem.setContent(content);
        poem.setAuthorAlias("AI小文");
        poem.setModel(llmClient.getModel());
        poem.setPrompt(prompt);
        poem.setStatus("generated");
        
        // 保存到数据库
        save(poem);
        
        return poem;
    }

    private String buildPrompt(String theme, String style, String wordCount, String dynasty) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是一位精通中国古典诗词的AI诗人，请根据以下要求创作一首诗：\n\n");
        prompt.append("主题：").append(theme).append("\n");
        
        if (style != null && !style.isEmpty()) {
            prompt.append("风格：").append(style).append("\n");
        }
        if (wordCount != null && !wordCount.isEmpty()) {
            prompt.append("字数要求：").append(wordCount).append("\n");
        }
        if (dynasty != null && !dynasty.isEmpty() && !"不限".equals(dynasty)) {
            prompt.append("朝代偏好：").append(dynasty).append("风格\n");
        }
        
        prompt.append("\n请按以下JSON格式输出：\n");
        prompt.append("{\n");
        prompt.append("  \"title\": \"诗的标题\",\n");
        prompt.append("  \"content\": \"诗的内容（用\\n表示换行）\"\n");
        prompt.append("}\n\n");
        prompt.append("注意：\n");
        prompt.append("1. 诗要符合中国古典诗词的格律和意境\n");
        prompt.append("2. 内容要围绕主题，体现").append(theme).append("的意境\n");
        prompt.append("3. 只输出JSON，不要有其他文字\n");
        
        return prompt.toString();
    }

    private Map<String, String> parsePoemResponse(String response) {
        Map<String, String> result = new HashMap<>();
        result.put("title", "无题");
        result.put("content", "");

        if (response == null) return result;

        // 剥掉 ```json ... ``` 围栏, 截取第一对大括号区间
        String candidate = stripCodeFences(response.trim());

        // 1. 优先整体 JSON 解析
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(candidate);
            if (root.isObject()) {
                if (root.hasNonNull("title")) {
                    result.put("title", root.get("title").asText().trim());
                }
                if (root.hasNonNull("content")) {
                    result.put("content", root.get("content").asText());
                }
            }
        } catch (Exception e) {
            // 2. 兜底: 引号安全正则提取(允许 title 含逗号/转义, content 不再误删引号)
            String title = extractJsonString(candidate, "title");
            String content = extractJsonString(candidate, "content");
            if (title != null) result.put("title", title);
            if (content != null) result.put("content", content);
        }

        if (result.get("title") == null || result.get("title").isBlank()) {
            result.put("title", "无题");
        }
        return result;
    }

    /** 剥离 ```json ... ``` 代码块围栏, 截取首个 { ... } 区间 */
    private String stripCodeFences(String s) {
        if (s == null) return "";
        int start = s.indexOf('{');
        int end = s.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return s.substring(start, end + 1);
        }
        return s;
    }

    /** 引号安全提取 JSON 字符串字段: 支持 \n 等转义, 不误伤值内引号/逗号 */
    private String extractJsonString(String json, String field) {
        Matcher m = Pattern.compile("\"" + field + "\"\\s*:\\s*\"((?:[^\"\\\\]|\\\\.)*)\"")
                .matcher(json);
        if (!m.find()) return null;
        return m.group(1)
                .replace("\\n", "\n")
                .replace("\\t", "\t")
                .replace("\\\"", "\"")
                .replace("\\\\", "\\");
    }
}
