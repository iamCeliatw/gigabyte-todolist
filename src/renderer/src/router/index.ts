import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@renderer/views/Home.vue')
  },
  {
    path: '/ai',
    name: 'AI',
    component: () => import('@renderer/views/AI.vue')
  },
  {
    path: '/Show',
    name: 'Show',
    component: () => import('@renderer/views/Show.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
