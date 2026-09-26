package com.sjg.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "学习任务反思反馈请求")
public record LearningFeedbackRequest(
        @Schema(description = "任务正文中的题目 ID", requiredMode = Schema.RequiredMode.REQUIRED) String questionId,
        @Schema(description = "兼容字段，服务端以 questionId 对应的任务正文为准") String question,
        @Schema(description = "学生回答", requiredMode = Schema.RequiredMode.REQUIRED) String answer,
        @Schema(description = "任务要求引用的证据") String evidence
) {
    /** 兼容旧的三字段 Java 调用方；公开接口仍要求 questionId。 */
    public LearningFeedbackRequest(String question, String answer, String evidence) {
        this(null, question, answer, evidence);
    }
}
