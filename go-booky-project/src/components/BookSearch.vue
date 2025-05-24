<template>
  <div class="search-container">
    <form @submit.prevent="handleSearch" class="search-form">
      <div class="search-input">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="도서 제목, 저자, 출판사 검색..."
          class="search-input-field"
        />
        <button v-if="searchQuery" type="button" @click="clearSearch" class="clear-button">
          ✕
        </button>
      </div>
      <button type="submit" class="search-button">검색</button>
    </form>
    <div v-if="showResetButton" class="search-info">
      <div class="search-status">
        <span class="search-query">"{{ bookStore.currentSearchQuery }}"</span> 검색 결과
        <span v-if="resultCount > 0" class="result-count">({{ resultCount }}건)</span>
      </div>
      <button @click="resetSearch" class="reset-button">
        <span class="reset-icon">↩</span> 전체 도서 목록으로
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useBookStore } from '@/stores/books.js'
import { useRouter, useRoute } from 'vue-router'

const bookStore = useBookStore()
const router = useRouter()
const route = useRoute()
const searchQuery = ref('')

// 검색 결과가 있는지 확인
const showResetButton = computed(() => bookStore.hasSearchResults)

// 검색 결과 개수
const resultCount = computed(() => bookStore.filteredBooks.length)

// URL 쿼리 파라미터에서 검색어 가져오기
onMounted(() => {
  const queryParam = route.query.q
  if (queryParam) {
    searchQuery.value = queryParam
    bookStore.searchBooks(queryParam)
  }
})

// URL 변경 시 검색어 업데이트
watch(
  () => route.query.q,
  (newQuery) => {
    if (newQuery !== searchQuery.value) {
      searchQuery.value = newQuery || ''
      if (newQuery) {
        bookStore.searchBooks(newQuery)
      } else {
        bookStore.getBooks()
      }
    }
  },
)

// 검색 함수 - 제출 시에만 실행
const handleSearch = () => {
  const query = searchQuery.value.trim()
  if (query) {
    // URL 쿼리 파라미터 업데이트
    router.push({ query: { ...route.query, q: query } })
    bookStore.searchBooks(query)
  } else {
    // 검색어가 비어있으면 쿼리 파라미터 제거 및 전체 목록으로 되돌림
    const newQuery = { ...route.query }
    delete newQuery.q
    router.push({ query: newQuery })
    bookStore.getBooks()
  }
}

// 검색어 지우기
const clearSearch = () => {
  searchQuery.value = ''
  // 자동으로 검색 결과를 지우지 않음 - 사용자가 검색 버튼을 다시 눌러야 함
}

// 전체 도서 목록으로 돌아가기
const resetSearch = () => {
  searchQuery.value = ''
  // URL에서 검색어 파라미터 제거
  const newQuery = { ...route.query }
  delete newQuery.q
  router.push({ query: newQuery })
  // 검색 결과 초기화하고 전체 도서 목록으로 돌아가기
  bookStore.clearSearchResults()
}
</script>

<style scoped>
.search-container {
  margin-bottom: 20px;
  width: 100%;
}

.search-form {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
}

.search-input-field {
  width: 100%;
  padding: 10px 30px 10px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.clear-button {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
}

.clear-button:hover {
  color: #333;
}

.search-button {
  padding: 10px 20px;
  background-color: #4c6ef5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.search-button:hover {
  background-color: #3b5bdb;
}

.search-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.search-status {
  font-size: 14px;
  color: #495057;
}

.search-query {
  font-weight: bold;
  color: #4c6ef5;
}

.result-count {
  color: #6c757d;
  margin-left: 5px;
}

.reset-button {
  background: none;
  border: none;
  color: #4c6ef5;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 4px;
}

.reset-button:hover {
  background-color: #e9ecef;
}

.reset-icon {
  margin-right: 5px;
  font-size: 16px;
}
</style>
