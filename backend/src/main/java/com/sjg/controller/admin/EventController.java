package com.sjg.controller.admin;

import com.sjg.dto.PageResult;
import com.sjg.entity.Event;
import com.sjg.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * 历史事件管理控制器（管理员）
 * 提供历史事件的增删改查接口，需要 JWT 认证
 */
@Tag(name = "历史事件管理", description = "历史事件的增删改查接口（管理员）")
@RestController
@RequestMapping("/api/admin/events")
public class EventController {
    private final EventService eventService;
    public EventController(EventService eventService) { this.eventService = eventService; }

    /**
     * 分页查询历史事件列表
     */
    @Operation(summary = "分页查询历史事件列表", description = "支持按事件标题关键字模糊搜索")
    @GetMapping
    public ResponseEntity<PageResult<Event>> list(
            @Parameter(description = "页码", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量", example = "10") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "搜索关键字（按事件标题模糊匹配）") @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(eventService.list(page, size, keyword));
    }

    /**
     * 根据 ID 查询历史事件详情
     */
    @Operation(summary = "查询历史事件详情", description = "根据事件ID查询详细信息")
    @GetMapping("/{id}")
    public ResponseEntity<Event> getById(
            @Parameter(description = "事件ID", example = "1", required = true) @PathVariable Long id) {
        return ResponseEntity.ok(eventService.getById(id));
    }

    /**
     * 创建历史事件
     */
    @Operation(summary = "创建历史事件", description = "新增历史事件记录")
    @PostMapping
    public ResponseEntity<?> create(@Parameter(description = "事件信息", required = true) @RequestBody Event event) {
        eventService.create(event);
        return ResponseEntity.ok(Map.of("message", "创建成功"));
    }

    /**
     * 更新历史事件信息
     */
    @Operation(summary = "更新历史事件", description = "根据ID更新历史事件信息")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @Parameter(description = "事件ID", example = "1", required = true) @PathVariable Long id,
            @Parameter(description = "事件信息", required = true) @RequestBody Event event) {
        eventService.update(id, event);
        return ResponseEntity.ok(Map.of("message", "更新成功"));
    }

    /**
     * 删除历史事件
     */
    @Operation(summary = "删除历史事件", description = "根据ID删除历史事件记录")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @Parameter(description = "事件ID", example = "1", required = true) @PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.ok(Map.of("message", "删除成功"));
    }
}
