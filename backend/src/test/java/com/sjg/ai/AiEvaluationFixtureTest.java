package com.sjg.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class AiEvaluationFixtureTest {
    @Test
    void fixtureHasExactlyFiftyFourValidQuestions() throws Exception {
        Path path = Path.of("..", "docs", "ai-evaluation-set.json");
        if (!Files.exists(path)) path = Path.of("docs", "ai-evaluation-set.json");
        JsonNode root = new ObjectMapper().readTree(Files.readString(path));
        assertTrue(root.isArray());
        assertEquals(54, root.size(), "真实回归集必须保持 54 题");
        Set<String> ids = new HashSet<>();
        for (JsonNode item : root) {
            assertTrue(ids.add(item.path("id").asText()), "题目 ID 必须唯一");
            assertTrue(item.path("question").isTextual());
            assertTrue(item.path("expectedEntityTypes").isArray());
            assertTrue(item.path("mustCiteSourceIds").isArray());
            assertTrue(item.path("forbiddenClaims").isArray());
            assertTrue(item.path("allowUnknown").isBoolean());
            if ("context".equals(item.path("category").asText())) {
                assertTrue(item.path("context").isObject(), "context 题必须声明页面上下文");
                assertTrue(item.path("context").path("type").isTextual(), "context.type 必须存在");
            }
        }
    }
}
