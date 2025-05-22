<template>
  <div class="book-detail-container">
    <div class="book-header">
      <!-- 쓰레드 작성 버튼 -->
      <button v-if="book" @click="goToThreadWrite" class="thread-write-btn">쓰레드 작성</button>
    </div>
    <div v-if="book" class="book-content">
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBookStore } from '@/stores/books.js'
import { useRoute, useRouter } from 'vue-router'

const bookStore = useBookStore()
const route = useRoute()
const router = useRouter()
const book = ref(null)

onMounted(async () => {
  book.value = await bookStore.getBookDetail(route.params.id)
})

const goToThreadWrite = () => {
  router.push({
    name: 'thread-write',
    query: { bookId: route.params.id },
  })
}
</script>

<style scoped>
.book-detail-container {
  padding: 20px;
}

.book-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.thread-write-btn {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.book-content {
  margin-top: 20px;
}
</style>
