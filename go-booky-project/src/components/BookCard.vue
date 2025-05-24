<template>
  <div>
    <div class="book-card" @click="goToBookDetail">
      <p>{{ book.title }}</p>
      <p>{{ book.author }}</p>
      <p>{{ book.publisher }}</p>
      <p>카테고리: {{ book.category_name }}</p>
      <p>{{ book.pub_date }}</p>
      <img :src="book.cover" alt="Book Cover" />
    </div>
    <hr />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  book: Object,
})
const goToBookDetail = () => {
  router.push({ name: 'book-detail', params: { id: props.book.id } })
}
</script>

<style scoped>
/* */
</style>
