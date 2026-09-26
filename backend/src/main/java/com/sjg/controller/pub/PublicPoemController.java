package com.sjg.controller.pub;

import com.sjg.dto.Result;
import com.sjg.dto.PageResult;
import com.sjg.entity.*;
import com.sjg.mapper.*;
import com.sjg.service.PoemService;
import com.sjg.service.ContentReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

/**
 * 诗词公开接口（无需认证）
 * 提供面向前端展示的诗词查询接口
 */
@Tag(name = "公开诗词", description = "面向前端展示的诗词查询接口（无需认证）")
@RestController
@RequestMapping("/api/public/poems")
public class PublicPoemController {

    private final PoemService poemService;
    private final PoetMapper poetMapper;
    private final DynastyMapper dynastyMapper;
    private final ScenicSpotMapper spotMapper;
    private final ContentReviewService contentReviewService;

    public PublicPoemController(PoemService poemService, PoetMapper poetMapper,
                                 DynastyMapper dynastyMapper, ScenicSpotMapper spotMapper,
                                 ContentReviewService contentReviewService) {
        this.poemService = poemService;
        this.poetMapper = poetMapper;
        this.dynastyMapper = dynastyMapper;
        this.spotMapper = spotMapper;
        this.contentReviewService = contentReviewService;
    }

    /**
     * 分页搜索诗词列表
     */
    @Operation(summary = "分页搜索诗词列表", description = "支持标题/内容关键字模糊搜索与按区域(景点归属或作者籍贯)筛选，公开接口无需认证")
    @GetMapping
    public ResponseEntity<Result<PageResult<Poem>>> search(
            @Parameter(description = "页码", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量", example = "20") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "搜索关键字（按诗词标题/内容模糊匹配）") @RequestParam(required = false) String keyword,
            @Parameter(description = "区域筛选（如 济南）") @RequestParam(required = false) String region) {
        return ResponseEntity.ok(Result.success(poemService.listPublished(page, size, keyword, region)));
    }

    /**
     * 查询诗词详情（含关联信息）
     */
    @Operation(summary = "查询诗词详情", description = "根据诗词ID查询详情，同时返回作者、朝代和关联景点信息")
    @GetMapping("/{id}")
    public ResponseEntity<Result<Map<String, Object>>> getById(
            @Parameter(description = "诗词ID", example = "1", required = true) @PathVariable Long id) {
        Poem poem = poemService.getById(id);
        if (poem == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Result.error(404, "诗词不存在"));
        }
        ContentReview review = contentReviewService.getReview("poem", id);
        if (review == null || !ContentReview.PUBLISHED.equals(review.getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Result.error(404, "诗词不存在"));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("poem", poem);
        Poet poet = poetMapper.selectById(poem.getPoetId());
        if (poet != null && !isPublished("poet", poet.getId())) poet = null;
        Dynasty dynasty = dynastyMapper.selectById(poem.getDynastyId());
        if (dynasty != null && !isPublished("dynasty", dynasty.getId())) dynasty = null;
        result.put("poet", poet);
        result.put("dynasty", dynasty);
        if (poem.getSpotId() != null) {
            ScenicSpot spot = spotMapper.selectById(poem.getSpotId());
            if (spot != null && !isPublished("scenic_spot", spot.getId())) spot = null;
            result.put("spot", spot);
        }
        result.put("sources", contentReviewService.listSourceSummaries("poem", id));
        return ResponseEntity.ok(Result.success(result));
    }

    private boolean isPublished(String entityType, Long entityId) {
        ContentReview review = contentReviewService.getReview(entityType, entityId);
        return review != null && ContentReview.PUBLISHED.equals(review.getStatus());
    }
}
