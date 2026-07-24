package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("poem_analysis")
@Schema(description = "诗词AI赏析实体")
public class PoemAnalysis {
    @TableId(type = IdType.AUTO)
    @Schema(description = "赏析ID", example = "1")
    private Long id;

    @Schema(description = "诗词ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long poemId;

    @Schema(description = "结构化赏析JSON", requiredMode = Schema.RequiredMode.REQUIRED)
    private String analysis;

    @Schema(description = "生成模型", example = "deepseek-chat")
    private String model;

    @Schema(description = "生成时间")
    private LocalDateTime generatedAt;

    @Schema(description = "赏析版本", example = "1")
    private Integer version;
}
