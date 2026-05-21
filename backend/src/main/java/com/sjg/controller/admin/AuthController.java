package com.sjg.controller.admin;

import com.sjg.dto.LoginRequest;
import com.sjg.dto.LoginResponse;
import com.sjg.dto.RegisterRequest;
import com.sjg.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 认证控制器
 * 提供用户注册和登录接口
 */
@Tag(name = "认证管理", description = "用户注册和登录接口")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 用户注册
     *
     * @param request 注册请求体
     * @return 注册成功消息
     */
    @Operation(summary = "用户注册", description = "注册新用户账号")
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(Map.of("message", "注册成功"));
    }

    /**
     * 用户登录
     *
     * @param request 登录请求体
     * @return 包含 JWT token 和用户名的登录响应
     */
    @Operation(summary = "用户登录", description = "用户登录获取JWT令牌")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
