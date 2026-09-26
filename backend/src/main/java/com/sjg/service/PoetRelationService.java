package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.entity.Dynasty;
import com.sjg.entity.Poet;
import com.sjg.entity.PoetRelation;
import com.sjg.mapper.DynastyMapper;
import com.sjg.mapper.PoetMapper;
import com.sjg.mapper.PoetRelationMapper;
import com.sjg.mapper.ContentReviewMapper;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 诗人关系图谱服务(路线图 #7): 查询诗人关系并组装 nodes+edges 供 G6 力导向图。
 */
@Service
public class PoetRelationService {

    private final PoetRelationMapper relationMapper;
    private final PoetMapper poetMapper;
    private final DynastyMapper dynastyMapper;
    private final ContentReviewMapper contentReviewMapper;

    public PoetRelationService(PoetRelationMapper relationMapper,
                               PoetMapper poetMapper,
                               DynastyMapper dynastyMapper) {
        this(relationMapper, poetMapper, dynastyMapper, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public PoetRelationService(PoetRelationMapper relationMapper,
                               PoetMapper poetMapper,
                               DynastyMapper dynastyMapper,
                               ContentReviewMapper contentReviewMapper) {
        this.relationMapper = relationMapper;
        this.poetMapper = poetMapper;
        this.dynastyMapper = dynastyMapper;
        this.contentReviewMapper = contentReviewMapper;
    }

    /**
     * 查询所有诗人关系, 并组装为 G6 力导向图数据 (nodes + edges)。
     *
     * @return {nodes: [...], edges: [...]}
     */
    public Map<String, Object> getGraph() {
        List<PoetRelation> relations = relationMapper.selectList(
            new LambdaQueryWrapper<PoetRelation>().orderByAsc(PoetRelation::getRelationType));

        Set<Long> publishedRelationIds = null;
        if (!relations.isEmpty() && contentReviewMapper != null) {
            Set<Long> relationIds = relations.stream()
                    .map(PoetRelation::getId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            publishedRelationIds = relationIds.isEmpty() ? Collections.emptySet()
                    : contentReviewMapper.selectList(
                            new LambdaQueryWrapper<com.sjg.entity.ContentReview>()
                                    .eq(com.sjg.entity.ContentReview::getEntityType, "poet_relation")
                                    .eq(com.sjg.entity.ContentReview::getStatus, com.sjg.entity.ContentReview.PUBLISHED)
                                    .in(com.sjg.entity.ContentReview::getEntityId, relationIds))
                    .stream().map(com.sjg.entity.ContentReview::getEntityId).collect(Collectors.toSet());
        }

        // 收集所有涉及的诗人 id (去重)
        Set<Long> poetIds = new HashSet<>();
        for (PoetRelation r : relations) {
            poetIds.add(r.getPoetAId());
            poetIds.add(r.getPoetBId());
        }

        // 批量查诗人 + 朝代名
        Map<Long, Poet> poetMap = poetIds.isEmpty() ? Collections.emptyMap()
            : poetMapper.selectBatchIds(poetIds).stream()
                .collect(Collectors.toMap(Poet::getId, p -> p));
        if (!poetMap.isEmpty() && contentReviewMapper != null) {
            Set<Long> publishedIds = contentReviewMapper.selectList(
                    new LambdaQueryWrapper<com.sjg.entity.ContentReview>()
                            .eq(com.sjg.entity.ContentReview::getEntityType, "poet")
                            .eq(com.sjg.entity.ContentReview::getStatus, com.sjg.entity.ContentReview.PUBLISHED)
                            .in(com.sjg.entity.ContentReview::getEntityId, poetMap.keySet()))
                    .stream().map(com.sjg.entity.ContentReview::getEntityId).collect(Collectors.toSet());
            poetMap = poetMap.entrySet().stream()
                    .filter(entry -> publishedIds.contains(entry.getKey()))
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
        }
        Set<Long> dynastyIds = poetMap.values().stream()
            .map(Poet::getDynastyId).filter(Objects::nonNull).collect(Collectors.toSet());
        if (!dynastyIds.isEmpty() && contentReviewMapper != null) {
            Set<Long> publishedDynastyIds = contentReviewMapper.selectList(
                    new LambdaQueryWrapper<com.sjg.entity.ContentReview>()
                            .eq(com.sjg.entity.ContentReview::getEntityType, "dynasty")
                            .eq(com.sjg.entity.ContentReview::getStatus, com.sjg.entity.ContentReview.PUBLISHED)
                            .in(com.sjg.entity.ContentReview::getEntityId, dynastyIds))
                    .stream().map(com.sjg.entity.ContentReview::getEntityId).collect(Collectors.toSet());
            dynastyIds.retainAll(publishedDynastyIds);
        }
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
            if (publishedRelationIds != null && !publishedRelationIds.contains(r.getId())) {
                continue;
            }
            // 跳过引用不存在诗人的关系
            if (!poetMap.containsKey(r.getPoetAId()) || !poetMap.containsKey(r.getPoetBId())) {
                continue;
            }
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
        return data;
    }
}
