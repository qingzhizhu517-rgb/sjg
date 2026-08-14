package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sjg.dto.ChatMessage;
import com.sjg.entity.Poem;
import com.sjg.entity.PoemAnalysis;
import com.sjg.mapper.PoemAnalysisMapper;
import com.sjg.mapper.PoemMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.function.Consumer;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PoemAnalysisServiceTest {

    @Mock PoemAnalysisMapper analysisMapper;
    @Mock PoemMapper poemMapper;
    @Mock LlmClient llm;
    ObjectMapper objectMapper = new ObjectMapper();

    PoemAnalysisService service;

    @BeforeEach
    void setUp() {
        service = new PoemAnalysisService(analysisMapper, poemMapper, llm, objectMapper);
    }

    // ─── 辅助方法 ───────────────────────────────────────────────

    private Poem samplePoem() {
        Poem p = new Poem();
        p.setId(1L);
        p.setTitle("静夜思");
        p.setContent("床前明月光，疑是地上霜。举头望明月，低头思故乡。");
        return p;
    }

    private PoemAnalysis sampleAnalysis(Long poemId, int version) {
        PoemAnalysis a = new PoemAnalysis();
        a.setId(1L);
        a.setPoemId(poemId);
        a.setAnalysis("{\"lines\":[],\"sentiment\":\"思乡\",\"background\":\"test\"}");
        a.setModel("deepseek-chat");
        a.setVersion(version);
        return a;
    }

    private String validAnalysisJson() {
        return """
                {"lines":[{"line":"床前明月光","解读":"月光洒在床前"},{"line":"疑是地上霜","解读":"好像是地上结了霜"}],"sentiment":"思乡之情","background":"李白旅居扬州时所作","annotations":[{"word":"床","meaning":"井栏"}]}""";
    }

    /**
     * 模拟 LlmClient.streamChat：收集 delta 拼接后调 onDelta。
     */
    @SuppressWarnings("unchecked")
    private void stubStreamChat(String response) {
        doAnswer(inv -> {
            Consumer<String> onDelta = inv.getArgument(1);
            // 逐字符模拟流式返回
            for (char c : response.toCharArray()) {
                onDelta.accept(String.valueOf(c));
            }
            return null;
        }).when(llm).streamChat(anyList(), any(Consumer.class), any(Consumer.class));
    }

    // ─── getOrGenerate 测试 ──────────────────────────────────────

    @Nested
    @DisplayName("getOrGenerate")
    class GetOrGenerateTests {

        @Test
        @DisplayName("缓存命中且版本匹配 -> 直接返回缓存，不调 LLM")
        void cacheHit_versionMatches_returnsCache() {
            PoemAnalysis cached = sampleAnalysis(1L, PoemAnalysisService.CURRENT_VERSION);
            when(analysisMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(cached);

            String result = service.getOrGenerate(1L);

            assertEquals(cached.getAnalysis(), result);
            verify(llm, never()).streamChat(anyList(), any(), any());
            verify(poemMapper, never()).selectById(any());
        }

        @Test
        @DisplayName("缓存未命中 -> 调 LLM 生成并存缓存")
        void cacheMiss_generatesAndCaches() {
            when(analysisMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);
            when(poemMapper.selectById(1L)).thenReturn(samplePoem());
            when(llm.getModel()).thenReturn("deepseek-chat");
            stubStreamChat(validAnalysisJson());

            // 首次插入
            when(analysisMapper.insert(any(PoemAnalysis.class))).thenReturn(1);

            String result = service.getOrGenerate(1L);

            assertNotNull(result);
            assertTrue(result.contains("思乡之情"));
            verify(analysisMapper).insert(any(PoemAnalysis.class));
        }

        @Test
        @DisplayName("缓存版本过期 -> 重新生成")
        void cacheExpired_regenerates() {
            PoemAnalysis old = sampleAnalysis(1L, 0); // version 0 < CURRENT_VERSION
            when(analysisMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(old);
            when(poemMapper.selectById(1L)).thenReturn(samplePoem());
            when(llm.getModel()).thenReturn("deepseek-chat");
            stubStreamChat(validAnalysisJson());

            String result = service.getOrGenerate(1L);

            assertNotNull(result);
            assertTrue(result.contains("思乡之情"));
            // 应该是 update 而不是 insert
            verify(analysisMapper).updateById(any(PoemAnalysis.class));
        }

        @Test
        @DisplayName("历史 fallback 脏缓存 -> 视为未命中并重新生成覆盖")
        void cachedFallback_treatedAsMiss_regenerates() {
            PoemAnalysis dirty = sampleAnalysis(1L, PoemAnalysisService.CURRENT_VERSION);
            dirty.setAnalysis(PoemAnalysisService.fallbackJson("生成失败: AI 服务未配置"));
            dirty.setModel("fallback");
            when(analysisMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(dirty);
            when(poemMapper.selectById(1L)).thenReturn(samplePoem());
            when(llm.getModel()).thenReturn("deepseek-chat");
            stubStreamChat(validAnalysisJson());

            String result = service.getOrGenerate(1L);

            assertTrue(result.contains("思乡之情"));
            verify(analysisMapper).updateById(any(PoemAnalysis.class));
        }

        @Test
        @DisplayName("LLM 未配置生成失败 -> 返回 fallback 但不落库")
        void generationFails_returnsFallback_butNotPersisted() {
            when(analysisMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);
            when(poemMapper.selectById(1L)).thenReturn(samplePoem());
            // 模拟 LlmClient 未配置: 回调 onError
            doAnswer(inv -> {
                Consumer<String> onError = inv.getArgument(2);
                onError.accept("AI 服务未配置（缺少 LLM_API_KEY / LLM_BASE_URL）");
                return null;
            }).when(llm).streamChat(anyList(), any(Consumer.class), any(Consumer.class));

            String result = service.getOrGenerate(1L);

            assertTrue(result.contains("生成失败"));
            // fallback 绝不落库, 避免污染缓存后永久命中脏数据
            verify(analysisMapper, never()).insert(any(PoemAnalysis.class));
            verify(analysisMapper, never()).updateById(any(PoemAnalysis.class));
        }

        @Test
        @DisplayName("诗词不存在 -> 返回 fallback JSON")
        void poemNotFound_returnsFallback() {
            when(analysisMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);
            when(poemMapper.selectById(999L)).thenReturn(null);

            String result = service.getOrGenerate(999L);

            assertTrue(result.contains("诗词不存在"));
            verify(llm, never()).streamChat(anyList(), any(), any());
        }
    }

    // ─── parseOrFallback 测试 ────────────────────────────────────

    @Nested
    @DisplayName("parseOrFallback")
    class ParseTests {

        @Test
        @DisplayName("合法 JSON -> 原样返回")
        void validJson_returnsAsIs() {
            String json = validAnalysisJson();
            assertEquals(json, service.parseOrFallback(json));
        }

        @Test
        @DisplayName("含 markdown 代码块包裹 -> 提取 JSON")
        void wrappedInCodeBlock_extractsJson() {
            String wrapped = "```json\n" + validAnalysisJson() + "\n```";
            String result = service.parseOrFallback(wrapped);
            assertTrue(result.contains("思乡之情"));
        }

        @Test
        @DisplayName("空/null -> 返回 fallback")
        void blank_returnsFallback() {
            String result = service.parseOrFallback("");
            assertTrue(result.contains("LLM 返回为空"));
        }

        @Test
        @DisplayName("乱码 -> 返回 fallback 并携带 raw")
        void garbage_returnsFallback() {
            String result = service.parseOrFallback("这不是JSON");
            assertTrue(result.contains("这不是JSON"));
        }
    }

    // ─── isFallbackAnalysis 测试 ────────────────────────────────

    @Nested
    @DisplayName("isFallbackAnalysis")
    class IsFallbackTests {

        @Test
        @DisplayName("fallback JSON -> true")
        void fallbackJson_isFallback() {
            assertTrue(service.isFallbackAnalysis(PoemAnalysisService.fallbackJson("生成失败")));
        }

        @Test
        @DisplayName("合法赏析 JSON -> false")
        void validAnalysis_isNotFallback() {
            assertFalse(service.isFallbackAnalysis(validAnalysisJson()));
        }

        @Test
        @DisplayName("非 JSON / null / 空白 -> true")
        void invalidInputs_isFallback() {
            assertTrue(service.isFallbackAnalysis("这不是JSON"));
            assertTrue(service.isFallbackAnalysis(null));
            assertTrue(service.isFallbackAnalysis("   "));
        }
    }

    // ─── fallbackJson 测试 ──────────────────────────────────────

    @Test
    @DisplayName("fallbackJson 正确转义特殊字符")
    void fallbackJson_escapesCorrectly() {
        String result = PoemAnalysisService.fallbackJson("含有\"引号\"和\n换行");
        // 应该是合法 JSON
        assertDoesNotThrow(() -> objectMapper.readTree(result));
        assertTrue(result.contains("含有"));
    }
}
