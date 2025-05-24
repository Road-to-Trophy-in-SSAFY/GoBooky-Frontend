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
import { onMounted } from 'vue'
import { useBookStore } from '@/stores/books.js'
import BookList from '@/components/BookList.vue'
import Category from '@/components/CategoryList.vue'

const bookStore = useBookStore()

onMounted(() => {
  bookStore.getBooks()
})
</script>

<style scoped>
/* */
</style>
