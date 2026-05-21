package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@TableName("dynasty")
@Schema(description = "朝代实体")
public class Dynasty {
    @TableId(type = IdType.AUTO)
    @Schema(description = "朝代ID", example = "1")
    private Long id;

    @Schema(description = "朝代名称", example = "唐朝")
    private String name;

    @Schema(description = "起始年份", example = "618")
    private Integer startYear;

    @Schema(description = "结束年份", example = "907")
    private Integer endYear;

    @Schema(description = "朝代描述", example = "中国历史上最繁荣的朝代之一")
    private String description;
}
