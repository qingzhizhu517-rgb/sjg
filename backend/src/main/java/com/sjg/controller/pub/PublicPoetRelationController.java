package com.sjg.controller.pub;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.dto.Result;
import com.sjg.entity.Dynasty;
import com.sjg.entity.Poet;
import com.sjg.entity.PoetRelation;
import com.sjg.mapper.DynastyMapper;
import com.sjg.mapper.PoetMapper;
import com.sjg.mapper.PoetRelationMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 诗人关系图谱公开接口(路线图 #7): 返回诗人-诗人关系, 供前端 G6 力导向图渲染。
 * Phase1 仅 source=seed 人工录入的关键关系; Phase2 将并 derived 派生边。
 */
@Tag(name = "公开诗人关系", description = "诗人关系图谱(无需认证)")
@RestController
@RequestMapping("/api/public/poet-relations")
public class PublicPoetRelationController {

    private final PoetRelationMapper relationMapper;
    private final PoetMapper poetMapper;
    private final DynastyMapper dynastyMapper;

    public PublicPoetRelationController(PoetRelationMapper relationMapper,
                                       PoetMapper poetMapper, DynastyMapper dynastyMapper) {
        this.relationMapper = relationMapper;
        this.poetMapper = poetMapper;
        this.dynastyMapper = dynastyMapper;
    }

    @Operation(summary = "查询诗人关系图谱", description = "返回 nodes(诗人) + edges(关系), 供 G6 力导向图")
    @GetMapping
    public ResponseEntity<Result<Map<String, Object>>> graph() {
        List<PoetRelation> relations = relationMapper.selectList(
            new LambdaQueryWrapper<PoetRelation>().orderByAsc(PoetRelation::getRelationType));

        // 收集所有涉及的诗人 id(去重)
        Set<Long> poetIds = new HashSet<>();
        for (PoetRelation r : relations) {
            poetIds.add(r.getPoetAId());
            poetIds.add(r.getPoetBId());
        }

        // 批量查诗人 + 朝代名
        Map<Long, Poet> poetMap = poetIds.isEmpty() ? Collections.emptyMap()
            : poetMapper.selectBatchIds(poetIds).stream()
                .collect(Collectors.toMap(Poet::getId, p -> p));
        Set<Long> dynastyIds = poetMap.values().stream()
            .map(Poet::getDynastyId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<Long, String> dynastyName = dynastyIds.isEmpty() ? Collections.emptyMap()
            : dynastyMapper.selectBatchIds(dynastyIds).stream()
                .collect(Collectors.toMap(Dynasty::getId, Dynasty::getName));

        // 组装 nodes
        List<Map<String, Object>> nodes = new ArrayList<>();
        for (Long id : poetIds) {
            Poet p = poetMap.get(id);
            if (p == null) continue;
            Map<String, Object> n = new LinkedHashMap<>();
            n.put("id", String.valueOf(p.getId()));
            n.put("poetId", p.getId());
            n.put("name", p.getName());
            n.put("dynasty", dynastyName.getOrDefault(p.getDynastyId(), ""));
            n.put("dynastyId", p.getDynastyId());
            n.put("style", p.getStyle());
            n.put("birthplace", p.getBirthplace());
            n.put("avatarAnimeUrl", p.getAvatarAnimeUrl());
            nodes.add(n);
        }

        // 组装 edges
        List<Map<String, Object>> edges = new ArrayList<>();
        for (PoetRelation r : relations) {
            Map<String, Object> e = new LinkedHashMap<>();
            e.put("source", String.valueOf(r.getPoetAId()));
            e.put("target", String.valueOf(r.getPoetBId()));
            e.put("relationType", r.getRelationType());
            e.put("description", r.getDescription());
            e.put("origin", r.getSource());
            edges.add(e);
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("nodes", nodes);
        data.put("edges", edges);
        return ResponseEntity.ok(Result.success(data));
    }
}
