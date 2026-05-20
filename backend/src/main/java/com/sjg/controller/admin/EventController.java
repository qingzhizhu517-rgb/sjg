package com.sjg.controller.admin;

import com.sjg.dto.PageResult;
import com.sjg.entity.Event;
import com.sjg.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/events")
public class EventController {
    private final EventService eventService;
    public EventController(EventService eventService) { this.eventService = eventService; }

    @GetMapping
    public ResponseEntity<PageResult<Event>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(eventService.list(page, size, keyword));
    }
    @GetMapping("/{id}") public ResponseEntity<Event> getById(@PathVariable Long id) { return ResponseEntity.ok(eventService.getById(id)); }
    @PostMapping public ResponseEntity<?> create(@RequestBody Event event) { eventService.create(event); return ResponseEntity.ok(Map.of("message", "创建成功")); }
    @PutMapping("/{id}") public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Event event) { eventService.update(id, event); return ResponseEntity.ok(Map.of("message", "更新成功")); }
    @DeleteMapping("/{id}") public ResponseEntity<?> delete(@PathVariable Long id) { eventService.delete(id); return ResponseEntity.ok(Map.of("message", "删除成功")); }
}
