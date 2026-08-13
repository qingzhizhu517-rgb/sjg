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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * AI 小文对话编排：拼系统提示 + RAG 上下文 + 历史 → 调 LlmClient 流式 → SseEmitter 推送。
 * 含简单的 IP 级滑动窗口限流（v1，内存实现）。
 */
@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

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
                String sys = buildSystemPrompt(ragCtx);

                // 注入前端页面上下文
                String contextHint = buildContextHint(req.context());
                if (!contextHint.isEmpty()) {
                    sys = sys + "\n\n" + contextHint;
                }

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

    /**
     * 构建最终系统提示：把检索资料填入 {@code {rag_context}} 占位符。
     * 若配置中缺失占位符（如被人误删），兜底把资料追加到末尾并告警，
     * 避免 RAG 上下文静默失效。
     */
    String buildSystemPrompt(String ragContext) {
        String ragBlock = (ragContext == null || ragContext.isEmpty()) ? "（无相关资料）" : ragContext;
        String sys = systemPrompt;
        if (sys != null && sys.contains("{rag_context}")) {
            return sys.replace("{rag_context}", ragBlock);
        }
        log.warn("llm.system-prompt 缺少 {rag_context} 占位符，检索资料将追加到末尾以保证 RAG 生效");
        return (sys == null ? "" : sys) + "\n\n检索资料：\n" + ragBlock;
    }

    /**
     * 根据前端上下文生成提示语，注入到 system prompt 末尾。
     */
    private String buildContextHint(Map<String, String> context) {
        if (context == null || context.isEmpty()) return "";
        String type = context.getOrDefault("type", "");
        return switch (type) {
            case "city" -> "【上下文】用户正在浏览「" + context.getOrDefault("city", "") + "」城市页面，请优先回答与该城市相关的问题。";
            case "poet" -> "【上下文】用户正在查看一位诗人的详情页，请优先回答与该诗人相关的问题。";
            case "poem" -> "【上下文】用户正在查看一首诗词的详情页，请优先回答与该诗词及其作者相关的问题。";
            case "spot" -> "【上下文】用户正在查看一处文学景观的详情页，请优先回答与该景观相关的问题。";
            case "timeline" -> "【上下文】用户正在浏览朝代时间线页面，请优先回答与朝代、历史时期相关的问题。";
            case "poets" -> "【上下文】用户正在浏览诗人列表页面，请优先回答与齐鲁名士相关的问题。";
            default -> "";
        };
    }
}
