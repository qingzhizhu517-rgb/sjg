package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("content_review")
public class ContentReview {
    public static final String DRAFT = "draft";
    public static final String NEEDS_REVIEW = "needs_review";
    public static final String APPROVED = "approved";
    public static final String PUBLISHED = "published";
    public static final String ARCHIVED = "archived";

    @TableId(type = IdType.AUTO)
    private Long id;
    private String entityType;
    private Long entityId;
    private String status;
    private Long reviewerId;
    private LocalDateTime reviewedAt;
    private String reviewNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
