package com.sjg.controller.admin;

import com.sjg.dto.PageResult;
import com.sjg.entity.Poem;
import com.sjg.service.PoemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

/**
 * 诗词管理控制器（管理员）
 * 提供诗词的增删改查接口，需要 JWT 认证
 */
@Tag(name = "诗词管理", description = "诗词的增删改查接口（管理员）")
@RestController
@RequestMapping("/api/admin/poems")
public class PoemController {
    private final PoemService poemService;
    public PoemController(PoemService poemService) { this.poemService = poemService; }

    /**
     * 分页查询诗词列表
     */
    @Operation(summary = "分页查询诗词列表", description = "支持按诗词标题关键字模糊搜索")
    @GetMapping
    public ResponseEntity<PageResult<Poem>> list(
            @Parameter(description = "页码", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量", example = "10") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "搜索关键字（按诗词标题模糊匹配）") @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(poemService.list(page, size, keyword));
    }

    /**
     * 根据 ID 查询诗词详情
     */
    @Operation(summary = "查询诗词详情", description = "根据诗词ID查询详细信息")
    @GetMapping("/{id}")
    public ResponseEntity<Poem> getById(
            @Parameter(description = "诗词ID", example = "1", required = true) @PathVariable Long id) {
        Poem poem = poemService.getById(id);
        if (poem == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(poem);
    }

    /**
     * 创建诗词
     */
    @Operation(summary = "创建诗词", description = "新增诗词记录")
    @PostMapping
    public ResponseEntity<?> create(@Parameter(description = "诗词信息", required = true) @RequestBody Poem poem) {
        poemService.create(poem);
        return ResponseEntity.ok(Map.of("message", "创建成功"));
    }

    /**
     * 更新诗词信息
     */
    @Operation(summary = "更新诗词", description = "根据ID更新诗词信息")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @Parameter(description = "诗词ID", example = "1", required = true) @PathVariable Long id,
            @Parameter(description = "诗词信息", required = true) @RequestBody Poem poem) {
        poemService.update(id, poem);
        return ResponseEntity.ok(Map.of("message", "更新成功"));
    }

    /**
     * 删除诗词
     */
    @Operation(summary = "删除诗词", description = "根据ID删除诗词记录")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @Parameter(description = "诗词ID", example = "1", required = true) @PathVariable Long id) {
        poemService.delete(id);
        return ResponseEntity.ok(Map.of("message", "删除成功"));
    }

    @Operation(summary = "批量导入诗词", description = "通过Excel文件批量导入诗词，表头：标题、内容、作者ID、朝代ID、景点ID、注解、背景、音频URL、视频URL、情感标签")
    @PostMapping("/import")
    public ResponseEntity<?> importExcel(@RequestParam("file") MultipartFile file) {
        try {
            int count = poemService.importFromExcel(file);
            return ResponseEntity.ok(Map.of("success", true, "message", "成功导入 " + count + " 条诗词记录"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "导入失败: " + e.getMessage()));
        }
    }
}
