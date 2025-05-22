<template>
  <div class="login-container">
    <form @submit.prevent="handleSubmit" class="login-form">
      <h2>로그인</h2>
      <SanitizedInput v-model="email" type="email" placeholder="이메일" inputClass="form-input" />
      <SanitizedInput
        v-model="password"
        type="password"
        placeholder="비밀번호"
        inputClass="form-input"
      />
      <button type="submit" class="submit-button">로그인</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import SanitizedInput from '@/components/common/SanitizedInput.vue'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')

const handleSubmit = async () => {
  try {
    await auth.login(email.value, password.value)
    // 로그인 성공 시 메인 페이지로 이동
    router.push('/')
  } catch (error) {
    console.error('로그인 실패:', error)
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #45a049;
}
</style>
