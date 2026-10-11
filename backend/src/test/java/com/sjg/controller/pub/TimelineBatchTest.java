package com.sjg.controller.pub;

import com.sjg.entity.Dynasty;
import com.sjg.mapper.*;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.mockito.Mockito.*;

class TimelineBatchTest {
    @org.junit.jupiter.api.BeforeAll
    static void initializeMybatisMetadata() {
        var config = new com.baomidou.mybatisplus.core.MybatisConfiguration();
        var assistant = new org.apache.ibatis.builder.MapperBuilderAssistant(config, "test");
        for (Class<?> type : java.util.List.of(com.sjg.entity.ContentReview.class,
                com.sjg.entity.ContentSourceLink.class, com.sjg.entity.PoemAnalysis.class,
                com.sjg.entity.Event.class, com.sjg.entity.Poet.class, com.sjg.entity.Poem.class)) {
            com.baomidou.mybatisplus.core.metadata.TableInfoHelper.initTableInfo(assistant, type);
        }
    }

    @Test void multipleDynastiesRequireOnlyFourQueries() {
        DynastyMapper dynasties = mock(DynastyMapper.class);
        EventMapper events = mock(EventMapper.class);
        PoetMapper poets = mock(PoetMapper.class);
        PoemMapper poems = mock(PoemMapper.class);
        Dynasty a = new Dynasty(); a.setId(1L);
        Dynasty b = new Dynasty(); b.setId(2L);
        when(dynasties.selectList(any())).thenReturn(List.of(a,b));
        new PublicTimelineController(dynasties,events,poets,poems).getTimeline();
        verify(events, times(1)).selectList(any());
        verify(poets, times(1)).selectList(any());
        verify(poems, times(1)).selectList(any());
    }
}
