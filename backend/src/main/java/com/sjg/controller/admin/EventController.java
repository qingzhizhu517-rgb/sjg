package com.sjg.controller.admin;

import com.sjg.dto.PageResult;
import com.sjg.dto.Result;
import com.sjg.entity.Event;
import com.sjg.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
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
    public ResponseEntity<Result<PageResult<Event>>> list(
            @Parameter(description = "页码", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量", example = "10") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "搜索关键字（按事件标题模糊匹配）") @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(Result.success(eventService.list(page, size, keyword)));
    }

    /**
     * 根据 ID 查询历史事件详情
     */
    @Operation(summary = "查询历史事件详情", description = "根据事件ID查询详细信息")
    @GetMapping("/{id}")
    public ResponseEntity<Result<Event>> getById(
            @Parameter(description = "事件ID", example = "1", required = true) @PathVariable Long id) {
        Event event = eventService.getById(id);
        if (event == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Result.error(404, "事件不存在"));
        }
        return ResponseEntity.ok(Result.success(event));
    }

    /**
     * 创建历史事件
     */
    @Operation(summary = "创建历史事件", description = "新增历史事件记录")
    @PostMapping
    public ResponseEntity<Result<Map<String, String>>> create(@Parameter(description = "事件信息", required = true) @RequestBody Event event) {
        eventService.create(event);
        return ResponseEntity.ok(Result.success(Map.of("message", "创建成功")));
    }

    /**
     * 更新历史事件信息
     */
    @Operation(summary = "更新历史事件", description = "根据ID更新历史事件信息")
    @PutMapping("/{id}")
    public ResponseEntity<Result<Map<String, String>>> update(
            @Parameter(description = "事件ID", example = "1", required = true) @PathVariable Long id,
            @Parameter(description = "事件信息", required = true) @RequestBody Event event) {
        eventService.update(id, event);
        return ResponseEntity.ok(Result.success(Map.of("message", "更新成功")));
    }

    /**
     * 删除历史事件
     */
    @Operation(summary = "删除历史事件", description = "根据ID删除历史事件记录")
    @DeleteMapping("/{id}")
    public ResponseEntity<Result<Map<String, String>>> delete(
            @Parameter(description = "事件ID", example = "1", required = true) @PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.ok(Result.success(Map.of("message", "删除成功")));
    }

    @Operation(summary = "批量导入事件", description = "通过Excel文件批量导入事件，表头：标题、朝代ID、年份、描述、历史意义")
    @PostMapping("/import")
    public ResponseEntity<Result<Map<String, Object>>> importExcel(@RequestParam("file") MultipartFile file) {
        try {
            int count = eventService.importFromExcel(file);
            return ResponseEntity.ok(Result.success(Map.of("success", true, "message", "成功导入 " + count + " 条事件记录")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Result.error(400, "导入失败: " + e.getMessage()));
        }
    }
}
