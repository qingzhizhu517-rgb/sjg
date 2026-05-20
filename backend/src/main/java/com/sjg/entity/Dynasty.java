package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("dynasty")
public class Dynasty {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private Integer startYear;
    private Integer endYear;
    private String description;
}
