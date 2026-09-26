package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("learning_submission")
public class LearningSubmission {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long taskId;
    private String sessionKeyHash;
    private Long userId;
    private String answersJson;
    private Integer currentStep;
    private String status;
    private String aiFeedbackJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
