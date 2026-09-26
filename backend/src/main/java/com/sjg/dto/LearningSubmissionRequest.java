package com.sjg.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "学习任务提交")
public record LearningSubmissionRequest(
        @Schema(description = "浏览器匿名会话标识", requiredMode = Schema.RequiredMode.REQUIRED)
        String sessionKey,
        @Schema(description = "答案 JSON 对象", requiredMode = Schema.RequiredMode.REQUIRED)
        String answersJson,
        @Schema(description = "当前步骤索引")
        Integer currentStep,
        @Schema(description = "draft 或 submitted")
        String status
) {
}
