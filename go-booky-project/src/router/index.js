import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/MainView.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/LandingView.vue'),
        },
        {
          path: '/books',
          name: 'books',
          component: () => import('@/views/BookListView.vue'),
        },
        {
          path: '/books/:id',
          name: 'book-detail',
          component: () => import('@/views/BookDetailView.vue'),
        },
        {
          path: '/threads',
          name: 'threads',
          component: () => import('@/views/ThreadListView.vue'),
        },
        {
          path: '/threads/write',
          name: 'thread-write',
          component: () => import('@/views/ThreadWriteView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/threads/:id',
          name: 'thread-detail',
          component: () => import('@/views/ThreadDetailView.vue'),
        },
      ],
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
  ],
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    alert('로그인이 필요한 서비스입니다.')
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
