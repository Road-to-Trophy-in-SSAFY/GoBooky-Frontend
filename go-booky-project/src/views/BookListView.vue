<template>
  <div>
    <p>book-list-view</p>
    <BookList :books="bookStore.books" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBookStore } from '@/stores/books.js'
import BookList from '@/components/BookList.vue'

const route = useRoute()
const bookStore = useBookStore()

onMounted(() => {
  bookStore.getBooks()
})
</script>

<style scoped>
/* */
</style>
