package com.sjg.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.sjg.entity.AiPoem;
import com.sjg.mapper.AiPoemMapper;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AiPoemService extends ServiceImpl<AiPoemMapper, AiPoem> {

    private final LlmClient llmClient;

    public AiPoemService(LlmClient llmClient) {
        this.llmClient = llmClient;
    }

    /**
     * 生成AI诗歌
     * @param theme 主题
     * @param style 风格（豪放、婉约等）
     * @param wordCount 字数（五言、七言、不限）
     * @param dynasty 朝代偏好
     * @return 生成的诗歌对象
     */
    public AiPoem generatePoem(String theme, String style, String wordCount, String dynasty) {
        // 构建prompt
        String prompt = buildPrompt(theme, style, wordCount, dynasty);
        
        // 调用LLM生成诗歌
        String response = llmClient.chatSync(prompt);
        
        // 解析响应
        Map<String, String> poemData = parsePoemResponse(response);
        
        // 创建实体
        AiPoem poem = new AiPoem();
        poem.setTheme(theme);
        poem.setTitle(poemData.getOrDefault("title", "无题"));
        poem.setContent(poemData.getOrDefault("content", ""));
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
