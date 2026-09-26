package com.sjg.controller.admin;

import com.sjg.dto.Result;
import com.sjg.service.AiMetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "AI 运行指标", description = "AI 请求量、错误、耗时和反馈概览")
@RestController
@RequestMapping("/api/admin/ai-metrics")
public class AiMetricsController {
    private final AiMetricsService service;

    public AiMetricsController(AiMetricsService service) { this.service = service; }

    @Operation(summary = "查询 AI 运行概览")
    @GetMapping("/summary")
    public Result<Map<String, Object>> summary(@RequestParam(defaultValue = "24") int hours) {
        return Result.success(service.summary(hours));
    }
}
