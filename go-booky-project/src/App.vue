<template>
  <Suspense>
    <RouterView />
  </Suspense>
</template>

<script setup>
import { RouterView } from 'vue-router'
// import { useAuthStore } from '@/stores/auth'
// import { onMounted } from 'vue'

// const auth = useAuthStore()

// onMounted(async () => {
//   await auth.checkAuth()
// })
</script>

<style scoped>
/* */
</style>
