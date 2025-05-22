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
        <input v-model="form.username" name="username" placeholder="닉네임" />
        <span v-if="errors.username">{{ errors.username }}</span>
        <input v-model="form.first_name" name="first_name" placeholder="이름" />
        <span v-if="errors.first_name">{{ errors.first_name }}</span>
        <input v-model="form.last_name" name="last_name" placeholder="성" />
        <span v-if="errors.last_name">{{ errors.last_name }}</span>
      </div>
      <div v-else-if="step === 1">
        <p>이메일로 인증 메일이 발송되었습니다.<br />메일함을 확인해주세요.</p>
        <button type="button" @click="resendEmail" :disabled="resendDisabled">재전송</button>
        <span v-if="resendDisabled">({{ resendTimer }}초 후 재전송 가능)</span>
        <button type="button" @click="checkEmailVerified">이메일 인증 확인</button>
        <span v-if="emailVerified" style="color: #42b983; font-weight: bold">인증 완료</span>
      </div>
      <div v-else-if="step === 2">
        <input v-model="form.username" name="username" placeholder="닉네임" />
        <span v-if="errors.username">{{ errors.username }}</span>
        <input v-model="form.first_name" name="first_name" placeholder="이름" />
        <span v-if="errors.first_name">{{ errors.first_name }}</span>
        <input v-model="form.last_name" name="last_name" placeholder="성" />
        <span v-if="errors.last_name">{{ errors.last_name }}</span>
      </div>
      <div v-else-if="step === 3">
        <p>회원가입이 완료되었습니다! 온보딩을 시작하세요.</p>
      </div>
      <div class="actions">
        <button v-if="step < 3" type="submit">다음</button>
      </div>
    </form>
    <Modal v-if="modalText" :text="modalText" @close="modalText = ''" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as yup from 'yup'
import Modal from '../ui/Modal.vue'
import axios from '@/services/axios'

const step = ref(0)
const stepLabels = ['계정 생성', '이메일 인증', '프로필 설정', '완료']
const form = ref({
  email: '',
  password: '',
  username: '',
  first_name: '',
  last_name: '',
})
const modalText = ref('')
const resendDisabled = ref(false)
const resendTimer = ref(60)
let resendInterval = null
const errors = ref({})
const emailVerified = ref(false)
const emailVerifyUUID = ref('')

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
    username: yup.string().min(2).max(20).required('필수 입력'),
    first_name: yup.string().min(1).max(20).required('필수 입력'),
    last_name: yup.string().min(1).max(20).required('필수 입력'),
  }),
  yup.object({
    username: yup.string().min(2).max(20).required('필수 입력'),
    first_name: yup.string().min(1).max(20).required('필수 입력'),
    last_name: yup.string().min(1).max(20).required('필수 입력'),
  }),
]

const handleNext = async () => {
  errors.value = {}
  if (step.value === 0) {
    try {
      await schemas[0].validate(form.value, { abortEarly: false })
      // 1단계: 모든 정보(이름, 성 포함)를 백엔드에 전달해 uuid만 발급받음(DB 저장 X)
      const res = await axios.post('/auth/register/', {
        email: form.value.email,
        password: form.value.password,
        username: form.value.username,
        first_name: form.value.first_name,
        last_name: form.value.last_name,
      })
      if (res.data && res.data.uuid) {
        emailVerifyUUID.value = res.data.uuid
      }
      modalText.value = '이메일로 인증 링크가 발송되었습니다. 메일함을 확인해주세요.'
      step.value = 1
      startResendTimer()
    } catch (err) {
      if (err.name === 'ValidationError') {
        err.inner.forEach((e) => {
          errors.value[e.path] = e.message
        })
      } else if (err.response && err.response.data) {
        modalText.value = Object.values(err.response.data).flat().join(' ')
      } else {
        modalText.value = err.response?.data?.detail || '회원가입 실패: ' + err.message
      }
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
      await schemas[1].validate(form.value, { abortEarly: false })
      // 마지막 단계에서 uuid와 함께 모든 정보 전송(DB 저장)
      await axios.patch('/auth/register/complete/', {
        uuid: emailVerifyUUID.value,
        username: form.value.username,
        first_name: form.value.first_name,
        last_name: form.value.last_name,
      })
      step.value = 3
      modalText.value = '회원가입이 완료되었습니다!'
    } catch (err) {
      if (err.name === 'ValidationError') {
        err.inner.forEach((e) => {
          errors.value[e.path] = e.message
        })
      } else if (err.response && err.response.data) {
        modalText.value = Object.values(err.response.data).flat().join(' ')
      } else {
        modalText.value = err.response?.data?.detail || '프로필 설정 실패: ' + err.message
      }
    }
  }
}

// 이메일 인증 확인 함수 (API 호출)
async function checkEmailVerified() {
  if (!emailVerifyUUID.value) {
    modalText.value = '인증 UUID가 없습니다. 다시 시도해주세요.'
    return
  }
  try {
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
    modalText.value = err.response?.data?.detail || '인증 확인 중 오류가 발생했습니다.'
  }
}

// 재전송 함수
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
    modalText.value = err.response?.data?.detail || '이메일 재발송 중 오류가 발생했습니다.'
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
</script>

<style scoped>
.signup-container {
  max-width: 400px;
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
</style>
