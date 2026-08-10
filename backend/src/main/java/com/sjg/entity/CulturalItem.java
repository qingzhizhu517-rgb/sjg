package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("cultural_item")
@Schema(description = "文化条目实体（民俗节庆/非遗工艺/民间文学/饮食戏曲公共表）")
public class CulturalItem {
    @TableId(type = IdType.AUTO)
    @Schema(description = "条目ID", example = "1")
    private Long id;

    @Schema(description = "类别", example = "festival", requiredMode = Schema.RequiredMode.REQUIRED)
    private String category;

    @Schema(description = "名称", example = "春节", requiredMode = Schema.RequiredMode.REQUIRED)
    private String title;

    @Schema(description = "一句话简介（卡片用）")
    private String summary;

    @Schema(description = "详细介绍正文")
    private String content;

    @Schema(description = "所属区域（沿黄九市，NULL=全域性内容）", example = "济南")
    private String region;

    @Schema(description = "实景图URL")
    private String imageUrl;

    @Schema(description = "水墨风图URL")
    private String imageAnimeUrl;

    @Schema(description = "标签数组（JSON 字符串）", example = "[\"传统节庆\",\"全域\"]")
    private String tags;

    @Schema(description = "排序权重", example = "0")
    private Integer sortOrder;

    @Schema(description = "状态：draft草稿/published已发布", example = "draft")
    private String status;

    @Schema(description = "来源：ai生成/manual人工", example = "ai")
    private String source;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
}
