package com.sjg.service;

import com.sjg.entity.Poet;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.PoetMapper;
import com.sjg.mapper.PoetRelationMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PoetServiceUpdateGovernanceTest {
    @Test
    void updateMissingPoetFailsWithoutCreatingGovernanceRecord() {
        PoetMapper poetMapper = mock(PoetMapper.class);
        ContentGovernanceCleanupService cleanup = mock(ContentGovernanceCleanupService.class);
        PoetService service = new PoetService(poetMapper, mock(OssService.class), mock(PoemMapper.class),
                mock(PoetRelationMapper.class), cleanup);

        assertThrows(IllegalArgumentException.class, () -> service.update(404L, new Poet()));

        verify(poetMapper, never()).updateById(any());
        verifyNoInteractions(cleanup);
    }
}
