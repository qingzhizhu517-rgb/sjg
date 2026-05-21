package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("user")
@Schema(description = "用户实体")
public class User {
    @TableId(type = IdType.AUTO)
    @Schema(description = "用户ID", example = "1")
    private Long id;

    @Schema(description = "用户名", example = "admin")
    private String username;

    @Schema(description = "密码（BCrypt加密）", accessMode = Schema.AccessMode.WRITE_ONLY)
    private String password;

    @Schema(description = "角色（admin/user）", example = "admin")
    private String role;

    @Schema(description = "状态（pending/approved/rejected/disabled）", example = "approved")
    private String status;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}
