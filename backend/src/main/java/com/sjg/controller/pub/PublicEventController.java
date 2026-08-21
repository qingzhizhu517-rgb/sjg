package com.sjg.controller.pub;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.dto.Result;
import com.sjg.entity.Event;
import com.sjg.mapper.EventMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 历史事件公开接口（无需认证）
 */
@Tag(name = "公开历史事件", description = "面向前端展示的历史事件查询接口（无需认证）")
@RestController
@RequestMapping("/api/public/events")
public class PublicEventController {

    private final EventMapper eventMapper;

    public PublicEventController(EventMapper eventMapper) {
        this.eventMapper = eventMapper;
    }

    @Operation(summary = "获取所有历史事件", description = "返回所有历史事件列表")
    @GetMapping
    public ResponseEntity<Result<List<Event>>> list() {
        List<Event> events = eventMapper.selectList(
            new LambdaQueryWrapper<Event>().orderByAsc(Event::getYear));
        return ResponseEntity.ok(Result.success(events));
    }
}
