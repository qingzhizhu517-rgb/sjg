package com.sjg.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "修改密码请求")
public class ChangePasswordRequest {

    @Schema(description = "当前密码", example = "oldPass123", requiredMode = Schema.RequiredMode.REQUIRED)
    private String oldPassword;

    @Schema(description = "新密码", example = "newPass123", requiredMode = Schema.RequiredMode.REQUIRED)
    private String newPassword;
}
