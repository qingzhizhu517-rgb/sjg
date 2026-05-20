package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("poet")
public class Poet {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private Long dynastyId;
    private Integer birthYear;
    private Integer deathYear;
    private String birthplace;
    private String biography;
    private String avatarUrl;
    private String avatarAnimeUrl;
    private String style;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
