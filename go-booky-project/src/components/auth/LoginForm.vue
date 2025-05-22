<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin">
      <input v-model="form.email" name="email" placeholder="이메일" />
      <span v-if="errors.email">{{ errors.email }}</span>
      <input v-model="form.password" name="password" type="password" placeholder="비밀번호" />
      <span v-if="errors.password">{{ errors.password }}</span>
      <button type="submit">로그인</button>
    </form>
    <Modal v-if="modalText" :text="modalText" @close="modalText = ''" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as yup from 'yup'
import Modal from '../ui/Modal.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const form = ref({ email: '', password: '' })
const modalText = ref('')
const errors = ref({})
const auth = useAuthStore()
const router = useRouter()

const schema = yup.object({
  email: yup.string().email('이메일 형식이 올바르지 않습니다.').required('필수 입력'),
  password: yup.string().required('필수 입력'),
})

const handleLogin = async () => {
  errors.value = {}
  try {
    await schema.validate(form.value, { abortEarly: false })
    await auth.login(form.value.email, form.value.password)
    modalText.value = '로그인 성공!'
    setTimeout(() => {
      router.push('/')
    }, 500)
  } catch (err) {
    if (err.name === 'ValidationError') {
      err.inner.forEach((e) => {
        errors.value[e.path] = e.message
      })
    } else {
      modalText.value =
        err.response?.data?.detail || '이메일 혹은 비밀번호가 틀렸습니다. 다시 시도해주세요.'
    }
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
button {
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
