package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.entity.ContentReview;
import com.sjg.entity.Dynasty;
import com.sjg.entity.Poet;
import com.sjg.entity.PoetRelation;
import com.sjg.mapper.ContentReviewMapper;
import com.sjg.mapper.DynastyMapper;
import com.sjg.mapper.PoetMapper;
import com.sjg.mapper.PoetRelationMapper;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PoetRelationServiceTest {

    @Test
    void publicGraphOnlyIncludesPublishedRelationsBetweenPublishedPoets() {
        PoetRelation published = relation(101L, 1L, 2L, "交游");
        PoetRelation needsReview = relation(102L, 1L, 2L, "师承");
        PoetRelation archived = relation(103L, 2L, 1L, "并称");

        PoetMapper poetMapper = mock(PoetMapper.class);
        PoetRelationMapper relationMapper = mock(PoetRelationMapper.class);
        DynastyMapper dynastyMapper = mock(DynastyMapper.class);
        ContentReviewMapper reviewMapper = mock(ContentReviewMapper.class);
        when(relationMapper.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(List.of(published, needsReview, archived));
        Poet poetA = poet(1L, 10L, "甲");
        Poet poetB = poet(2L, 10L, "乙");
        when(poetMapper.selectBatchIds(any())).thenReturn(List.of(poetA, poetB));
        Dynasty dynasty = new Dynasty();
        dynasty.setId(10L);
        dynasty.setName("唐");
        when(dynastyMapper.selectBatchIds(any())).thenReturn(List.of(dynasty));

        AtomicInteger reviewCall = new AtomicInteger();
        when(reviewMapper.selectList(any(LambdaQueryWrapper.class))).thenAnswer(invocation -> switch (reviewCall.getAndIncrement()) {
            case 0 -> List.of(review("poet_relation", 101L, ContentReview.PUBLISHED));
            case 1 -> List.of(review("poet", 1L, ContentReview.PUBLISHED), review("poet", 2L, ContentReview.PUBLISHED));
            case 2 -> List.of(review("dynasty", 10L, ContentReview.PUBLISHED));
            default -> List.of();
        });

        Map<String, Object> graph = new PoetRelationService(relationMapper, poetMapper, dynastyMapper, reviewMapper).getGraph();

        List<?> edges = (List<?>) graph.get("edges");
        assertEquals(1, edges.size());
        assertTrue(edges.get(0).toString().contains("交游"));
    }

    @Test
    void keepsThreeArgumentConstructorForExistingCallers() {
        PoetRelationService service = new PoetRelationService(
                mock(PoetRelationMapper.class), mock(PoetMapper.class), mock(DynastyMapper.class));
        assertTrue(service != null);
    }

    private PoetRelation relation(long id, long poetAId, long poetBId, String type) {
        PoetRelation relation = new PoetRelation();
        relation.setId(id);
        relation.setPoetAId(poetAId);
        relation.setPoetBId(poetBId);
        relation.setRelationType(type);
        return relation;
    }

    private Poet poet(long id, long dynastyId, String name) {
        Poet poet = new Poet();
        poet.setId(id);
        poet.setDynastyId(dynastyId);
        poet.setName(name);
        return poet;
    }

    private ContentReview review(String type, long entityId, String status) {
        ContentReview review = new ContentReview();
        review.setEntityType(type);
        review.setEntityId(entityId);
        review.setStatus(status);
        return review;
    }
}
