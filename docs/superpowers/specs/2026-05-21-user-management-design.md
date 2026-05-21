# 用户管理系统设计文档

## Context

当前系统每次登录都需要先注册，注册直接生效无需审批，且无角色区分。需要改为：仅管理员可登录，新注册用户需管理员审批，默认提供一个管理员账号。

## 数据库变更

### user 表新增字段

```sql
ALTER TABLE user ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user' COMMENT '角色（admin/user）';
ALTER TABLE user ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态（pending/approved/rejected/disabled）';
```

### 字段说明

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| role | VARCHAR(20) | 'user' | 角色：admin=管理员，user=普通用户 |
| status | VARCHAR(20) | 'pending' | 状态：pending=待审批，approved=已批准，rejected=已拒绝，disabled=已禁用 |

### 默认管理员账号

在 schema.sql 中预置：
- username: `admin`
- password: `admin123`（BCrypt 加密）
- role: `admin`
- status: `approved`

## 认证流程变更

### 注册流程
1. 用户提交用户名和密码
2. 检查用户名是否已存在
3. 创建用户，status=pending，role=user
4. 返回"注册成功，等待管理员审批"

### 登录流程
1. 校验用户名和密码
2. 检查 status 必须为 approved
3. 若 status=pending，返回"账号待审批"
4. 若 status=rejected，返回"注册已被拒绝"
5. 若 status=disabled，返回"账号已被禁用"
6. 生成 JWT 返回

### 修改密码（需登录）
1. 验证旧密码
2. 更新为新密码

### 重置密码（管理员）
1. 管理员指定用户 ID 和新密码
2. 直接更新密码

## API 接口设计

### 认证接口（/api/auth）

| 方法 | 路径 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| POST | /api/auth/register | 用户注册 | {username, password} | {message} |
| POST | /api/auth/login | 用户登录 | {username, password} | {token, username} |
| PUT | /api/auth/change-password | 修改密码 | {oldPassword, newPassword} | {message} |

### 用户管理接口（/api/admin/users）— 需管理员登录

| 方法 | 路径 | 说明 | 参数 | 响应 |
|------|------|------|------|------|
| GET | /api/admin/users | 分页查询用户 | page, size, keyword, status | PageResult<User> |
| PUT | /api/admin/users/{id}/approve | 批准注册 | - | {message} |
| PUT | /api/admin/users/{id}/reject | 拒绝注册 | - | {message} |
| PUT | /api/admin/users/{id}/disable | 禁用用户 | - | {message} |
| PUT | /api/admin/users/{id}/enable | 启用用户 | - | {message} |
| PUT | /api/admin/users/{id}/reset-password | 重置密码 | {newPassword} | {message} |

## 状态流转

```
注册 → pending
  → approve → approved（可登录）
  → reject → rejected
approved → disable → disabled
disabled → enable → approved
```

## 涉及文件

### 修改文件
- `backend/src/main/resources/schema.sql` — user 表新增字段 + 预置管理员
- `backend/src/main/java/com/sjg/entity/User.java` — 新增 role/status 字段
- `backend/src/main/java/com/sjg/service/AuthService.java` — 注册/登录逻辑变更
- `backend/src/main/java/com/sjg/controller/admin/AuthController.java` — 新增改密接口

### 新建文件
- `backend/src/main/java/com/sjg/dto/ChangePasswordRequest.java` — 改密请求体
- `backend/src/main/java/com/sjg/dto/ResetPasswordRequest.java` — 重置密码请求体
- `backend/src/main/java/com/sjg/service/UserService.java` — 用户管理服务
- `backend/src/main/java/com/sjg/controller/admin/UserController.java` — 用户管理控制器

## 安全约束

- 注册接口保持公开（permitAll）
- 用户管理接口需 admin 角色登录
- 禁用/拒绝的用户无法登录
- 管理员不能删除自己
- 修改密码需验证旧密码
