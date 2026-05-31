package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("poem_event")
public class PoemEvent {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long poemId;
    private Long eventId;
}
