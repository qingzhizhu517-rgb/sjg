package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("source_document")
public class SourceDocument {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String sourceType;
    private String title;
    private String authorOrg;
    private Integer publicationYear;
    private String identifier;
    private String url;
    private String copyrightNote;
    private String citation;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
