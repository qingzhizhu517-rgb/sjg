package com.sjg.service;

import com.sjg.entity.Event;
import com.sjg.mapper.EventMapper;
import com.sjg.mapper.PoemEventMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EventServiceUpdateGovernanceTest {
    @Test
    void updateMissingEventFailsWithoutCreatingGovernanceRecord() {
        EventMapper eventMapper = mock(EventMapper.class);
        ContentGovernanceCleanupService cleanup = mock(ContentGovernanceCleanupService.class);
        EventService service = new EventService(eventMapper, mock(PoemEventMapper.class), cleanup);

        assertThrows(IllegalArgumentException.class, () -> service.update(404L, new Event()));

        verify(eventMapper, never()).updateById(any());
        verifyNoInteractions(cleanup);
    }
}
