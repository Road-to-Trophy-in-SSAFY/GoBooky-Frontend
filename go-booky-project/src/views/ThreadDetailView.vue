<!-- 쓰레드 상세 보기 -->
<template>
  <div v-if="thread" class="thread-detail">
    <h2>{{ thread.title }}</h2>

    <!-- 쓰레드 이미지 표시 -->
    <div class="thread-image">
      <img :src="threadImage" alt="쓰레드 이미지" class="cover-image" />
    </div>

    <p>책: {{ thread.book.title }}</p>
    <p>작성일: {{ formatDate(thread.created_at) }}</p>
    <p>독서일: {{ formatDate(thread.reading_date) }}</p>
    <div class="content" v-html="thread.content"></div>

    <div class="actions">
      <button @click="likeThread">
        <span v-if="isLiked">❤️</span>
        <span v-else>🤍</span>
        {{ likesCount }}
      </button>
      <button @click="showEditModal = true" class="edit-btn">수정</button>
      <button @click="showDeleteModal = true" class="delete-btn">삭제</button>
    </div>

    <!-- 수정 모달 -->
    <Modal
      :model-value="showEditModal"
      @update:model-value="showEditModal = $event"
      title="쓰레드 수정"
      :close-on-overlay-click="false"
    >
      <div class="edit-form">
        <div class="form-group">
          <label for="title">제목</label>
          <input id="title" v-model="editForm.title" type="text" required />
        </div>
        <div class="form-group">
          <label for="content">내용</label>
          <QuillEditor
            v-model:content="editForm.content"
            contentType="html"
            theme="snow"
            toolbar="essential"
            :options="editorOptions"
            class="editor-container"
          />
        </div>
        <div class="form-group">
          <label for="reading_date">독서일</label>
          <input id="reading_date" v-model="editForm.reading_date" type="date" required />
        </div>
      </div>
      <template #footer>
        <div class="modal-actions">
          <button @click="showEditModal = false" :disabled="isLoading">취소</button>
          <button @click="updateThread" :disabled="isLoading" class="save-btn">
            {{ isLoading ? '저장 중...' : '저장' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- 삭제 확인 모달 -->
    <ConfirmModal
      :model-value="showDeleteModal"
      @update:model-value="showDeleteModal = $event"
      title="쓰레드 삭제"
      message="정말 이 쓰레드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      confirm-text="삭제"
      @confirm="confirmDelete"
    />
  </div>
  <div v-else>
    <p>쓰레드를 불러오는 중입니다...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useThreadStore } from '@/stores/thread'
import { useRoute, useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import axios from '@/services/axios'

const threadStore = useThreadStore()
const route = useRoute()
const router = useRouter()
const thread = ref(null)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isLiked = ref(false)
const likesCount = ref(0)
const isLoading = ref(false)
const editForm = ref({
  title: '',
  content: '',
  reading_date: '',
})

// 기본 이미지 URL
const defaultImageUrl = '/default_thread_image.jpg'
const API_URL = 'http://127.0.0.1:8000'

// 쓰레드 이미지 계산
const threadImage = computed(() => {
  if (thread.value && thread.value.cover_img_url) {
    return thread.value.cover_img_url
  }
  if (thread.value && thread.value.cover_img) {
    // 절대 경로인지 확인
    if (thread.value.cover_img.startsWith('http')) {
      return thread.value.cover_img
    }
    return `${API_URL}/media/${thread.value.cover_img}`
  }
  // 기본 이미지 사용
  return '/logo.png'
})

const editorOptions = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, false] }],
      ['link'],
      ['clean'],
    ],
  },
  placeholder: '내용을 입력하세요',
}

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
    isLoading.value = true
    await threadStore.updateThread(route.params.id, editForm.value)
    await loadThread()
    isLoading.value = false
    showEditModal.value = false
  } catch (error) {
    isLoading.value = false
    console.error('쓰레드 수정 실패:', error)
    alert('쓰레드 수정에 실패했습니다.')
  }
}

const confirmDelete = async () => {
  try {
    await threadStore.deleteThread(route.params.id)
    router.push({ name: 'threads' })
  } catch (error) {
    console.error('쓰레드 삭제 실패:', error)
    alert('쓰레드 삭제에 실패했습니다.')
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
  max-width: 800px;
  margin: 0 auto;
}

.thread-image {
  margin: 20px 0;
  text-align: center;
}

.cover-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.content {
  margin: 20px 0;
  white-space: pre-line;
  line-height: 1.6;
}

.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.like-btn {
  background-color: #3498db;
  color: white;
}

.edit-btn {
  background-color: #f39c12;
  color: white;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

/* 수정 폼 스타일 */
.edit-form {
  padding: 10px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button:first-child {
  background-color: #f1f1f1;
}

.save-btn {
  background-color: #4caf50;
  color: white;
}

.modal-actions button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Quill 에디터 스타일 */
.editor-container {
  height: 300px;
  margin-bottom: 20px;
}

/* Quill 에디터 안의 내용 영역 스타일 */
:deep(.ql-editor) {
  min-height: 200px;
  font-size: 14px;
  line-height: 1.6;
}
</style>
