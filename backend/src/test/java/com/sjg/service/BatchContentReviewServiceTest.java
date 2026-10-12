package com.sjg.service;

import com.sjg.dto.BatchReviewRequest;
import com.sjg.entity.ContentReview;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BatchContentReviewServiceTest {
    private final ContentReviewService reviews = mock(ContentReviewService.class);
    private final BatchContentReviewService batch = new BatchContentReviewService(reviews);

    @Test void partialFailureDoesNotStopLaterItemsAndDuplicateIsNotProcessedTwice() {
        ContentReview published = new ContentReview();
        published.setId(1L); published.setEntityType("poem"); published.setEntityId(11L);
        published.setStatus(ContentReview.PUBLISHED);
        when(reviews.approveAndPublish(1L, 42L, "来源已核验")).thenReturn(published);
        when(reviews.approveAndPublish(2L, 42L, "来源已核验"))
                .thenThrow(new IllegalStateException("实体至少需要一条来源关联才能发布"));
        when(reviews.approveAndPublish(3L, 42L, "来源已核验")).thenReturn(published);
        var result = batch.approveAndPublish(new BatchReviewRequest(List.of(1L,2L,3L,1L), "来源已核验"), 42L);
        assertEquals(4, result.total()); assertEquals(2, result.successCount()); assertEquals(2, result.failureCount());
        assertEquals(List.of(1L,2L,3L,1L), result.items().stream().map(item -> item.reviewId()).toList());
        assertEquals("published", result.items().get(0).status());
        assertTrue(result.items().get(1).message().contains("来源"));
        assertTrue(result.items().get(2).success());
        assertTrue(result.items().get(3).message().contains("重复"));
        verify(reviews, times(1)).approveAndPublish(1L,42L,"来源已核验");
    }

    @Test void unexpectedDatabaseFailureIsSanitizedAndNextItemContinues() {
        when(reviews.approveAndPublish(1L,42L,null)).thenThrow(new RuntimeException("password=private sql"));
        when(reviews.approveAndPublish(2L,42L,null)).thenThrow(new IllegalArgumentException("审核记录不存在"));
        var result = batch.approveAndPublish(new BatchReviewRequest(List.of(1L,2L),null),42L);
        assertEquals(2,result.failureCount());
        assertEquals("处理失败，请刷新队列核对后重试", result.items().get(0).message());
        assertEquals("审核记录不存在",result.items().get(1).message());
    }
    @Test void explicitUnreferencedFlagUsesOptInAndReportsSourcePending() {
        ContentReview published = new ContentReview(); published.setEntityType("poem");
        published.setEntityId(11L); published.setStatus(ContentReview.PUBLISHED);
        published.setReviewNote("[来源待补充] 用户授权");
        when(reviews.approveAndPublish(1L,42L,"用户授权",true)).thenReturn(published);
        var result=batch.approveAndPublish(new BatchReviewRequest(List.of(1L),"用户授权",true),42L);
        assertEquals(1,result.successCount());
        assertTrue(result.items().get(0).message().contains("来源待补充"));
        verify(reviews,never()).approveAndPublish(1L,42L,"用户授权");
    }

}
