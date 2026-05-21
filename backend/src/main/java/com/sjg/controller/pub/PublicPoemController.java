package com.sjg.controller.pub;

import com.sjg.entity.*;
import com.sjg.mapper.*;
import com.sjg.service.PoemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
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

    public PublicPoemController(PoemService poemService, PoetMapper poetMapper,
                                 DynastyMapper dynastyMapper, ScenicSpotMapper spotMapper) {
        this.poemService = poemService;
        this.poetMapper = poetMapper;
        this.dynastyMapper = dynastyMapper;
        this.spotMapper = spotMapper;
    }

    /**
     * 分页搜索诗词列表
     */
    @Operation(summary = "分页搜索诗词列表", description = "支持按诗词标题关键字模糊搜索，公开接口无需认证")
    @GetMapping
    public ResponseEntity<?> search(
            @Parameter(description = "页码", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量", example = "20") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "搜索关键字（按诗词标题模糊匹配）") @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(poemService.list(page, size, keyword));
    }

    /**
     * 查询诗词详情（含关联信息）
     */
    @Operation(summary = "查询诗词详情", description = "根据诗词ID查询详情，同时返回作者、朝代和关联景点信息")
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @Parameter(description = "诗词ID", example = "1", required = true) @PathVariable Long id) {
        Poem poem = poemService.getById(id);
        if (poem == null) return ResponseEntity.notFound().build();

        Map<String, Object> result = new HashMap<>();
        result.put("poem", poem);
        result.put("poet", poetMapper.selectById(poem.getPoetId()));
        result.put("dynasty", dynastyMapper.selectById(poem.getDynastyId()));
        if (poem.getSpotId() != null) {
            result.put("spot", spotMapper.selectById(poem.getSpotId()));
        }
        return ResponseEntity.ok(result);
    }
}
