package com.sjg.controller.pub;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sjg.dto.Result;
import com.sjg.entity.PoemAnalysis;
import com.sjg.mapper.PoemAnalysisMapper;
import com.sjg.service.PoemAnalysisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PublicPoemAnalysisControllerTest {

    @Mock PoemAnalysisService poemAnalysisService;
    @Mock PoemAnalysisMapper poemAnalysisMapper;
    ObjectMapper objectMapper = new ObjectMapper();

    PublicPoemAnalysisController controller;

    @BeforeEach
    void setUp() {
        controller = new PublicPoemAnalysisController(poemAnalysisService, poemAnalysisMapper, objectMapper);
    }

    private PoemAnalysis sampleAnalysis() {
        PoemAnalysis a = new PoemAnalysis();
        a.setId(1L);
        a.setPoemId(1L);
        a.setAnalysis("{\"lines\":[],\"sentiment\":\"思乡\",\"background\":\"test\"}");
        a.setModel("deepseek-chat");
        a.setVersion(1);
        a.setGeneratedAt(LocalDateTime.of(2026, 7, 23, 10, 0, 0));
        return a;
    }

    @Test
    @DisplayName("正常返回赏析结果")
    void getAnalysis_success() {
        PoemAnalysis analysis = sampleAnalysis();
        when(poemAnalysisService.getOrGenerate(1L)).thenReturn(analysis.getAnalysis());
        when(poemAnalysisMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(analysis);

        ResponseEntity<Result<Map<String, Object>>> response = controller.getAnalysis(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(200, response.getBody().getCode());

        Map<String, Object> data = response.getBody().getData();
        assertNotNull(data);
        assertNotNull(data.get("analysis"));
        assertEquals("deepseek-chat", data.get("model"));
        assertNotNull(data.get("generatedAt"));
    }

    @Test
    @DisplayName("诗词不存在时返回500")
    void getAnalysis_poemNotFound() {
        when(poemAnalysisService.getOrGenerate(999L)).thenReturn("{\"lines\":[],\"sentiment\":\"暂无分析\",\"background\":\"诗词不存在\"}");
        when(poemAnalysisMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);

        ResponseEntity<Result<Map<String, Object>>> response = controller.getAnalysis(999L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getMessage().contains("赏析生成失败"));
    }

    @Test
    @DisplayName("服务异常时返回500")
    void getAnalysis_serviceException() {
        when(poemAnalysisService.getOrGenerate(1L)).thenThrow(new RuntimeException("LLM 调用失败"));

        ResponseEntity<Result<Map<String, Object>>> response = controller.getAnalysis(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getMessage().contains("获取赏析失败"));
    }
}
