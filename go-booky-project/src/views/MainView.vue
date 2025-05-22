<template>
  <div class="main-container">
    <h1>GoBooky</h1>
    <div v-if="auth.isAuthenticated" class="main-actions">
      <span style="font-weight: bold">{{ auth.user?.email }} 님 환영합니다!</span>
      <button @click="handleLogout">로그아웃</button>
      <button @click="handleWithdraw">회원탈퇴</button>
    </div>
    <div v-else class="main-actions">
      <RouterLink to="/login">
        <button>로그인</button>
      </RouterLink>
      <RouterLink to="/signup">
        <button>회원가입</button>
      </RouterLink>
    </div>
    <Modal v-if="modalText" :text="modalText" @close="modalText = ''" />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/ui/Modal.vue'
import axios from '@/services/axios'

const auth = useAuthStore()
const router = useRouter()
const modalText = ref('')

const handleLogout = () => {
  auth.logout()
  router.push('/')
}

const handleWithdraw = async () => {
  try {
    // 실제로는 비밀번호 확인 등 추가 로직 필요
    await axios.delete('/auth/account/', { data: { password: '' } })
    auth.logout()
    modalText.value = '회원탈퇴가 완료되었습니다.'
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } catch (err) {
    modalText.value = err.response?.data?.detail || '회원탈퇴 실패'
  }
}
</script>

<style scoped>
.main-container {
  max-width: 400px;
  margin: 5rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}
.main-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: space-around;
}
button {
  background: #42b983;
  color: #fff;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}
</style>
