<template>
  <div class="signup-form">
    <form @submit.prevent="handleSubmit">
      <!-- Step 1: Email -->
      <div v-if="currentStep === 1">
        <h2>이메일 입력</h2>
        <div class="form-group">
          <input
            type="email"
            v-model="formData.email"
            placeholder="이메일"
            required
            class="form-control"
          />
        </div>
      </div>

      <!-- Step 2: Basic Info -->
      <div v-if="currentStep === 2">
        <h2>기본 정보 입력</h2>
        <div class="form-group">
          <input
            type="text"
            v-model="formData.lastName"
            placeholder="성"
            required
            class="form-control"
          />
        </div>
        <div class="form-group">
          <input
            type="text"
            v-model="formData.firstName"
            placeholder="이름"
            required
            class="form-control"
          />
        </div>
        <div class="form-group">
          <select v-model="formData.gender" required class="form-control">
            <option value="">성별 선택</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
            <option value="other">기타</option>
          </select>
        </div>
        <div class="form-group">
          <input
            type="text"
            v-model="formData.username"
            placeholder="사용자 이름"
            required
            class="form-control"
          />
        </div>
      </div>

      <!-- Step 3: Reading Info -->
      <div v-if="currentStep === 3">
        <h2>독서 정보 입력</h2>
        <div class="form-group">
          <input
            type="number"
            v-model="formData.weeklyReadTime"
            placeholder="주간 평균 독서 시간 (분)"
            class="form-control"
          />
        </div>
        <div class="form-group">
          <input
            type="number"
            v-model="formData.yearlyReadCount"
            placeholder="연간 독서량"
            class="form-control"
          />
        </div>
        <div class="form-group">
          <h3>관심 장르 선택 (최소 1개)</h3>
          <div class="categories-grid">
            <div v-for="category in categories" :key="category.id" class="category-item">
              <input
                type="checkbox"
                :id="'category-' + category.id"
                :value="category.id"
                v-model="formData.category_ids"
              />
              <label :for="'category-' + category.id">{{ category.name }}</label>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="form-actions">
        <button
          type="button"
          v-if="currentStep > 1"
          @click="currentStep--"
          class="btn btn-secondary"
        >
          이전
        </button>
        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          {{ isLoading ? '처리중...' : currentStep === 3 ? '회원가입' : '다음' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
  name: 'SignUpForm',
  setup() {
    const router = useRouter()
    const currentStep = ref(1)
    const isLoading = ref(false)
    const categories = ref([])

    const formData = reactive({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      username: '',
      gender: '',
      weeklyReadTime: null,
      yearlyReadCount: null,
      category_ids: [],
    })

    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/accounts/categories/')
        categories.value = response.data
      } catch (error) {
        console.error('카테고리 로딩 실패:', error)
      }
    }

    onMounted(() => {
      fetchCategories()
    })

    const handleSubmit = async () => {
      if (currentStep.value === 1) {
        isLoading.value = true
        try {
          // 이메일 인증 API 호출
          await axios.post('/api/accounts/register/', { email: formData.email })
          currentStep.value++
        } catch (error) {
          console.error('이메일 인증 실패:', error)
        } finally {
          isLoading.value = false
        }
      } else if (currentStep.value === 2) {
        currentStep.value++
      } else if (currentStep.value === 3) {
        if (formData.category_ids.length === 0) {
          alert('최소 하나의 관심 장르를 선택해주세요.')
          return
        }
        isLoading.value = true
        try {
          await axios.post('/api/accounts/profile-complete/', formData)
          router.push('/login')
        } catch (error) {
          console.error('회원가입 실패:', error)
        } finally {
          isLoading.value = false
        }
      }
    }

    return {
      currentStep,
      isLoading,
      formData,
      categories,
      handleSubmit,
    }
  },
}
</script>

<style scoped>
.signup-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
