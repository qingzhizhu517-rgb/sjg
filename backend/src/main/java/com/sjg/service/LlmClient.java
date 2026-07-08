package com.sjg.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.sjg.dto.ChatMessage;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.function.Consumer;

/**
 * OpenAI 兼容大模型客户端（SSE 流式）。
 * 用 Java 11+ 内置 HttpClient，无需新增依赖。
 * 适用于 DeepSeek / 通义 / 智谱 / 月之暗面 / 豆包 等 OpenAI 兼容 endpoint。
 */
@Service
public class LlmClient {

    @Value("${llm.base-url}") private String baseUrl;
    @Value("${llm.api-key:}") private String apiKey;
    @Value("${llm.model}") private String model;
    @Value("${llm.temperature:0.6}") private double temperature;
    @Value("${llm.max-tokens:1024}") private int maxTokens;
    @Value("${llm.timeout-seconds:60}") private int timeoutSeconds;

    private final ObjectMapper mapper = new ObjectMapper();
    private HttpClient http;

    @PostConstruct
    public void init() {
        this.http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    /** 是否已配置可用（apiKey 非空） */
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank()
                && baseUrl != null && !baseUrl.isBlank();
    }

    /**
     * 流式对话。
     *
     * @param messages 完整消息序列（含 system / history / user）
     * @param onDelta  每收到一段文本增量时回调
     * @param onError  出错时回调（含 HTTP 非 200、网络异常等）
     */
    public void streamChat(List<ChatMessage> messages,
                           Consumer<String> onDelta,
                           Consumer<String> onError) {
        if (!isConfigured()) {
            onError.accept("AI 服务未配置（缺少 LLM_API_KEY / LLM_BASE_URL）");
            return;
        }
        try {
            ObjectNode body = mapper.createObjectNode();
            body.put("model", model);
            body.put("stream", true);
            body.put("temperature", temperature);
            body.put("max_tokens", maxTokens);
            ArrayNode arr = body.putArray("messages");
            for (ChatMessage m : messages) {
                if (m == null || m.role() == null || m.content() == null) continue;
                ObjectNode mo = arr.addObject();
                mo.put("role", m.role());
                mo.put("content", m.content());
            }

            String url = baseUrl.replaceAll("/+$", "");
            // 容错：若 base-url 已含完整路径则不再追加，避免 /chat/completions/chat/completions
            if (!url.endsWith("/chat/completions")) {
                url = url + "/chat/completions";
            }
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .header("Content-Type", "application/json")
                    .header("Accept", "text/event-stream")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
                    .build();

            HttpResponse<InputStream> resp = http.send(req, HttpResponse.BodyHandlers.ofInputStream());
            int code = resp.statusCode();
            if (code != 200) {
                String errText;
                try (InputStream is = resp.body()) {
                    byte[] b = is.readAllBytes();
                    errText = new String(b, StandardCharsets.UTF_8);
                }
                onError.accept("大模型接口返回 " + code + " [URL=" + url + "]：" + truncate(errText, 300));
                return;
            }

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resp.body(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (!line.startsWith("data:")) continue;
                    String data = line.substring(5).trim();
                    if (data.isEmpty() || "[DONE]".equals(data)) continue;
                    try {
                        JsonNode node = mapper.readTree(data);
                        JsonNode delta = node.path("choices").path(0).path("delta").path("content");
                        if (!delta.isMissingNode() && !delta.isNull()) {
                            String text = delta.asText();
                            if (text != null && !text.isEmpty()) onDelta.accept(text);
                        }
                    } catch (Exception parseEx) {
                        // 跳过格式异常的单个 chunk，不影响后续
                    }
                }
            }
        } catch (Exception e) {
            onError.accept("调用大模型失败：" + e.getMessage());
        }
    }

    private String truncate(String s, int n) {
        return s == null ? "" : (s.length() > n ? s.substring(0, n) + "…" : s);
    }
}
