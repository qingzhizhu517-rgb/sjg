package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.dto.EntityContext;
import com.sjg.dto.EvidenceSnippet;
import com.sjg.entity.CulturalItem;
import com.sjg.entity.ContentReview;
import com.sjg.entity.Event;
import com.sjg.entity.Poem;
import com.sjg.entity.PoemAnalysis;
import com.sjg.entity.Poet;
import com.sjg.entity.PoetRelation;
import com.sjg.entity.ScenicSpot;
import com.sjg.mapper.CulturalItemMapper;
import com.sjg.mapper.ContentSourceLinkMapper;
import com.sjg.mapper.ContentReviewMapper;
import com.sjg.mapper.EventMapper;
import com.sjg.mapper.PoemAnalysisMapper;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.PoetMapper;
import com.sjg.mapper.PoetRelationMapper;
import com.sjg.mapper.ScenicSpotMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class KnowledgeRetrievalService {

    private static final int MAX_SNIPPETS = 6;

    private final PoetMapper poetMapper;
    private final PoemMapper poemMapper;
    private final ScenicSpotMapper spotMapper;
    private final CulturalItemMapper culturalMapper;
    private final EventMapper eventMapper;
    private final PoetRelationMapper relationMapper;
    private final PoemAnalysisMapper analysisMapper;
    private final ContentSourceLinkMapper sourceLinkMapper;
    private final ContentReviewMapper reviewMapper;

    public KnowledgeRetrievalService(PoetMapper poetMapper, PoemMapper poemMapper,
                                     ScenicSpotMapper spotMapper, CulturalItemMapper culturalMapper,
                                     EventMapper eventMapper, PoetRelationMapper relationMapper,
                                     PoemAnalysisMapper analysisMapper) {
        this(poetMapper, poemMapper, spotMapper, culturalMapper, eventMapper,
                relationMapper, analysisMapper, null);
    }

    public KnowledgeRetrievalService(PoetMapper poetMapper, PoemMapper poemMapper,
                                     ScenicSpotMapper spotMapper, CulturalItemMapper culturalMapper,
                                     EventMapper eventMapper, PoetRelationMapper relationMapper,
                                     PoemAnalysisMapper analysisMapper,
                                     ContentSourceLinkMapper sourceLinkMapper) {
        this(poetMapper, poemMapper, spotMapper, culturalMapper, eventMapper,
                relationMapper, analysisMapper, sourceLinkMapper, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public KnowledgeRetrievalService(PoetMapper poetMapper, PoemMapper poemMapper,
                                     ScenicSpotMapper spotMapper, CulturalItemMapper culturalMapper,
                                     EventMapper eventMapper, PoetRelationMapper relationMapper,
                                     PoemAnalysisMapper analysisMapper,
                                     ContentSourceLinkMapper sourceLinkMapper,
                                     ContentReviewMapper reviewMapper) {
        this.poetMapper = poetMapper;
        this.poemMapper = poemMapper;
        this.spotMapper = spotMapper;
        this.culturalMapper = culturalMapper;
        this.eventMapper = eventMapper;
        this.relationMapper = relationMapper;
        this.analysisMapper = analysisMapper;
        this.sourceLinkMapper = sourceLinkMapper;
        this.reviewMapper = reviewMapper;
    }

    public List<EvidenceSnippet> retrieve(String query, EntityContext context) {
        Map<String, EvidenceSnippet> deduplicated = new LinkedHashMap<>();
        addContextEntity(deduplicated, context);
        String keyword = normalizeQuery(query);
        if (!keyword.isBlank()) {
            addPoems(deduplicated, keyword);
            addPoets(deduplicated, keyword);
            addSpots(deduplicated, keyword);
            addCulturalItems(deduplicated, keyword);
            addEvents(deduplicated, keyword);
            addAnalyses(deduplicated, keyword);
            addRelations(deduplicated, keyword);
        }
        return new ArrayList<>(deduplicated.values()).subList(0,
                Math.min(MAX_SNIPPETS, deduplicated.size()));
    }

    public String toPromptContext(List<EvidenceSnippet> snippets) {
        if (snippets == null || snippets.isEmpty()) return "";
        StringBuilder out = new StringBuilder();
        for (EvidenceSnippet snippet : snippets) {
            out.append("【").append(snippet.entityType()).append("】")
                    .append(snippet.title()).append("：")
                    .append(snippet.snippet()).append("\n");
        }
        return out.toString().trim();
    }

    private void addContextEntity(Map<String, EvidenceSnippet> out, EntityContext context) {
        if (context == null || context.entityId() == null || !StringUtils.hasText(context.type())) return;
        try {
            switch (context.type()) {
                case "poem" -> {
                    add(out, poemMapper.selectById(context.entityId()), context);
                    addAnalysesForPoem(out, context.entityId(), context);
                }
                case "poet" -> add(out, poetMapper.selectById(context.entityId()), context);
                case "spot" -> add(out, spotMapper.selectById(context.entityId()), context);
                case "cultural", "cultural_item" -> add(out, culturalMapper.selectById(context.entityId()), context);
                case "event" -> add(out, eventMapper.selectById(context.entityId()), context);
                default -> { }
            }
            if ("poet".equals(context.type())) addRelationsForPoet(out, context.entityId(), context);
        } catch (Exception ignored) {
            // 当前页面实体查询失败时继续走关键词检索。
        }
    }

    private void addPoems(Map<String, EvidenceSnippet> out, String keyword) {
        try {
            List<Poem> rows = poemMapper.selectList(new LambdaQueryWrapper<Poem>()
                    .like(Poem::getTitle, keyword).or().like(Poem::getContent, keyword)
                    .or().like(Poem::getBackground, keyword).last("LIMIT 3"));
            for (Poem row : rows) add(out, row, null);
        } catch (Exception ignored) { }
    }

    private void addPoets(Map<String, EvidenceSnippet> out, String keyword) {
        try {
            List<Poet> rows = poetMapper.selectList(new LambdaQueryWrapper<Poet>()
                    .like(Poet::getName, keyword).or().like(Poet::getBiography, keyword)
                    .or().like(Poet::getBirthplace, keyword).last("LIMIT 3"));
            for (Poet row : rows) add(out, row, null);
        } catch (Exception ignored) { }
    }

    private void addSpots(Map<String, EvidenceSnippet> out, String keyword) {
        try {
            List<ScenicSpot> rows = spotMapper.selectList(new LambdaQueryWrapper<ScenicSpot>()
                    .like(ScenicSpot::getName, keyword).or().like(ScenicSpot::getDescription, keyword)
                    .or().like(ScenicSpot::getRegion, keyword).last("LIMIT 3"));
            for (ScenicSpot row : rows) add(out, row, null);
        } catch (Exception ignored) { }
    }

    private void addCulturalItems(Map<String, EvidenceSnippet> out, String keyword) {
        try {
            List<CulturalItem> rows = culturalMapper.selectList(new LambdaQueryWrapper<CulturalItem>()
                    .like(CulturalItem::getTitle, keyword).or().like(CulturalItem::getSummary, keyword)
                    .or().like(CulturalItem::getContent, keyword).last("LIMIT 3"));
            for (CulturalItem row : rows) add(out, row, null);
        } catch (Exception ignored) { }
    }

    private void addEvents(Map<String, EvidenceSnippet> out, String keyword) {
        try {
            List<Event> rows = eventMapper.selectList(new LambdaQueryWrapper<Event>()
                    .like(Event::getTitle, keyword).or().like(Event::getDescription, keyword)
                    .or().like(Event::getSignificance, keyword).last("LIMIT 3"));
            for (Event row : rows) add(out, row, null);
        } catch (Exception ignored) { }
    }

    private void addAnalyses(Map<String, EvidenceSnippet> out, String keyword) {
        try {
            List<PoemAnalysis> rows = analysisMapper.selectList(new LambdaQueryWrapper<PoemAnalysis>()
                    .like(PoemAnalysis::getAnalysis, keyword).last("LIMIT 3"));
            for (PoemAnalysis row : rows) add(out, row, null);
        } catch (Exception ignored) { }
    }

    private void addAnalysesForPoem(Map<String, EvidenceSnippet> out, Long poemId, EntityContext context) {
        if (poemId == null) return;
        try {
            List<PoemAnalysis> rows = analysisMapper.selectList(new LambdaQueryWrapper<PoemAnalysis>()
                    .eq(PoemAnalysis::getPoemId, poemId).last("LIMIT 2"));
            for (PoemAnalysis row : rows) add(out, row, context);
        } catch (Exception ignored) { }
    }

    private void addRelations(Map<String, EvidenceSnippet> out, String keyword) {
        try {
            List<PoetRelation> rows = relationMapper.selectList(new LambdaQueryWrapper<PoetRelation>()
                    .and(w -> w.like(PoetRelation::getRelationType, keyword)
                            .or().like(PoetRelation::getDescription, keyword))
                    .last("LIMIT 3"));
            for (PoetRelation row : rows) add(out, row, null);
        } catch (Exception ignored) { }
    }

    private void addRelationsForPoet(Map<String, EvidenceSnippet> out, Long poetId, EntityContext context) {
        if (poetId == null) return;
        try {
            List<PoetRelation> rows = relationMapper.selectList(new LambdaQueryWrapper<PoetRelation>()
                    .and(w -> w.eq(PoetRelation::getPoetAId, poetId)
                            .or().eq(PoetRelation::getPoetBId, poetId))
                    .last("LIMIT 3"));
            for (PoetRelation row : rows) add(out, row, context);
        } catch (Exception ignored) { }
    }

    private void add(Map<String, EvidenceSnippet> out, Object row, EntityContext context) {
        if (row == null) return;
        String entityType = entityType(row);
        Long entityId = entityId(row);
        if (!isPubliclyPublished(entityType, entityId)) return;
        if (row instanceof PoemAnalysis analysis
                && !isPubliclyPublished("poem", analysis.getPoemId())) return;
        if (row instanceof PoetRelation relation && !isRelationPublic(relation)) return;
        EvidenceSnippet snippet = toSnippet(row, context);
        if (snippet != null) out.putIfAbsent(snippet.entityType() + ":" + snippet.entityId(), snippet);
    }

    private boolean isRelationPublic(PoetRelation relation) {
        return relation != null
                && isPubliclyPublished("poet", relation.getPoetAId())
                && isPubliclyPublished("poet", relation.getPoetBId());
    }

    private boolean isPubliclyPublished(String entityType, Long entityId) {
        if (reviewMapper == null || entityId == null || entityType == null) return true;
        String storedType = storedEntityType(entityType);
        try {
            var review = reviewMapper.selectOne(new LambdaQueryWrapper<ContentReview>()
                    .eq(ContentReview::getEntityType, storedType)
                    .eq(ContentReview::getEntityId, entityId));
            return review != null && ContentReview.PUBLISHED.equals(review.getStatus());
        } catch (Exception ignored) {
            return false;
        }
    }

    private String entityType(Object row) {
        if (row instanceof Poem) return "poem";
        if (row instanceof Poet) return "poet";
        if (row instanceof ScenicSpot) return "spot";
        if (row instanceof CulturalItem) return "cultural_item";
        if (row instanceof Event) return "event";
        if (row instanceof PoemAnalysis) return "poem_analysis";
        if (row instanceof PoetRelation) return "relation";
        return null;
    }

    private Long entityId(Object row) {
        if (row instanceof Poem poem) return poem.getId();
        if (row instanceof Poet poet) return poet.getId();
        if (row instanceof ScenicSpot spot) return spot.getId();
        if (row instanceof CulturalItem item) return item.getId();
        if (row instanceof Event event) return event.getId();
        if (row instanceof PoemAnalysis analysis) return analysis.getId();
        if (row instanceof PoetRelation relation) return relation.getId();
        return null;
    }

    private EvidenceSnippet toSnippet(Object row, EntityContext context) {
        if (row instanceof Poem poem) {
            return snippet("poem", poem.getId(), "《" + safe(poem.getTitle()) + "》",
                    firstNonBlank(poem.getContent(), poem.getBackground()), context);
        }
        if (row instanceof Poet poet) {
            return snippet("poet", poet.getId(), safe(poet.getName()),
                    firstNonBlank(poet.getBiography(), poet.getStyle(), poet.getBirthplace()), context);
        }
        if (row instanceof ScenicSpot spot) {
            return snippet("spot", spot.getId(), safe(spot.getName()),
                    firstNonBlank(spot.getDescription(), spot.getRegion(), spot.getAddress()), context);
        }
        if (row instanceof CulturalItem item) {
            return snippet("cultural_item", item.getId(), safe(item.getTitle()),
                    firstNonBlank(item.getContent(), item.getSummary(), item.getRegion()), context);
        }
        if (row instanceof Event event) {
            return snippet("event", event.getId(), safe(event.getTitle()),
                    firstNonBlank(event.getDescription(), event.getSignificance()), context);
        }
        if (row instanceof PoemAnalysis analysis) {
            String title = "诗词赏析";
            try {
                Poem poem = analysis.getPoemId() == null ? null : poemMapper.selectById(analysis.getPoemId());
                if (poem != null && StringUtils.hasText(poem.getTitle())) {
                    title = "《" + poem.getTitle() + "》赏析";
                }
            } catch (Exception ignored) { }
            return snippet("poem_analysis", analysis.getId(), title, analysis.getAnalysis(), context);
        }
        if (row instanceof PoetRelation relation) {
            String first = String.valueOf(relation.getPoetAId());
            String second = String.valueOf(relation.getPoetBId());
            try {
                Poet poetA = poetMapper.selectById(relation.getPoetAId());
                Poet poetB = poetMapper.selectById(relation.getPoetBId());
                if (poetA != null && StringUtils.hasText(poetA.getName())) first = poetA.getName();
                if (poetB != null && StringUtils.hasText(poetB.getName())) second = poetB.getName();
            } catch (Exception ignored) { }
            String relationType = safe(relation.getRelationType());
            String title = first + " × " + second + (relationType.isBlank() ? "" : "（" + relationType + "）");
            return snippet("relation", relation.getId(), title,
                    firstNonBlank(relation.getDescription(), relationType), context);
        }
        return null;
    }

    private EvidenceSnippet snippet(String type, Long id, String title, String body, EntityContext context) {
        double score = context != null && type.equals(context.type()) && id != null
                && id.equals(context.entityId()) ? 100.0 : 1.0;
        return new EvidenceSnippet(type, id, title, truncate(body, 500), sourceIds(type, id), score);
    }

    private List<Long> sourceIds(String entityType, Long entityId) {
        if (sourceLinkMapper == null || entityId == null) return Collections.emptyList();
        String storedType = storedEntityType(entityType);
        try {
            List<com.sjg.entity.ContentSourceLink> links = sourceLinkMapper.selectList(
                    new LambdaQueryWrapper<com.sjg.entity.ContentSourceLink>()
                            .eq(com.sjg.entity.ContentSourceLink::getEntityType, storedType)
                            .eq(com.sjg.entity.ContentSourceLink::getEntityId, entityId)
                            .orderByAsc(com.sjg.entity.ContentSourceLink::getId));
            if (links == null || links.isEmpty()) return Collections.emptyList();
            return links.stream()
                    .map(com.sjg.entity.ContentSourceLink::getSourceDocumentId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();
        } catch (Exception ignored) {
            return Collections.emptyList();
        }
    }

    private String storedEntityType(String entityType) {
        if ("spot".equals(entityType)) return "scenic_spot";
        if ("relation".equals(entityType)) return "poet_relation";
        return entityType;
    }

    private String normalizeQuery(String query) {
        return query == null ? "" : query.replaceAll("[\\s，。、；：！？,.?!;:（）()【】\\[\\]\\\"'“”‘’]", "").trim();
    }

    private String firstNonBlank(String... values) {
        for (String value : values) if (StringUtils.hasText(value)) return value;
        return "暂无摘要";
    }

    private String safe(String value) { return value == null ? "" : value; }

    private String truncate(String value, int max) {
        if (value == null) return "";
        return value.length() > max ? value.substring(0, max) + "…" : value;
    }
}
