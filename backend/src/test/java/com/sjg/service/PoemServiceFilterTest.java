package com.sjg.service;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.entity.Poem;
import com.sjg.mapper.PoemEventMapper;
import com.sjg.mapper.PoemMapper;
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
class PoemServiceFilterTest {

    @BeforeAll
    static void initializeEntityMetadata() {
        var assistant = new MapperBuilderAssistant(new MybatisConfiguration(), "PoemServiceFilterTest");
        TableInfoHelper.initTableInfo(assistant, Poem.class);
    }

    @Mock private PoemMapper poemMapper;
    @Mock private PoemEventMapper poemEventMapper;

    @Test
    void filtersByPoetDynastySpotAndMissingAnnotation() {
        when(poemMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class)))
                .thenReturn(new Page<Poem>().setRecords(List.of()));

        new PoemService(poemMapper, poemEventMapper)
                .list(1, 10, "", 1L, 4L, 2L, "missingAnnotation");

        ArgumentCaptor<LambdaQueryWrapper<Poem>> wrapperCaptor = ArgumentCaptor.forClass(LambdaQueryWrapper.class);
        verify(poemMapper).selectPage(any(Page.class), wrapperCaptor.capture());

        String sql = wrapperCaptor.getValue().getCustomSqlSegment();
        assertThat(sql).contains("poet_id").contains("dynasty_id").contains("spot_id");
        assertThat(sql).contains("annotation").contains("background");
    }
}
