package com.sjg.controller.admin;

import com.sjg.dto.PageResult;
import com.sjg.entity.Poet;
import com.sjg.service.PoetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/poets")
public class PoetController {

    private final PoetService poetService;

    public PoetController(PoetService poetService) {
        this.poetService = poetService;
    }

    @GetMapping
    public ResponseEntity<PageResult<Poet>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(poetService.list(page, size, keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Poet> getById(@PathVariable Long id) {
        return ResponseEntity.ok(poetService.getById(id));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Poet poet) {
        poetService.create(poet);
        return ResponseEntity.ok(Map.of("message", "创建成功"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Poet poet) {
        poetService.update(id, poet);
        return ResponseEntity.ok(Map.of("message", "更新成功"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        poetService.delete(id);
        return ResponseEntity.ok(Map.of("message", "删除成功"));
    }
}
