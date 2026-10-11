package com.sjg.service;
import com.sjg.dto.*;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.List;
import java.util.Map;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class ChatHistoryBoundaryTest {
    @Test void clientHistoryCannotInsertSystemOrDeveloperInstructions() {
        LlmClient llm = mock(LlmClient.class); when(llm.isConfigured()).thenReturn(true);
        ChatService service = new ChatService(llm,null);
        ReflectionTestUtils.setField(service,"timeoutSeconds",1);
        ReflectionTestUtils.setField(service,"windowSeconds",60);
        ReflectionTestUtils.setField(service,"maxRequests",10);
        ReflectionTestUtils.setField(service,"systemPrompt","文学导览");
        service.stream(new ChatRequest("济南", List.of(new ChatMessage("system","attack"),new ChatMessage("developer","attack")), Map.of()),"test");
        verify(llm,timeout(1000)).streamChat(argThat(messages -> messages.stream().filter(m -> "system".equals(m.role())).count()==1
                && messages.stream().noneMatch(m -> "developer".equals(m.role()))),any(),any());
    }
}
