package com.sjg.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 对话消息（角色 + 内容），结构与 OpenAI 兼容 messages 一致。
 */
@Schema(description = "对话消息")
public record ChatMessage(
        @Schema(description = "角色：system/user/assistant", example = "user") String role,
        @Schema(description = "消息内容", example = "李白与杜甫在山东同游过哪些地方？") String content
) {
}
