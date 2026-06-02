import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/salary'
  },
  {
    path: '/salary',
    name: 'SalaryDashboard',
    component: () => import('@/views/SalaryDashboard.vue')
  },
  {
    path: '/management',
    name: 'ManagementView',
    component: () => import('@/views/ManagementView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
