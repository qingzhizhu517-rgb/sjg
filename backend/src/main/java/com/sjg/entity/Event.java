package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("event")
@Schema(description = "历史事件实体")
public class Event {
    @TableId(type = IdType.AUTO)
    @Schema(description = "事件ID", example = "1")
    private Long id;

    @Schema(description = "事件标题", example = "安史之乱", requiredMode = Schema.RequiredMode.REQUIRED)
    private String title;

    @Schema(description = "事件描述", example = "唐朝由盛转衰的转折点")
    private String description;

    @Schema(description = "所属朝代ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long dynastyId;

    @Schema(description = "发生年份", example = "755")
    private Integer year;

    @Schema(description = "历史意义", example = "标志着唐朝由盛转衰")
    private String significance;

    @Schema(description = "相关图片URL", example = "https://example.com/event.jpg")
    private String imageUrl;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
}
