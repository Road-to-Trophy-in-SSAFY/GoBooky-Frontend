import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Main',
    component: () => import('@/views/MainView.vue'),
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('@/views/auth/SignupView.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
  },
  {
    path: '/verify-email/:uuid',
    name: 'EmailVerification',
    component: () => import('@/views/auth/EmailVerificationView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
