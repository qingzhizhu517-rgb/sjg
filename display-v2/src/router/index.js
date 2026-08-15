import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/map' },
  { path: '/map', name: 'Map', component: () => import('../views/MapView.vue') },
  { path: '/poets', name: 'Poets', component: () => import('../views/PoetList.vue') },
  { path: '/poets/all', redirect: '/poets?view=all' },
  { path: '/poets/:id', name: 'PoetDetail', component: () => import('../views/PoetDetail.vue') },
  { path: '/poems/:id', name: 'PoemDetail', component: () => import('../views/PoemDetail.vue') },
  { path: '/spots/:id', name: 'SpotDetail', component: () => import('../views/SpotDetail.vue') },
  { path: '/timeline', name: 'Timeline', component: () => import('../views/Timeline.vue') },
  { path: '/festivals', name: 'FestivalList', component: () => import('../views/FestivalList.vue') },
  { path: '/festivals/:id', name: 'CulturalDetailFestival', component: () => import('../views/CulturalDetail.vue') },
  { path: '/crafts', name: 'CraftWorkshop', component: () => import('../views/CraftWorkshop.vue') },
  { path: '/crafts/:id', name: 'CulturalDetailCraft', component: () => import('../views/CulturalDetail.vue') },
  { path: '/regions/:region', name: 'RegionSpots', component: () => import('../views/RegionSpots.vue') },
  { path: '/cities/:region', name: 'CityCulture', component: () => import('../views/CityCulture.vue') },
  { path: '/compose', name: 'PoemComposer', component: () => import('../views/PoemComposerView.vue') },
  { path: '/literature', name: 'LiteratureList', component: () => import('../views/LiteratureList.vue') },
  { path: '/literature/:id', name: 'CulturalDetailLiterature', component: () => import('../views/CulturalDetail.vue') },
  { path: '/food-opera', name: 'FoodOperaList', component: () => import('../views/FoodOperaList.vue') },
  { path: '/food-opera/:id', name: 'CulturalDetailFoodOpera', component: () => import('../views/CulturalDetail.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

export default router
