package com.sjg.controller.pub;

import com.sjg.dto.Result;
import com.sjg.entity.ScenicSpot;
import com.sjg.entity.Poem;
import com.sjg.service.SpotService;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.PoetMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 景点公开接口（无需认证）
 * 提供面向前端展示的景点查询接口
 */
@Tag(name = "公开景点", description = "面向前端展示的景点查询接口（无需认证）")
@RestController
@RequestMapping("/api/public/spots")
public class PublicSpotController {

    private final SpotService spotService;
    private final PoemMapper poemMapper;
    private final PoetMapper poetMapper;

    public PublicSpotController(SpotService spotService, PoemMapper poemMapper, PoetMapper poetMapper) {
        this.spotService = spotService;
        this.poemMapper = poemMapper;
        this.poetMapper = poetMapper;
    }

    /**
     * 分页查询景点列表（含关联诗词数量）
     * 优化：使用批量查询替代 N+1 查询
     */
    @Operation(summary = "分页查询景点列表", description = "查询景点列表并附带每个景点的关联诗词数量，支持区域筛选")
    @GetMapping
    public ResponseEntity<Result<Map<String, Object>>> list(
            @Parameter(description = "页码", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量", example = "20") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "区域筛选", example = "济南") @RequestParam(required = false) String region) {
        var result = spotService.list(page, size, null, region);

        // 批量查询所有景点的诗词数量，避免 N+1 查询
        List<Long> spotIds = result.getRecords().stream()
            .map(ScenicSpot::getId)
            .collect(Collectors.toList());

        Map<Long, Long> poemCountMap = new HashMap<>();
        if (!spotIds.isEmpty()) {
            // 一次性查询所有相关诗词的 spot_id，然后按 spot_id 分组计数
            List<Poem> allPoems = poemMapper.selectList(
                new LambdaQueryWrapper<Poem>().in(Poem::getSpotId, spotIds));
            poemCountMap = allPoems.stream()
                .filter(p -> p.getSpotId() != null)
                .collect(Collectors.groupingBy(Poem::getSpotId, Collectors.counting()));
        }

        final Map<Long, Long> finalPoemCountMap = poemCountMap;
        var enriched = result.getRecords().stream().map(spot -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", spot.getId());
            map.put("name", spot.getName());
            map.put("address", spot.getAddress());
            map.put("imageUrl", spot.getImageUrl());
            map.put("imageAnimeUrl", spot.getImageAnimeUrl());
            map.put("region", spot.getRegion());
            map.put("longitude", spot.getLongitude());
            map.put("latitude", spot.getLatitude());
            map.put("poemCount", finalPoemCountMap.getOrDefault(spot.getId(), 0L));
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(Result.success(Map.of("records", enriched, "total", result.getTotal())));
    }

    /**
     * 查询景点详情（含关联诗词列表）
     */
    @Operation(summary = "查询景点详情", description = "根据景点ID查询详情，同时返回关联的诗词列表")
    @GetMapping("/{id}")
    public ResponseEntity<Result<Map<String, Object>>> getById(
            @Parameter(description = "景点ID", example = "1", required = true) @PathVariable Long id) {
        ScenicSpot spot = spotService.getById(id);
        if (spot == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Result.error(404, "景点不存在"));
        }

        List<Poem> poems = poemMapper.selectList(
            new LambdaQueryWrapper<Poem>().eq(Poem::getSpotId, id));

        Map<String, Object> result = new HashMap<>();
        result.put("spot", spot);
        result.put("poems", poems);
        return ResponseEntity.ok(Result.success(result));
    }

    /**
     * 获取所有区域及其景点数量
     */
    @Operation(summary = "获取区域列表", description = "返回所有预设区域及其景点数量统计")
    @GetMapping("/regions")
    public ResponseEntity<Result<List<Map<String, Object>>>> regions() {
        // 黄河上游→下游顺序(与 MapView 九城一致): 菏泽入境 → 东营归海
        String[] regions = {"菏泽", "济宁", "泰安", "聊城", "济南", "德州", "淄博", "滨州", "东营"};
        List<Map<String, Object>> regionList = new ArrayList<>();
        for (String region : regions) {
            Long count = spotService.list(1, 1, null, region).getTotal();
            regionList.add(Map.of("name", region, "spotCount", count));
        }
        return ResponseEntity.ok(Result.success(regionList));
    }
}
