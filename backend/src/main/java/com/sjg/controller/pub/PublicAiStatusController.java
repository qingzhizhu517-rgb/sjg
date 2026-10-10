package com.sjg.controller.pub;

import com.sjg.dto.Result;
import com.sjg.service.LlmClient;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public/ai")
public class PublicAiStatusController {

    private final LlmClient llm;

    public PublicAiStatusController(LlmClient llm) {
        this.llm = llm;
    }

    @Operation(summary = "查询AI生成配置状态", description = "仅判断配置是否齐全，不探测模型可用性")
    @GetMapping("/status")
    public Result<Map<String, Object>> status() {
        boolean configured = llm.isConfigured();
        return Result.success(Map.of("generationConfigured", configured,
                "reason", configured ? "configured" : "not_configured"));
    }
}
