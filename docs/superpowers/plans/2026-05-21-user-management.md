# 用户管理系统实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现用户注册审批流程，仅管理员可登录，新用户需管理员审批。

**Architecture:** 在现有 user 表增加 role/status 字段，新增 UserService + UserController 处理用户管理，修改 AuthService 实现审批登录逻辑。

**Tech Stack:** Spring Boot 3.2.5, MyBatis-Plus, Spring Security, JWT, BCrypt

---

### Task 1: 更新数据库 schema

**Files:**
- Modify: `backend/src/main/resources/schema.sql`

- [ ] **Step 1: 修改 user 表定义，新增 role 和 status 字段**

将 schema.sql 中的 user 表改为：

```sql
-- 用户表
CREATE TABLE user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(200) NOT NULL COMMENT '密码（BCrypt加密）',
    role VARCHAR(20) NOT NULL DEFAULT 'user' COMMENT '角色（admin/user）',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态（pending/approved/rejected/disabled）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

- [ ] **Step 2: 添加默认管理员账号种子数据**

在 schema.sql 末尾的 dynasty seed 数据之后追加：

```sql
-- 默认管理员账号（密码: admin123）
INSERT INTO user (username, password, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'admin', 'approved');
```

注意：`$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi` 是 `admin123` 的 BCrypt 加密值。

- [ ] **Step 3: 验证 schema.sql 语法正确**

检查文件内容，确认 user 表定义包含 role/status 字段，且 INSERT 语句格式正确。

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/resources/schema.sql
git commit -m "feat: add role/status fields to user table with default admin account"
```

---

### Task 2: 更新 User 实体

**Files:**
- Modify: `backend/src/main/java/com/sjg/entity/User.java`

- [ ] **Step 1: 给 User 实体新增 role 和 status 字段**

将 User.java 替换为：

```java
package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("user")
@Schema(description = "用户实体")
public class User {
    @TableId(type = IdType.AUTO)
    @Schema(description = "用户ID", example = "1")
    private Long id;

    @Schema(description = "用户名", example = "admin")
    private String username;

    @Schema(description = "密码（BCrypt加密）", accessMode = Schema.AccessMode.WRITE_ONLY)
    private String password;

    @Schema(description = "角色（admin/user）", example = "admin")
    private String role;

    @Schema(description = "状态（pending/approved/rejected/disabled）", example = "approved")
    private String status;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/main/java/com/sjg/entity/User.java
git commit -m "feat: add role and status fields to User entity"
```

---

### Task 3: 创建 DTO 类

**Files:**
- Create: `backend/src/main/java/com/sjg/dto/ChangePasswordRequest.java`
- Create: `backend/src/main/java/com/sjg/dto/ResetPasswordRequest.java`

- [ ] **Step 1: 创建 ChangePasswordRequest**

```java
package com.sjg.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "修改密码请求")
public class ChangePasswordRequest {

    @Schema(description = "当前密码", example = "oldPass123", requiredMode = Schema.RequiredMode.REQUIRED)
    private String oldPassword;

    @Schema(description = "新密码", example = "newPass123", requiredMode = Schema.RequiredMode.REQUIRED)
    private String newPassword;
}
```

- [ ] **Step 2: 创建 ResetPasswordRequest**

```java
package com.sjg.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "重置密码请求（管理员）")
public class ResetPasswordRequest {

    @Schema(description = "新密码", example = "newPass123", requiredMode = Schema.RequiredMode.REQUIRED)
    private String newPassword;
}
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/sjg/dto/ChangePasswordRequest.java backend/src/main/java/com/sjg/dto/ResetPasswordRequest.java
git commit -m "feat: add ChangePasswordRequest and ResetPasswordRequest DTOs"
```

---

### Task 4: 修改 AuthService — 注册/登录逻辑

**Files:**
- Modify: `backend/src/main/java/com/sjg/service/AuthService.java`

- [ ] **Step 1: 重写 AuthService**

```java
package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sjg.dto.*;
import com.sjg.entity.User;
import com.sjg.mapper.UserMapper;
import com.sjg.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserMapper userMapper, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public void register(RegisterRequest request) {
        Long count = userMapper.selectCount(
            new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername()));
        if (count > 0) {
            throw new RuntimeException("用户名已存在");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("user");
        user.setStatus("pending");
        userMapper.insert(user);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userMapper.selectOne(
            new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername()));
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }
        if ("pending".equals(user.getStatus())) {
            throw new RuntimeException("账号待审批，请等待管理员审核");
        }
        if ("rejected".equals(user.getStatus())) {
            throw new RuntimeException("注册已被拒绝");
        }
        if ("disabled".equals(user.getStatus())) {
            throw new RuntimeException("账号已被禁用");
        }
        String token = jwtUtil.generateToken(user.getUsername());
        return new LoginResponse(token, user.getUsername());
    }

    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userMapper.selectOne(
            new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("当前密码错误");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userMapper.updateById(user);
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/main/java/com/sjg/service/AuthService.java
git commit -m "feat: update AuthService with approval-based registration and password change"
```

---

### Task 5: 修改 AuthController — 新增改密接口

**Files:**
- Modify: `backend/src/main/java/com/sjg/controller/admin/AuthController.java`

- [ ] **Step 1: 给 AuthController 添加修改密码接口**

```java
package com.sjg.controller.admin;

import com.sjg.dto.*;
import com.sjg.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/main/java/com/sjg/controller/admin/AuthController.java
git commit -m "feat: add change-password endpoint to AuthController"
```

---

### Task 6: 创建 UserService

**Files:**
- Create: `backend/src/main/java/com/sjg/service/UserService.java`

- [ ] **Step 1: 创建 UserService**

```java
package com.sjg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sjg.dto.PageResult;
import com.sjg.dto.ResetPasswordRequest;
import com.sjg.entity.User;
import com.sjg.mapper.UserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public PageResult<User> list(int page, int size, String keyword, String status) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(User::getUsername, keyword);
        }
        if (StringUtils.hasText(status)) {
            wrapper.eq(User::getStatus, status);
        }
        wrapper.orderByDesc(User::getId);
        Page<User> result = userMapper.selectPage(new Page<>(page, size), wrapper);
        // 清除密码字段再返回
        result.getRecords().forEach(u -> u.setPassword(null));
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    public void approve(Long id) {
        updateStatus(id, "approved");
    }

    public void reject(Long id) {
        updateStatus(id, "rejected");
    }

    public void disable(Long id) {
        updateStatus(id, "disabled");
    }

    public void enable(Long id) {
        updateStatus(id, "approved");
    }

    public void resetPassword(Long id, ResetPasswordRequest request) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userMapper.updateById(user);
    }

    private void updateStatus(Long id, String status) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        user.setStatus(status);
        userMapper.updateById(user);
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/main/java/com/sjg/service/UserService.java
git commit -m "feat: add UserService for user management operations"
```

---

### Task 7: 创建 UserController

**Files:**
- Create: `backend/src/main/java/com/sjg/controller/admin/UserController.java`

- [ ] **Step 1: 创建 UserController**

```java
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
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/main/java/com/sjg/controller/admin/UserController.java
git commit -m "feat: add UserController for user management endpoints"
```

---

### Task 8: 更新 SecurityConfig — 放行修改密码接口

**Files:**
- Modify: `backend/src/main/java/com/sjg/config/SecurityConfig.java`

当前 `/api/auth/**` 已全部放行，`/api/auth/change-password` 也走这个规则，无需修改 SecurityConfig。

但需要确认 JWT filter 能正确解析 Principal。当前 filter 设置了 Authentication，Controller 中 `Principal principal` 可以获取用户名。

- [ ] **Step 1: 验证 SecurityConfig 无需修改**

当前规则：
- `/api/auth/**` → permitAll（包含 register、login、change-password）
- `/api/admin/**` → authenticated（包含 /api/admin/users/**）

change-password 需要登录才能拿到 Principal，但当前是 permitAll。需要改为：change-password 需要认证。

修改 SecurityConfig 的 authorizeHttpRequests：

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
    .requestMatchers("/api/public/**").permitAll()
    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
    .requestMatchers("/api/admin/**").authenticated()
    .requestMatchers("/api/auth/**").authenticated()
    .anyRequest().permitAll()
)
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/main/java/com/sjg/config/SecurityConfig.java
git commit -m "fix: require auth for change-password endpoint"
```

---

### Task 9: 验证和提交

- [ ] **Step 1: 检查所有修改文件的一致性**

确认以下文件已正确修改：
- `schema.sql` — user 表有 role/status 字段 + admin 种子数据
- `User.java` — 有 role/status 字段
- `ChangePasswordRequest.java` — 已创建
- `ResetPasswordRequest.java` — 已创建
- `AuthService.java` — 注册设 status=pending，登录检查 status，有 changePassword 方法
- `AuthController.java` — 有 change-password 接口
- `UserService.java` — 已创建
- `UserController.java` — 已创建
- `SecurityConfig.java` — change-password 需认证

- [ ] **Step 2: 最终 Commit（如有遗漏）**

```bash
git add -A
git commit -m "feat: complete user management system with approval workflow"
```
