package com.sjg.controller.admin;

import com.sjg.dto.ChangePasswordRequest;
import com.sjg.dto.LoginRequest;
import com.sjg.dto.LoginResponse;
import com.sjg.dto.RegisterRequest;
import com.sjg.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

/**
 * 认证控制器
 * 提供用户注册、登录和修改密码接口
 */
@Tag(name = "认证管理", description = "用户注册、登录和修改密码接口")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 用户注册
     */
    @Operation(summary = "用户注册", description = "注册新用户账号，需等待管理员审批")
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(Map.of("message", "注册成功，等待管理员审批"));
    }

    /**
     * 用户登录
     */
    @Operation(summary = "用户登录", description = "用户登录获取JWT令牌，仅已审批用户可登录")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * 修改密码
     */
    @Operation(summary = "修改密码", description = "登录用户修改自己的密码，需验证当前密码")
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(Principal principal,
            @RequestBody ChangePasswordRequest request) {
        authService.changePassword(principal.getName(), request);
        return ResponseEntity.ok(Map.of("message", "密码修改成功"));
    }
}
