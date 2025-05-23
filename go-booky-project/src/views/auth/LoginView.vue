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
    <Modal v-if="modalText" :text="modalText" @close="modalText = ''" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import SanitizedInput from '@/components/common/SanitizedInput.vue'
import Modal from '@/components/ui/Modal.vue'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const modalText = ref('')

// 컴포넌트 마운트 시 localStorage에서 이메일 복원
onMounted(() => {
  email.value = localStorage.getItem('login_email') || ''
})

// 이메일이 변경될 때마다 localStorage에 저장
watch(email, (newValue) => {
  localStorage.setItem('login_email', newValue)
})

const handleSubmit = async () => {
  try {
    await auth.login(email.value, password.value)
    // 로그인 성공 시 메인 페이지로 이동
    router.push('/')
  } catch (error) {
    modalText.value =
      error.response?.data?.detail || '이메일 혹은 비밀번호가 틀렸습니다. 다시 시도해주세요.'
    password.value = '' // 로그인 실패 시 비밀번호 초기화
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
