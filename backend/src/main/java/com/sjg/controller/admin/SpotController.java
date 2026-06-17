package com.sjg.controller.admin;

import com.sjg.dto.PageResult;
import com.sjg.dto.Result;
import com.sjg.entity.ScenicSpot;
import com.sjg.service.SpotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

/**
 * 景点管理控制器（管理员）
 * 提供景点的增删改查接口，需要 JWT 认证
 */
@Tag(name = "景点管理", description = "景点的增删改查接口（管理员）")
@RestController
@RequestMapping("/api/admin/spots")
public class SpotController {
    private final SpotService spotService;
    public SpotController(SpotService spotService) { this.spotService = spotService; }

    /**
     * 分页查询景点列表
     */
    @Operation(summary = "分页查询景点列表", description = "支持按景点名称关键字搜索和区域筛选")
    @GetMapping
    public ResponseEntity<Result<PageResult<ScenicSpot>>> list(
            @Parameter(description = "页码", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量", example = "10") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "搜索关键字（按景点名称模糊匹配）") @RequestParam(required = false) String keyword,
            @Parameter(description = "所属区域筛选", example = "济南") @RequestParam(required = false) String region) {
        return ResponseEntity.ok(Result.success(spotService.list(page, size, keyword, region)));
    }

    /**
     * 根据 ID 查询景点详情
     */
    @Operation(summary = "查询景点详情", description = "根据景点ID查询详细信息")
    @GetMapping("/{id}")
    public ResponseEntity<Result<ScenicSpot>> getById(
            @Parameter(description = "景点ID", example = "1", required = true) @PathVariable Long id) {
        ScenicSpot spot = spotService.getById(id);
        if (spot == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Result.error(404, "景点不存在"));
        }
        return ResponseEntity.ok(Result.success(spot));
    }

    /**
     * 创建景点
     */
    @Operation(summary = "创建景点", description = "新增景点记录")
    @PostMapping
    public ResponseEntity<Result<Map<String, String>>> create(@Parameter(description = "景点信息", required = true) @RequestBody ScenicSpot spot) {
        spotService.create(spot);
        return ResponseEntity.ok(Result.success(Map.of("message", "创建成功")));
    }

    /**
     * 更新景点信息
     */
    @Operation(summary = "更新景点", description = "根据ID更新景点信息")
    @PutMapping("/{id}")
    public ResponseEntity<Result<Map<String, String>>> update(
            @Parameter(description = "景点ID", example = "1", required = true) @PathVariable Long id,
            @Parameter(description = "景点信息", required = true) @RequestBody ScenicSpot spot) {
        spotService.update(id, spot);
        return ResponseEntity.ok(Result.success(Map.of("message", "更新成功")));
    }

    /**
     * 删除景点
     */
    @Operation(summary = "删除景点", description = "根据ID删除景点记录")
    @DeleteMapping("/{id}")
    public ResponseEntity<Result<Map<String, String>>> delete(
            @Parameter(description = "景点ID", example = "1", required = true) @PathVariable Long id) {
        spotService.delete(id);
        return ResponseEntity.ok(Result.success(Map.of("message", "删除成功")));
    }

    @Operation(summary = "批量导入景点", description = "通过Excel文件批量导入景点，表头：名称、地区、地址、经度、纬度、介绍")
    @PostMapping("/import")
    public ResponseEntity<Result<Map<String, Object>>> importExcel(@RequestParam("file") MultipartFile file) {
        try {
            int count = spotService.importFromExcel(file);
            return ResponseEntity.ok(Result.success(Map.of("success", true, "message", "成功导入 " + count + " 条景点记录")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Result.error(400, "导入失败: " + e.getMessage()));
        }
    }
}
