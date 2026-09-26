package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("learning_task")
public class LearningTask {
    public static final String DRAFT = "draft";
    public static final String PUBLISHED = "published";
    public static final String ARCHIVED = "archived";

    @TableId(type = IdType.AUTO)
    private Long id;
    private String taskCode;
    private String title;
    private String city;
    private String goal;
    private String background;
    private String contentJson;
    private String exportTemplate;
    private String status;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
