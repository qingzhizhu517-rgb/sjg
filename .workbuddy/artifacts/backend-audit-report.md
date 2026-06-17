# 后端 Spring Boot 安全与架构审查报告

**审查日期**: 2026-06-17 | **审查文件**: 43 个 Java 源文件 + 配置文件  
**问题总数**: 83 个 (CRITICAL 3 / HIGH 27 / MEDIUM 44 / LOW 9)

---

## 🔴 CRITICAL (3 个 — 必须立即修复)

| # | 位置 | 问题 |
|---|------|------|
| C1 | `CorsConfig.java:14,17` | `allowCredentials(true)` + `allowedOriginPattern("*")` — CORS 规范违规，浏览器直接拒绝 |
| C2 | `application.yml:8` | 数据库密码默认值 `123456`，极度弱密码 |
| C3 | `application.yml:21` | JWT 密钥默认值硬编码，攻击者可伪造任意 Token |

---

## HIGH 问题分类 (27 个)

### 🛡️ 批量赋值漏洞 (Mass Assignment) — 6 个 Controller
EventController、PoemController、PoetController、SpotController — 全部使用 `@RequestBody Entity` 接收请求，客户端可注入 `id`/`createdAt`/`updatedAt`。

### 📝 缺少 Bean Validation — 全部 DTO + Controller
- 4 个 DTO 类无 `@NotBlank`/`@Size` 注解
- 所有 Controller 方法缺少 `@Valid`

### 🔐 安全配置
- `SecurityConfig.java:49` — GET `/api/admin/**` 只要求登录，任意用户可查看管理数据
- `User.java` — `password` 字段无 `@JsonIgnore`

### 🗑️ 异常信息泄漏 — 6 处
- `GlobalExceptionHandler.java:71` — `e.getMessage()` 直接返回给客户端
- 5 个 Controller 的 import 异常处理

### 🏗️ 架构缺陷
- 4 个 Public Controller 直连 Mapper 层，完全绕过 Service
- `UploadController` 无文件类型校验（任意上传）
- `PoetService.delete()` 级联删除漏了 poem_event 关联

---

## 优先修复 Top 10

```
P0 — 今天必须修
  [ ] C1: CORS → 域名白名单
  [ ] C2: DB 密码 → 移除默认值，强制环境变量
  [ ] C3: JWT 密钥 → 同上
  
P1 — 本周必修
  [ ] H1: 所有 DTO 加 @NotBlank/@Size
  [ ] H2: 所有 Controller 加 @Valid
  [ ] H3: 创建 CreateDTO/UpdateDTO 替换 Entity 入参
  [ ] H4: GlobalExceptionHandler 移除 e.getMessage()
  [ ] H5: UploadController 加文件类型白名单校验
  [ ] H6: PoetService.delete() 修复 poem_event 级联
  [ ] H7: GET /api/admin/** 也要求 admin 权限
```

---

## 其他重要发现

| 类别 | 问题数 | 典型问题 |
|------|--------|---------|
| @Transactional 缺失 | 8 | 所有 Service 的 create/update/delete 无事务 |
| N+1 查询 | 3 | PublicTimelineController 单次请求 25 次 DB 查询 |
| 无日志 | 全部 Service | 零 `log.info`/`log.error`，排查困难 |
| 无自定义异常 | 全部 | 仅使用 `RuntimeException`，无法区分错误类型 |
| 密码策略弱 | 3 | 无最小长度、无复杂度要求、无登录失败锁定 |
| 过期依赖 | 3 | Spring Boot 3.2.5、POI 5.2.5 (有 CVE)、springdoc 2.3.0 |
| 死代码 | 2 | PoetService 中 3 个冗余 Excel 读取方法 |

---

## 各 Service 质量评分

| Service | 安全性 | 健壮性 | 日志 | 事务 | 评分 |
|---------|--------|--------|------|------|------|
| AuthService | ⚠️ 无密码策略 | ⚠️ RuntimeException | ❌ | ❌ | 2/5 |
| EventService | ✅ | ❌ 无存在性检查 | ❌ | ❌ | 2/5 |
| PoemService | ✅ | ❌ 无存在性检查 | ❌ | ❌ | 2/5 |
| PoetService | ⚠️ 级联删除bug | ❌ | ❌ | ❌ | 1/5 |
| SpotService | ⚠️ 删除无级联 | ❌ | ❌ | ❌ | 1/5 |
| UserService | ✅ | ⚠️ 竞态条件 | ❌ | ❌ | 2/5 |
| OssService | ⚠️ 无超时配置 | ✅ | ❌ | - | 3/5 |
