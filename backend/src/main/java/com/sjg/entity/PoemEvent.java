package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("poem_event")
public class PoemEvent {
    private Long poemId;
    private Long eventId;
}
