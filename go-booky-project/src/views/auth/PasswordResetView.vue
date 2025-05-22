<template>
  <div class="password-reset-container">
    <h1>비밀번호 재설정</h1>

    <!-- 성공 메시지 -->
    <div v-if="success" class="success-message">
      <p>비밀번호 재설정 이메일을 보냈습니다. 이메일을 확인해주세요.</p>
      <RouterLink to="/login">로그인 페이지로 돌아가기</RouterLink>
    </div>

    <!-- 비밀번호 재설정 폼 -->
    <form v-else @submit.prevent="submitResetRequest">
      <!-- 에러 메시지 -->
      <div v-if="error" class="error-message">{{ error }}</div>

      <div class="form-group">
        <label for="email">이메일</label>
        <input
          type="email"
          id="email"
          v-model="email"
          required
          placeholder="가입할 때 사용한 이메일을 입력하세요"
        />
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? '처리 중...' : '비밀번호 재설정 이메일 보내기' }}
        </button>
        <div class="form-links">
          <RouterLink to="/login">로그인으로 돌아가기</RouterLink>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { authService } from '@/services/api'

// 상태 관리
const email = ref('')
const isLoading = ref(false)
const error = ref(null)
const success = ref(false)

// 비밀번호 재설정 요청
const submitResetRequest = async () => {
  if (!email.value) {
    error.value = '이메일을 입력해주세요.'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    await authService.resetPassword(email.value)
    success.value = true
  } catch (err) {
    error.value = err.response?.data?.detail || '비밀번호 재설정 요청 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}
</script>
