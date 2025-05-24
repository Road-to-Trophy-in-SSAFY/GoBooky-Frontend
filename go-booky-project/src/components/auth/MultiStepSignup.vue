<template>
  <div class="signup-container">
    <div class="step-progress">
      <div
        v-for="(label, idx) in stepLabels"
        :key="idx"
        :class="['step', { active: idx === currentStep }]"
      >
        {{ label }}
      </div>
    </div>
    <form @submit.prevent="handleNext">
      <div v-if="currentStep === 0">
        <div class="form-group">
          <SanitizedInput
            v-model="formState.form.email"
            type="email"
            placeholder="이메일"
            inputClass="form-control"
          />
          <span v-if="formState.errors.email" class="error">{{ formState.errors.email }}</span>
        </div>
        <div class="form-group">
          <SanitizedInput
            v-model="formState.form.password"
            type="password"
            placeholder="비밀번호"
            inputClass="form-control"
          />
          <span v-if="formState.errors.password" class="error">{{
            formState.errors.password
          }}</span>
        </div>
      </div>
      <div v-else-if="currentStep === 1">
        <div v-if="formState.loading.check" class="loader">
          <div class="spinner"></div>
          <p>이메일 인증 중...</p>
        </div>
        <div v-else class="verification-container">
          <div class="verification-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <p class="verification-message">
            이메일로 인증 메일이 발송되었습니다.<br />메일함을 확인해주세요.
          </p>
          <div class="verification-actions">
            <button
              type="button"
              @click="resendEmail"
              :disabled="formState.verification.resendDisabled || formState.loading.resend"
              class="btn btn-secondary"
            >
              <span v-if="formState.loading.resend" class="spinner-small"></span>
              <span v-else>재전송</span>
            </button>
            <span v-if="formState.verification.resendDisabled" class="resend-timer"
              >({{ formState.verification.resendTimer }}초 후 재전송 가능)</span
            >
            <button
              type="button"
              @click="checkEmailVerified"
              :disabled="formState.loading.check"
              class="btn btn-primary"
            >
              <span v-if="formState.loading.check" class="spinner-small"></span>
              <span v-else>이메일 인증 확인</span>
            </button>
          </div>
          <span v-if="formState.verification.verified" class="verification-success">인증 완료</span>
        </div>
      </div>
      <div v-else-if="currentStep === 2">
        <div class="form-group">
          <SanitizedInput
            v-model="formState.form.username"
            type="text"
            placeholder="닉네임"
            inputClass="form-control"
          />
          <span v-if="formState.errors.username" class="error">{{
            formState.errors.username
          }}</span>
        </div>
        <div class="form-group">
          <SanitizedInput
            v-model="formState.form.first_name"
            type="text"
            placeholder="이름"
            inputClass="form-control"
          />
          <span v-if="formState.errors.first_name" class="error">{{
            formState.errors.first_name
          }}</span>
        </div>
        <div class="form-group">
          <SanitizedInput
            v-model="formState.form.last_name"
            type="text"
            placeholder="성"
            inputClass="form-control"
          />
          <span v-if="formState.errors.last_name" class="error">{{
            formState.errors.last_name
          }}</span>
        </div>
        <div class="form-group">
          <select v-model="formState.form.gender" name="gender" class="form-control">
            <option value="">성별 선택</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
            <option value="other">기타</option>
          </select>
          <span v-if="formState.errors.gender" class="error">{{ formState.errors.gender }}</span>
        </div>
      </div>
      <div v-else-if="currentStep === 3">
        <div class="reading-info">
          <h3>독서 정보</h3>
          <div class="form-group">
            <label>주간 평균 독서 시간 (시간)</label>
            <SanitizedInput
              v-model.number="formState.form.weekly_read_time"
              type="number"
              min="0"
              placeholder="예: 2"
              inputClass="form-control"
            />
          </div>
          <div class="form-group">
            <label>연간 독서량 (권)</label>
            <SanitizedInput
              v-model.number="formState.form.yearly_read_count"
              type="number"
              min="0"
              placeholder="예: 24"
              inputClass="form-control"
            />
          </div>
        </div>
        <div class="categories">
          <h3>관심 장르 (최소 1개 이상 선택)</h3>
          <div class="category-grid">
            <div
              v-for="category in formState.categories"
              :key="category.id"
              :class="[
                'category-item',
                { selected: formState.form.category_ids.includes(category.id) },
              ]"
              @click="toggleCategory(category.id)"
            >
              {{ category.name }}
            </div>
          </div>
          <span v-if="formState.errors.category_ids" class="error">{{
            formState.errors.category_ids
          }}</span>
        </div>
      </div>
      <div v-else-if="currentStep === 4">
        <div class="completion-container">
          <div class="completion-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <p class="completion-message">회원가입이 완료되었습니다!</p>
          <div v-if="formState.loading.redirect" class="redirect-loader">
            <div class="spinner"></div>
            <p>로그인 페이지로 이동합니다...</p>
          </div>
        </div>
      </div>
      <div class="actions">
        <button
          v-if="!isLastStep"
          type="submit"
          class="btn btn-primary"
          :disabled="formState.loading.submit || !canProceed"
        >
          <span v-if="formState.loading.submit" class="spinner-small"></span>
          <span v-else>다음</span>
        </button>
      </div>
    </form>
    <Modal
      v-if="formState.modal.text"
      :text="formState.modal.text"
      @close="formState.modal.text = ''"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as yup from 'yup'
import Modal from '../ui/Modal.vue'
import SanitizedInput from '../common/SanitizedInput.vue'
import axios from '@/services/axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const step = ref(0)
const stepLabels = ['이메일 입력', '이메일 인증', '기본 정보', '독서 정보', '완료']

// 폼 상태를 하나의 객체로 통합
const formState = ref({
  form: {
    email: '',
    password: '',
    username: '',
    first_name: '',
    last_name: '',
    gender: '',
    weekly_read_time: null,
    yearly_read_count: null,
    category_ids: [],
  },
  errors: {},
  loading: {
    submit: false,
    resend: false,
    check: false,
    redirect: false,
  },
  verification: {
    uuid: '',
    verified: false,
    resendDisabled: false,
    resendTimer: 60,
  },
  modal: {
    text: '',
  },
  categories: [],
})

// computed 속성으로 자주 사용되는 값들 캐싱
const currentStep = computed(() => step.value)
const isLastStep = computed(() => step.value === 4)
const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return formState.value.verification.verified
  }
  return true
})

// 유효성 검사 스키마
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

// 에러 처리 유틸리티 함수
const handleError = (err) => {
  if (err.name === 'ValidationError') {
    formState.value.errors = {}
    err.inner.forEach((e) => {
      formState.value.errors[e.path] = e.message
    })
  } else if (err.response?.data) {
    formState.value.modal.text = Object.values(err.response.data).flat().join(' ')
  } else {
    formState.value.modal.text = err.response?.data?.detail || err.message
  }
}

// 타이머 관리
let resendInterval = null
const startResendTimer = () => {
  formState.value.verification.resendTimer = 60
  formState.value.verification.resendDisabled = true
  clearInterval(resendInterval)
  resendInterval = setInterval(() => {
    formState.value.verification.resendTimer--
    if (formState.value.verification.resendTimer <= 0) {
      formState.value.verification.resendDisabled = false
      clearInterval(resendInterval)
    }
  }, 1000)
}

// API 호출 함수들
const registerUser = async () => {
  try {
    formState.value.loading.submit = true
    await schemas[0].validate(formState.value.form, { abortEarly: false })
    const res = await axios.post('/auth/register/', {
      email: formState.value.form.email,
      password: formState.value.form.password,
    })
    if (res.data?.uuid) {
      formState.value.verification.uuid = res.data.uuid
      formState.value.modal.text = '이메일로 인증 링크가 발송되었습니다. 메일함을 확인해주세요.'
      step.value = 1
      startResendTimer()
    }
  } catch (err) {
    handleError(err)
  } finally {
    formState.value.loading.submit = false
  }
}

const checkEmailVerified = async () => {
  if (!formState.value.verification.uuid) {
    formState.value.modal.text = '인증 UUID가 없습니다. 다시 시도해주세요.'
    return
  }
  try {
    formState.value.loading.check = true
    const res = await axios.post('/auth/register/verify/', {
      uuid: formState.value.verification.uuid,
    })
    if (res.data.detail?.includes('완료')) {
      formState.value.verification.verified = true
      formState.value.modal.text = '이메일 인증이 완료되었습니다! 다음 단계로 진행할 수 있습니다.'
    } else {
      formState.value.modal.text = '아직 이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.'
      formState.value.verification.verified = false
    }
  } catch (err) {
    formState.value.verification.verified = false
    handleError(err)
  } finally {
    formState.value.loading.check = false
  }
}

const resendEmail = async () => {
  if (!formState.value.form.email) {
    formState.value.modal.text = '이메일 주소가 필요합니다.'
    return
  }
  try {
    formState.value.loading.resend = true
    await axios.post('/auth/resend-email/', { email: formState.value.form.email })
    formState.value.modal.text = '인증 이메일이 재발송되었습니다.'
    startResendTimer()
  } catch (err) {
    handleError(err)
  } finally {
    formState.value.loading.resend = false
  }
}

const completeRegistration = async () => {
  try {
    formState.value.loading.submit = true
    await schemas[3].validate(formState.value.form, { abortEarly: false })
    await axios.patch('/auth/register/complete/', {
      uuid: formState.value.verification.uuid,
      ...formState.value.form,
    })
    step.value = 4
    formState.value.loading.redirect = true
    formState.value.modal.text = '회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err) {
    handleError(err)
  } finally {
    formState.value.loading.submit = false
  }
}

// 단계별 처리 함수
const handleNext = async () => {
  formState.value.errors = {}
  switch (currentStep.value) {
    case 0:
      await registerUser()
      break
    case 1:
      if (!formState.value.verification.verified) {
        formState.value.modal.text = '이메일 인증을 완료해 주세요.'
        return
      }
      step.value = 2
      break
    case 2:
      try {
        formState.value.loading.submit = true
        await schemas[2].validate(formState.value.form, { abortEarly: false })
        step.value = 3
      } catch (err) {
        handleError(err)
      } finally {
        formState.value.loading.submit = false
      }
      break
    case 3:
      await completeRegistration()
      break
  }
}

// 카테고리 관련 함수
const toggleCategory = (categoryId) => {
  const index = formState.value.form.category_ids.indexOf(categoryId)
  if (index === -1) {
    formState.value.form.category_ids.push(categoryId)
  } else {
    formState.value.form.category_ids.splice(index, 1)
  }
}

const fetchCategories = async () => {
  try {
    const res = await axios.get('/auth/categories/')
    formState.value.categories = res.data
  } catch (err) {
    handleError(err)
  }
}

// 컴포넌트 마운트 시 실행
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
  position: relative;
}

.step-progress::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: #eee;
  z-index: 1;
}

.step {
  flex: 1;
  text-align: center;
  padding: 0.5rem 0;
  position: relative;
  z-index: 2;
  background: #fff;
  color: #aaa;
  font-size: 0.9rem;
}

.step.active {
  color: #42b983;
  font-weight: bold;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  border-color: #42b983;
  outline: none;
}

.error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
}

.verification-container {
  text-align: center;
  padding: 2rem;
}

.verification-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  color: #42b983;
}

.verification-message {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.verification-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
}

.verification-success {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #42b983;
  color: white;
  border-radius: 4px;
  font-weight: bold;
}

.completion-container {
  text-align: center;
  padding: 2rem;
}

.completion-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  color: #42b983;
}

.completion-message {
  font-size: 1.2rem;
  color: #42b983;
  font-weight: bold;
  margin-bottom: 1rem;
}

.redirect-loader {
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background: #42b983;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3aa876;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #fff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.resend-timer {
  color: #666;
  font-size: 0.9rem;
}

.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loader p {
  margin-top: 1rem;
  color: #666;
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
</style>
