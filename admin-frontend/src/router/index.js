import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    redirect: '/poets',
    // 后端所有管理接口都要求管理员，前端子路由统一继承这一约束。
    meta: { requireAdmin: true },
    children: [
      { path: 'poets', name: 'PoetList', component: () => import('../views/PoetList.vue') },
      { path: 'spots', name: 'SpotList', component: () => import('../views/SpotList.vue') },
      { path: 'poems', name: 'PoemList', component: () => import('../views/PoemList.vue') },
      { path: 'events', name: 'EventList', component: () => import('../views/EventList.vue') },
      { path: 'cultural', name: 'CulturalList', component: () => import('../views/CulturalList.vue') },
      { path: 'content-governance', name: 'ContentGovernance', component: () => import('../views/ContentGovernance.vue') },
      { path: 'learning-tasks', name: 'LearningTaskList', component: () => import('../views/LearningTaskList.vue') },
      { path: 'ai-metrics', name: 'AiMetrics', component: () => import('../views/AiMetrics.vue') },
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
    // 避免回到带默认 redirect 的根路由造成循环，同时保留当前会话。
    next({ path: '/login', query: { reason: 'forbidden' } })
  } else {
    next()
  }
})

export default router
