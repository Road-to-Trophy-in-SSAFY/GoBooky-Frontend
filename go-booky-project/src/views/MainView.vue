<template>
  <div class="main-container">
    <h1>GoBooky</h1>
    <div v-if="auth.isAuthenticated" class="main-actions">
      <span style="font-weight: bold">{{ auth.user?.email }} 님 환영합니다!</span>
      <button @click="handleLogout">로그아웃</button>
      <button @click="openDeleteModal">회원탈퇴</button>
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
    <Modal v-if="showDeleteModal" @close="closeDeleteModal">
      <template #default>
        <div style="margin-bottom: 1rem">정말 계정을 삭제하시겠습니까?</div>
        <input
          v-model="deletePassword"
          type="password"
          placeholder="비밀번호 입력"
          style="margin-bottom: 1rem"
        />
        <div style="display: flex; gap: 1rem; justify-content: center">
          <button @click="closeDeleteModal">취소</button>
          <button @click="handleWithdraw" style="background: #e74c3c">삭제</button>
        </div>
      </template>
    </Modal>
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
const showDeleteModal = ref(false)
const deletePassword = ref('')

function handleError(err, fallbackMsg = '회원탈퇴 실패') {
  modalText.value = err.response?.data?.detail || fallbackMsg
}

const handleLogout = () => {
  auth.logout()
  router.push('/')
}

function openDeleteModal() {
  showDeleteModal.value = true
  deletePassword.value = ''
}
function closeDeleteModal() {
  showDeleteModal.value = false
  deletePassword.value = ''
}

const handleWithdraw = async () => {
  if (!deletePassword.value) {
    modalText.value = '비밀번호를 입력해주세요.'
    return
  }
  try {
    await axios.delete('/auth/account/', { data: { password: deletePassword.value } })
    auth.logout()
    showDeleteModal.value = false
    modalText.value = '회원탈퇴가 완료되었습니다.'
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } catch (err) {
    handleError(err)
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
