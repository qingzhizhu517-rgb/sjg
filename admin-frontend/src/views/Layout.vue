<template>
  <el-container class="layout-container" @keydown.esc="closeSidebar">
    <el-aside
      width="220px"
      class="sidebar"
      :class="{ 'is-mobile-open': mobileMenuOpen }"
      aria-label="主导航"
    >
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
        <el-menu-item index="/cultural">
          <el-icon><Collection /></el-icon>
          <span>文化条目</span>
        </el-menu-item>
        <el-menu-item index="/content-governance">
          <el-icon><DocumentChecked /></el-icon>
          <span>来源与审核</span>
        </el-menu-item>
        <el-menu-item index="/learning-tasks">
          <el-icon><Collection /></el-icon>
          <span>探究任务</span>
        </el-menu-item>
        <el-menu-item index="/ai-metrics">
          <el-icon><Collection /></el-icon>
          <span>AI 指标</span>
        </el-menu-item>
        <!-- 底部分隔区 -->
        <div class="sidebar-divider"></div>
        <el-menu-item v-if="isAdmin" index="/users">
          <el-icon><UserFilled /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <div class="sidebar-decoration"></div>
        <span class="footer-label">黄河流域 · 山东段</span>
      </div>
    </el-aside>
    <button
      v-if="mobileMenuOpen"
      type="button"
      class="sidebar-backdrop"
      aria-label="关闭导航"
      @click="closeSidebar"
    ></button>
    <el-container class="content-container">
      <el-header class="top-header" height="56px">
        <div class="header-left">
          <el-button
            class="mobile-menu-toggle"
            text
            aria-label="打开导航"
            :aria-expanded="mobileMenuOpen"
            @click="toggleSidebar"
          >
            <el-icon><Menu /></el-icon>
          </el-button>
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
import { UserFilled, Collection } from '@element-plus/icons-vue'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const mobileMenuOpen = ref(false)
const username = computed(() => localStorage.getItem('username') || '管理员')
const isAdmin = computed(() => localStorage.getItem('role') === 'admin')

const pageTitles = {
  '/poets': '诗人管理',
  '/spots': '景点管理',
  '/poems': '诗词管理',
  '/events': '事件管理',
  '/cultural': '文化条目管理',
  '/content-governance': '内容来源与审核',
  '/learning-tasks': '诗词探究任务',
  '/ai-metrics': 'AI 运行指标',
  '/users': '用户管理',
}

const currentPageTitle = computed(() => pageTitles[route.path] || '管理后台')

const toggleSidebar = () => { mobileMenuOpen.value = !mobileMenuOpen.value }
const closeSidebar = () => { mobileMenuOpen.value = false }
watch(() => route.path, closeSidebar)

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('role')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  min-width: 0;
  position: relative;
}

.content-container {
  min-width: 0;
}

.sidebar {
  background: linear-gradient(180deg, #1a1a2e 0%, #2C2A2E 50%, #1a1a2e 100%);
  border-right: none;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
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

.header-left {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-menu-toggle,
.sidebar-backdrop {
  display: none;
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
  height: calc(100vh - 56px);
  overflow: auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
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

.sidebar-divider {
  height: 1px;
  margin: 8px 20px;
  background: linear-gradient(90deg, transparent, rgba(232, 220, 200, 0.15), transparent);
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 30;
    top: 0;
    bottom: 0;
    left: 0;
    width: min(82vw, 280px) !important;
    transform: translateX(-105%);
    transition: transform var(--transition-normal);
    box-shadow: var(--shadow-heavy);
  }

  .sidebar.is-mobile-open {
    transform: translateX(0);
  }

  .sidebar .el-menu-item span {
    display: inline;
  }

  .sidebar-backdrop {
    display: block;
    position: fixed;
    z-index: 20;
    inset: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    background: rgba(44, 42, 46, 0.42);
  }

  .mobile-menu-toggle {
    display: inline-flex;
    flex: 0 0 auto;
    padding: 8px;
    color: var(--color-zhu);
  }

  .top-header {
    padding: 0 12px;
  }

  .header-right {
    gap: 8px;
  }

  .username {
    max-width: 34vw;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .main-content {
    padding: 14px;
    overflow: auto;
  }
}
</style>
