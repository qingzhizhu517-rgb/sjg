package com.sjg.controller.pub;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sjg.dto.Result;
import com.sjg.entity.PoemAnalysis;
import com.sjg.mapper.PoemAnalysisMapper;
import com.sjg.service.PoemAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 诗词AI赏析公开接口（无需认证）
 * 提供面向前端展示的诗词赏析接口
 */
@Tag(name = "公开诗词赏析", description = "面向前端展示的诗词AI赏析接口（无需认证）")
@RestController
@RequestMapping("/api/public/poems")
public class PublicPoemAnalysisController {

    private static final Logger log = LoggerFactory.getLogger(PublicPoemAnalysisController.class);

    private final PoemAnalysisService poemAnalysisService;
    private final PoemAnalysisMapper poemAnalysisMapper;
    private final ObjectMapper objectMapper;

    public PublicPoemAnalysisController(PoemAnalysisService poemAnalysisService,
                                         PoemAnalysisMapper poemAnalysisMapper,
                                         ObjectMapper objectMapper) {
        this.poemAnalysisService = poemAnalysisService;
        this.poemAnalysisMapper = poemAnalysisMapper;
        this.objectMapper = objectMapper;
    }

    /**
     * 获取诗词AI赏析
     * 优先返回缓存，缓存未命中则调用LLM生成
     */
    @Operation(summary = "获取诗词AI赏析", description = "根据诗词ID获取结构化AI赏析，优先返回缓存结果")
    @GetMapping("/{id}/analysis")
    public ResponseEntity<Result<Map<String, Object>>> getAnalysis(
            @Parameter(description = "诗词ID", example = "1", required = true) @PathVariable Long id) {
        try {
            // 1. 调用服务获取或生成赏析（确保缓存存在）
            poemAnalysisService.getOrGenerate(id);

            // 2. 从数据库获取完整的赏析实体
            PoemAnalysis analysis = poemAnalysisMapper.selectOne(
                    new LambdaQueryWrapper<PoemAnalysis>()
                            .eq(PoemAnalysis::getPoemId, id)
                            .last("LIMIT 1"));

            if (analysis == null) {
                log.warn("赏析生成后仍未找到记录: poemId={}", id);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Result.error("赏析生成失败"));
            }

            // 3. 解析赏析JSON字符串为对象
            Object analysisObj;
            try {
                analysisObj = objectMapper.readValue(analysis.getAnalysis(), Object.class);
            } catch (Exception e) {
                log.warn("赏析JSON解析失败，使用原始字符串: poemId={}", id);
                analysisObj = analysis.getAnalysis();
            }

            // 4. 构建响应
            Map<String, Object> response = new HashMap<>();
            response.put("analysis", analysisObj);
            response.put("model", analysis.getModel());
            response.put("generatedAt", analysis.getGeneratedAt());

            return ResponseEntity.ok(Result.success(response));
        } catch (Exception e) {
            log.error("获取诗词赏析失败: poemId={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Result.error("获取赏析失败: " + e.getMessage()));
        }
    }
}
