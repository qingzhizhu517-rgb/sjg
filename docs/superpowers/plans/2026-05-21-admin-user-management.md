# 管理端用户管理系统实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在管理前端实现用户注册、登录、用户管理（审批/禁用/重置密码）功能。

**Architecture:** 复用现有DataTable/FormDialog组件，新增UserList页面，改造Login页面支持注册tab，调整侧边栏和路由。

**Tech Stack:** Vue 3, Element Plus, Vue Router, Axios

---

### Task 1: 修改登录响应处理 — 存储role字段

**Files:**
- Modify: `admin-frontend/src/views/Login.vue`

- [ ] **Step 1: 修改登录成功处理，存储role到localStorage**

将 Login.vue 的 `handleLogin` 方法改为：

```javascript
const handleLogin = async () => {
  loading.value = true
  try {
    const data = await api.post('/auth/login', form.value)
    localStorage.setItem('token', data.token)
    localStorage.setItem('username', data.username)
    localStorage.setItem('role', data.role || 'user')
    ElMessage.success('登录成功')
    router.push('/')
  } catch (e) {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add admin-frontend/src/views/Login.vue
git commit -m "feat: store user role from login response"
```

---

### Task 2: 登录页增加注册tab

**Files:**
- Modify: `admin-frontend/src/views/Login.vue`

- [ ] **Step 1: 添加注册表单和tab切换**

将 Login.vue 的 template 部分改为：

```vue
<template>
  <div class="login-page">
    <div class="login-card-wrapper fade-in-up">
      <div class="login-card">
        <div class="login-header">
          <div class="seal-stamp">山左文渊</div>
          <h1 class="login-title">管理后台</h1>
          <p class="login-subtitle">数字人文视域下黄河流域文学景观</p>
        </div>
        <div class="ink-divider"></div>
        <el-tabs v-model="activeTab" class="login-tabs">
          <el-tab-pane label="登录" name="login">
            <el-form :model="loginForm" @submit.prevent="handleLogin" class="login-form">
              <el-form-item>
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入用户名"
                  prefix-icon="User"
                  size="large"
                />
              </el-form-item>
              <el-form-item>
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  prefix-icon="Lock"
                  show-password
                  size="large"
                />
              </el-form-item>
              <el-button
                type="primary"
                native-type="submit"
                :loading="loading"
                size="large"
                class="login-btn"
              >
                登 录
              </el-button>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="注册" name="register">
            <el-form :model="registerForm" @submit.prevent="handleRegister" class="login-form">
              <el-form-item>
                <el-input
                  v-model="registerForm.username"
                  placeholder="请输入用户名"
                  prefix-icon="User"
                  size="large"
                />
              </el-form-item>
              <el-form-item>
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="请输入密码"
                  prefix-icon="Lock"
                  show-password
                  size="large"
                />
              </el-form-item>
              <el-form-item>
                <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="请确认密码"
                  prefix-icon="Lock"
                  show-password
                  size="large"
                />
              </el-form-item>
              <el-button
                type="primary"
                native-type="submit"
                :loading="loading"
                size="large"
                class="login-btn"
              >
                注 册
              </el-button>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        <div class="login-footer">
          <span class="footer-text">山东师范大学 · 文学院</span>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: 添加注册逻辑和错误处理**

将 Login.vue 的 script 部分改为：

```vue
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api'

const router = useRouter()
const loading = ref(false)
const activeTab = ref('login')
const loginForm = ref({ username: '', password: '' })
const registerForm = ref({ username: '', password: '', confirmPassword: '' })

const handleLogin = async () => {
  loading.value = true
  try {
    const data = await api.post('/auth/login', loginForm.value)
    localStorage.setItem('token', data.token)
    localStorage.setItem('username', data.username)
    localStorage.setItem('role', data.role || 'user')
    ElMessage.success('登录成功')
    router.push('/')
  } catch (e) {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  if (!registerForm.value.username || !registerForm.value.password) {
    ElMessage.error('请输入用户名和密码')
    return
  }
  loading.value = true
  try {
    await api.post('/auth/register', {
      username: registerForm.value.username,
      password: registerForm.value.password
    })
    ElMessage.success('注册成功，等待管理员审批')
    activeTab.value = 'login'
    registerForm.value = { username: '', password: '', confirmPassword: '' }
  } catch (e) {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}
</script>
```

- [ ] **Step 3: 添加tab样式**

在 Login.vue 的 style 部分添加：

```css
.login-tabs {
  margin-top: 16px;
}

.login-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.login-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.login-tabs :deep(.el-tabs__item) {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--text-muted);
  letter-spacing: 2px;
}

.login-tabs :deep(.el-tabs__item.is-active) {
  color: var(--color-zhu);
}

.login-tabs :deep(.el-tabs__active-bar) {
  background-color: var(--color-zhu);
}
```

- [ ] **Step 4: Commit**

```bash
git add admin-frontend/src/views/Login.vue
git commit -m "feat: add register tab to login page"
```

---

### Task 3: 新建用户管理页面

**Files:**
- Create: `admin-frontend/src/views/UserList.vue`

- [ ] **Step 1: 创建UserList.vue基础结构**

```vue
<template>
  <div>
    <div class="page-title">用户管理</div>
    <el-tabs v-model="statusFilter" @tab-change="handleTabChange" class="status-tabs">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="待审批" name="pending" />
      <el-tab-pane label="已批准" name="approved" />
      <el-tab-pane label="已拒绝" name="rejected" />
      <el-tab-pane label="已禁用" name="disabled" />
    </el-tabs>
    <DataTable ref="table" :fetchFn="fetchUsers">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column prop="role" label="角色" width="100">
        <template #default="{ row }">
          <el-tag :type="row.role === 'admin' ? 'danger' : 'info'" size="small">
            {{ row.role === 'admin' ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 'pending'">
            <el-button type="success" link class="action-link" @click="handleApprove(row)">
              <el-icon><Check /></el-icon> 批准
            </el-button>
            <el-button type="danger" link class="action-link" @click="handleReject(row)">
              <el-icon><Close /></el-icon> 拒绝
            </el-button>
          </template>
          <template v-else-if="row.status === 'approved'">
            <el-button type="warning" link class="action-link" @click="handleDisable(row)">
              <el-icon><Lock /></el-icon> 禁用
            </el-button>
            <el-button type="primary" link class="action-link" @click="openResetPassword(row)">
              <el-icon><Key /></el-icon> 重置密码
            </el-button>
          </template>
          <template v-else-if="row.status === 'disabled'">
            <el-button type="success" link class="action-link" @click="handleEnable(row)">
              <el-icon><Unlock /></el-icon> 启用
            </el-button>
            <el-button type="primary" link class="action-link" @click="openResetPassword(row)">
              <el-icon><Key /></el-icon> 重置密码
            </el-button>
          </template>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 重置密码弹窗 -->
    <el-dialog v-model="resetDialogVisible" title="重置密码" width="400px">
      <el-form :model="resetForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input :value="resetForm.username" disabled />
        </el-form-item>
        <el-form-item label="新密码" required>
          <el-input v-model="resetForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="resetLoading" @click="handleResetPassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

- [ ] **Step 2: 添加script逻辑**

```vue
<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'
import DataTable from '../components/DataTable.vue'

const table = ref(null)
const statusFilter = ref('')
const resetDialogVisible = ref(false)
const resetLoading = ref(false)
const resetForm = ref({ id: null, username: '', newPassword: '' })

const fetchUsers = (page, size, keyword) =>
  api.get('/admin/users', { params: { page, size, keyword, status: statusFilter.value || undefined } })

const handleTabChange = () => {
  table.value.fetch()
}

const statusTagType = (status) => {
  const map = { pending: 'warning', approved: 'success', rejected: 'danger', disabled: 'info' }
  return map[status] || 'info'
}

const statusLabel = (status) => {
  const map = { pending: '待审批', approved: '已批准', rejected: '已拒绝', disabled: '已禁用' }
  return map[status] || status
}

const handleApprove = async (row) => {
  await ElMessageBox.confirm(`确定批准用户 "${row.username}"？`, '确认操作')
  await api.put(`/admin/users/${row.id}/approve`)
  ElMessage.success('已批准')
  table.value.fetch()
}

const handleReject = async (row) => {
  await ElMessageBox.confirm(`确定拒绝用户 "${row.username}"？`, '确认操作')
  await api.put(`/admin/users/${row.id}/reject`)
  ElMessage.success('已拒绝')
  table.value.fetch()
}

const handleDisable = async (row) => {
  await ElMessageBox.confirm(`确定禁用用户 "${row.username}"？`, '确认操作')
  await api.put(`/admin/users/${row.id}/disable`)
  ElMessage.success('已禁用')
  table.value.fetch()
}

const handleEnable = async (row) => {
  await ElMessageBox.confirm(`确定启用用户 "${row.username}"？`, '确认操作')
  await api.put(`/admin/users/${row.id}/enable`)
  ElMessage.success('已启用')
  table.value.fetch()
}

const openResetPassword = (row) => {
  resetForm.value = { id: row.id, username: row.username, newPassword: '' }
  resetDialogVisible.value = true
}

const handleResetPassword = async () => {
  if (!resetForm.value.newPassword) {
    ElMessage.error('请输入新密码')
    return
  }
  resetLoading.value = true
  try {
    await api.put(`/admin/users/${resetForm.value.id}/reset-password`, {
      newPassword: resetForm.value.newPassword
    })
    ElMessage.success('密码重置成功')
    resetDialogVisible.value = false
  } finally {
    resetLoading.value = false
  }
}
</script>
```

- [ ] **Step 3: 添加样式**

```vue
<style scoped>
.status-tabs {
  margin-bottom: 16px;
}

.status-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.status-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.action-link {
  padding: 4px 8px;
}

.action-link .el-icon {
  margin-right: 2px;
}
</style>
```

- [ ] **Step 4: Commit**

```bash
git add admin-frontend/src/views/UserList.vue
git commit -m "feat: add UserList page with approval workflow"
```

---

### Task 4: 添加路由和侧边栏

**Files:**
- Modify: `admin-frontend/src/router/index.js`
- Modify: `admin-frontend/src/views/Layout.vue`

- [ ] **Step 1: 在router中添加/users路由**

将 router/index.js 改为：

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    redirect: '/poets',
    children: [
      { path: 'poets', name: 'PoetList', component: () => import('../views/PoetList.vue') },
      { path: 'spots', name: 'SpotList', component: () => import('../views/SpotList.vue') },
      { path: 'poems', name: 'PoemList', component: () => import('../views/PoemList.vue') },
      { path: 'events', name: 'EventList', component: () => import('../views/EventList.vue') },
      { path: 'users', name: 'UserList', component: () => import('../views/UserList.vue'), meta: { requireAdmin: true } },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.meta.requireAdmin && localStorage.getItem('role') !== 'admin') {
    next('/')
  } else {
    next()
  }
})

export default router
```

- [ ] **Step 2: 在Layout侧边栏底部添加用户管理入口**

在 Layout.vue 的 `<el-menu>` 中，最后一个 `</el-menu-item>` 之后添加：

```vue
        <!-- 底部分隔区 -->
        <div class="sidebar-divider"></div>
        <el-menu-item v-if="isAdmin" index="/users">
          <el-icon><UserFilled /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
```

- [ ] **Step 3: 添加isAdmin计算属性和UserFilled图标导入**

在 Layout.vue 的 `<script setup>` 中添加：

```javascript
import { UserFilled } from '@element-plus/icons-vue'

const isAdmin = computed(() => localStorage.getItem('role') === 'admin')
```

- [ ] **Step 4: 添加分隔线样式**

在 Layout.vue 的 `<style scoped>` 中添加：

```css
.sidebar-divider {
  height: 1px;
  margin: 8px 20px;
  background: linear-gradient(90deg, transparent, rgba(232, 220, 200, 0.15), transparent);
}
```

- [ ] **Step 5: 更新pageTitles映射**

在 Layout.vue 的 `pageTitles` 中添加：

```javascript
const pageTitles = {
  '/poets': '诗人管理',
  '/spots': '景点管理',
  '/poems': '诗词管理',
  '/events': '事件管理',
  '/users': '用户管理',
}
```

- [ ] **Step 6: Commit**

```bash
git add admin-frontend/src/router/index.js admin-frontend/src/views/Layout.vue
git commit -m "feat: add user management route and sidebar entry"
```

---

### Task 5: 清理localStorage中的过期数据

**Files:**
- Modify: `admin-frontend/src/views/Layout.vue`

- [ ] **Step 1: 修改logout方法，清除role**

将 Layout.vue 的 `logout` 方法改为：

```javascript
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('role')
  router.push('/login')
}
```

- [ ] **Step 2: Commit**

```bash
git add admin-frontend/src/views/Layout.vue
git commit -m "fix: clear role from localStorage on logout"
```

---

### Task 6: 后端登录接口返回role字段

**Files:**
- Modify: `backend/src/main/java/com/sjg/service/AuthService.java`
- Modify: `backend/src/main/java/com/sjg/dto/LoginResponse.java`

- [ ] **Step 1: 给LoginResponse添加role字段**

将 LoginResponse.java 改为：

```java
package com.sjg.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@Schema(description = "登录响应")
public class LoginResponse {

    @Schema(description = "JWT令牌", example = "eyJhbGciOiJIUzI1NiJ9...")
    private String token;

    @Schema(description = "用户名", example = "admin")
    private String username;

    @Schema(description = "用户角色", example = "admin")
    private String role;
}
```

- [ ] **Step 2: 修改AuthService.login方法返回role**

将 AuthService.java 的 `login` 方法最后一行改为：

```java
return new LoginResponse(token, user.getUsername(), user.getRole());
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/sjg/dto/LoginResponse.java backend/src/main/java/com/sjg/service/AuthService.java
git commit -m "feat: include role in login response"
```

---

### Task 7: 验证和提交

- [ ] **Step 1: 启动后端服务**

```bash
cd backend && mvn spring-boot:run
```

- [ ] **Step 2: 启动前端开发服务器**

```bash
cd admin-frontend && npm run dev
```

- [ ] **Step 3: 测试完整流程**

1. 访问 http://localhost:5173/login
2. 点击"注册"tab，注册新用户 test1
3. 看到"注册成功，等待管理员审批"提示，自动切回登录tab
4. 用 admin/admin123 登录
5. 侧边栏底部看到"用户管理"入口
6. 点击进入用户管理页，看到待审批的 test1 用户
7. 点击"批准"按钮
8. 退出登录，用 test1 登录成功
9. 非admin用户看不到"用户管理"菜单

- [ ] **Step 4: 最终Commit（如有遗漏）**

```bash
git add -A
git commit -m "feat: complete admin frontend user management integration"
```
