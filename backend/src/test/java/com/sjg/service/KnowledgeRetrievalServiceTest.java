package com.sjg.service;

import com.sjg.entity.CulturalItem;
import com.sjg.entity.ContentSourceLink;
import com.sjg.entity.ContentReview;
import com.sjg.entity.Poem;
import com.sjg.entity.PoemAnalysis;
import com.sjg.entity.Poet;
import com.sjg.entity.PoetRelation;
import com.sjg.mapper.ContentSourceLinkMapper;
import com.sjg.mapper.ContentReviewMapper;
import com.sjg.mapper.CulturalItemMapper;
import com.sjg.mapper.EventMapper;
import com.sjg.mapper.PoemAnalysisMapper;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.PoetMapper;
import com.sjg.mapper.PoetRelationMapper;
import com.sjg.mapper.ScenicSpotMapper;
import com.sjg.dto.EntityContext;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class KnowledgeRetrievalServiceTest {

    private final PoetMapper poetMapper = mock(PoetMapper.class);
    private final PoemMapper poemMapper = mock(PoemMapper.class);
    private final ScenicSpotMapper spotMapper = mock(ScenicSpotMapper.class);
    private final CulturalItemMapper culturalMapper = mock(CulturalItemMapper.class);
    private final EventMapper eventMapper = mock(EventMapper.class);
    private final PoetRelationMapper relationMapper = mock(PoetRelationMapper.class);
    private final PoemAnalysisMapper analysisMapper = mock(PoemAnalysisMapper.class);
    private final ContentSourceLinkMapper sourceLinkMapper = mock(ContentSourceLinkMapper.class);
    private final ContentReviewMapper reviewMapper = mock(ContentReviewMapper.class);
    private final KnowledgeRetrievalService service = new KnowledgeRetrievalService(
            poetMapper, poemMapper, spotMapper, culturalMapper, eventMapper,
            relationMapper, analysisMapper, sourceLinkMapper, reviewMapper);

    @Test
    void entityContextIsRankedFirstAndContainsStableIds() {
        Poem poem = new Poem();
        poem.setId(7L);
        poem.setTitle("静夜思");
        poem.setContent("床前明月光");
        when(poemMapper.selectById(7L)).thenReturn(poem);
        when(reviewMapper.selectOne(any())).thenReturn(publishedReview());

        List<?> evidence = service.retrieve("月亮", new EntityContext("poem", 7L, null, null));

        assertEquals(1, evidence.size());
        var snippet = (com.sjg.dto.EvidenceSnippet) evidence.get(0);
        assertEquals("poem", snippet.entityType());
        assertEquals(7L, snippet.entityId());
        assertEquals("《静夜思》", snippet.title());
        assertTrue(snippet.snippet().contains("床前明月光"));
    }

    @Test
    void evidenceContainsLinkedSourceIds() {
        Poem poem = new Poem();
        poem.setId(7L);
        poem.setTitle("静夜思");
        poem.setContent("床前明月光");
        when(poemMapper.selectById(7L)).thenReturn(poem);
        when(reviewMapper.selectOne(any())).thenReturn(publishedReview());

        ContentSourceLink link = new ContentSourceLink();
        link.setSourceDocumentId(3L);
        when(sourceLinkMapper.selectList(any())).thenReturn(List.of(link));

        var evidence = service.retrieve("月亮", new EntityContext("poem", 7L, null, null));

        var snippet = (com.sjg.dto.EvidenceSnippet) evidence.get(0);
        assertEquals(List.of(3L), snippet.sourceIds());
    }

    @Test
    void unreviewedEntityIsExcludedFromPublicEvidence() {
        Poem poem = new Poem();
        poem.setId(7L);
        poem.setTitle("静夜思");
        poem.setContent("床前明月光");
        when(poemMapper.selectById(7L)).thenReturn(poem);

        ContentReview review = new ContentReview();
        review.setStatus(ContentReview.NEEDS_REVIEW);
        when(reviewMapper.selectOne(any())).thenReturn(review);

        assertTrue(service.retrieve("月亮", new EntityContext("poem", 7L, null, null)).isEmpty());
    }

    @Test
    void culturalItemQueryUsesDedicatedDomain() {
        CulturalItem item = new CulturalItem();
        item.setId(3L);
        item.setTitle("泉水文化");
        item.setContent("济南泉水与城市生活");
        when(culturalMapper.selectList(any())).thenReturn(List.of(item));
        when(reviewMapper.selectOne(any())).thenReturn(publishedReview());

        var evidence = service.retrieve("泉水", EntityContext.empty());

        assertTrue(evidence.stream().anyMatch(s -> "cultural_item".equals(s.entityType())
                && s.entityId().equals(3L)));
    }

    @Test
    void publishedAnalysisIsIncludedAsEvidence() {
        PoemAnalysis analysis = new PoemAnalysis();
        analysis.setId(9L);
        analysis.setPoemId(7L);
        analysis.setAnalysis("月亮意象与思乡情感");
        when(analysisMapper.selectList(any())).thenReturn(List.of(analysis));
        when(reviewMapper.selectOne(any())).thenReturn(publishedReview());

        var evidence = service.retrieve("思乡", EntityContext.empty());

        assertTrue(evidence.stream().anyMatch(s -> "poem_analysis".equals(s.entityType())
                && s.entityId().equals(9L)
                && s.snippet().contains("思乡")));
    }

    @Test
    void unpublishedAnalysisIsExcludedFromEvidence() {
        PoemAnalysis analysis = new PoemAnalysis();
        analysis.setId(9L);
        analysis.setPoemId(7L);
        analysis.setAnalysis("月亮意象与思乡情感");
        when(analysisMapper.selectList(any())).thenReturn(List.of(analysis));
        ContentReview review = new ContentReview();
        review.setStatus(ContentReview.NEEDS_REVIEW);
        when(reviewMapper.selectOne(any())).thenReturn(review);

        var evidence = service.retrieve("思乡", EntityContext.empty());

        assertTrue(evidence.stream().noneMatch(s -> "poem_analysis".equals(s.entityType())));
    }

    @Test
    void relationBetweenPublishedPoetsIsIncludedAsEvidence() {
        PoetRelation relation = new PoetRelation();
        relation.setId(12L);
        relation.setPoetAId(1L);
        relation.setPoetBId(2L);
        relation.setRelationType("交游");
        relation.setDescription("同游齐鲁山水");
        Poet first = new Poet();
        first.setId(1L);
        first.setName("甲");
        Poet second = new Poet();
        second.setId(2L);
        second.setName("乙");
        when(relationMapper.selectList(any())).thenReturn(List.of(relation));
        when(poetMapper.selectById(1L)).thenReturn(first);
        when(poetMapper.selectById(2L)).thenReturn(second);
        when(reviewMapper.selectOne(any())).thenReturn(publishedReview());

        var evidence = service.retrieve("交游", EntityContext.empty());

        assertTrue(evidence.stream().anyMatch(s -> "relation".equals(s.entityType())
                && s.entityId().equals(12L)
                && s.title().contains("甲")
                && s.title().contains("乙")));
    }

    @Test
    void relationEvidenceUsesPoetRelationReviewAndSourceLinks() {
        PoetRelation relation = new PoetRelation();
        relation.setId(12L);
        relation.setPoetAId(1L);
        relation.setPoetBId(2L);
        relation.setRelationType("交游");
        relation.setDescription("同游齐鲁山水");
        Poet first = new Poet();
        first.setId(1L);
        first.setName("甲");
        Poet second = new Poet();
        second.setId(2L);
        second.setName("乙");
        when(relationMapper.selectList(any())).thenReturn(List.of(relation));
        when(poetMapper.selectById(1L)).thenReturn(first);
        when(poetMapper.selectById(2L)).thenReturn(second);
        when(reviewMapper.selectOne(any())).thenReturn(publishedReview());
        ContentSourceLink link = new ContentSourceLink();
        link.setSourceDocumentId(8L);
        when(sourceLinkMapper.selectList(any())).thenReturn(List.of(link));

        var evidence = service.retrieve("交游", EntityContext.empty());

        verify(relationMapper, atLeastOnce()).selectList(any());
        assertTrue(!evidence.isEmpty(), evidence.toString());
        var snippet = evidence.stream().filter(s -> "relation".equals(s.entityType())).findFirst().orElseThrow();
        assertEquals(List.of(8L), snippet.sourceIds());
        verify(sourceLinkMapper, atLeastOnce()).selectList(any());
    }

    @Test
    void contextParserKeepsBackwardCompatibleTypeAndIds() {
        EntityContext context = EntityContext.from(Map.of(
                "type", "poem", "poemId", "12", "region", "济南", "dynastyId", "4"));

        assertEquals("poem", context.type());
        assertEquals(12L, context.entityId());
        assertEquals("济南", context.region());
        assertEquals(4L, context.dynastyId());
    }

    private ContentReview publishedReview() {
        ContentReview review = new ContentReview();
        review.setStatus(ContentReview.PUBLISHED);
        return review;
    }
}
