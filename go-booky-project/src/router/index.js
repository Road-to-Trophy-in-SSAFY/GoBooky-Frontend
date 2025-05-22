import { createRouter, createWebHistory } from 'vue-router'
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
  ],
})

export default router
