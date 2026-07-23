package com.sjg.controller.pub;

import com.sjg.dto.Result;
import com.sjg.service.PoetRelationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * 诗人关系图谱公开接口(路线图 #7): 返回诗人-诗人关系, 供前端 G6 力导向图渲染。
 * Phase1 仅 source=seed 人工录入的关键关系; Phase2 将并 derived 派生边。
 */
@Tag(name = "公开诗人关系", description = "诗人关系图谱(无需认证)")
@RestController
@RequestMapping("/api/public/poet-relations")
public class PublicPoetRelationController {

    private final PoetRelationService poetRelationService;

    public PublicPoetRelationController(PoetRelationService poetRelationService) {
        this.poetRelationService = poetRelationService;
    }

    @Operation(summary = "查询诗人关系图谱", description = "返回 nodes(诗人) + edges(关系), 供 G6 力导向图")
    @GetMapping
    public ResponseEntity<Result<Map<String, Object>>> graph() {
        return ResponseEntity.ok(Result.success(poetRelationService.getGraph()));
    }
}
