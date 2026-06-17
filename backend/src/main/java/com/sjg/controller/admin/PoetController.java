package com.sjg.controller.admin;

import com.sjg.dto.PageResult;
import com.sjg.dto.Result;
import com.sjg.entity.Poet;
import com.sjg.service.PoetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
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
    public ResponseEntity<Result<PageResult<Poet>>> list(
            @Parameter(description = "页码", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量", example = "10") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "搜索关键字（按诗人名称模糊匹配）") @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(Result.success(poetService.list(page, size, keyword)));
    }

    /**
     * 根据 ID 查询诗人详情
     */
    @Operation(summary = "查询诗人详情", description = "根据诗人ID查询详细信息")
    @GetMapping("/{id}")
    public ResponseEntity<Result<Poet>> getById(
            @Parameter(description = "诗人ID", example = "1", required = true) @PathVariable Long id) {
        Poet poet = poetService.getById(id);
        if (poet == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Result.error(404, "诗人不存在"));
        }
        return ResponseEntity.ok(Result.success(poet));
    }

    /**
     * 创建诗人
     */
    @Operation(summary = "创建诗人", description = "新增诗人记录")
    @PostMapping
    public ResponseEntity<Result<Map<String, String>>> create(@Parameter(description = "诗人信息", required = true) @RequestBody Poet poet) {
        poetService.create(poet);
        return ResponseEntity.ok(Result.success(Map.of("message", "创建成功")));
    }

    /**
     * 更新诗人信息
     */
    @Operation(summary = "更新诗人", description = "根据ID更新诗人信息")
    @PutMapping("/{id}")
    public ResponseEntity<Result<Map<String, String>>> update(
            @Parameter(description = "诗人ID", example = "1", required = true) @PathVariable Long id,
            @Parameter(description = "诗人信息", required = true) @RequestBody Poet poet) {
        poetService.update(id, poet);
        return ResponseEntity.ok(Result.success(Map.of("message", "更新成功")));
    }

    /**
     * 删除诗人
     */
    @Operation(summary = "删除诗人", description = "根据ID删除诗人记录")
    @DeleteMapping("/{id}")
    public ResponseEntity<Result<Map<String, String>>> delete(
            @Parameter(description = "诗人ID", example = "1", required = true) @PathVariable Long id) {
        poetService.delete(id);
        return ResponseEntity.ok(Result.success(Map.of("message", "删除成功")));
    }

    /**
     * 上传/修改诗人图片（回显并存储到 OSS）
     */
    @Operation(summary = "上传/修改诗人图片", description = "上传文件到阿里云OSS并更新对应诗人的图片字段，支持回显")
    @PostMapping("/{id}/avatar")
    public ResponseEntity<Result<Map<String, Object>>> uploadAvatar(
            @Parameter(description = "诗人ID", example = "1", required = true) @PathVariable Long id,
            @Parameter(description = "上传的文件", required = true) @RequestParam("file") MultipartFile file,
            @Parameter(description = "图片类型: avatar (真实头像) 或 avatarAnime (动漫头像)", example = "avatar") @RequestParam(defaultValue = "avatar") String type,
            @Parameter(description = "更新模式: replace (替换, 默认) 或 append (追加)", example = "replace") @RequestParam(defaultValue = "replace") String mode) {
        try {
            Map<String, Object> result = poetService.updateAvatar(id, file, type, mode);
            return ResponseEntity.ok(Result.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Result.error(400, "更新图片失败: " + e.getMessage()));
        }
    }

    /**
     * 批量导入诗人（Excel）
     */
    @Operation(summary = "批量导入诗人", description = "通过Excel文件批量导入诗人，表头：名称、朝代ID、出生年、卒年、出生地、简介、风格")
    @PostMapping("/import")
    public ResponseEntity<Result<Map<String, Object>>> importExcel(@RequestParam("file") MultipartFile file) {
        try {
            int count = poetService.importFromExcel(file);
            return ResponseEntity.ok(Result.success(Map.of("success", true, "message", "成功导入 " + count + " 条诗人记录")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Result.error(400, "导入失败: " + e.getMessage()));
        }
    }
}
