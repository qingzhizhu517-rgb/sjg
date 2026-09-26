package com.sjg.service;

import com.sjg.entity.ScenicSpot;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.ScenicSpotMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SpotServiceUpdateGovernanceTest {
    @Test
    void updateMissingSpotFailsWithoutCreatingGovernanceRecord() {
        ScenicSpotMapper spotMapper = mock(ScenicSpotMapper.class);
        ContentGovernanceCleanupService cleanup = mock(ContentGovernanceCleanupService.class);
        SpotService service = new SpotService(spotMapper, mock(PoemMapper.class), cleanup);

        assertThrows(IllegalArgumentException.class, () -> service.update(404L, new ScenicSpot()));

        verify(spotMapper, never()).updateById(any());
        verifyNoInteractions(cleanup);
    }
}
