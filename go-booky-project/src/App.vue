<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth/authStore'

// 인증 스토어 초기화
const authStore = useAuthStore()

// 앱 시작 시 인증 상태 복원
onMounted(async () => {
  await authStore.initialize()
})
</script>

<template>
  <div id="app">
    <main>
      <!-- 화면 전환 애니메이션 -->
      <RouterView v-slot="{ Component }">
        <component :is="Component" />
      </RouterView>
    </main>
  </div>
</template>
