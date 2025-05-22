<template>
  <div>
    <h4>book-card</h4>
    <p>{{ book.title }}</p>
    <p>{{ book.author }}</p>
    <p>{{ book.publisher }}</p>
    <p>{{ book.pub_data }}</p>
    <img :src="book.cover" alt="Book Cover" />
    <hr />
  </div>
</template>

<script setup>
const props = defineProps({
  book: Object,
})
</script>

<style scoped>
/* */
</style>
