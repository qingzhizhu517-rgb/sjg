package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("poem")
public class Poem {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String content;
    private Long poetId;
    private Long dynastyId;
    private Long spotId;
    private String annotation;
    private String background;
    private String audioUrl;
    private String videoUrl;
    private String sentimentTags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
