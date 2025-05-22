<template>
  <div class="test-container">
    <h1>JWT 토큰 테스트</h1>

    <div class="card">
      <h2>현재 토큰 상태</h2>
      <div v-if="authStore.isAuthenticated" class="token-info">
        <p><strong>인증 상태:</strong> 로그인됨</p>
        <p><strong>사용자:</strong> {{ authStore.user?.username || '로딩 중...' }}</p>
      </div>
      <div v-else class="token-info">
        <p><strong>인증 상태:</strong> 로그아웃됨</p>
      </div>

      <div class="actions">
        <button @click="testTokenValidity" :disabled="loading">액세스 토큰 테스트</button>
        <button @click="testRefreshToken" :disabled="loading">리프레시 토큰 테스트</button>
        <button @click="forceExpireToken" :disabled="loading">토큰 만료 시뮬레이션</button>
      </div>
    </div>

    <div v-if="result" class="result-card">
      <h2>테스트 결과</h2>
      <pre>{{ result }}</pre>
    </div>

    <div v-if="error" class="error-card">
      <h2>오류</h2>
      <pre>{{ error }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth/authStore'
import { authService } from '@/services/api'

const authStore = useAuthStore()
const loading = ref(false)
const result = ref(null)
const error = ref(null)

// 액세스 토큰 유효성 테스트
const testTokenValidity = async () => {
  loading.value = true
  result.value = null
  error.value = null

  try {
    // 사용자 정보를 요청하여 토큰이 유효한지 테스트
    const response = await authService.getUserInfo()
    result.value = {
      status: '성공',
      message: '액세스 토큰이 유효합니다.',
      user: response.data,
    }
  } catch (err) {
    error.value = {
      status: '실패',
      message: '액세스 토큰이 유효하지 않습니다.',
      error: err.response?.data || err.message,
    }
  } finally {
    loading.value = false
  }
}

// 리프레시 토큰 테스트
const testRefreshToken = async () => {
  loading.value = true
  result.value = null
  error.value = null

  try {
    // 저장된 리프레시 토큰 가져오기
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      throw new Error('리프레시 토큰이 없습니다.')
    }

    // 명시적으로 리프레시 토큰을 사용하여 새 액세스 토큰 요청
    const response = await authStore.refreshAccessToken()

    result.value = {
      status: '성공',
      message: '토큰이 성공적으로 리프레시되었습니다.',
      success: response,
    }

    // 사용자 정보 다시 가져오기
    await authStore.fetchUserInfo()
  } catch (err) {
    error.value = {
      status: '실패',
      message: '토큰 리프레시에 실패했습니다.',
      error: err.message,
    }
  } finally {
    loading.value = false
  }
}

// 토큰 만료 시뮬레이션
const forceExpireToken = () => {
  // 유효하지 않은 토큰으로 설정하여 만료 시뮬레이션
  localStorage.setItem('token', 'invalid-token')
  authStore.token = 'invalid-token'

  result.value = {
    status: '정보',
    message:
      '토큰이 의도적으로 유효하지 않게 변경되었습니다. 이제 API 요청을 하면 리프레시가 트리거됩니다.',
  }
}
</script>

<style scoped>
.test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.card,
.result-card,
.error-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-card {
  background-color: #e7f5ea;
}

.error-card {
  background-color: #f8e7e7;
}

.token-info {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 4px;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

button {
  padding: 10px 15px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
}

pre {
  white-space: pre-wrap;
  word-break: break-all;
  background-color: #ffffff;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}

h1 {
  margin-bottom: 20px;
}

h2 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}
</style>
