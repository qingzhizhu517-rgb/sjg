package com.sjg.service;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.entity.ScenicSpot;
import com.sjg.mapper.ScenicSpotMapper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SpotServiceFilterTest {

    @BeforeAll
    static void initializeEntityMetadata() {
        var assistant = new MapperBuilderAssistant(new MybatisConfiguration(), "SpotServiceFilterTest");
        TableInfoHelper.initTableInfo(assistant, ScenicSpot.class);
    }

    @Mock private ScenicSpotMapper spotMapper;

    @Test
    void missingCoordinatesFilterAddsCoordinateConditions() {
        when(spotMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class)))
                .thenReturn(new Page<ScenicSpot>().setRecords(List.of()));

        new SpotService(spotMapper).list(1, 10, "", "", "missingCoordinates");

        ArgumentCaptor<LambdaQueryWrapper<ScenicSpot>> wrapperCaptor = ArgumentCaptor.forClass(LambdaQueryWrapper.class);
        verify(spotMapper).selectPage(any(Page.class), wrapperCaptor.capture());

        String sql = wrapperCaptor.getValue().getCustomSqlSegment();
        assertThat(sql).contains("longitude").contains("latitude");
    }
}
