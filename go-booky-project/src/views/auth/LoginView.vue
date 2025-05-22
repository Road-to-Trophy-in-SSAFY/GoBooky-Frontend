<template>
  <div class="login-container">
    <h1>로그인</h1>

    <!-- 에러 메시지 -->
    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- 로그인 폼 -->
    <form @submit.prevent="submitLogin">
      <div class="form-group">
        <label for="username">아이디</label>
        <input
          type="text"
          id="username"
          v-model="loginForm.username"
          required
          placeholder="아이디를 입력하세요"
        />
      </div>

      <div class="form-group">
        <label for="password">비밀번호</label>
        <input
          type="password"
          id="password"
          v-model="loginForm.password"
          required
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? '로그인 중...' : '로그인' }}
        </button>
        <div class="form-links">
          <RouterLink to="/password-reset">비밀번호를 잊으셨나요?</RouterLink>
          <RouterLink to="/register">회원가입</RouterLink>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth/authStore'

// 라우터와 스토어 초기화
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 로그인 폼 데이터
const loginForm = ref({
  username: '',
  password: '',
})

// 상태 가져오기
const isLoading = computed(() => authStore.loading)
const error = computed(() => authStore.error)

// 로그인 제출 처리
const submitLogin = async () => {
  if (loginForm.value.username && loginForm.value.password) {
    const success = await authStore.login(loginForm.value.username, loginForm.value.password)

    if (success) {
      // 리디렉션 처리
      const redirectPath = route.query.redirect || '/'
      router.push(redirectPath)
    }
  }
}
</script>
