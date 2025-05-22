<template>
  <div v-if="book">
    <h4>book-detail</h4>
    <p>{{ book.title }}</p>
    <p>{{ book.author }}</p>
    <p>{{ book.publisher }}</p>
    <p>{{ book.pub_date }}</p>
    <img :src="book.cover" alt="Book Cover" />
    <p>{{ book.description }}</p>
    <p>ISBN: {{ book.isbn }}</p>
  </div>
  <div v-else>
    <p>책 정보를 불러오는 중입니다...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBookStore } from '@/stores/books.js'
import { useRoute } from 'vue-router'

const bookStore = useBookStore()
const route = useRoute()
const book = ref(null)

onMounted(async () => {
  book.value = await bookStore.getBookDetail(route.params.id)
})
</script>

<style scoped>
/* */
</style>
