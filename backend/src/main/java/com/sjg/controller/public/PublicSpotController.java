package com.sjg.controller.public;

import com.sjg.entity.ScenicSpot;
import com.sjg.entity.Poem;
import com.sjg.service.SpotService;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.PoetMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

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

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String region) {
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

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        ScenicSpot spot = spotService.getById(id);
        if (spot == null) return ResponseEntity.notFound().build();

        List<Poem> poems = poemMapper.selectList(
            new LambdaQueryWrapper<Poem>().eq(Poem::getSpotId, id));

        Map<String, Object> result = new HashMap<>();
        result.put("spot", spot);
        result.put("poems", poems);
        return ResponseEntity.ok(result);
    }

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
