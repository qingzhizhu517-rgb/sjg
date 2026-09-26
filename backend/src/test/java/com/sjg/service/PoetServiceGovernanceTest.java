package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.entity.Poem;
import com.sjg.mapper.PoemMapper;
import com.sjg.mapper.PoetMapper;
import com.sjg.mapper.PoetRelationMapper;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PoetServiceGovernanceTest {

    @Test
    void deleteCleansChildPoemGovernanceBeforeDeletingPoems() {
        PoetMapper poetMapper = mock(PoetMapper.class);
        PoemMapper poemMapper = mock(PoemMapper.class);
        ContentGovernanceCleanupService cleanup = mock(ContentGovernanceCleanupService.class);
        Poem poem = new Poem();
        poem.setId(9L);
        when(poemMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(poem));
        PoetService service = new PoetService(poetMapper, mock(OssService.class), poemMapper,
                mock(PoetRelationMapper.class), cleanup);

        service.delete(3L);

        var order = inOrder(cleanup, poemMapper, poetMapper);
        order.verify(cleanup).deleteEntityReferences("poet", 3L);
        order.verify(cleanup).deletePoems(List.of(9L));
        order.verify(poemMapper).delete(any(LambdaQueryWrapper.class));
        order.verify(poetMapper).deleteById(3L);
    }
}
