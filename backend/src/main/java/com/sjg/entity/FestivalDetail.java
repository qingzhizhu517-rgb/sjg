package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@TableName("festival_detail")
@Schema(description = "民俗节庆扩展信息（与 cultural_item 1:1）")
public class FestivalDetail {
    @TableId
    @Schema(description = "关联 cultural_item.id", example = "1")
    private Long itemId;

    @Schema(description = "节庆时间", example = "农历正月初一")
    private String festivalDate;

    @Schema(description = "起源渊源")
    private String origin;

    @Schema(description = "习俗活动")
    private String customs;

    @Schema(description = "节庆饮食")
    private String food;
}
