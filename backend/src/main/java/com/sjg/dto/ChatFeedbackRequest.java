package com.sjg.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** AI 回复反馈请求。 */
@Schema(description = "AI回复反馈")
public record ChatFeedbackRequest(
        @Schema(description = "对应的AI审计记录ID", requiredMode = Schema.RequiredMode.REQUIRED)
        Long auditId,
        @Schema(description = "反馈类型：helpful/unhelpful/factual_error", requiredMode = Schema.RequiredMode.REQUIRED)
        String feedback,
        @Schema(description = "补充说明")
        String comment
) {
}
