package com.sjg.service;

import com.sjg.dto.CulturalItemRequest;
import com.sjg.entity.CulturalItem;
import com.sjg.mapper.CraftDetailMapper;
import com.sjg.mapper.CulturalItemMapper;
import com.sjg.mapper.FestivalDetailMapper;
import com.sjg.mapper.FoodOperaDetailMapper;
import com.sjg.mapper.LiteratureDetailMapper;
import com.sjg.mapper.ContentReviewMapper;
import com.sjg.entity.ContentReview;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class CulturalItemServiceReviewTest {

    private final CulturalItemMapper itemMapper = mock(CulturalItemMapper.class);
    private final CulturalItemService service = new CulturalItemService(
            itemMapper,
            mock(FestivalDetailMapper.class),
            mock(CraftDetailMapper.class),
            mock(LiteratureDetailMapper.class),
            mock(FoodOperaDetailMapper.class));

    @Test
    void aiContentStartsInNeedsReview() {
        CulturalItem item = new CulturalItem();
        item.setCategory("literature");
        item.setTitle("AI 条目");
        item.setSource("ai");

        service.create(request(item));

        assertEquals(CulturalItemService.STATUS_NEEDS_REVIEW, item.getStatus());
        verify(itemMapper).insert(any(CulturalItem.class));
    }

    @Test
    void manualContentKeepsDraftDefault() {
        CulturalItem item = new CulturalItem();
        item.setCategory("literature");
        item.setTitle("人工条目");
        item.setSource("manual");

        service.create(request(item));

        assertEquals(CulturalItemService.STATUS_DRAFT, item.getStatus());
    }

    @Test
    void legacyPublishRequiresPublishedReview() {
        ContentReviewMapper reviewMapper = mock(ContentReviewMapper.class);
        CulturalItemService governedService = new CulturalItemService(
                itemMapper, mock(FestivalDetailMapper.class), mock(CraftDetailMapper.class),
                mock(LiteratureDetailMapper.class), mock(FoodOperaDetailMapper.class), reviewMapper);
        ContentReview review = new ContentReview();
        review.setStatus(ContentReview.APPROVED);
        org.mockito.Mockito.when(reviewMapper.selectOne(any())).thenReturn(review);

        IllegalStateException error = assertThrows(IllegalStateException.class,
                () -> governedService.updateStatus(7L, CulturalItemService.STATUS_PUBLISHED));

        assertEquals("请先在内容治理工作台完成发布审核", error.getMessage());
    }

    private CulturalItemRequest request(CulturalItem item) {
        CulturalItemRequest request = new CulturalItemRequest();
        request.setItem(item);
        return request;
    }
}
