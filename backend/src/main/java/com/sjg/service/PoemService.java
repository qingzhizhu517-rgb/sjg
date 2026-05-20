package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.dto.PageResult;
import com.sjg.entity.Poem;
import com.sjg.mapper.PoemMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class PoemService {

    private final PoemMapper poemMapper;

    public PoemService(PoemMapper poemMapper) {
        this.poemMapper = poemMapper;
    }

    public PageResult<Poem> list(int page, int size, String keyword) {
        LambdaQueryWrapper<Poem> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Poem::getTitle, keyword)
                   .or().like(Poem::getContent, keyword);
        }
        wrapper.orderByDesc(Poem::getId);
        Page<Poem> result = poemMapper.selectPage(new Page<>(page, size), wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    public Poem getById(Long id) { return poemMapper.selectById(id); }
    public void create(Poem poem) { poemMapper.insert(poem); }
    public void update(Long id, Poem poem) { poem.setId(id); poemMapper.updateById(poem); }
    public void delete(Long id) { poemMapper.deleteById(id); }
}
