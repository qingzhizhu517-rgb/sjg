package com.sjg.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.sjg.entity.Event;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface EventMapper extends BaseMapper<Event> {
}
