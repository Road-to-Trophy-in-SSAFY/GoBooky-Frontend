<template>
  <div>
    <div class="top-section">
      <BookSearch />
    </div>
    <div class="main-content">
      <div class="sidebar">
        <Category />
      </div>
      <div class="content">
        <div v-if="bookStore.isLoading" class="loading">
          <div class="loading-spinner"></div>
          <p>도서 정보를 불러오는 중입니다...</p>
        </div>
        <div v-else-if="bookStore.filteredBooks.length === 0" class="no-results">
          <p>검색 결과가 없습니다.</p>
          <p class="sub-message">다른 검색어로 다시 시도해보세요.</p>
        </div>
        <BookList v-else :books="bookStore.filteredBooks" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBookStore } from '@/stores/books.js'
import BookList from '@/components/BookList.vue'
import Category from '@/components/Category.vue'
import BookSearch from '@/components/BookSearch.vue'

const route = useRoute()
const bookStore = useBookStore()

onMounted(() => {
  bookStore.getBooks()
})
</script>

<style scoped>
.top-section {
  margin-bottom: 20px;
}

.main-content {
  display: flex;
}

.sidebar {
  width: 200px;
  margin-right: 20px;
}

.content {
  flex: 1;
}

.loading,
.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #4c6ef5;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.no-results p {
  margin: 5px 0;
}

.sub-message {
  font-size: 14px;
  color: #999;
  margin-top: 10px;
}
</style>
