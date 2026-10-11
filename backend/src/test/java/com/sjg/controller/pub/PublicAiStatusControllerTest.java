package com.sjg.controller.pub;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.sjg.service.LlmClient;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

class PublicAiStatusControllerTest {

    @Test
    void configuredStatusContainsOnlyPublicCapabilityFieldsAndNeverCallsTheModel() throws Exception {
        for (boolean configured : new boolean[]{true, false}) {
            LlmClient llm = mock(LlmClient.class);
            when(llm.isConfigured()).thenReturn(configured);
            var mvc = MockMvcBuilders.standaloneSetup(new PublicAiStatusController(llm)).build();
            var response = mvc.perform(get("/api/public/ai/status")).andReturn().getResponse();
            assertEquals(200, response.getStatus());
            JsonNode body = new ObjectMapper().readTree(response.getContentAsString());
            assertEquals(200, body.path("code").asInt());
            JsonNode data = body.path("data");
            Set<String> fields = new HashSet<>();
            data.properties().forEach(entry -> fields.add(entry.getKey()));
            assertEquals(Set.of("generationConfigured", "reason"), fields);
            assertEquals(configured, data.path("generationConfigured").asBoolean());
            assertEquals(configured ? "configured" : "not_configured", data.path("reason").asText());
            verify(llm).isConfigured();
            verifyNoMoreInteractions(llm);
        }
    }
}
