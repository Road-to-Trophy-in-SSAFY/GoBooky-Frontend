import { createRouter, createWebHistory } from 'vue-router'
import MainView from '@/views/MainView.vue'
import LandingView from '@/views/LandingView.vue'
import BookListView from '@/views/BookListView.vue'
import BookDetailView from '@/views/BookDetailView.vue'

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
      ],
    },
  ],
})

export default router
