<template>
  <div class="register-container">
    <h1>회원가입</h1>

    <!-- 에러 메시지 -->
    <div v-if="typeof error === 'object'" class="error-message">
      <ul>
        <li v-for="(errors, field) in error" :key="field">
          <strong>{{ field }}:</strong> {{ errors.join(', ') }}
        </li>
      </ul>
    </div>
    <div v-else-if="error" class="error-message">{{ error }}</div>

    <!-- 회원가입 폼 -->
    <form @submit.prevent="submitRegister">
      <!-- 기본 정보 -->
      <div class="form-group">
        <label for="username">아이디*</label>
        <input
          type="text"
          id="username"
          v-model="registerForm.username"
          required
          placeholder="아이디를 입력하세요"
        />
      </div>

      <div class="form-group">
        <label for="email">이메일*</label>
        <input
          type="email"
          id="email"
          v-model="registerForm.email"
          required
          placeholder="이메일을 입력하세요"
        />
      </div>

      <div class="form-group">
        <label for="password1">비밀번호*</label>
        <input
          type="password"
          id="password1"
          v-model="registerForm.password1"
          required
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      <div class="form-group">
        <label for="password2">비밀번호 확인*</label>
        <input
          type="password"
          id="password2"
          v-model="registerForm.password2"
          required
          placeholder="비밀번호를 다시 입력하세요"
        />
      </div>

      <!-- 추가 정보 -->
      <div class="form-group">
        <label for="gender">성별*</label>
        <select id="gender" v-model="registerForm.gender" required>
          <option value="">성별을 선택하세요</option>
          <option value="M">남성</option>
          <option value="F">여성</option>
        </select>
      </div>

      <div class="form-group">
        <label for="age">나이*</label>
        <input
          type="number"
          id="age"
          v-model.number="registerForm.age"
          required
          min="1"
          placeholder="나이를 입력하세요"
        />
      </div>

      <div class="form-group">
        <label for="annual_reading_count">연간 독서 권수*</label>
        <input
          type="number"
          id="annual_reading_count"
          v-model.number="registerForm.annual_reading_count"
          required
          min="0"
          placeholder="연간 독서 권수를 입력하세요"
        />
      </div>

      <div class="form-group">
        <label for="weekly_avg_reading_time">주간 평균 독서 시간(시간 단위)</label>
        <input
          type="number"
          id="weekly_avg_reading_time"
          v-model.number="registerForm.weekly_avg_reading_time"
          min="0"
          placeholder="주간 평균 독서 시간을 입력하세요"
        />
      </div>

      <!-- 관심 장르 -->
      <div class="form-group">
        <label>관심 장르*</label>
        <div class="categories-container">
          <div v-for="category in categories" :key="category.id" class="category-checkbox">
            <input
              type="checkbox"
              :id="'category-' + category.id"
              :value="category.id"
              v-model="registerForm.categories"
            />
            <label :for="'category-' + category.id">{{ category.name }}</label>
          </div>
        </div>
      </div>

      <!-- 프로필 이미지 -->
      <div class="form-group">
        <label for="profile_image">프로필 이미지</label>
        <input type="file" id="profile_image" @change="handleFileUpload" accept="image/*" />
        <img v-if="imagePreview" :src="imagePreview" class="image-preview" />
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? '가입 처리 중...' : '회원가입' }}
        </button>
        <div class="form-links">
          <RouterLink to="/login">이미 계정이 있으신가요?</RouterLink>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/authStore'
import { authService } from '@/services/api'

// 라우터와 스토어 초기화
const router = useRouter()
const authStore = useAuthStore()

// 회원가입 폼 데이터
const registerForm = ref({
  username: '',
  email: '',
  password1: '',
  password2: '',
  gender: '',
  age: null,
  annual_reading_count: null,
  weekly_avg_reading_time: null,
  categories: [],
  profile_image: null,
})

// 상태 가져오기
const isLoading = computed(() => authStore.loading)
const error = computed(() => authStore.error)
const categories = ref([])
const imagePreview = ref(null)

// 카테고리 데이터 가져오기
onMounted(async () => {
  try {
    const response = await authService.getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('카테고리를 가져오는 중 오류 발생:', error)
  }
})

// 파일 업로드 처리
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    registerForm.value.profile_image = file

    // 이미지 미리보기
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 회원가입 제출 처리
const submitRegister = async () => {
  if (validateForm()) {
    const success = await authStore.register(registerForm.value)

    if (success) {
      // 가입 성공 후 로그인 페이지로 이동
      router.push('/login')
    }
  }
}

// 폼 유효성 검사
const validateForm = () => {
  // 필수 필드 확인
  if (
    !registerForm.value.username ||
    !registerForm.value.email ||
    !registerForm.value.password1 ||
    !registerForm.value.password2 ||
    !registerForm.value.gender ||
    !registerForm.value.age ||
    !registerForm.value.annual_reading_count ||
    !registerForm.value.categories.length
  ) {
    authStore.error = '필수 입력 항목을 모두 입력해주세요.'
    return false
  }

  // 비밀번호 일치 확인
  if (registerForm.value.password1 !== registerForm.value.password2) {
    authStore.error = '비밀번호가 일치하지 않습니다.'
    return false
  }

  return true
}
</script>
