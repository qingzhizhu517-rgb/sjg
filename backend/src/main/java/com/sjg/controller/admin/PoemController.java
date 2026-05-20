package com.sjg.controller.admin;

import com.sjg.dto.PageResult;
import com.sjg.entity.Poem;
import com.sjg.service.PoemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/poems")
public class PoemController {
    private final PoemService poemService;
    public PoemController(PoemService poemService) { this.poemService = poemService; }

    @GetMapping
    public ResponseEntity<PageResult<Poem>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(poemService.list(page, size, keyword));
    }
    @GetMapping("/{id}") public ResponseEntity<Poem> getById(@PathVariable Long id) { return ResponseEntity.ok(poemService.getById(id)); }
    @PostMapping public ResponseEntity<?> create(@RequestBody Poem poem) { poemService.create(poem); return ResponseEntity.ok(Map.of("message", "创建成功")); }
    @PutMapping("/{id}") public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Poem poem) { poemService.update(id, poem); return ResponseEntity.ok(Map.of("message", "更新成功")); }
    @DeleteMapping("/{id}") public ResponseEntity<?> delete(@PathVariable Long id) { poemService.delete(id); return ResponseEntity.ok(Map.of("message", "删除成功")); }
}
