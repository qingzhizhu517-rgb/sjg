package com.sjg.dto;

import com.sjg.entity.CulturalItem;
import com.sjg.entity.FestivalDetail;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "文化条目创建/更新请求（公共字段 + 扩展字段一并收发）")
public class CulturalItemRequest {
    @Schema(description = "公共字段", requiredMode = Schema.RequiredMode.REQUIRED)
    private CulturalItem item;

    @Schema(description = "民俗节庆扩展字段（category=festival 时有效）")
    private FestivalDetail festivalDetail;
}
