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
        <el-form :model="form" @submit.prevent="handleLogin" class="login-form">
          <el-form-item>
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              size="large"
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="form.password"
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
        <div class="login-footer">
          <span class="footer-text">山东师范大学 · 文学院</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api'

const router = useRouter()
const loading = ref(false)
const form = ref({ username: '', password: '' })

const handleLogin = async () => {
  loading.value = true
  try {
    const data = await api.post('/auth/login', form.value)
    localStorage.setItem('token', data.token)
    localStorage.setItem('username', data.username)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (e) {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-header {
  text-align: center;
  margin-bottom: 8px;
}

.login-header .seal-stamp {
  display: inline-block;
  padding: 6px 16px;
  border: 2px solid var(--color-zhu);
  color: var(--color-zhu);
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: 4px;
  transform: rotate(-2deg);
  margin-bottom: 16px;
}

.login-header .login-title {
  font-family: var(--font-display);
  font-size: 26px;
  color: var(--color-mo);
  letter-spacing: 6px;
  margin: 0 0 8px 0;
}

.login-header .login-subtitle {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1px;
  margin: 0;
}

.login-form {
  margin-top: 24px;
}

.login-form .el-form-item {
  margin-bottom: 20px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: var(--radius-md);
  box-shadow: 0 0 0 1px var(--border-light) inset;
  padding: 4px 12px;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--color-jin) inset;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--color-zhu) inset;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-family: var(--font-body);
  font-size: 16px;
  letter-spacing: 4px;
  background: linear-gradient(135deg, var(--color-zhu), var(--color-zhu-dark));
  border: none;
  border-radius: var(--radius-md);
  margin-top: 8px;
}

.login-btn:hover {
  background: linear-gradient(135deg, var(--color-zhu-light), var(--color-zhu));
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

.login-footer .footer-text {
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 1px;
}
</style>
