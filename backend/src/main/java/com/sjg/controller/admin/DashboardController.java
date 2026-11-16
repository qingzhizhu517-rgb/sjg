package com.sjg.controller.admin;

import com.sjg.dto.DashboardSummary;
import com.sjg.dto.Result;
import com.sjg.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "管理端总览", description = "管理端运营总览与数据质量接口")
@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Operation(summary = "获取管理端总览", description = "返回内容总量、待办、数据质量、地区分布和朝代分布")
    @GetMapping
    public ResponseEntity<Result<DashboardSummary>> summary() {
        return ResponseEntity.ok(Result.success(dashboardService.getSummary()));
    }
}
