package com.sjg.controller.pub;

import com.sjg.entity.ScenicSpot;
import com.sjg.entity.Poem;
import com.sjg.service.SpotService;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.PoetMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
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
     */
    @Operation(summary = "分页查询景点列表", description = "查询景点列表并附带每个景点的关联诗词数量，支持区域筛选")
    @GetMapping
    public ResponseEntity<?> list(
            @Parameter(description = "页码", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量", example = "20") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "区域筛选", example = "济南") @RequestParam(required = false) String region) {
        var result = spotService.list(page, size, null, region);
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
            Long poemCount = poemMapper.selectCount(
                new LambdaQueryWrapper<Poem>().eq(Poem::getSpotId, spot.getId()));
            map.put("poemCount", poemCount);
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("records", enriched, "total", result.getTotal()));
    }

    /**
     * 查询景点详情（含关联诗词列表）
     */
    @Operation(summary = "查询景点详情", description = "根据景点ID查询详情，同时返回关联的诗词列表")
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @Parameter(description = "景点ID", example = "1", required = true) @PathVariable Long id) {
        ScenicSpot spot = spotService.getById(id);
        if (spot == null) return ResponseEntity.notFound().build();

        List<Poem> poems = poemMapper.selectList(
            new LambdaQueryWrapper<Poem>().eq(Poem::getSpotId, id));

        Map<String, Object> result = new HashMap<>();
        result.put("spot", spot);
        result.put("poems", poems);
        return ResponseEntity.ok(result);
    }

    /**
     * 获取所有区域及其景点数量
     */
    @Operation(summary = "获取区域列表", description = "返回所有预设区域及其景点数量统计")
    @GetMapping("/regions")
    public ResponseEntity<?> regions() {
        String[] regions = {"菏泽", "济宁", "泰安", "聊城", "济南", "德州", "滨州", "淄博", "东营"};
        List<Map<String, Object>> regionList = new ArrayList<>();
        for (String region : regions) {
            Long count = spotService.list(1, 1, null, region).getTotal();
            regionList.add(Map.of("name", region, "spotCount", count));
        }
        return ResponseEntity.ok(regionList);
    }
}
