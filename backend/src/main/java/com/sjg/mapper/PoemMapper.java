package com.sjg.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.sjg.entity.Poem;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PoemMapper extends BaseMapper<Poem> {
}
