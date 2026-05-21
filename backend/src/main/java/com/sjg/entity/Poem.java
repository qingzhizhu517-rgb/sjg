package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("poem")
@Schema(description = "诗词实体")
public class Poem {
    @TableId(type = IdType.AUTO)
    @Schema(description = "诗词ID", example = "1")
    private Long id;

    @Schema(description = "诗词标题", example = "静夜思", requiredMode = Schema.RequiredMode.REQUIRED)
    private String title;

    @Schema(description = "诗词内容", example = "床前明月光，疑是地上霜。举头望明月，低头思故乡。", requiredMode = Schema.RequiredMode.REQUIRED)
    private String content;

    @Schema(description = "作者ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long poetId;

    @Schema(description = "所属朝代ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long dynastyId;

    @Schema(description = "关联景点ID", example = "1")
    private Long spotId;

    @Schema(description = "诗词注释", example = "明亮的月光洒在窗户纸上...")
    private String annotation;

    @Schema(description = "创作背景", example = "李白在旅途中思念故乡所作")
    private String background;

    @Schema(description = "音频朗诵URL", example = "https://example.com/audio.mp3")
    private String audioUrl;

    @Schema(description = "视频URL", example = "https://example.com/video.mp4")
    private String videoUrl;

    @Schema(description = "情感标签", example = "思乡,孤独")
    private String sentimentTags;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
}
