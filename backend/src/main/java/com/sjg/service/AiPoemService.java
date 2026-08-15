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
        // 入参校验
        if (!StringUtils.hasText(theme)) {
            throw new IllegalArgumentException("请输入创作主题");
        }
        if (!checkRate(clientKey)) {
            throw new IllegalStateException("创作过于频繁，请稍后再试");
        }

        // 构建prompt
        String prompt = buildPrompt(theme, style, wordCount, dynasty);
        
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
        poem.setTheme(theme);
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
        
        try {
            // 尝试解析JSON
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(response);
            
            if (root.has("title")) {
                result.put("title", root.get("title").asText());
            }
            if (root.has("content")) {
                result.put("content", root.get("content").asText());
            }
        } catch (Exception e) {
            // JSON解析失败，尝试提取内容
            if (response.contains("title") && response.contains("content")) {
                // 简单提取
                String title = extractBetween(response, "\"title\":", ",");
                String content = extractBetween(response, "\"content\":", "}");
                
                if (title != null) {
                    result.put("title", title.trim().replace("\"", ""));
                }
                if (content != null) {
                    result.put("content", content.trim().replace("\"", "").replace("\\n", "\n"));
                }
            }
        }
        
        return result;
    }

    private String extractBetween(String text, String start, String end) {
        int startIndex = text.indexOf(start);
        if (startIndex == -1) return null;
        
        startIndex += start.length();
        int endIndex = text.indexOf(end, startIndex);
        if (endIndex == -1) endIndex = text.length();
        
        return text.substring(startIndex, endIndex);
    }
}
