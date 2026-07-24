package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 诗人关系图谱(路线图 #7): 诗人-诗人关系(师承/交游/并称/亲属)。
 * source=seed 人工录入关键关系; source=derived 派生(Phase2, 同朝代/同景点/同籍贯)。
 * poet_a_id 恒取较小 id, poet_b_id 较大, 配合 UNIQUE(poet_a_id,poet_b_id,relation_type) 去重。
 */
@Data
@TableName("poet_relation")
@Schema(description = "诗人关系实体")
public class PoetRelation {
    @TableId(type = IdType.AUTO)
    @Schema(description = "关系ID", example = "1")
    private Long id;

    @Schema(description = "诗人A ID(较小id保序)", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long poetAId;

    @Schema(description = "诗人B ID(较大id保序)", example = "6", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long poetBId;

    @Schema(description = "关系类型: 师承/交游/并称/亲属", example = "并称", requiredMode = Schema.RequiredMode.REQUIRED)
    private String relationType;

    @Schema(description = "关系说明(文化味)", example = "李杜齐鲁相会")
    private String description;

    @Schema(description = "来源: seed=人工录入, derived=派生", example = "seed")
    private String source;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}
