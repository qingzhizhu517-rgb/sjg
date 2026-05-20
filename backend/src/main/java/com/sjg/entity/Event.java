package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("event")
public class Event {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String description;
    private Long dynastyId;
    private Integer year;
    private String significance;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
