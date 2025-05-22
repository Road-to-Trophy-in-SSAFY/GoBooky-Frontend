<!-- 쓰레드 작성 view -->
<template>
  <div class="thread-write">
    <h2>쓰레드 작성</h2>

    <div v-if="book" class="book-info">
      <h3>책 정보</h3>
      <p>제목: {{ book.title }}</p>
      <p>저자: {{ book.author }}</p>
    </div>

    <form @submit.prevent="submitThread">
      <div class="form-group">
        <label for="title">제목</label>
        <input
          id="title"
          v-model="threadForm.title"
          type="text"
          required
          placeholder="제목을 입력하세요"
        />
      </div>

      <div class="form-group">
        <label for="content">내용</label>
        <textarea
          id="content"
          v-model="threadForm.content"
          rows="10"
          required
          placeholder="내용을 입력하세요"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="reading_date">독서일</label>
        <input
          id="reading_date"
          v-model="threadForm.reading_date"
          type="date"
          required
          :max="today"
        />
      </div>

      <div class="form-actions">
        <button type="submit">작성하기</button>
        <button type="button" @click="goBack">취소</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThreadStore } from '@/stores/thread'
import { useBookStore } from '@/stores/books'

const route = useRoute()
const router = useRouter()
const threadStore = useThreadStore()
const bookStore = useBookStore()

const book = ref(null)
const today = new Date().toISOString().split('T')[0]
const threadForm = ref({
  title: '',
  content: '',
  reading_date: today,
  book: null,
})

onMounted(async () => {
  // URL에서 bookId를 가져옴
  const bookId = route.query.bookId
  if (bookId) {
    book.value = await bookStore.getBookDetail(bookId)
    threadForm.value.book = bookId
  } else {
    alert('책 정보가 없습니다.')
    goBack()
  }
})

const submitThread = async () => {
  try {
    await threadStore.createThread(threadForm.value)
    router.push({ name: 'threads' })
  } catch (error) {
    console.error('쓰레드 작성 실패:', error)
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.thread-write {
  padding: 20px;
}

.book-info {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
}

.form-actions {
  margin-top: 20px;
}

.form-actions button {
  margin-right: 10px;
}
</style>
