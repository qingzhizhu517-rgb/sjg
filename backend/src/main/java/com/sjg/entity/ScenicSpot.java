package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("scenic_spot")
public class ScenicSpot {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String description;
    private BigDecimal longitude;
    private BigDecimal latitude;
    private String address;
    private String imageUrl;
    private String imageAnimeUrl;
    private String region;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
