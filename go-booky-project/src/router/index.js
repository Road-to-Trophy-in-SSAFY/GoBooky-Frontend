import { createRouter, createWebHistory } from 'vue-router'
import EmailVerificationView from '@/views/auth/EmailVerificationView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import MainView from '@/views/MainView.vue'
import SignupView from '@/views/auth/SignupView.vue'
import MainView from '@/views/MainView.vue'
import LandingView from '@/views/LandingView.vue'
import BookListView from '@/views/BookListView.vue'
import BookDetailView from '@/views/BookDetailView.vue'
import ThreadListView from '@/views/ThreadListView.vue'
import ThreadDetailView from '@/views/ThreadDetailView.vue'
import ThreadWriteView from '@/views/ThreadWriteView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainView,
      children: [
        {
          path: '',
          name: 'home',
          component: LandingView,
        },
        {
          path: '/books',
          name: 'books',
          component: BookListView,
        },
        {
          path: '/books/:id',
          name: 'book-detail',
          component: BookDetailView,
        },
        {
          path: '/threads',
          name: 'threads',
          component: ThreadListView,
        },
        {
          path: '/threads/write',
          name: 'thread-write',
          component: ThreadWriteView,
        },
        {
          path: '/threads/:id',
          name: 'thread-detail',
          component: ThreadDetailView,
        },
      ],
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
  ],
})

export default router
