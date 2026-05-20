package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.dto.PageResult;
import com.sjg.entity.Event;
import com.sjg.mapper.EventMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class EventService {

    private final EventMapper eventMapper;

    public EventService(EventMapper eventMapper) {
        this.eventMapper = eventMapper;
    }

    public PageResult<Event> list(int page, int size, String keyword) {
        LambdaQueryWrapper<Event> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Event::getTitle, keyword)
                   .or().like(Event::getDescription, keyword);
        }
        wrapper.orderByDesc(Event::getId);
        Page<Event> result = eventMapper.selectPage(new Page<>(page, size), wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    public Event getById(Long id) { return eventMapper.selectById(id); }
    public void create(Event event) { eventMapper.insert(event); }
    public void update(Long id, Event event) { event.setId(id); eventMapper.updateById(event); }
    public void delete(Long id) { eventMapper.deleteById(id); }
}
