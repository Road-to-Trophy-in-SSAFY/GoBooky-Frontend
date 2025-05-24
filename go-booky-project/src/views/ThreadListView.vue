<!-- 쓰레드 전체 목록 조회 view -->
<template>
  <div>
    <h2>쓰레드 목록</h2>
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
    <div v-if="filteredThreads.length > 0">
      <div v-for="thread in filteredThreads" :key="thread.id" class="thread-item">
        <h3>{{ thread.title }}</h3>
        <p>책: {{ thread.book.title }}</p>
        <p>카테고리: {{ thread.book.category_name }}</p>
        <div class="thread-actions">
          <button @click="goToThreadDetail(thread.id)">자세히 보기</button>
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

onMounted(async () => {
  await threadStore.getThreads()
  threads.value = threadStore.threads
})

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
.thread-item {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
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
</style>
