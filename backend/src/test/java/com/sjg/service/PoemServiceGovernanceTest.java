package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.mapper.PoemEventMapper;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.PoetMapper;
import com.sjg.mapper.ScenicSpotMapper;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PoemServiceGovernanceTest {

    @Test
    void updateResetsReviewForEdit() {
        PoemMapper poemMapper = mock(PoemMapper.class);
        ContentGovernanceCleanupService cleanup = mock(ContentGovernanceCleanupService.class);
        when(poemMapper.selectById(42L)).thenReturn(new com.sjg.entity.Poem());
        PoemService service = new PoemService(poemMapper, mock(PoemEventMapper.class),
                mock(PoetMapper.class), mock(ScenicSpotMapper.class), cleanup);

        service.update(42L, new com.sjg.entity.Poem());

        verify(cleanup).resetReviewForEdit("poem", 42L);
    }

    @Test
    void updateMissingPoemFailsWithoutCreatingGovernanceRecord() {
        PoemMapper poemMapper = mock(PoemMapper.class);
        ContentGovernanceCleanupService cleanup = mock(ContentGovernanceCleanupService.class);
        PoemService service = new PoemService(poemMapper, mock(PoemEventMapper.class),
                mock(PoetMapper.class), mock(ScenicSpotMapper.class), cleanup);

        assertThrows(IllegalArgumentException.class,
                () -> service.update(404L, new com.sjg.entity.Poem()));

        verify(poemMapper, never()).updateById(any());
        verifyNoInteractions(cleanup);
    }

    @Test
    void deleteCleansGovernanceBeforeDeletingPoem() {
        PoemMapper poemMapper = mock(PoemMapper.class);
        PoemEventMapper poemEventMapper = mock(PoemEventMapper.class);
        ContentGovernanceCleanupService cleanup = mock(ContentGovernanceCleanupService.class);
        PoemService service = new PoemService(poemMapper, poemEventMapper,
                mock(PoetMapper.class), mock(ScenicSpotMapper.class), cleanup);

        service.delete(42L);

        var order = inOrder(poemEventMapper, cleanup, poemMapper);
        order.verify(poemEventMapper).delete(any(LambdaQueryWrapper.class));
        order.verify(cleanup).deletePoems(List.of(42L));
        order.verify(poemMapper).deleteById(42L);
    }
}
