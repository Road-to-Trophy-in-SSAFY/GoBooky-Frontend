<template>
  <nav>
    <RouterLink :to="{ name: 'home' }">Home</RouterLink>
    &nbsp;|&nbsp;
    <RouterLink :to="{ name: 'books' }">Books</RouterLink>
    &nbsp;|&nbsp;
    <RouterLink :to="{ name: 'threads' }">Threads</RouterLink>
  </nav>
  <div>
    <p>main-view</p>
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView, RouterLink } from 'vue-router'
</script>

<style scoped>
/* */
</style>
