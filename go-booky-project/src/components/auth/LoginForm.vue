<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin">
      <input v-model="form.email" name="email" placeholder="이메일" />
      <span v-if="errors.email">{{ errors.email }}</span>
      <div class="password-input-wrapper">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="form.password"
          name="password"
          placeholder="비밀번호"
          autocomplete="current-password"
        />
        <button type="button" class="toggle-password" @click="togglePassword" tabindex="-1">
          <svg
            v-if="showPassword"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#888"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#888"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M17.94 17.94A10.94 10.94 0 0 1 12 19C5 19 1 12 1 12a21.81 21.81 0 0 1 5.06-7.94"
            />
            <path d="M22.54 12.88A10.94 10.94 0 0 0 23 12s-4-7-11-7a10.94 10.94 0 0 0-4.06.76" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        </button>
      </div>
      <span v-if="errors.password">{{ errors.password }}</span>
      <button type="submit">로그인</button>
    </form>
    <Modal v-if="modalText" :text="modalText" @close="modalText = ''" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as yup from 'yup'
import Modal from '../ui/Modal.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const form = ref({ email: '', password: '' })
const modalText = ref('')
const errors = ref({})
const auth = useAuthStore()
const router = useRouter()
const showPassword = ref(false)

onMounted(() => {
  // 새로고침 시 이메일은 localStorage에서 복원, 비밀번호는 항상 초기화
  form.value.email = localStorage.getItem('login_email') || ''
  form.value.password = '' // 새로고침 시 비밀번호 초기화
})

watch(
  () => form.value.email,
  (val) => {
    localStorage.setItem('login_email', val)
  },
)

const schema = yup.object({
  email: yup.string().email('이메일 형식이 올바르지 않습니다.').required('필수 입력'),
  password: yup.string().required('필수 입력'),
})

function togglePassword() {
  showPassword.value = !showPassword.value
}

function handleError(err) {
  form.value.password = '' // 로그인 실패 시 비밀번호 초기화
  if (err.name === 'ValidationError') {
    err.inner.forEach((e) => {
      errors.value[e.path] = e.message
    })
  } else {
    modalText.value =
      err.response?.data?.detail || '이메일 혹은 비밀번호가 틀렸습니다. 다시 시도해주세요.'
  }
}

const handleLogin = async () => {
  errors.value = {}
  try {
    await schema.validate(form.value, { abortEarly: false })
    await auth.login(form.value.email, form.value.password)
    modalText.value = '로그인 성공!'
    setTimeout(() => {
      router.push('/')
    }, 500)
    form.value.password = '' // 로그인 성공 후에도 비밀번호 초기화(보안)
  } catch (err) {
    handleError(err)
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.password-input-wrapper {
  position: relative;
}
.password-input-wrapper input {
  width: 100%;
  padding-right: 2.5rem;
}
.toggle-password {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}
button[type='submit'] {
  margin-top: 1rem;
  width: 100%;
  background: #42b983;
  color: #fff;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}
</style>
