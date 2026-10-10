package com.sjg.service;

import com.sjg.mapper.ContentReviewMapper;
import com.sjg.mapper.CraftDetailMapper;
import com.sjg.mapper.CulturalItemMapper;
import com.sjg.mapper.FestivalDetailMapper;
import com.sjg.mapper.FoodOperaDetailMapper;
import com.sjg.mapper.LiteratureDetailMapper;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;

class CulturalItemServiceContextTest {

    @Test
    void springCanStartTheCulturalServiceWithItsGovernanceDependencies() {
        try (var context = new AnnotationConfigApplicationContext()) {
            context.registerBean(CulturalItemMapper.class, () -> mock(CulturalItemMapper.class));
            context.registerBean(FestivalDetailMapper.class, () -> mock(FestivalDetailMapper.class));
            context.registerBean(CraftDetailMapper.class, () -> mock(CraftDetailMapper.class));
            context.registerBean(LiteratureDetailMapper.class, () -> mock(LiteratureDetailMapper.class));
            context.registerBean(FoodOperaDetailMapper.class, () -> mock(FoodOperaDetailMapper.class));
            context.registerBean(ContentReviewMapper.class, () -> mock(ContentReviewMapper.class));
            context.registerBean(ContentGovernanceCleanupService.class,
                    () -> mock(ContentGovernanceCleanupService.class));
            context.register(CulturalItemService.class);

            assertDoesNotThrow(context::refresh);
            assertNotNull(context.getBean(CulturalItemService.class));
        }
    }
}
