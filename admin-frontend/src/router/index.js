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
