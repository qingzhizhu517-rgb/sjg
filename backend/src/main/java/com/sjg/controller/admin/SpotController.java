package com.sjg.controller.admin;

import com.sjg.dto.PageResult;
import com.sjg.entity.ScenicSpot;
import com.sjg.service.SpotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/spots")
public class SpotController {
    private final SpotService spotService;
    public SpotController(SpotService spotService) { this.spotService = spotService; }

    @GetMapping
    public ResponseEntity<PageResult<ScenicSpot>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region) {
        return ResponseEntity.ok(spotService.list(page, size, keyword, region));
    }
    @GetMapping("/{id}") public ResponseEntity<ScenicSpot> getById(@PathVariable Long id) { return ResponseEntity.ok(spotService.getById(id)); }
    @PostMapping public ResponseEntity<?> create(@RequestBody ScenicSpot spot) { spotService.create(spot); return ResponseEntity.ok(Map.of("message", "创建成功")); }
    @PutMapping("/{id}") public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ScenicSpot spot) { spotService.update(id, spot); return ResponseEntity.ok(Map.of("message", "更新成功")); }
    @DeleteMapping("/{id}") public ResponseEntity<?> delete(@PathVariable Long id) { spotService.delete(id); return ResponseEntity.ok(Map.of("message", "删除成功")); }
}
