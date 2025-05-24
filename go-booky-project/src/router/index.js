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
    {
      path: '/profile/:username',
      name: 'Profile',
      component: () => import('@/views/profile/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  // 인증이 필요한 페이지인 경우
  if (to.meta.requiresAuth) {
    // 인증 상태 확인
    const isAuthenticated = await auth.checkAuth()
    if (!isAuthenticated) {
      alert('로그인이 필요한 서비스입니다.')
      next({ name: 'Login' })
      return
    }
  }
  next()
})

export default router
