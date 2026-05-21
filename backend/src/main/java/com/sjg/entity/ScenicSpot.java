package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("scenic_spot")
@Schema(description = "景点实体")
public class ScenicSpot {
    @TableId(type = IdType.AUTO)
    @Schema(description = "景点ID", example = "1")
    private Long id;

    @Schema(description = "景点名称", example = "泰山", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @Schema(description = "景点描述", example = "五岳之首，位于山东省泰安市")
    private String description;

    @Schema(description = "经度", example = "117.129")
    private BigDecimal longitude;

    @Schema(description = "纬度", example = "36.254")
    private BigDecimal latitude;

    @Schema(description = "详细地址", example = "山东省泰安市泰山区")
    private String address;

    @Schema(description = "景点图片URL", example = "https://example.com/taishan.jpg")
    private String imageUrl;

    @Schema(description = "动漫风格图片URL", example = "https://example.com/taishan-anime.jpg")
    private String imageAnimeUrl;

    @Schema(description = "所属区域", example = "泰安")
    private String region;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
}
