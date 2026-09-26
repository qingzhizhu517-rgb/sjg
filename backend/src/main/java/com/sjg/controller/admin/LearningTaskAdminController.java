package com.sjg.controller.admin;

import com.sjg.dto.PageResult;
import com.sjg.dto.Result;
import com.sjg.entity.LearningTask;
import com.sjg.service.LearningTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "学习任务管理", description = "一城一课任务编辑和发布")
@RestController
@RequestMapping("/api/admin/learning-tasks")
public class LearningTaskAdminController {
    private final LearningTaskService service;

    public LearningTaskAdminController(LearningTaskService service) { this.service = service; }

    @Operation(summary = "分页查询学习任务")
    @GetMapping
    public Result<PageResult<LearningTask>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        return Result.success(service.list(page, size, status, keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Result<LearningTask>> get(@PathVariable Long id) {
        LearningTask task = service.getById(id);
        if (task == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Result.error(404, "学习任务不存在"));
        return ResponseEntity.ok(Result.success(task));
    }

    @PostMapping
    public ResponseEntity<Result<LearningTask>> create(@RequestBody LearningTask task) {
        try { return ResponseEntity.status(HttpStatus.CREATED).body(Result.success(service.create(task))); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Result.error(400, e.getMessage())); }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Result<LearningTask>> update(@PathVariable Long id, @RequestBody LearningTask task) {
        try { return ResponseEntity.ok(Result.success(service.update(id, task))); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Result.error(400, e.getMessage())); }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Result<LearningTask>> status(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        try { return ResponseEntity.ok(Result.success(service.updateStatus(id, body == null ? null : body.get("status")))); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Result.error(400, e.getMessage())); }
    }

    @PostMapping("/{id}/copy")
    public ResponseEntity<Result<LearningTask>> copy(@PathVariable Long id) {
        try { return ResponseEntity.status(HttpStatus.CREATED).body(Result.success(service.copy(id))); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Result.error(400, e.getMessage())); }
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return Result.success();
    }
}
