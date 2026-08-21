package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.ScenicSpotMapper;
import org.junit.jupiter.api.Test;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

class SpotServiceTest {

    @Test
    void deleteClearsSpotReferenceBeforeDeletingSpot() {
        ScenicSpotMapper spotMapper = mock(ScenicSpotMapper.class);
        PoemMapper poemMapper = mock(PoemMapper.class);
        SpotService service = new SpotService(spotMapper, poemMapper);

        service.delete(42L);

        verify(poemMapper).update(isNull(), any(UpdateWrapper.class));
        verify(spotMapper).deleteById(42L);
    }
}
