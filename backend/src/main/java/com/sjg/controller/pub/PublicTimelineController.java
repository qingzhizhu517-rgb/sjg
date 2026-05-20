package com.sjg.controller.pub;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.entity.*;
import com.sjg.mapper.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/timeline")
public class PublicTimelineController {

    private final DynastyMapper dynastyMapper;
    private final EventMapper eventMapper;
    private final PoetMapper poetMapper;
    private final PoemMapper poemMapper;

    public PublicTimelineController(DynastyMapper dynastyMapper, EventMapper eventMapper,
                                     PoetMapper poetMapper, PoemMapper poemMapper) {
        this.dynastyMapper = dynastyMapper;
        this.eventMapper = eventMapper;
        this.poetMapper = poetMapper;
        this.poemMapper = poemMapper;
    }

    @GetMapping
    public ResponseEntity<?> getTimeline() {
        List<Dynasty> dynasties = dynastyMapper.selectList(
            new LambdaQueryWrapper<Dynasty>().orderByAsc(Dynasty::getStartYear));

        List<Map<String, Object>> timeline = dynasties.stream().map(dynasty -> {
            Map<String, Object> item = new HashMap<>();
            item.put("dynasty", dynasty);
            item.put("events", eventMapper.selectList(
                new LambdaQueryWrapper<Event>().eq(Event::getDynastyId, dynasty.getId())));
            item.put("poets", poetMapper.selectList(
                new LambdaQueryWrapper<Poet>().eq(Poet::getDynastyId, dynasty.getId())));
            item.put("poems", poemMapper.selectList(
                new LambdaQueryWrapper<Poem>().eq(Poem::getDynastyId, dynasty.getId())));
            return item;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(timeline);
    }
}
