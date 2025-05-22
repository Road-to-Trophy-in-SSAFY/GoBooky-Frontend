import { createRouter, createWebHistory } from 'vue-router'
import EmailVerificationView from '@/views/auth/EmailVerificationView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import MainView from '@/views/MainView.vue'
import SignupView from '@/views/auth/SignupView.vue'

const routes = [
  {
    path: '/',
    name: 'Main',
    component: MainView,
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupView,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/verify-email/:uuid',
    name: 'EmailVerification',
    component: EmailVerificationView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
