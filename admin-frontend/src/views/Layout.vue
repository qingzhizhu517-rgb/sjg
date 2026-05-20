<template>
  <el-container style="height: 100vh">
    <el-aside width="200px" style="background: #001529">
      <div style="color: #fff; text-align: center; padding: 20px; font-size: 18px; font-weight: bold;">
        SJG 管理后台
      </div>
      <el-menu
        :default-active="route.path"
        router
        background-color="#001529"
        text-color="#ffffffa6"
        active-text-color="#fff"
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
    </el-aside>
    <el-container>
      <el-header style="display: flex; align-items: center; justify-content: flex-end; border-bottom: 1px solid #eee;">
        <span style="margin-right: 16px;">{{ username }}</span>
        <el-button type="text" @click="logout">退出登录</el-button>
      </el-header>
      <el-main>
        <router-view />
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

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>
