package com.sjg.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@Schema(description = "重置密码请求（管理员）")
public class ResetPasswordRequest {

    @Schema(description = "新密码", example = "newPass123", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank @Size(max = 100)
    private String newPassword;
}
