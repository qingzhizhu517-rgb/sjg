package com.sjg.controller.pub;

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

import java.util.List;
import java.util.Map;

/**
 * 文化条目公开接口（无需认证）
 * 仅返回已发布（published）条目
 */
@Tag(name = "公开文化条目", description = "面向前端展示的文化条目查询接口（无需认证，仅 published）")
@RestController
@RequestMapping("/api/public/cultural")
public class PublicCulturalController {

    private final CulturalItemService culturalItemService;

    public PublicCulturalController(CulturalItemService culturalItemService) {
        this.culturalItemService = culturalItemService;
    }

    @Operation(summary = "分页查询文化条目", description = "仅返回已发布条目，支持类别/区域/关键字筛选")
    @GetMapping
    public ResponseEntity<Result<PageResult<CulturalItem>>> list(
            @Parameter(description = "页码", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量", example = "20") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "类别", example = "festival") @RequestParam(required = false) String category,
            @Parameter(description = "区域筛选", example = "济南") @RequestParam(required = false) String region,
            @Parameter(description = "搜索关键字") @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(Result.success(
                culturalItemService.list(page, size, category, region, keyword, null, true)));
    }

    @Operation(summary = "查询文化条目详情", description = "公共字段 + 按类别 JOIN 的扩展字段；仅已发布可见")
    @GetMapping("/{id}")
    public ResponseEntity<Result<Map<String, Object>>> getById(
            @Parameter(description = "条目ID", example = "1", required = true) @PathVariable Long id) {
        Map<String, Object> view = culturalItemService.getDetailView(id);
        if (view == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Result.error(404, "条目不存在"));
        }
        CulturalItem item = (CulturalItem) view.get("item");
        if (!CulturalItemService.STATUS_PUBLISHED.equals(item.getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Result.error(404, "条目不存在"));
        }
        return ResponseEntity.ok(Result.success(view));
    }

    @Operation(summary = "文化类别元信息", description = "五类名称/印章字/已发布条目数，首页聚合入口用")
    @GetMapping("/categories")
    public ResponseEntity<Result<List<Map<String, Object>>>> categories() {
        return ResponseEntity.ok(Result.success(culturalItemService.categoryStats()));
    }
}
