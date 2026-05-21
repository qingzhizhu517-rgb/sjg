package com.sjg.controller.admin;

import com.sjg.dto.PageResult;
import com.sjg.entity.Poet;
import com.sjg.service.PoetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 诗人管理控制器（管理员）
 * 提供诗人的增删改查接口，需要 JWT 认证
 */
@Tag(name = "诗人管理", description = "诗人的增删改查接口（管理员）")
@RestController
@RequestMapping("/api/admin/poets")
public class PoetController {

    private final PoetService poetService;

    public PoetController(PoetService poetService) {
        this.poetService = poetService;
    }

    /**
     * 分页查询诗人列表
     */
    @Operation(summary = "分页查询诗人列表", description = "支持按诗人名称关键字模糊搜索")
    @GetMapping
    public ResponseEntity<PageResult<Poet>> list(
            @Parameter(description = "页码", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量", example = "10") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "搜索关键字（按诗人名称模糊匹配）") @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(poetService.list(page, size, keyword));
    }

    /**
     * 根据 ID 查询诗人详情
     */
    @Operation(summary = "查询诗人详情", description = "根据诗人ID查询详细信息")
    @GetMapping("/{id}")
    public ResponseEntity<Poet> getById(
            @Parameter(description = "诗人ID", example = "1", required = true) @PathVariable Long id) {
        return ResponseEntity.ok(poetService.getById(id));
    }

    /**
     * 创建诗人
     */
    @Operation(summary = "创建诗人", description = "新增诗人记录")
    @PostMapping
    public ResponseEntity<?> create(@Parameter(description = "诗人信息", required = true) @RequestBody Poet poet) {
        poetService.create(poet);
        return ResponseEntity.ok(Map.of("message", "创建成功"));
    }

    /**
     * 更新诗人信息
     */
    @Operation(summary = "更新诗人", description = "根据ID更新诗人信息")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @Parameter(description = "诗人ID", example = "1", required = true) @PathVariable Long id,
            @Parameter(description = "诗人信息", required = true) @RequestBody Poet poet) {
        poetService.update(id, poet);
        return ResponseEntity.ok(Map.of("message", "更新成功"));
    }

    /**
     * 删除诗人
     */
    @Operation(summary = "删除诗人", description = "根据ID删除诗人记录")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @Parameter(description = "诗人ID", example = "1", required = true) @PathVariable Long id) {
        poetService.delete(id);
        return ResponseEntity.ok(Map.of("message", "删除成功"));
    }
}
