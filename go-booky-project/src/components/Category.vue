<template>
  <div>
    <ul>
      <li v-for="category in categories" :key="category.pk">
        <button @click="selectCategory(category.pk)">{{ category.fields.name }}</button>
      </li>
      <li>
        <button @click="selectCategory(null)">전체</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useCategoryStore } from '@/stores/category.js'
import { computed } from 'vue'
import { useBookStore } from '@/stores/books.js'

const categoryStore = useCategoryStore()
const categories = computed(() => categoryStore.categories)
const bookStore = useBookStore()

function selectCategory(pk) {
  bookStore.getBooks(pk)
}
</script>

<style scoped>
/* */
</style>
