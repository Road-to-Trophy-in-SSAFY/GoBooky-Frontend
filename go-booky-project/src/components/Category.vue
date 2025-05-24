<template>
  <div>
    <ul>
      <li v-for="category in categories" :key="category.pk">
        <button
          @click="selectCategory(category.pk)"
          :class="{ active: currentCategory === category.pk }"
        >
          {{ category.fields.name }}
        </button>
      </li>
      <li>
        <button @click="selectCategory(null)" :class="{ active: currentCategory === null }">
          전체
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useCategoryStore } from '@/stores/category.js'
import { computed, ref } from 'vue'
import { useBookStore } from '@/stores/books.js'
import { useRouter, useRoute } from 'vue-router'

const categoryStore = useCategoryStore()
const categories = computed(() => categoryStore.categories)
const bookStore = useBookStore()
const router = useRouter()
const route = useRoute()

// 현재 선택된 카테고리를 저장
const currentCategory = computed(() => bookStore.currentCategory)

function selectCategory(pk) {
  // URL 쿼리 파라미터 업데이트
  const query = { ...route.query }

  if (pk) {
    query.category = pk
  } else {
    delete query.category
  }

  // 현재 검색어가 있다면 유지하고 해당 카테고리만 필터링
  const searchQuery = route.query.q
  if (searchQuery) {
    // 검색 결과 내에서 카테고리 필터링 적용
    bookStore.filterSearchResultsByCategory(pk)
  } else {
    // 검색어가 없으면 카테고리로만 필터링
    bookStore.getBooks(pk)
  }

  // URL 업데이트
  router.push({ query })
}
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 8px;
}

button {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #e9ecef;
}

button.active {
  background-color: #4c6ef5;
  color: white;
  border-color: #4c6ef5;
}
</style>
