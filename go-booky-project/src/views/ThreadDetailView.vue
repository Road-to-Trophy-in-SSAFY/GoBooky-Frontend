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
        {{ isLiked ? '좋아요 취소' : '좋아요' }} ({{ likesCount }})
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
import { ref, onMounted, computed } from 'vue'
import { useThreadStore } from '@/stores/thread'
import { useRoute, useRouter } from 'vue-router'

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
  await loadThread()
})

const loadThread = async () => {
  await threadStore.getThreadDetail(route.params.id)
  thread.value = threadStore.threadDetail

  if (thread.value) {
    editForm.value = {
      title: thread.value.title,
      content: thread.value.content,
      reading_date: thread.value.reading_date,
    }
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
    const response = await threadStore.likeThread(route.params.id)
    isLiked.value = response.liked
    likesCount.value = response.likes_count
  } catch (error) {
    console.error('좋아요 처리 실패:', error)
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
