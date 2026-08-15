package com.sjg.dto;

import com.sjg.entity.CraftDetail;
import com.sjg.entity.CulturalItem;
import com.sjg.entity.FestivalDetail;
import com.sjg.entity.FoodOperaDetail;
import com.sjg.entity.LiteratureDetail;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "文化条目创建/更新请求（公共字段 + 扩展字段一并收发）")
public class CulturalItemRequest {
    @Schema(description = "公共字段", requiredMode = Schema.RequiredMode.REQUIRED)
    private CulturalItem item;

    @Schema(description = "民俗节庆扩展字段（category=festival 时有效）")
    private FestivalDetail festivalDetail;

    @Schema(description = "非遗工艺扩展字段（category=craft 时有效）")
    private CraftDetail craftDetail;

    @Schema(description = "民间文学扩展字段（category=literature 时有效）")
    private LiteratureDetail literatureDetail;

    @Schema(description = "饮食戏曲扩展字段（category=food_opera 时有效）")
    private FoodOperaDetail foodOperaDetail;
}
