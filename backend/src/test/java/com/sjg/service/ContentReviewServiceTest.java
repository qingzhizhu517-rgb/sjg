package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.entity.ContentReview;
import com.sjg.entity.ContentSourceLink;
import com.sjg.entity.CulturalItem;
import com.sjg.entity.SourceDocument;
import com.sjg.mapper.ContentSourceLinkMapper;
import com.sjg.mapper.SourceDocumentMapper;
import com.sjg.mapper.ContentReviewMapper;
import com.sjg.mapper.DynastyMapper;
import com.sjg.mapper.EventMapper;
import com.sjg.mapper.CulturalItemMapper;
import com.sjg.mapper.PoemAnalysisMapper;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.PoetMapper;
import com.sjg.mapper.PoetRelationMapper;
import com.sjg.mapper.ScenicSpotMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.ArgumentCaptor;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.anyLong;

class ContentReviewServiceTest {

    private final ContentReviewMapper mapper = mock(ContentReviewMapper.class);
    private final SourceDocumentMapper sourceMapper = mock(SourceDocumentMapper.class);
    private final ContentSourceLinkMapper linkMapper = mock(ContentSourceLinkMapper.class);
    private final DynastyMapper dynastyMapper = mock(DynastyMapper.class);
    private final PoemMapper poemMapper = mock(PoemMapper.class);
    private final PoetMapper poetMapper = mock(PoetMapper.class);
    private final ScenicSpotMapper scenicSpotMapper = mock(ScenicSpotMapper.class);
    private final EventMapper eventMapper = mock(EventMapper.class);
    private final CulturalItemMapper culturalItemMapper = mock(CulturalItemMapper.class);
    private final PoemAnalysisMapper poemAnalysisMapper = mock(PoemAnalysisMapper.class);
    private final PoetRelationMapper poetRelationMapper = mock(PoetRelationMapper.class);
    private final ContentReviewService service = new ContentReviewService(mapper, sourceMapper, linkMapper,
            dynastyMapper, poemMapper, poetMapper, scenicSpotMapper, eventMapper,
            culturalItemMapper, poemAnalysisMapper, poetRelationMapper);

    @BeforeEach
    void stubExistingEntities() {
        when(poemMapper.selectById(anyLong())).thenReturn(new com.sjg.entity.Poem());
        when(culturalItemMapper.selectById(anyLong())).thenReturn(new CulturalItem());
    }

    @Test
    void rejectsReviewTransitionForMissingBusinessEntity() {
        when(poemMapper.selectById(404L)).thenReturn(null);
        when(mapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.transition("poem", 404L, ContentReview.NEEDS_REVIEW, null, "待核验"));

        assertEquals("实体不存在：poem 404", error.getMessage());
    }

    @Test
    void advancesReviewThroughApprovedToPublished() {
        ContentReview review = review(ContentReview.NEEDS_REVIEW);
        when(mapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(review);
        when(linkMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(1L);

        service.transition("poem", 1L, ContentReview.APPROVED, 7L, "来源已核验");
        assertEquals(ContentReview.APPROVED, review.getStatus());
        verify(mapper).updateById(review);

        when(mapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(review);
        service.transition("poem", 1L, ContentReview.PUBLISHED, 7L, "发布");
        assertEquals(ContentReview.PUBLISHED, review.getStatus());
    }

    @Test
    void rejectsPublishingEntityWithoutSourceLink() {
        ContentReview review = review(ContentReview.APPROVED);
        when(mapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(review);
        when(linkMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);

        IllegalStateException error = assertThrows(IllegalStateException.class,
                () -> service.transition("poem", 1L, ContentReview.PUBLISHED, 7L, "发布"));

        assertEquals("实体至少需要一条来源关联才能发布", error.getMessage());
    }

    @Test
    void publishingCulturalItemSyncsLegacyStatus() {
        ContentReview review = review(ContentReview.APPROVED);
        when(mapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(review);
        when(linkMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(1L);

        service.transition("cultural_item", 2L, ContentReview.PUBLISHED, 7L, "发布");

        ArgumentCaptor<CulturalItem> captor = ArgumentCaptor.forClass(CulturalItem.class);
        verify(culturalItemMapper).updateById(captor.capture());
        assertEquals(2L, captor.getValue().getId());
        assertEquals(CulturalItemService.STATUS_PUBLISHED, captor.getValue().getStatus());
    }

    @Test
    void rejectsSkippingReview() {
        ContentReview review = review(ContentReview.NEEDS_REVIEW);
        when(mapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(review);

        assertThrows(IllegalStateException.class,
                () -> service.transition("poem", 1L, ContentReview.PUBLISHED, 7L, null));
    }

    @Test
    void createsOnlyNeedsReviewWhenRecordIsMissing() {
        when(mapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);

        ContentReview created = service.transition("cultural_item", 2L,
                ContentReview.NEEDS_REVIEW, null, "AI 内容");

        assertEquals(ContentReview.NEEDS_REVIEW, created.getStatus());
        verify(mapper).insert(created);
    }

    @Test
    void buildsSourceSummaryWithReviewStatus() {
        ContentSourceLink link = new ContentSourceLink();
        link.setSourceDocumentId(5L);
        link.setEntityType("poem");
        link.setEntityId(1L);
        link.setLocator("第 12 页");
        link.setQuote("床前明月光");

        SourceDocument source = new SourceDocument();
        source.setId(5L);
        source.setTitle("唐诗选注");
        source.setPublicationYear(1982);
        source.setUrl("https://example.test/book");

        ContentReview review = review(ContentReview.APPROVED);
        when(linkMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(java.util.List.of(link));
        when(sourceMapper.selectById(5L)).thenReturn(source);
        when(mapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(review);

        var summaries = service.listSourceSummaries("poem", 1L);

        assertEquals(1, summaries.size());
        assertEquals("唐诗选注", summaries.get(0).getTitle());
        assertEquals("第 12 页", summaries.get(0).getLocator());
        assertEquals(ContentReview.APPROVED, summaries.get(0).getReviewStatus());
        assertNotNull(summaries.get(0).getSourceId());
    }

    @Test
    void rejectsLinkWhenBusinessEntityDoesNotExist() {
        ContentSourceLink link = new ContentSourceLink();
        link.setEntityType("poem");
        link.setEntityId(404L);
        link.setSourceDocumentId(5L);
        when(sourceMapper.selectById(5L)).thenReturn(new SourceDocument());
        when(poemMapper.selectById(404L)).thenReturn(null);

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.linkSource(link));

        assertEquals("实体不存在：poem 404", error.getMessage());
    }

    @Test
    void rejectsDuplicateEntitySourceLocator() {
        ContentSourceLink link = new ContentSourceLink();
        link.setEntityType("poem");
        link.setEntityId(1L);
        link.setSourceDocumentId(5L);
        link.setLocator("第 12 页");
        when(sourceMapper.selectById(5L)).thenReturn(new SourceDocument());
        when(poemMapper.selectById(1L)).thenReturn(new com.sjg.entity.Poem());
        when(linkMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(new ContentSourceLink());

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.linkSource(link));

        assertEquals("该实体与来源已存在相同定位的关联", error.getMessage());
    }

    @Test
    void acceptsSourceLinkForPoetRelationAndUsesItsGovernanceType() {
        ContentSourceLink link = new ContentSourceLink();
        link.setEntityType("relation");
        link.setEntityId(12L);
        link.setSourceDocumentId(5L);
        when(sourceMapper.selectById(5L)).thenReturn(new SourceDocument());
        when(poetRelationMapper.selectById(12L)).thenReturn(new com.sjg.entity.PoetRelation());
        when(linkMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);

        ContentSourceLink created = service.linkSource(link);

        assertEquals("poet_relation", created.getEntityType());
        verify(linkMapper).insert(created);
    }

    @Test
    void updatesSourceMetadata() {
        SourceDocument current = new SourceDocument();
        current.setId(5L);
        current.setTitle("旧标题");
        when(sourceMapper.selectById(5L)).thenReturn(current);

        SourceDocument incoming = new SourceDocument();
        incoming.setTitle("新标题");
        incoming.setAuthorOrg("山东大学");

        SourceDocument updated = service.updateSource(5L, incoming);

        assertEquals(5L, updated.getId());
        assertEquals("新标题", updated.getTitle());
        verify(sourceMapper).updateById(updated);
    }

    private ContentReview review(String status) {
        ContentReview review = new ContentReview();
        review.setId(10L);
        review.setEntityType("poem");
        review.setEntityId(1L);
        review.setStatus(status);
        return review;
    }
}
