package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.dto.PageResult;
import com.sjg.entity.Poet;
import com.sjg.mapper.PoetMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class PoetService {

    private final PoetMapper poetMapper;

    public PoetService(PoetMapper poetMapper) {
        this.poetMapper = poetMapper;
    }

    public PageResult<Poet> list(int page, int size, String keyword) {
        LambdaQueryWrapper<Poet> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Poet::getName, keyword)
                   .or().like(Poet::getBirthplace, keyword);
        }
        wrapper.orderByDesc(Poet::getId);
        Page<Poet> result = poetMapper.selectPage(new Page<>(page, size), wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    public Poet getById(Long id) {
        return poetMapper.selectById(id);
    }

    public void create(Poet poet) {
        poetMapper.insert(poet);
    }

    public void update(Long id, Poet poet) {
        poet.setId(id);
        poetMapper.updateById(poet);
    }

    public void delete(Long id) {
        poetMapper.deleteById(id);
    }
}
