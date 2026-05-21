# 管理端用户管理系统设计文档

## Context

后端已实现用户管理系统（注册审批流程、角色权限），管理前端需要接入相关功能：登录页支持注册、新增用户管理页面、侧边栏入口调整。

## 设计方案

### 1. 登录页面改造

**文件**: `src/views/Login.vue`

- 使用 `el-tabs` 实现登录/注册两个标签页切换
- 登录tab：用户名 + 密码 + 登录按钮（保持现有样式）
- 注册tab：用户名 + 密码 + 确认密码 + 注册按钮
- 注册成功后显示 ElMessage 提示"注册成功，等待管理员审批"，自动切回登录tab
- 登录错误提示：待审批/已拒绝/已禁用分别显示不同消息

**API对接**:
- 登录：`POST /api/auth/login` → 响应需包含 `{token, username, role}`
- 注册：`POST /api/auth/register` → 请求 `{username, password}`

### 2. 用户管理页面

**新建文件**: `src/views/UserList.vue`

- 页面标题：用户管理
- 顶部使用 `el-tabs` 切换状态筛选：全部 / 待审批 / 已批准 / 已拒绝 / 已禁用
- 复用 `DataTable` 组件显示用户列表
- 表格列：ID、用户名、角色、状态、创建时间
- 操作列（根据状态动态显示）：
  - 待审批：批准、拒绝
  - 已批准：禁用、重置密码
  - 已拒绝：无操作
  - 已禁用：启用、重置密码
- 重置密码：点击后弹窗输入新密码（使用 el-dialog + el-form）

**API对接**:
- 用户列表：`GET /api/admin/users?page=&size=&keyword=&status=`
- 批准：`PUT /api/admin/users/{id}/approve`
- 拒绝：`PUT /api/admin/users/{id}/reject`
- 禁用：`PUT /api/admin/users/{id}/disable`
- 启用：`PUT /api/admin/users/{id}/enable`
- 重置密码：`PUT /api/admin/users/{id}/reset-password` → 请求 `{newPassword}`

### 3. 侧边栏调整

**修改文件**: `src/views/Layout.vue`

- 现有菜单（诗人/景点/诗词/事件）保持不变
- 底部添加分隔线和"用户管理"菜单项
- 使用 `UserFilled` 图标
- 仅当用户角色为 admin 时显示此菜单项

### 4. 路由配置

**修改文件**: `src/router/index.js`

- 新增路由：`/users` → `UserList.vue`
- 路由守卫：检查 localStorage 中的 role，仅 admin 可访问 /users
- 非 admin 访问 /users 时重定向到 /

### 5. 认证信息调整

**修改文件**: `src/api/index.js`

- 登录成功后存储 role 到 localStorage
- 响应拦截器中处理 401 跳转逻辑保持不变

## 涉及文件

### 修改文件
- `src/views/Login.vue` — 登录页增加注册tab
- `src/views/Layout.vue` — 侧边栏增加用户管理入口
- `src/router/index.js` — 新增 /users 路由 + admin守卫
- `src/api/index.js` — 登录响应处理role字段

### 新建文件
- `src/views/UserList.vue` — 用户管理页面

## 后端配合

登录接口 `POST /api/auth/login` 响应需新增 role 字段：

```json
{
  "token": "xxx",
  "username": "admin",
  "role": "admin"
}
```

## 状态流转

```
注册 → pending（待审批）
  → approve → approved（已批准，可登录）
  → reject → rejected（已拒绝）
approved → disable → disabled（已禁用）
disabled → enable → approved（已批准）
```
