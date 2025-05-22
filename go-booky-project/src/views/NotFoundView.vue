<template>
  <div class="not-found">
    <h1>404</h1>
    <p>페이지를 찾을 수 없습니다.</p>
    <RouterLink to="/">홈으로 돌아가기</RouterLink>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
