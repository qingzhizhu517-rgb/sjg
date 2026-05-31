import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/map' },
  { path: '/map', name: 'Map', component: () => import('../views/MapView.vue') },
  { path: '/poets', name: 'Poets', component: () => import('../views/PoetList.vue') },
  { path: '/poets/:id', name: 'PoetDetail', component: () => import('../views/PoetDetail.vue') },
  { path: '/poems/:id', name: 'PoemDetail', component: () => import('../views/PoemDetail.vue') },
  { path: '/spots/:id', name: 'SpotDetail', component: () => import('../views/SpotDetail.vue') },
  { path: '/timeline', name: 'Timeline', component: () => import('../views/Timeline.vue') },
  { path: '/regions/:region', name: 'RegionSpots', component: () => import('../views/RegionSpots.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
