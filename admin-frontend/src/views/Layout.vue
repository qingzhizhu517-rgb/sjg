<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-seal">文</div>
        <h2>山左文渊</h2>
        <span class="subtitle">管理后台</span>
      </div>
      <el-menu
        :default-active="route.path"
        router
        background-color="transparent"
        text-color="rgba(232, 220, 200, 0.7)"
        active-text-color="#F0D0A0"
      >
        <el-menu-item index="/poets">
          <el-icon><User /></el-icon>
          <span>诗人管理</span>
        </el-menu-item>
        <el-menu-item index="/spots">
          <el-icon><Location /></el-icon>
          <span>景点管理</span>
        </el-menu-item>
        <el-menu-item index="/poems">
          <el-icon><Document /></el-icon>
          <span>诗词管理</span>
        </el-menu-item>
        <el-menu-item index="/events">
          <el-icon><Calendar /></el-icon>
          <span>事件管理</span>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <div class="sidebar-decoration"></div>
        <span class="footer-label">黄河流域 · 山东段</span>
      </div>
    </el-aside>
    <el-container>
      <el-header class="top-header" height="56px">
        <div class="header-left">
          <span class="page-breadcrumb">{{ currentPageTitle }}</span>
        </div>
        <div class="header-right">
          <span class="username">
            <el-icon><User /></el-icon>
            {{ username }}
          </span>
          <el-button text class="logout-btn" @click="logout">
            <el-icon><SwitchButton /></el-icon>
            退出
          </el-button>
        </div>
      </el-header>
      <el-main class="main-content page-texture">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const username = computed(() => localStorage.getItem('username') || '管理员')

const pageTitles = {
  '/poets': '诗人管理',
  '/spots': '景点管理',
  '/poems': '诗词管理',
  '/events': '事件管理',
}

const currentPageTitle = computed(() => pageTitles[route.path] || '管理后台')

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background: linear-gradient(180deg, #1a1a2e 0%, #2C2A2E 50%, #1a1a2e 100%);
  border-right: none;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, transparent, rgba(184, 134, 11, 0.3), transparent);
}

.sidebar-logo {
  padding: 28px 20px 20px;
  text-align: center;
  border-bottom: 1px solid rgba(232, 220, 200, 0.08);
}

.logo-seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 2px solid var(--color-zhu);
  color: var(--color-zhu);
  font-family: var(--font-display);
  font-size: 24px;
  margin-bottom: 12px;
  transform: rotate(-3deg);
}

.sidebar-logo h2 {
  font-family: var(--font-display);
  font-size: 20px;
  color: var(--text-on-dark);
  letter-spacing: 6px;
  margin: 0 0 4px 0;
}

.sidebar-logo .subtitle {
  font-size: 11px;
  color: var(--text-on-dark-muted);
  letter-spacing: 2px;
}

.sidebar .el-menu {
  border-right: none;
  background: transparent !important;
  padding: 16px 0;
  flex: 1;
}

.sidebar .el-menu-item {
  height: 50px;
  line-height: 50px;
  margin: 4px 12px;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 15px;
  letter-spacing: 1px;
  transition: all var(--transition-normal);
  position: relative;
}

.sidebar .el-menu-item:hover {
  background: rgba(194, 59, 34, 0.12) !important;
}

.sidebar .el-menu-item.is-active {
  background: linear-gradient(135deg, rgba(194, 59, 34, 0.2), rgba(184, 134, 11, 0.1)) !important;
  color: #F0D0A0 !important;
  font-weight: 500;
}

.sidebar .el-menu-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: linear-gradient(180deg, var(--color-zhu), var(--color-jin));
  border-radius: 0 2px 2px 0;
}

.sidebar .el-menu-item .el-icon {
  font-size: 18px;
  margin-right: 10px;
}

.sidebar-footer {
  padding: 16px 20px;
  text-align: center;
  border-top: 1px solid rgba(232, 220, 200, 0.08);
}

.sidebar-decoration {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-jin), transparent);
  margin: 0 auto 8px;
}

.footer-label {
  font-size: 11px;
  color: var(--text-on-dark-muted);
  letter-spacing: 2px;
}

.top-header {
  background: rgba(253, 250, 245, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-left .page-breadcrumb {
  font-family: var(--font-display);
  font-size: 16px;
  color: var(--text-primary);
  letter-spacing: 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.logout-btn {
  font-family: var(--font-body);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color var(--transition-fast);
}

.logout-btn:hover {
  color: var(--color-zhu);
}

.main-content {
  padding: 24px;
  background: var(--bg-page);
  min-height: calc(100vh - 56px);
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
