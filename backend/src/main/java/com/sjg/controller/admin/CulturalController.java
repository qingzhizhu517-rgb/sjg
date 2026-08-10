package com.sjg.controller.admin;

import com.sjg.dto.CulturalItemRequest;
import com.sjg.dto.PageResult;
import com.sjg.dto.Result;
import com.sjg.entity.CulturalItem;
import com.sjg.service.CulturalItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 文化条目管理控制器（管理员）
 * 写操作需 admin 角色（SecurityConfig 现有规则覆盖 /api/admin/**）
 */
@Tag(name = "文化条目管理", description = "文化条目的增删改查与发布流转（管理员）")
@RestController
@RequestMapping("/api/admin/cultural")
public class CulturalController {

    private final CulturalItemService culturalItemService;

    public CulturalController(CulturalItemService culturalItemService) {
        this.culturalItemService = culturalItemService;
    }

    @Operation(summary = "分页查询文化条目（含草稿）", description = "支持类别/状态/关键字筛选")
    @GetMapping
    public ResponseEntity<Result<PageResult<CulturalItem>>> list(
            @Parameter(description = "页码", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量", example = "10") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "类别", example = "festival") @RequestParam(required = false) String category,
            @Parameter(description = "状态", example = "draft") @RequestParam(required = false) String status,
            @Parameter(description = "搜索关键字") @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(Result.success(
                culturalItemService.list(page, size, category, null, keyword, status, false)));
    }

    @Operation(summary = "查询条目详情（含扩展字段）")
    @GetMapping("/{id}")
    public ResponseEntity<Result<Map<String, Object>>> getById(
            @Parameter(description = "条目ID", example = "1", required = true) @PathVariable Long id) {
        Map<String, Object> view = culturalItemService.getDetailView(id);
        if (view == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Result.error(404, "条目不存在"));
        }
        return ResponseEntity.ok(Result.success(view));
    }

    @Operation(summary = "创建文化条目", description = "公共字段 + 扩展字段一并提交，service 层分写两表")
    @PostMapping
    public ResponseEntity<Result<Map<String, String>>> create(@RequestBody CulturalItemRequest request) {
        if (request.getItem() == null) {
            return ResponseEntity.badRequest().body(Result.error(400, "item 不能为空"));
        }
        culturalItemService.create(request.getItem(), request.getFestivalDetail());
        return ResponseEntity.ok(Result.success(Map.of("message", "创建成功")));
    }

    @Operation(summary = "更新文化条目")
    @PutMapping("/{id}")
    public ResponseEntity<Result<Map<String, String>>> update(
            @Parameter(description = "条目ID", example = "1", required = true) @PathVariable Long id,
            @RequestBody CulturalItemRequest request) {
        if (request.getItem() == null) {
            return ResponseEntity.badRequest().body(Result.error(400, "item 不能为空"));
        }
        if (culturalItemService.getById(id) == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Result.error(404, "条目不存在"));
        }
        culturalItemService.update(id, request.getItem(), request.getFestivalDetail());
        return ResponseEntity.ok(Result.success(Map.of("message", "更新成功")));
    }

    @Operation(summary = "删除文化条目", description = "级联删除扩展表记录")
    @DeleteMapping("/{id}")
    public ResponseEntity<Result<Map<String, String>>> delete(
            @Parameter(description = "条目ID", example = "1", required = true) @PathVariable Long id) {
        culturalItemService.delete(id);
        return ResponseEntity.ok(Result.success(Map.of("message", "删除成功")));
    }

    @Operation(summary = "发布/下架切换", description = "status: draft | published")
    @PutMapping("/{id}/status")
    public ResponseEntity<Result<Map<String, String>>> updateStatus(
            @Parameter(description = "条目ID", example = "1", required = true) @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (!CulturalItemService.STATUS_DRAFT.equals(status)
                && !CulturalItemService.STATUS_PUBLISHED.equals(status)) {
            return ResponseEntity.badRequest().body(Result.error(400, "status 仅支持 draft/published"));
        }
        if (culturalItemService.getById(id) == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Result.error(404, "条目不存在"));
        }
        culturalItemService.updateStatus(id, status);
        return ResponseEntity.ok(Result.success(Map.of("message", "状态已更新")));
    }
}
