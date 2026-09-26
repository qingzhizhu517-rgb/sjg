package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.mapper.ContentReviewMapper;
import com.sjg.mapper.ContentSourceLinkMapper;
import com.sjg.mapper.PoemAnalysisMapper;
import com.sjg.entity.PoemAnalysis;
import com.sjg.entity.ContentReview;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class ContentGovernanceCleanupServiceTest {

    @Test
    void deleteEntityReferencesRemovesLinksAndReviewRows() {
        ContentReviewMapper reviewMapper = mock(ContentReviewMapper.class);
        ContentSourceLinkMapper sourceLinkMapper = mock(ContentSourceLinkMapper.class);
        ContentGovernanceCleanupService service =
                new ContentGovernanceCleanupService(reviewMapper, sourceLinkMapper);

        service.deleteEntityReferences("poem", List.of(7L, 8L));

        verify(sourceLinkMapper).delete(any(LambdaQueryWrapper.class));
        verify(reviewMapper).delete(any(LambdaQueryWrapper.class));
    }

    @Test
    void deletePoemsRemovesAnalysesAndTheirGovernanceRows() {
        ContentReviewMapper reviewMapper = mock(ContentReviewMapper.class);
        ContentSourceLinkMapper sourceLinkMapper = mock(ContentSourceLinkMapper.class);
        PoemAnalysisMapper analysisMapper = mock(PoemAnalysisMapper.class);
        ContentGovernanceCleanupService service =
                new ContentGovernanceCleanupService(reviewMapper, sourceLinkMapper, analysisMapper);

        PoemAnalysis analysis = new PoemAnalysis();
        analysis.setId(70L);
        analysis.setPoemId(7L);
        org.mockito.Mockito.when(analysisMapper.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(List.of(analysis));

        service.deletePoems(List.of(7L));

        verify(analysisMapper).selectList(any(LambdaQueryWrapper.class));
        verify(analysisMapper).delete(any(LambdaQueryWrapper.class));
        verify(sourceLinkMapper, org.mockito.Mockito.times(2)).delete(any(LambdaQueryWrapper.class));
        verify(reviewMapper, org.mockito.Mockito.times(2)).delete(any(LambdaQueryWrapper.class));
    }

    @Test
    void ensureNeedsReviewIsIdempotentAndKeepsExistingStatus() {
        ContentReviewMapper reviewMapper = mock(ContentReviewMapper.class);
        ContentSourceLinkMapper sourceLinkMapper = mock(ContentSourceLinkMapper.class);
        ContentGovernanceCleanupService service =
                new ContentGovernanceCleanupService(reviewMapper, sourceLinkMapper);

        org.mockito.Mockito.when(reviewMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);
        service.ensureNeedsReview("poem", 7L);
        verify(reviewMapper).insert(org.mockito.ArgumentMatchers.argThat(review ->
                "poem".equals(review.getEntityType())
                        && Long.valueOf(7L).equals(review.getEntityId())
                        && ContentReview.NEEDS_REVIEW.equals(review.getStatus())));

        ContentReview existing = new ContentReview();
        existing.setStatus(ContentReview.PUBLISHED);
        org.mockito.Mockito.when(reviewMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(existing);
        service.ensureNeedsReview("poem", 7L);
        verify(reviewMapper, org.mockito.Mockito.times(1)).insert(any(ContentReview.class));
    }

    @Test
    void resetReviewForEditDemotesPublishedEntity() {
        ContentReviewMapper reviewMapper = mock(ContentReviewMapper.class);
        ContentSourceLinkMapper sourceLinkMapper = mock(ContentSourceLinkMapper.class);
        ContentGovernanceCleanupService service =
                new ContentGovernanceCleanupService(reviewMapper, sourceLinkMapper);
        ContentReview existing = new ContentReview();
        existing.setStatus(ContentReview.PUBLISHED);
        existing.setReviewerId(9L);
        org.mockito.Mockito.when(reviewMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(existing);

        service.resetReviewForEdit("poem", 7L);

        org.mockito.ArgumentCaptor<ContentReview> captor =
                org.mockito.ArgumentCaptor.forClass(ContentReview.class);
        verify(reviewMapper).updateById(captor.capture());
        org.junit.jupiter.api.Assertions.assertEquals(ContentReview.NEEDS_REVIEW, captor.getValue().getStatus());
        org.junit.jupiter.api.Assertions.assertNull(captor.getValue().getReviewerId());
    }
}
