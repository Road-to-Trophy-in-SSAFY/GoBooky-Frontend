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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBookStore } from '@/stores/books.js'

const bookStore = useBookStore()
const searchQuery = ref('')

// 검색 함수 - 제출 시에만 실행
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    bookStore.searchBooks(searchQuery.value.trim())
  } else {
    // 검색어가 비어있으면 전체 목록으로 되돌림
    bookStore.getBooks()
  }
}

// 검색어 지우기
const clearSearch = () => {
  searchQuery.value = ''
  // 자동으로 검색 결과를 지우지 않음 - 사용자가 검색 버튼을 다시 눌러야 함
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
</style>
