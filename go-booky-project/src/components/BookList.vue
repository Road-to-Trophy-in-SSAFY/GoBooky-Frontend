<template>
  <div>
    <BookCard v-for="book in books" :key="book.id" :book="book" />
  </div>
</template>

<script setup>
import BookCard from '@/components/BookCard.vue'

const props = defineProps({
  books: {
    type: Array,
  },
})
</script>

<style scoped>
/* */
</style>
