import { createRouter, createWebHistory } from 'vue-router'

// 인증 관련 라우터
import authRoutes from './auth/authRoutes'

// 나중에 다른 라우트들도 추가될 수 있음
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: false }
  },
  ...authRoutes, // 인증 관련 라우트 추가
  {
    // 찾을 수 없는 페이지는 404 페이지로 리다이렉트
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 라우터 가드 설정
router.beforeEach((to, from, next) => {
  // 로컬 스토리지에서 토큰 확인
  const token = localStorage.getItem('token')

  // 인증이 필요한 페이지인지 확인
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 인증이 필요한데 로그인이 안 되어 있으면 로그인 페이지로
    if (!token) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  }
  // 인증된 사용자가 로그인/회원가입 페이지 방문 시 홈으로 리다이렉트
  else if (token && (to.path === '/login' || to.path === '/register')) {
    next({ path: '/' })
  }
  // 다른 경우는 그냥 진행
  else {
    next()
  }
})

export default router
