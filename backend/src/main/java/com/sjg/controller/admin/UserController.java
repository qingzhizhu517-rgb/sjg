package com.sjg.controller.admin;

import com.sjg.dto.PageResult;
import com.sjg.dto.ResetPasswordRequest;
import com.sjg.entity.User;
import com.sjg.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 用户管理控制器（管理员）
 * 提供用户审批、启用/禁用、重置密码等接口
 */
@Tag(name = "用户管理", description = "用户审批和管理接口（管理员）")
@RestController
@RequestMapping("/api/admin/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * 分页查询用户列表
     */
    @Operation(summary = "分页查询用户列表", description = "支持按用户名搜索和按状态筛选")
    @GetMapping
    public ResponseEntity<PageResult<User>> list(
            @Parameter(description = "页码", example = "1") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量", example = "10") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "搜索关键字（按用户名模糊匹配）") @RequestParam(required = false) String keyword,
            @Parameter(description = "状态筛选", example = "pending") @RequestParam(required = false) String status) {
        return ResponseEntity.ok(userService.list(page, size, keyword, status));
    }

    /**
     * 批准注册
     */
    @Operation(summary = "批准注册", description = "将待审批用户状态设为已批准")
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(
            @Parameter(description = "用户ID", example = "1", required = true) @PathVariable Long id) {
        userService.approve(id);
        return ResponseEntity.ok(Map.of("message", "已批准"));
    }

    /**
     * 拒绝注册
     */
    @Operation(summary = "拒绝注册", description = "将待审批用户状态设为已拒绝")
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(
            @Parameter(description = "用户ID", example = "1", required = true) @PathVariable Long id) {
        userService.reject(id);
        return ResponseEntity.ok(Map.of("message", "已拒绝"));
    }

    /**
     * 禁用用户
     */
    @Operation(summary = "禁用用户", description = "将已批准用户状态设为已禁用")
    @PutMapping("/{id}/disable")
    public ResponseEntity<?> disable(
            @Parameter(description = "用户ID", example = "1", required = true) @PathVariable Long id) {
        userService.disable(id);
        return ResponseEntity.ok(Map.of("message", "已禁用"));
    }

    /**
     * 启用用户
     */
    @Operation(summary = "启用用户", description = "将已禁用用户状态设为已批准")
    @PutMapping("/{id}/enable")
    public ResponseEntity<?> enable(
            @Parameter(description = "用户ID", example = "1", required = true) @PathVariable Long id) {
        userService.enable(id);
        return ResponseEntity.ok(Map.of("message", "已启用"));
    }

    /**
     * 重置密码
     */
    @Operation(summary = "重置密码", description = "管理员重置指定用户的密码")
    @PutMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(
            @Parameter(description = "用户ID", example = "1", required = true) @PathVariable Long id,
            @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(id, request);
        return ResponseEntity.ok(Map.of("message", "密码重置成功"));
    }
}
