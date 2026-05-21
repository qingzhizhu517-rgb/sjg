package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("poet")
@Schema(description = "诗人实体")
public class Poet {
    @TableId(type = IdType.AUTO)
    @Schema(description = "诗人ID", example = "1")
    private Long id;

    @Schema(description = "诗人名称", example = "李白", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @Schema(description = "所属朝代ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long dynastyId;

    @Schema(description = "出生年份", example = "701")
    private Integer birthYear;

    @Schema(description = "逝世年份", example = "762")
    private Integer deathYear;

    @Schema(description = "出生地", example = "碎叶城")
    private String birthplace;

    @Schema(description = "诗人简介", example = "唐代伟大的浪漫主义诗人")
    private String biography;

    @Schema(description = "头像图片URL", example = "https://example.com/avatar.jpg")
    private String avatarUrl;

    @Schema(description = "动漫风格头像URL", example = "https://example.com/avatar-anime.jpg")
    private String avatarAnimeUrl;

    @Schema(description = "诗词风格", example = "豪放派")
    private String style;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
}
