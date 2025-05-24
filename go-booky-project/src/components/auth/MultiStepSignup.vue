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
          <div class="password-validation">
            <p
              v-for="(message, index) in passwordValidationMessages"
              :key="index"
              :class="{ valid: message.valid }"
            >
              {{ message.text }}
            </p>
          </div>
          <span v-if="formState.errors.password" class="error">{{
            formState.errors.password
          }}</span>
        </div>
        <div class="form-group">
          <SanitizedInput
            v-model="formState.form.passwordConfirm"
            type="password"
            placeholder="비밀번호 확인"
            inputClass="form-control"
          />
          <div class="password-match-container">
            <span
              v-if="formState.form.password"
              :class="['password-match', { match: isPasswordMatch }]"
            >
              {{ passwordMatchMessage }}
            </span>
          </div>
        </div>
      </div>
      <div v-else-if="currentStep === 1">
        <div v-if="formState.loading.check" class="verification-loading">
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
          <div class="verification-content">
            <h3>이메일 인증</h3>
            <p class="verification-message">
              <span class="email-highlight">{{ formState.form.email }}</span
              >로<br />
              인증 메일이 발송되었습니다.<br />
              메일함을 확인해주세요.
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
              <span v-if="formState.verification.resendDisabled" class="resend-timer">
                {{ formState.verification.resendTimer }}초 후 재전송 가능
              </span>
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
            <div v-if="formState.verification.verified" class="verification-success">
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
              <span>인증 완료</span>
            </div>
          </div>
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
    <Modal v-if="formState.modal.text" :text="formState.modal.text" @close="handleModalClose" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
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
    passwordConfirm: '',
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
  switch (currentStep.value) {
    case 0: {
      // 이메일과 비밀번호 유효성 검사
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.value.form.email)
      const passwordValid = passwordValidationMessages.value.every((msg) => msg.valid)
      const passwordMatch = formState.value.form.password === formState.value.form.passwordConfirm
      const hasPasswordConfirm = formState.value.form.passwordConfirm !== ''
      return emailValid && passwordValid && passwordMatch && hasPasswordConfirm
    }
    case 1:
      return formState.value.verification.verified
    case 2:
      // 기본 정보 유효성 검사
      return (
        formState.value.form.username &&
        formState.value.form.first_name &&
        formState.value.form.last_name &&
        formState.value.form.gender
      )
    case 3:
      // 독서 정보 유효성 검사
      return formState.value.form.category_ids.length > 0
    default:
      return true
  }
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
    // 특정 에러 메시지 확인
    const errorMessage = Object.values(err.response.data).flat().join(' ')
    formState.value.modal.text = errorMessage
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

// 모달 닫기 핸들러
const handleModalClose = () => {
  const modalText = formState.value.modal.text
  formState.value.modal.text = '' // 먼저 모달 닫기

  // 특정 에러 메시지인 경우 회원가입 초기화
  if (modalText === '해당 이메일로 대기 중인 인증이 없습니다.') {
    step.value = 0 // 첫 번째 스텝으로 이동
    // 폼 상태 및 검증 상태 초기화
    formState.value.form = {
      email: '',
      password: '',
      passwordConfirm: '',
      username: '',
      first_name: '',
      last_name: '',
      gender: '',
      weekly_read_time: null,
      yearly_read_count: null,
      category_ids: [],
    }
    formState.value.errors = {}
    formState.value.verification = {
      uuid: '',
      verified: false,
      resendDisabled: false,
      resendTimer: 60,
    }
    // 비밀번호 유효성 메시지 초기화
    passwordValidationMessages.value = [
      { text: '8자 이상', valid: false },
      { text: '대문자 포함', valid: false },
      { text: '소문자 포함', valid: false },
      { text: '숫자 포함', valid: false },
      { text: '특수문자 포함', valid: false },
    ]
    passwordMatchMessage.value = '비밀번호를 입력해주세요'
    isPasswordMatch.value = false
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

const passwordValidationMessages = ref([
  { text: '8자 이상', valid: false },
  { text: '대문자 포함', valid: false },
  { text: '소문자 포함', valid: false },
  { text: '숫자 포함', valid: false },
  { text: '특수문자 포함', valid: false },
])
const passwordMatchMessage = ref('비밀번호를 입력해주세요')
const isPasswordMatch = ref(false)

// 디바운스 유틸리티 함수
const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// 비밀번호 유효성 검사 함수
const validatePassword = debounce(() => {
  const password = formState.value.form.password
  passwordValidationMessages.value = [
    { text: '8자 이상', valid: password.length >= 8 },
    { text: '대문자 포함', valid: /[A-Z]/.test(password) },
    { text: '소문자 포함', valid: /[a-z]/.test(password) },
    { text: '숫자 포함', valid: /[0-9]/.test(password) },
    { text: '특수문자 포함', valid: /[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/.test(password) },
  ]
}, 300)

// 비밀번호 일치 검사 함수
const checkPasswordMatch = debounce(() => {
  const password = formState.value.form.password
  const confirmPassword = formState.value.form.passwordConfirm

  if (!confirmPassword) {
    isPasswordMatch.value = false
    return
  }

  if (password === confirmPassword) {
    passwordMatchMessage.value = '비밀번호가 일치합니다'
    isPasswordMatch.value = true
  } else {
    passwordMatchMessage.value = '비밀번호가 일치하지 않습니다'
    isPasswordMatch.value = false
  }
}, 300)

// 비밀번호 변경 감시
watch(
  () => formState.value.form.password,
  () => {
    validatePassword()
    if (formState.value.form.passwordConfirm) {
      checkPasswordMatch()
    }
  },
)

// 비밀번호 확인 변경 감시
watch(
  () => formState.value.form.passwordConfirm,
  () => {
    if (formState.value.form.password) {
      checkPasswordMatch()
    }
  },
)
</script>

<style scoped>
.signup-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2.5rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.step-progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  position: relative;
  padding: 0 1rem;
}

.step-progress::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: #e2e8f0;
  z-index: 1;
}

.step {
  flex: 1;
  text-align: center;
  padding: 0.75rem 0;
  position: relative;
  z-index: 2;
  background: #fff;
  color: #94a3b8;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.step.active {
  color: #42b983;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.75rem;
}

.form-control {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #f8fafc;
}

.form-control:focus {
  border-color: #42b983;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
  background-color: #fff;
}

.error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
  font-weight: 500;
}

.password-validation {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  min-height: 120px;
  padding: 0.5rem;
  background-color: #f8fafc;
  border-radius: 8px;
}

.password-validation p {
  color: #ef4444;
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.password-validation p::before {
  content: '•';
  font-size: 1.2rem;
}

.password-validation p.valid {
  color: #42b983;
}

.password-match-container {
  min-height: 24px;
  margin-top: 0.75rem;
  padding: 0.5rem;
  background-color: #f8fafc;
  border-radius: 8px;
}

.password-match {
  display: block;
  font-size: 0.875rem;
  color: #ef4444;
  font-weight: 500;
}

.password-match.match {
  color: #42b983;
}

.btn {
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  width: 100%;
  margin-top: 1rem;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: #e2e8f0;
  transform: none;
  box-shadow: none;
}

.btn:disabled:hover {
  transform: none;
  box-shadow: none;
}

.btn-primary {
  background: #42b983;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3aa876;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.2);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}

.verification-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: #f8fafc;
  border-radius: 12px;
  text-align: center;
}

.verification-loading p {
  margin-top: 1rem;
  color: #475569;
  font-size: 1.1rem;
}

.verification-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
  background: #f8fafc;
  border-radius: 12px;
  text-align: center;
}

.verification-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 2rem;
  color: #42b983;
  animation: float 3s ease-in-out infinite;
}

.verification-content {
  width: 100%;
  max-width: 400px;
}

.verification-content h3 {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.verification-message {
  font-size: 1.1rem;
  color: #475569;
  margin-bottom: 2rem;
  line-height: 1.8;
}

.email-highlight {
  color: #42b983;
  font-weight: 600;
  background: rgba(66, 185, 131, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.verification-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.verification-actions .btn {
  width: 100%;
  max-width: 300px;
}

.resend-timer {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.verification-success {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #42b983;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.2);
  animation: slideUp 0.3s ease-out;
}

.verification-success svg {
  width: 20px;
  height: 20px;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.completion-container {
  text-align: center;
  padding: 3rem 2rem;
  background: #f8fafc;
  border-radius: 12px;
}

.completion-icon {
  width: 88px;
  height: 88px;
  margin: 0 auto 2rem;
  color: #42b983;
}

.completion-message {
  font-size: 1.25rem;
  color: #42b983;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.redirect-loader {
  margin-top: 1rem;
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
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  margin-top: 1.25rem;
}

.category-item {
  padding: 0.875rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  background: #fff;
}

.category-item:hover {
  border-color: #42b983;
  background-color: #f0fdf4;
  transform: translateY(-1px);
}

.category-item.selected {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.2);
}

.reading-info h3,
.categories h3 {
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
}

.reading-info label {
  display: block;
  margin-bottom: 0.75rem;
  color: #475569;
  font-weight: 500;
}

@media (max-width: 480px) {
  .signup-container {
    margin: 1rem;
    padding: 1.5rem;
  }

  .step-progress {
    margin-bottom: 2rem;
  }

  .step {
    font-size: 0.85rem;
  }

  .verification-container,
  .completion-container {
    padding: 1.5rem;
  }

  .category-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
