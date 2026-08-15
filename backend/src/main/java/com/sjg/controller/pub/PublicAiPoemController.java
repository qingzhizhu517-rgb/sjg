package com.sjg.controller.pub;

import com.sjg.dto.Result;
import com.sjg.entity.AiPoem;
import com.sjg.service.AiPoemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@Tag(name = "公开AI写诗", description = "AI写诗相关接口（无需认证）")
@RestController
@RequestMapping("/api/public/ai-poem")
public class PublicAiPoemController {

    private static final Logger log = LoggerFactory.getLogger(PublicAiPoemController.class);

    private final AiPoemService aiPoemService;

    public PublicAiPoemController(AiPoemService aiPoemService) {
        this.aiPoemService = aiPoemService;
    }

    @Operation(summary = "生成AI诗歌", description = "根据主题、风格等参数生成一首诗（IP 级限流）")
    @PostMapping("/generate")
    public ResponseEntity<Result<AiPoem>> generate(
            @Parameter(description = "主题", example = "黄河", required = true) @RequestParam String theme,
            @Parameter(description = "风格", example = "豪放") @RequestParam(required = false) String style,
            @Parameter(description = "字数", example = "七言") @RequestParam(required = false) String wordCount,
            @Parameter(description = "朝代偏好", example = "唐") @RequestParam(required = false) String dynasty,
            HttpServletRequest http) {
        String clientIp = clientIp(http);
        if (!StringUtils.hasText(theme)) {
            return ResponseEntity.badRequest().body(Result.error(400, "请输入创作主题"));
        }
        if (!aiPoemService.checkRate(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Result.error(429, "创作过于频繁，请稍后再试"));
        }
        try {
            AiPoem poem = aiPoemService.generatePoem(theme, style, wordCount, dynasty, clientIp);
            return ResponseEntity.ok(Result.success(poem));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Result.error(400, e.getMessage()));
        } catch (Exception e) {
            // chatSync 失败 / 内容为空等: 细节只进服务端日志, 避免向公开接口泄露内部 URL 等异常细节
            log.error("AI写诗生成失败: theme={}, ip={}", theme, clientIp, e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Result.error(502, "生成失败，请稍后再试"));
        }
    }

    @Operation(summary = "获取AI诗歌详情", description = "根据ID获取AI生成的诗歌")
    @GetMapping("/{id}")
    public ResponseEntity<Result<AiPoem>> getById(
            @Parameter(description = "诗歌ID", example = "1", required = true) @PathVariable Long id) {
        AiPoem poem = aiPoemService.getById(id);
        if (poem == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Result.error(404, "诗歌不存在"));
        }
        return ResponseEntity.ok(Result.success(poem));
    }

    private String clientIp(HttpServletRequest req) {
        String xff = req.getHeader("x-forwarded-for");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        String real = req.getHeader("x-real-ip");
        if (real != null && !real.isBlank()) {
            return real;
        }
        return req.getRemoteAddr();
    }
}
