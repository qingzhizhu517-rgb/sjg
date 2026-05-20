package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.dto.PageResult;
import com.sjg.entity.ScenicSpot;
import com.sjg.mapper.ScenicSpotMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class SpotService {

    private final ScenicSpotMapper spotMapper;

    public SpotService(ScenicSpotMapper spotMapper) {
        this.spotMapper = spotMapper;
    }

    public PageResult<ScenicSpot> list(int page, int size, String keyword, String region) {
        LambdaQueryWrapper<ScenicSpot> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(ScenicSpot::getName, keyword)
                   .or().like(ScenicSpot::getAddress, keyword);
        }
        if (StringUtils.hasText(region)) {
            wrapper.eq(ScenicSpot::getRegion, region);
        }
        wrapper.orderByDesc(ScenicSpot::getId);
        Page<ScenicSpot> result = spotMapper.selectPage(new Page<>(page, size), wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    public ScenicSpot getById(Long id) { return spotMapper.selectById(id); }
    public void create(ScenicSpot spot) { spotMapper.insert(spot); }
    public void update(Long id, ScenicSpot spot) { spot.setId(id); spotMapper.updateById(spot); }
    public void delete(Long id) { spotMapper.deleteById(id); }
}
