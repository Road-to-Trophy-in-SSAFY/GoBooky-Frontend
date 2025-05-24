<!-- 쓰레드 상세 보기 -->
<template>
  <div v-if="thread" class="thread-detail">
    <h2>{{ thread.title }}</h2>
    <p>책: {{ thread.book.title }}</p>
    <p>작성일: {{ formatDate(thread.created_at) }}</p>
    <p>독서일: {{ formatDate(thread.reading_date) }}</p>
    <div class="content">
      {{ thread.content }}
    </div>

    <div class="actions">
      <button @click="likeThread">
        <span v-if="isLiked">❤️</span>
        <span v-else>🤍</span>
        {{ likesCount }}
      </button>
      <button @click="showEditForm = !showEditForm">수정</button>
      <button @click="deleteThread">삭제</button>
    </div>

    <!-- 수정 폼 -->
    <div v-if="showEditForm" class="edit-form">
      <h3>쓰레드 수정</h3>
      <div>
        <label for="title">제목</label>
        <input id="title" v-model="editForm.title" type="text" />
      </div>
      <div>
        <label for="content">내용</label>
        <textarea id="content" v-model="editForm.content" rows="5"></textarea>
      </div>
      <div>
        <label for="reading_date">독서일</label>
        <input id="reading_date" v-model="editForm.reading_date" type="date" />
      </div>
      <div class="form-actions">
        <button @click="updateThread">저장</button>
        <button @click="showEditForm = false">취소</button>
      </div>
    </div>
  </div>
  <div v-else>
    <p>쓰레드를 불러오는 중입니다...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useThreadStore } from '@/stores/thread'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/services/axios'

const threadStore = useThreadStore()
const route = useRoute()
const router = useRouter()
const thread = ref(null)
const showEditForm = ref(false)
const isLiked = ref(false)
const likesCount = ref(0)
const editForm = ref({
  title: '',
  content: '',
  reading_date: '',
})

onMounted(async () => {
  // 컴포넌트 마운트 시 ID 유효성 검사
  const threadId = route.params.id
  if (!threadId || threadId === 'undefined') {
    console.error('유효하지 않은 쓰레드 ID:', threadId)
    router.push({ name: 'threads' }) // 유효하지 않은 ID인 경우 목록 페이지로 리다이렉트
    return
  }

  await loadThread()
  // 컴포넌트 마운트 후에 좋아요 상태와 개수를 명시적으로 동기화
  if (thread.value) {
    isLiked.value = thread.value.liked
    likesCount.value = thread.value.likes_count
  }
})

const loadThread = async () => {
  try {
    // 캐시 무시하고 항상 최신 데이터 가져오기 위한 옵션 추가
    const threadId = route.params.id

    // ID가 유효한지 확인 (undefined, null, '', NaN 등 체크)
    if (!threadId || threadId === 'undefined') {
      console.error('유효하지 않은 쓰레드 ID:', threadId)
      router.push({ name: 'threads' }) // 유효하지 않은 ID인 경우 목록 페이지로 리다이렉트
      return
    }

    // 강제로 최신 데이터 요청 - CORS 문제 해결을 위해 일반 요청 사용
    // 타임스탬프를 URL에 추가하여 캐시를 우회
    const timestamp = new Date().getTime()
    const response = await axios.get(`/books/threads/${threadId}/?_t=${timestamp}`)

    // 스토어 업데이트 및 직접 최신 데이터 설정
    await threadStore.getThreadDetail(threadId)
    thread.value = response.data

    // 스토어 데이터도 강제로 최신 데이터로 갱신 (더블 체크)
    threadStore.threadDetail = response.data

    if (thread.value) {
      editForm.value = {
        title: thread.value.title,
        content: thread.value.content,
        reading_date: thread.value.reading_date,
      }
      // 좋아요 상태 동기화
      isLiked.value = thread.value.liked
      likesCount.value = thread.value.likes_count
    }
  } catch (error) {
    console.error('쓰레드 데이터 로드 실패:', error)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const updateThread = async () => {
  try {
    await threadStore.updateThread(route.params.id, editForm.value)
    await loadThread()
    showEditForm.value = false
  } catch (error) {
    console.error('쓰레드 수정 실패:', error)
  }
}

const deleteThread = async () => {
  if (confirm('정말 삭제하시겠습니까?')) {
    try {
      await threadStore.deleteThread(route.params.id)
      router.push({ name: 'threads' })
    } catch (error) {
      console.error('쓰레드 삭제 실패:', error)
    }
  }
}

const likeThread = async () => {
  try {
    // 좋아요 상태 직접 토글 (UI 즉시 반응)
    isLiked.value = !isLiked.value
    likesCount.value = isLiked.value ? likesCount.value + 1 : likesCount.value - 1

    // 서버에 요청 보내기
    const response = await threadStore.likeThread(route.params.id)

    // 서버 응답으로 UI 상태 정확하게 맞추기
    isLiked.value = response.liked
    likesCount.value = response.likes_count

    // 일정 시간(1초) 후에 데이터 다시 로드 (너무 빨리 요청하면 캐시 문제 발생할 수 있음)
    setTimeout(() => {
      loadThread()
    }, 1000)
  } catch (error) {
    console.error('좋아요 처리 실패:', error)
    // 에러 발생시 원래 상태로 복원 (타임아웃으로 지연 적용)
    setTimeout(() => {
      loadThread()
    }, 500)
  }
}
</script>

<style scoped>
.thread-detail {
  padding: 20px;
}

.content {
  margin: 20px 0;
  white-space: pre-line;
}

.actions {
  margin-top: 20px;
}

.actions button {
  margin-right: 10px;
}

.edit-form {
  margin-top: 20px;
  border: 1px solid #ccc;
  padding: 15px;
}

.edit-form div {
  margin-bottom: 10px;
}

.edit-form label {
  display: block;
  margin-bottom: 5px;
}

.edit-form input,
.edit-form textarea {
  width: 100%;
}

.form-actions {
  margin-top: 15px;
}
</style>
