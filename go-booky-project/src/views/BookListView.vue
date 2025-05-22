<template>
  <div>
    <div class="sidebar">
      <p>카테고리</p>
      <Category />
    </div>
    <div class="content">
      <p>book-list-view</p>
      <BookList :books="bookStore.filteredBooks" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBookStore } from '@/stores/books.js'
import BookList from '@/components/BookList.vue'
import Category from '@/components/Category.vue'

const route = useRoute()
const bookStore = useBookStore()

onMounted(() => {
  bookStore.getBooks()
})
</script>

<style scoped>
/* */
</style>
