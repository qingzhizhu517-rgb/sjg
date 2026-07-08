package com.sjg.service;

import com.sjg.dto.ChatMessage;
import com.sjg.dto.ChatRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * AI 小文对话编排：拼系统提示 + RAG 上下文 + 历史 → 调 LlmClient 流式 → SseEmitter 推送。
 * 含简单的 IP 级滑动窗口限流（v1，内存实现）。
 */
@Service
public class ChatService {

    private final LlmClient llm;
    private final RagRetrievalService rag;

    @Value("${llm.system-prompt}") private String systemPrompt;
    @Value("${llm.timeout-seconds:60}") private int timeoutSeconds;
    @Value("${llm.rate-limit.window-seconds:60}") private int windowSeconds;
    @Value("${llm.rate-limit.max-requests:10}") private int maxRequests;

    private final ExecutorService executor = Executors.newCachedThreadPool();
    /** v1：内存限流，key→时间戳列表。map 不自动清理，长期可换 Caffeine/Redis。 */
    private final Map<String, List<Long>> rateMap = new ConcurrentHashMap<>();

    public ChatService(LlmClient llm, RagRetrievalService rag) {
        this.llm = llm;
        this.rag = rag;
    }

    /**
     * 流式对话，返回 SseEmitter。事件 data 为 {"delta":"..."} 或 {"error":"..."}。
     */
    public SseEmitter stream(ChatRequest req, String clientKey) {
        SseEmitter emitter = new SseEmitter((long) timeoutSeconds * 1000 + 5000);

        // 1. 未配置
        if (!llm.isConfigured()) {
            executor.submit(() -> sendOnce(emitter, Map.of("error", "AI 服务尚未配置（缺少 LLM_API_KEY 等），请联系管理员。")));
            return emitter;
        }
        // 2. 限流
        if (!checkRate(clientKey)) {
            executor.submit(() -> sendOnce(emitter, Map.of("error", "提问过于频繁，请稍后再试。")));
            return emitter;
        }
        // 3. 校验入参
        if (req == null || !StringUtils.hasText(req.message())) {
            executor.submit(() -> sendOnce(emitter, Map.of("error", "请输入问题。")));
            return emitter;
        }

        executor.submit(() -> {
            try {
                String ragCtx = rag.retrieve(req.message());
                String sys = systemPrompt.replace("{rag_context}",
                        ragCtx.isEmpty() ? "（无相关资料）" : ragCtx);

                List<ChatMessage> messages = new ArrayList<>();
                messages.add(new ChatMessage("system", sys));
                if (req.history() != null) {
                    for (ChatMessage m : req.history()) {
                        if (m != null && m.role() != null && m.content() != null) {
                            messages.add(m);
                        }
                    }
                }
                messages.add(new ChatMessage("user", req.message()));

                llm.streamChat(messages,
                        delta -> sendEvent(emitter, Map.of("delta", delta)),
                        err -> sendEvent(emitter, Map.of("error", err)));
                emitter.complete();
            } catch (Exception e) {
                sendEvent(emitter, Map.of("error", "生成失败：" + e.getMessage()));
                emitter.complete();
            }
        });
        return emitter;
    }

    private void sendEvent(SseEmitter emitter, Map<String, String> payload) {
        try {
            emitter.send(SseEmitter.event().data(payload));
        } catch (Exception ignore) {
            // 客户端可能已断开，忽略
        }
    }

    private void sendOnce(SseEmitter emitter, Map<String, String> payload) {
        try {
            emitter.send(SseEmitter.event().data(payload));
            emitter.complete();
        } catch (Exception ignore) {
        }
    }

    /** 滑动窗口限流：windowSeconds 内同一 key 不超过 maxRequests 次 */
    private boolean checkRate(String key) {
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
}
