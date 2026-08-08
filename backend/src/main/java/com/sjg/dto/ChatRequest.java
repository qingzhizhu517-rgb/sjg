package com.sjg.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.Map;

/**
 * AI 小文对话请求。
 *
 * @param message 当前用户提问
 * @param history 之前的对话历史（不含本次 message），用于多轮上下文
 * @param context 前端页面上下文（城市/诗人/诗词等）
 */
@Schema(description = "AI对话请求")
public record ChatRequest(
        @Schema(description = "当前用户提问", example = "李白与杜甫在山东同游过哪些地方？", requiredMode = Schema.RequiredMode.REQUIRED) String message,
        @Schema(description = "历史对话（不含本次提问）") List<ChatMessage> history,
        @Schema(description = "前端页面上下文") Map<String, String> context
) {
}
