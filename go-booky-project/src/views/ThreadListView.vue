<!-- 쓰레드 전체 목록 조회 view -->
<template>
  <div>
    <div class="header-actions">
    </div>

    <!-- 카테고리 필터 -->
    <div class="category-filter">
      <button :class="{ active: selectedCategory === null }" @click="selectCategory(null)">
        전체
      </button>
      <button
        v-for="category in categories"
        :key="category.pk"
        :class="{ active: selectedCategory === category.fields.name }"
        @click="selectCategory(category.fields.name)"
      >
        {{ category.fields.name }}
      </button>
    </div>

    <!-- 쓰레드 목록 -->
    <div v-if="filteredThreads.length > 0" class="thread-list">
      <div
        v-for="thread in filteredThreads"
        :key="thread.id"
        class="thread-item"
        :data-id="thread.id"
      >
        <div class="thread-image">
          <img :src="getThreadImage(thread)" alt="쓰레드 이미지" class="cover-thumbnail" />
        </div>
        <div class="thread-info">
          <h3>{{ thread.title }}</h3>
          <p>책: {{ thread.book.title }}</p>
          <p>카테고리: {{ thread.book.category_name }}</p>
          <div class="thread-actions">
          <button @click="goToThreadDetail(thread.id)" class="detail-btn">자세히 보기</button>
        </div>
          <button @click.stop="toggleLike(thread)" class="like-btn">
            <span v-if="thread.liked">❤️</span>
            <span v-else>🤍</span>
            {{ thread.likes_count }}
          </button>
        </div>
      </div>
    </div>
    <div v-else>
      <p>쓰레드가 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useThreadStore } from '@/stores/thread'
import { useRouter } from 'vue-router'
import { categoriesData } from '@/stores/categoriesData.js'

const threadStore = useThreadStore()
const router = useRouter()
const threads = ref([])
const categories = categoriesData
const selectedCategory = ref(null)
const API_URL = 'http://127.0.0.1:8000'
const defaultImageUrl = '/default_thread_image.jpg'

onMounted(async () => {
  await loadThreads()
})

const loadThreads = async () => {
  await threadStore.getThreads()
  threads.value = threadStore.threads
}

const getThreadImage = (thread) => {
  if (thread.cover_img_url) {
    return thread.cover_img_url
  }
  if (thread.cover_img) {
    // 절대 경로인지 확인
    if (thread.cover_img.startsWith('http')) {
      return thread.cover_img
    }
    return `${API_URL}/media/${thread.cover_img}`
  }
  // 기본 이미지 사용
  return '/logo.png'
}

const selectCategory = (categoryName) => {
  selectedCategory.value = categoryName
}

const filteredThreads = computed(() => {
  if (!selectedCategory.value) return threads.value
  return threads.value.filter((thread) => thread.book.category_name === selectedCategory.value)
})

const goToThreadDetail = (threadId) => {
  router.push({ name: 'thread-detail', params: { id: threadId } })
}

const toggleLike = async (thread) => {
  try {
    await threadStore.likeThread(thread.id)
    // 스토어의 최신 데이터로 로컬 상태 업데이트
    threads.value = threadStore.threads
  } catch {
    alert('로그인 후 이용 가능합니다.')
  }
}
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.thread-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.thread-item {
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.thread-item:hover {
  transform: translateY(-5px);
}

.thread-item.highlight {
  animation: highlight-pulse 3s;
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.8);
}

@keyframes highlight-pulse {
  0% {
    box-shadow: 0 0 15px rgba(76, 175, 80, 0.8);
  }
  70% {
    box-shadow: 0 0 15px rgba(76, 175, 80, 0.8);
  }
  100% {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

.thread-image {
  height: 180px;
  overflow: hidden;
}

.cover-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thread-info {
  padding: 15px;
}

.thread-info h3 {
  margin-top: 0;
  font-size: 18px;
}

.category-filter {
  margin-bottom: 20px;
}

.category-filter button {
  margin-right: 8px;
  padding: 6px 14px;
  border: 1px solid #aaa;
  background: #f7f7f7;
  cursor: pointer;
  border-radius: 4px;
}

.category-filter button.active {
  background: #4caf50;
  color: #fff;
  border-color: #4caf50;
}
.thread-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.like-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.like-btn span {
  font-size: 20px;
}

.thread-actions {
  margin-bottom: 15px;
  text-align: right;
}

.refresh-btn {
  padding: 6px 14px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.detail-btn {
  padding: 6px 12px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}
</style>
