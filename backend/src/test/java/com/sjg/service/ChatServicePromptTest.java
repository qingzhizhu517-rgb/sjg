package com.sjg.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 验证 ChatService.buildSystemPrompt：RAG 占位符替换 / 空资料回退 / 占位符缺失兜底。
 * 不依赖 LLM 与 RAG，仅校验提示词装配逻辑，避免 RAG 上下文静默失效。
 */
class ChatServicePromptTest {

    private ChatService service;

    @BeforeEach
    void setUp() {
        // 构造注入 mock 即可；systemPrompt 由 @Value 在单测中不生效，改用反射设置
        service = new ChatService(null, null);
    }

    @Test
    @DisplayName("含占位符时正确替换检索资料且不残留占位符")
    void replacesPlaceholder() {
        ReflectionTestUtils.setField(service, "systemPrompt", "你是助手。\n检索资料：\n{rag_context}");
        String sys = service.buildSystemPrompt("李白《静夜思》");

        assertTrue(sys.contains("李白《静夜思》"));
        assertFalse(sys.contains("{rag_context}"), "占位符应被完全替换");
    }

    @Test
    @DisplayName("检索资料为空时回退为无资料提示语")
    void emptyRagFallsBack() {
        ReflectionTestUtils.setField(service, "systemPrompt", "资料：{rag_context}");
        String sys = service.buildSystemPrompt("");

        assertTrue(sys.contains("（无相关资料）"));
        assertFalse(sys.contains("{rag_context}"));
    }

    @Test
    @DisplayName("缺失占位符时兜底追加检索资料，RAG 不静默失效")
    void missingPlaceholderAppends() {
        ReflectionTestUtils.setField(service, "systemPrompt", "你是助手，配置里没有占位符。");
        String sys = service.buildSystemPrompt("黄河文化");

        assertTrue(sys.contains("检索资料"), "缺失占位符时应追加检索资料段");
        assertTrue(sys.endsWith("黄河文化"), "检索资料应出现在末尾");
    }
}
