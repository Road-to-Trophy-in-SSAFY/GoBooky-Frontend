<template>
  <div class="home-container">
    <h1>GoBooky</h1>
    <p>독서와 관련된 다양한 정보를 찾아보세요!</p>

    <div class="auth-status">
      <div v-if="isLoggedIn" class="logged-in">
        <p>{{ user ? `환영합니다, ${user.username}님!` : '환영합니다!' }}</p>
        <div class="buttons">
          <RouterLink to="/profile" class="btn">내 프로필</RouterLink>
          <RouterLink to="/token-test" class="btn">토큰 테스트</RouterLink>
        </div>
      </div>
      <div v-else class="not-logged-in">
        <p>로그인하고 더 많은 기능을 사용해보세요!</p>
        <div class="buttons">
          <RouterLink to="/login" class="btn">로그인</RouterLink>
          <RouterLink to="/register" class="btn">회원가입</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth/authStore'

// 스토어 초기화
const authStore = useAuthStore()

// 상태 가져오기
const isLoggedIn = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

// 컴포넌트 마운트 시 초기화
onMounted(async () => {
  if (!authStore.user && localStorage.getItem('token')) {
    await authStore.fetchUserInfo()
  }
})
</script>
