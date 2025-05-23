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
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? '작성 중...' : '작성하기' }}
        </button>
        <button type="button" @click="goBack" :disabled="isLoading">취소</button>
      </div>
    </form>

    <!-- 로딩 오버레이 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <img src="/logo.png" alt="로딩 중" class="loading-logo" />
        <p>쓰레드 이미지를 생성하는 중입니다...</p>
        <div class="loading-spinner"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThreadStore } from '@/stores/thread'
import { useBookStore } from '@/stores/books'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const threadStore = useThreadStore()
const bookStore = useBookStore()
const authStore = useAuthStore()

const book = ref(null)
const today = new Date().toISOString().split('T')[0]
const isLoading = ref(false)
const threadForm = ref({
  title: '',
  content: '',
  reading_date: today,
  book: null,
})

onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.access) {
    alert('로그인이 필요한 서비스입니다.')
    router.push({ name: 'Login' })
    return
  }
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
    isLoading.value = true
    await threadStore.createThread(threadForm.value)
    // 쓰레드 목록을 새로고침하기 위해 getThreads 호출
    await threadStore.getThreads()
    isLoading.value = false
    router.push({ name: 'threads' })
  } catch (error) {
    isLoading.value = false
    if (error.response?.status === 401) {
      alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
      authStore.logout()
      router.push({ name: 'Login' })
    } else {
      console.error('쓰레드 작성 실패:', error)
      alert('쓰레드 작성에 실패했습니다.')
    }
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.thread-write {
  padding: 20px;
  position: relative;
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
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-content {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.loading-logo {
  width: 100px;
  height: auto;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

.loading-spinner {
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4caf50;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin: 20px auto 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
