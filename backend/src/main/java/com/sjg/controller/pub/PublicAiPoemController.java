package com.sjg.controller.pub;

import com.sjg.dto.Result;
import com.sjg.entity.AiPoem;
import com.sjg.service.AiPoemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "公开AI写诗", description = "AI写诗相关接口（无需认证）")
@RestController
@RequestMapping("/api/public/ai-poem")
public class PublicAiPoemController {

    private final AiPoemService aiPoemService;

    public PublicAiPoemController(AiPoemService aiPoemService) {
        this.aiPoemService = aiPoemService;
    }

    @Operation(summary = "生成AI诗歌", description = "根据主题、风格等参数生成一首诗")
    @PostMapping("/generate")
    public ResponseEntity<Result<AiPoem>> generate(
            @Parameter(description = "主题", example = "黄河", required = true) @RequestParam String theme,
            @Parameter(description = "风格", example = "豪放") @RequestParam(required = false) String style,
            @Parameter(description = "字数", example = "七言") @RequestParam(required = false) String wordCount,
            @Parameter(description = "朝代偏好", example = "唐") @RequestParam(required = false) String dynasty) {
        try {
            AiPoem poem = aiPoemService.generatePoem(theme, style, wordCount, dynasty);
            return ResponseEntity.ok(Result.success(poem));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Result.error(400, "生成诗歌失败: " + e.getMessage()));
        }
    }

    @Operation(summary = "获取AI诗歌详情", description = "根据ID获取AI生成的诗歌")
    @GetMapping("/{id}")
    public ResponseEntity<Result<AiPoem>> getById(
            @Parameter(description = "诗歌ID", example = "1", required = true) @PathVariable Long id) {
        AiPoem poem = aiPoemService.getById(id);
        if (poem == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Result.success(poem));
    }
}
