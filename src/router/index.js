import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: () => import('@/views/HomePage.vue')
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
  },
  {
    path: '/resume',
    name: 'ResumeView',
    component: () => import('@/views/ResumeView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
