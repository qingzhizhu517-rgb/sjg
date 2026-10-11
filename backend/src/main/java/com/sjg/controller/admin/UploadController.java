package com.sjg.controller.admin;

import com.sjg.dto.Result;
import com.sjg.service.OssService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.security.Principal;
import com.sjg.exception.BusinessException;
import org.slf4j.LoggerFactory;

/**
 * 文件上传控制器（管理员）
 * 提供文件上传到阿里云 OSS 的接口，需要 JWT 认证
 */
@Tag(name = "文件上传", description = "文件上传到阿里云OSS（管理员）")
@RestController
@RequestMapping("/api/admin")
public class UploadController {

    private final OssService ossService;

    public UploadController(OssService ossService) {
        this.ossService = ossService;
    }

    /**
     * 上传文件到阿里云 OSS
     */
    @Operation(summary = "上传文件", description = "上传文件到阿里云OSS，返回文件访问URL")
    @PostMapping("/upload")
    public ResponseEntity<Result<Map<String, String>>> upload(
            @Parameter(description = "上传的文件", required = true) @RequestParam("file") MultipartFile file,
            @Parameter(description = "OSS存储目录", example = "images") @RequestParam(defaultValue = "images") String directory, Principal principal) {
        try {
            String url = ossService.upload(file, directory, principal.getName());
            return ResponseEntity.ok(Result.success(Map.of("url", url)));
        } catch (BusinessException e) {
            return ResponseEntity.badRequest().body(Result.error(400, e.getMessage()));
        } catch (Exception e) {
            LoggerFactory.getLogger(UploadController.class).error("文件上传失败", e);
            return ResponseEntity.internalServerError().body(Result.error(500, "上传失败，请稍后重试"));
        }
    }
}
