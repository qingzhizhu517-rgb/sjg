package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("content_source_link")
public class ContentSourceLink {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String entityType;
    private Long entityId;
    private Long sourceDocumentId;
    private String locator;
    private String quote;
    private String note;
    private LocalDateTime createdAt;
}
