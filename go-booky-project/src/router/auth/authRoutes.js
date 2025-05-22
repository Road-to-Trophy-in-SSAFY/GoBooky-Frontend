// 인증 관련 라우터
const authRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/auth/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/password-reset',
    name: 'PasswordReset',
    component: () => import('@/views/auth/PasswordResetView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/token-test',
    name: 'TokenTest',
    component: () => import('@/views/auth/TokenTestView.vue'),
    meta: { requiresAuth: true },
  },
]

export default authRoutes
