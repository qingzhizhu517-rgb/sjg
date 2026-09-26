package com.sjg.controller.pub;

import com.sjg.dto.PageResult;
import com.sjg.entity.ContentReview;
import com.sjg.entity.CulturalItem;
import com.sjg.entity.Poet;
import com.sjg.entity.Poem;
import com.sjg.entity.ScenicSpot;
import com.sjg.mapper.DynastyMapper;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.PoetMapper;
import com.sjg.service.ContentReviewService;
import com.sjg.service.CulturalItemService;
import com.sjg.service.PoetService;
import com.sjg.service.SpotService;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PublicPublishedContentTest {

    @Test
    void poetListUsesPublishedQuery() {
        PoetService service = mock(PoetService.class);
        PoemMapper poemMapper = mock(PoemMapper.class);
        DynastyMapper dynastyMapper = mock(DynastyMapper.class);
        ContentReviewService reviewService = mock(ContentReviewService.class);
        PageResult<Poet> page = new PageResult<>(List.of(new Poet()), 1, 1, 20);
        when(service.listPublished(1, 20, "李", "济南")).thenReturn(page);

        PublicPoetController controller = new PublicPoetController(service, poemMapper, dynastyMapper, reviewService);
        ResponseEntity<?> response = controller.list(1, 20, "李", "济南");

        assertEquals(200, response.getStatusCode().value());
        assertSame(page, ((com.sjg.dto.Result<?>) response.getBody()).getData());
        verify(service).listPublished(1, 20, "李", "济南");
        verify(service, never()).list(anyInt(), anyInt(), anyString(), anyString());
    }

    @Test
    void unpublishedPoetDetailIsHidden() {
        PoetService service = mock(PoetService.class);
        ContentReviewService reviewService = mock(ContentReviewService.class);
        Poet poet = new Poet();
        poet.setId(7L);
        when(service.getById(7L)).thenReturn(poet);
        ContentReview review = new ContentReview();
        review.setStatus(ContentReview.DRAFT);
        when(reviewService.getReview("poet", 7L)).thenReturn(review);

        PublicPoetController controller = new PublicPoetController(service, mock(PoemMapper.class),
                mock(DynastyMapper.class), reviewService);
        ResponseEntity<?> response = controller.getById(7L);

        assertEquals(404, response.getStatusCode().value());
    }

    @Test
    void unpublishedSpotDetailIsHidden() {
        SpotService service = mock(SpotService.class);
        ScenicSpot spot = new ScenicSpot();
        spot.setId(9L);
        when(service.getById(9L)).thenReturn(spot);
        ContentReviewService reviewService = mock(ContentReviewService.class);
        ContentReview review = new ContentReview();
        review.setStatus(ContentReview.NEEDS_REVIEW);
        when(reviewService.getReview("scenic_spot", 9L)).thenReturn(review);

        PublicSpotController controller = new PublicSpotController(service, mock(PoemMapper.class),
                mock(PoetMapper.class), reviewService);
        ResponseEntity<?> response = controller.getById(9L);

        assertEquals(404, response.getStatusCode().value());
    }

    @Test
    void unpublishedCulturalDetailIsHidden() {
        CulturalItemService service = mock(CulturalItemService.class);
        CulturalItem item = new CulturalItem();
        item.setId(11L);
        item.setStatus(CulturalItemService.STATUS_PUBLISHED);
        Map<String, Object> view = new HashMap<>();
        view.put("item", item);
        when(service.getDetailView(11L)).thenReturn(view);
        ContentReviewService reviewService = mock(ContentReviewService.class);
        ContentReview review = new ContentReview();
        review.setStatus(ContentReview.NEEDS_REVIEW);
        when(reviewService.getReview("cultural_item", 11L)).thenReturn(review);

        PublicCulturalController controller = new PublicCulturalController(service, reviewService);
        ResponseEntity<?> response = controller.getById(11L);

        assertEquals(404, response.getStatusCode().value());
        verify(reviewService, never()).listSourceSummaries(anyString(), anyLong());
    }

}
