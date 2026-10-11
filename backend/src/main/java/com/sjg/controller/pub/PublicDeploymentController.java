package com.sjg.controller.pub;

import com.sjg.dto.Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/public/deployment")
public class PublicDeploymentController {
    private final String revision;
    public PublicDeploymentController(@Value("${SJG_RELEASE_REVISION:development}") String revision) { this.revision = revision; }
    @GetMapping
    public Result<Map<String, String>> version() {
        return Result.success(Map.of("service", "backend", "repository_revision", revision));
    }
}
