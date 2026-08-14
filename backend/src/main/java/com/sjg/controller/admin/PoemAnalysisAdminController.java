package com.sjg.controller.admin;

import com.sjg.dto.Result;
import com.sjg.service.PoemAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 诗词 AI 赏析运维接口（管理员）。
 * <p>
 * 公开端 {@code /api/public/poems/{id}/analysis} 按需惰性生成；
 * 本控制器提供批量预热 / 重跑入口，POST 需 admin 角色（见 SecurityConfig）。
 */
@Tag(name = "诗词赏析运维", description = "AI 赏析批量生成与状态查询（管理员）")
@RestController
@RequestMapping("/api/admin/poems/analysis")
public class PoemAnalysisAdminController {

    private static final Logger log = LoggerFactory.getLogger(PoemAnalysisAdminController.class);

    private final PoemAnalysisService poemAnalysisService;

    public PoemAnalysisAdminController(PoemAnalysisService poemAnalysisService) {
        this.poemAnalysisService = poemAnalysisService;
    }

    /**
     * 发起批量赏析生成任务（异步）。
     * 请求体：{ "startId": 1, "endId": 195, "skipSuccessful": true }
     * 三者均可省略；skipSuccessful 默认 true。
     */
    @Operation(summary = "批量生成赏析", description = "按诗 ID 范围异步批量生成 AI 赏析，跳过已有合法缓存（可关闭）")
    @PostMapping("/batch")
    public ResponseEntity<Result<Map<String, Object>>> startBatch(@RequestBody(required = false) Map<String, Object> body) {
        try {
            Long startId = toLong(body == null ? null : body.get("startId"));
            Long endId = toLong(body == null ? null : body.get("endId"));
            boolean skipSuccessful = body == null
                    || !Boolean.FALSE.equals(body.get("skipSuccessful"));

            PoemAnalysisService.BatchJob job = poemAnalysisService.startBatch(startId, endId, skipSuccessful);
            Map<String, Object> resp = new HashMap<>();
            resp.put("jobId", job.jobId);
            resp.put("total", job.total);
            resp.put("message", "批量任务已启动，轮询 GET /api/admin/poems/analysis/batch/status 查看进度");
            return ResponseEntity.ok(Result.success(resp));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Result.error(409, e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Result.error(400, e.getMessage()));
        } catch (Exception e) {
            log.error("启动赏析批量任务失败", e);
            return ResponseEntity.internalServerError().body(Result.error("启动失败: " + e.getMessage()));
        }
    }

    /**
     * 查询批量任务状态（GET 只需登录即可，见 SecurityConfig 的 /api/admin/** GET 规则）。
     */
    @Operation(summary = "批量任务状态", description = "查询当前/最近一次批量赏析任务进度")
    @GetMapping("/batch/status")
    public ResponseEntity<Result<Object>> batchStatus() {
        PoemAnalysisService.BatchJob job = poemAnalysisService.getBatchJob();
        if (job == null) {
            return ResponseEntity.ok(Result.success(Map.of("message", "暂无批量任务记录")));
        }
        Map<String, Object> resp = new HashMap<>();
        resp.put("jobId", job.jobId);
        resp.put("total", job.total);
        resp.put("done", job.done.get());
        resp.put("success", job.success.get());
        resp.put("skipped", job.skipped.get());
        resp.put("failed", job.failed.get());
        resp.put("failedIds", job.failedIds);
        resp.put("running", job.running);
        resp.put("startedAt", job.startedAt);
        resp.put("finishedAt", job.finishedAt);
        return ResponseEntity.ok(Result.success(resp));
    }

    private Long toLong(Object v) {
        if (v == null) return null;
        if (v instanceof Number n) return n.longValue();
        try {
            return Long.parseLong(String.valueOf(v).trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("非法的数字参数: " + v);
        }
    }
}
