package com.sjg.controller.pub;

import com.sjg.dto.Result;
import com.sjg.dto.SourceSummary;
import com.sjg.entity.ContentReview;
import com.sjg.entity.Poet;
import com.sjg.entity.ScenicSpot;
import com.sjg.mapper.DynastyMapper;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.PoetMapper;
import com.sjg.service.ContentReviewService;
import com.sjg.service.PoetService;
import com.sjg.service.SpotService;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PublicSourceSummaryTest {

    @Test
    void publishedPoetDetailIncludesSourceSummaries() {
        PoetService poetService = mock(PoetService.class);
        Poet poet = new Poet();
        poet.setId(7L);
        when(poetService.getById(7L)).thenReturn(poet);
        ContentReviewService reviewService = mock(ContentReviewService.class);
        when(reviewService.getReview("poet", 7L)).thenReturn(publishedReview());
        SourceSummary source = source(101L, "山东地方文献");
        when(reviewService.listSourceSummaries("poet", 7L)).thenReturn(List.of(source));

        PublicPoetController controller = new PublicPoetController(poetService, mock(PoemMapper.class),
                mock(DynastyMapper.class), reviewService);

        ResponseEntity<Result<Map<String, Object>>> response = controller.getById(7L);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(List.of(source), response.getBody().getData().get("sources"));
        verify(reviewService).listSourceSummaries("poet", 7L);
    }

    @Test
    void publishedSpotDetailIncludesSourceSummaries() {
        SpotService spotService = mock(SpotService.class);
        ScenicSpot spot = new ScenicSpot();
        spot.setId(9L);
        when(spotService.getById(9L)).thenReturn(spot);
        ContentReviewService reviewService = mock(ContentReviewService.class);
        when(reviewService.getReview("scenic_spot", 9L)).thenReturn(publishedReview());
        SourceSummary source = source(202L, "济南府志");
        when(reviewService.listSourceSummaries("scenic_spot", 9L)).thenReturn(List.of(source));

        PublicSpotController controller = new PublicSpotController(spotService, mock(PoemMapper.class),
                mock(PoetMapper.class), reviewService);

        ResponseEntity<Result<Map<String, Object>>> response = controller.getById(9L);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(List.of(source), response.getBody().getData().get("sources"));
        verify(reviewService).listSourceSummaries("scenic_spot", 9L);
    }

    private ContentReview publishedReview() {
        ContentReview review = new ContentReview();
        review.setStatus(ContentReview.PUBLISHED);
        return review;
    }

    private SourceSummary source(long id, String title) {
        SourceSummary source = new SourceSummary();
        source.setSourceId(id);
        source.setTitle(title);
        return source;
    }
}
