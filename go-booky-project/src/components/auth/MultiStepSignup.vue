<template>
  <div class="signup-container">
    <div class="step-progress">
      <div
        v-for="(label, idx) in stepLabels"
        :key="idx"
        :class="['step', { active: idx === step }]"
      >
        {{ label }}
      </div>
    </div>
    <form @submit.prevent="handleNext">
      <div v-if="step === 0">
        <input v-model="form.email" name="email" placeholder="이메일" />
        <span v-if="errors.email">{{ errors.email }}</span>
        <input v-model="form.password" name="password" type="password" placeholder="비밀번호" />
        <span v-if="errors.password">{{ errors.password }}</span>
      </div>
      <div v-else-if="step === 1">
        <div v-if="isLoading" class="loader">
          <div class="spinner"></div>
          <p>이메일 인증 중...</p>
        </div>
        <div v-else>
          <p>이메일로 인증 메일이 발송되었습니다.<br />메일함을 확인해주세요.</p>
          <button type="button" @click="resendEmail" :disabled="resendDisabled">재전송</button>
          <span v-if="resendDisabled">({{ resendTimer }}초 후 재전송 가능)</span>
          <button type="button" @click="checkEmailVerified">이메일 인증 확인</button>
          <span v-if="emailVerified" style="color: #42b983; font-weight: bold">인증 완료</span>
        </div>
      </div>
      <div v-else-if="step === 2">
        <input v-model="form.username" name="username" placeholder="닉네임" />
        <span v-if="errors.username">{{ errors.username }}</span>
        <input v-model="form.first_name" name="first_name" placeholder="이름" />
        <span v-if="errors.first_name">{{ errors.first_name }}</span>
        <input v-model="form.last_name" name="last_name" placeholder="성" />
        <span v-if="errors.last_name">{{ errors.last_name }}</span>
        <select v-model="form.gender" name="gender">
          <option value="">성별 선택</option>
          <option value="male">남성</option>
          <option value="female">여성</option>
          <option value="other">기타</option>
        </select>
        <span v-if="errors.gender">{{ errors.gender }}</span>
      </div>
      <div v-else-if="step === 3">
        <div class="reading-info">
          <h3>독서 정보</h3>
          <div class="input-group">
            <label>주간 평균 독서 시간 (시간)</label>
            <input
              v-model.number="form.weekly_read_time"
              type="number"
              min="0"
              placeholder="예: 2"
            />
          </div>
          <div class="input-group">
            <label>연간 독서량 (권)</label>
            <input
              v-model.number="form.yearly_read_count"
              type="number"
              min="0"
              placeholder="예: 24"
            />
          </div>
        </div>
        <div class="categories">
          <h3>관심 장르 (최소 1개 이상 선택)</h3>
          <div class="category-grid">
            <div
              v-for="category in categories"
              :key="category.id"
              :class="['category-item', { selected: form.category_ids.includes(category.id) }]"
              @click="toggleCategory(category.id)"
            >
              {{ category.name }}
            </div>
          </div>
          <span v-if="errors.category_ids" class="error">{{ errors.category_ids }}</span>
        </div>
      </div>
      <div v-else-if="step === 4">
        <p>회원가입이 완료되었습니다! 온보딩을 시작하세요.</p>
      </div>
      <div class="actions">
        <button v-if="step < 4" type="submit">다음</button>
      </div>
    </form>
    <Modal v-if="modalText" :text="modalText" @close="modalText = ''" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as yup from 'yup'
import Modal from '../ui/Modal.vue'
import axios from '@/services/axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const step = ref(0)
const stepLabels = ['이메일 입력', '이메일 인증', '기본 정보', '독서 정보', '완료']
const form = ref({
  email: '',
  password: '',
  username: '',
  first_name: '',
  last_name: '',
  gender: '',
  weekly_read_time: null,
  yearly_read_count: null,
  category_ids: [],
})
const modalText = ref('')
const resendDisabled = ref(false)
const resendTimer = ref(60)
let resendInterval = null
const errors = ref({})
const emailVerified = ref(false)
const emailVerifyUUID = ref('')
const isLoading = ref(false)
const categories = ref([])

const schemas = [
  yup.object({
    email: yup.string().email('이메일 형식이 올바르지 않습니다.').required('필수 입력'),
    password: yup
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다.')
      .max(32, '비밀번호는 32자 이하여야 합니다.')
      .matches(/[a-z]/, '소문자를 포함해야 합니다.')
      .matches(/[A-Z]/, '대문자를 포함해야 합니다.')
      .matches(/[0-9]/, '숫자를 포함해야 합니다.')
      .matches(/[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/, '특수문자를 포함해야 합니다.')
      .required('필수 입력'),
  }),
  yup.object({}),
  yup.object({
    username: yup.string().min(2).max(20).required('필수 입력'),
    first_name: yup.string().min(1).max(20).required('필수 입력'),
    last_name: yup.string().min(1).max(20).required('필수 입력'),
    gender: yup.string().required('성별을 선택해주세요'),
  }),
  yup.object({
    weekly_read_time: yup.number().nullable(),
    yearly_read_count: yup.number().nullable(),
    category_ids: yup.array().min(1, '최소 하나의 관심 장르를 선택해주세요').required('필수 입력'),
  }),
]

function handleError(err) {
  if (err.name === 'ValidationError') {
    err.inner.forEach((e) => {
      errors.value[e.path] = e.message
    })
  } else if (err.response && err.response.data) {
    modalText.value = Object.values(err.response.data).flat().join(' ')
  } else {
    modalText.value = err.response?.data?.detail || err.message
  }
}

const handleNext = async () => {
  errors.value = {}
  if (step.value === 0) {
    try {
      await schemas[0].validate(form.value, { abortEarly: false })
      const res = await axios.post('/auth/register/', {
        email: form.value.email,
        password: form.value.password,
      })
      if (res.data && res.data.uuid) {
        emailVerifyUUID.value = res.data.uuid
        modalText.value = '이메일로 인증 링크가 발송되었습니다. 메일함을 확인해주세요.'
        step.value = 1
        startResendTimer()
      }
    } catch (err) {
      handleError(err)
    }
  } else if (step.value === 1) {
    if (!emailVerified.value) {
      modalText.value =
        '이메일 인증을 완료해 주세요. 메일의 인증 링크를 클릭하거나 "이메일 인증 확인" 버튼을 눌러주세요.'
      return
    }
    step.value = 2
  } else if (step.value === 2) {
    try {
      await schemas[2].validate(form.value, { abortEarly: false })
      step.value = 3
    } catch (err) {
      handleError(err)
    }
  } else if (step.value === 3) {
    try {
      await schemas[3].validate(form.value, { abortEarly: false })
      await axios.patch('/auth/register/complete/', {
        uuid: emailVerifyUUID.value,
        username: form.value.username,
        first_name: form.value.first_name,
        last_name: form.value.last_name,
        gender: form.value.gender,
        weekly_read_time: form.value.weekly_read_time,
        yearly_read_count: form.value.yearly_read_count,
        category_ids: form.value.category_ids,
      })
      modalText.value = '회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      handleError(err)
    }
  }
}

async function checkEmailVerified() {
  if (!emailVerifyUUID.value) {
    modalText.value = '인증 UUID가 없습니다. 다시 시도해주세요.'
    return
  }
  try {
    isLoading.value = true
    const res = await axios.post('/auth/register/verify/', { uuid: emailVerifyUUID.value })
    if (res.data.detail && res.data.detail.includes('완료')) {
      emailVerified.value = true
      modalText.value = '이메일 인증이 완료되었습니다! 다음 단계로 진행할 수 있습니다.'
    } else {
      modalText.value = '아직 이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.'
      emailVerified.value = false
    }
  } catch (err) {
    emailVerified.value = false
    handleError(err)
  } finally {
    isLoading.value = false
  }
}

async function resendEmail() {
  if (!form.value.email) {
    modalText.value = '이메일 주소가 필요합니다.'
    return
  }
  try {
    await axios.post('/auth/resend-email/', { email: form.value.email })
    modalText.value = '인증 이메일이 재발송되었습니다.'
    startResendTimer()
  } catch (err) {
    handleError(err)
  }
}

function startResendTimer() {
  resendTimer.value = 60
  resendDisabled.value = true
  clearInterval(resendInterval)
  resendInterval = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0) {
      resendDisabled.value = false
      clearInterval(resendInterval)
    }
  }, 1000)
}

function toggleCategory(categoryId) {
  const index = form.value.category_ids.indexOf(categoryId)
  if (index === -1) {
    form.value.category_ids.push(categoryId)
  } else {
    form.value.category_ids.splice(index, 1)
  }
}

async function fetchCategories() {
  try {
    const res = await axios.get('/auth/categories/')
    categories.value = res.data
  } catch (err) {
    handleError(err)
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.signup-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.step-progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.step {
  flex: 1;
  text-align: center;
  padding: 0.5rem 0;
  border-bottom: 2px solid #eee;
  color: #aaa;
}

.step.active {
  border-bottom: 2px solid #42b983;
  color: #42b983;
  font-weight: bold;
}

.actions {
  margin-top: 2rem;
  text-align: right;
}

.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.reading-info,
.categories {
  margin-bottom: 2rem;
}

.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.category-item {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-item:hover {
  border-color: #42b983;
  background-color: #f8f8f8;
}

.category-item.selected {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}

.error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
}
</style>
