<template>
  <div class="profile-container">
    <div class="profile-header-bar">
      <button class="home-btn" @click="goHome">🏠 홈으로</button>
      <h2>마이페이지</h2>
    </div>

    <div v-if="loading" class="loading">프로필 정보를 불러오는 중...</div>

    <div v-else-if="profile" class="profile-details">
      <div class="profile-header">
        <img
          :src="profile.profile_picture_url || '/media/profile_pictures/default-profile.jpg'"
          alt="프로필 사진"
          class="profile-picture"
        />
        <div class="profile-header-info">
          <h3>{{ profile.username }}</h3>
          <div class="follow-info">
            <span>팔로워 {{ profile.followers_count }}</span>
            <span>·</span>
            <span>팔로잉 {{ profile.following_count }}</span>
          </div>
          <button
            v-if="auth.user && profile.username !== auth.user.username"
            @click="toggleFollow"
            class="follow-button"
          >
            {{ profile.is_following ? '팔로우 해제' : '팔로우' }}
          </button>
        </div>
      </div>

      <div v-if="!isEditing" class="view-mode">
        <p><strong>이메일:</strong> {{ profile.email }}</p>
        <p><strong>이름:</strong> {{ profile.last_name + profile.first_name }}</p>
        <p><strong>성별:</strong> {{ genderToKorean(profile.gender) }}</p>
        <p><strong>주간 평균 독서 시간:</strong> {{ profile.weekly_read_time || '미입력' }} 시간</p>
        <p><strong>연간 독서량:</strong> {{ profile.yearly_read_count || '미입력' }} 권</p>
        <p>
          <strong>관심 장르:</strong>
          {{
            profile.categories && profile.categories.length > 0
              ? profile.categories.map((cat) => cat.name).join(', ')
              : '미입력'
          }}
        </p>
        <button
          v-if="auth.user && profile.username === auth.user.username"
          @click="startEditing"
          class="edit-button"
        >
          프로필 수정
        </button>
      </div>

      <div v-else class="edit-mode">
        <div class="form-group">
          <label for="profile_picture">프로필 사진:</label>
          <input type="file" id="profile_picture" @change="handleProfilePictureChange" />
          <span v-if="profilePictureError" class="error">{{ profilePictureError }}</span>
        </div>

        <div class="form-group">
          <label for="weekly_read_time">주간 평균 독서 시간 (시간):</label>
          <input
            type="number"
            id="weekly_read_time"
            v-model.number="editableProfile.weekly_read_time"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="yearly_read_count">연간 독서량 (권):</label>
          <input
            type="number"
            id="yearly_read_count"
            v-model.number="editableProfile.yearly_read_count"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="categories">관심 장르:</label>
          <div class="category-grid">
            <div
              v-for="category in allCategories"
              :key="category.id"
              :class="[
                'category-item',
                {
                  selected:
                    editableProfile.category_ids &&
                    editableProfile.category_ids.includes(category.id),
                },
              ]"
              @click="toggleCategory(category.id)"
            >
              {{ category.name }}
            </div>
          </div>
          <span v-if="categoriesError" class="error">{{ categoriesError }}</span>
        </div>

        <div class="edit-btn-group">
          <button @click="saveProfile" class="save-button">저장</button>
          <button @click="cancelEditing" class="cancel-button">취소</button>
        </div>
      </div>
    </div>

    <div v-else class="error-message">프로필 정보를 불러오지 못했습니다.</div>

    <Modal v-if="modalText" :text="modalText" @close="modalText = ''" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/services/axios'
import Modal from '@/components/ui/Modal.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const profile = ref(null)
const editableProfile = ref({})
const isEditing = ref(false)
const loading = ref(true)
const modalText = ref('')
const allCategories = ref([])
const profilePictureFile = ref(null)
const profilePictureError = ref('')
const categoriesError = ref('')

let logStep = 1
function log(msg, ...args) {
  const now = new Date().toISOString().slice(11, 23) // HH:MM:SS.mmm
  console.log(`[${now}][ProfileView][${logStep++}] ${msg}`, ...args)
}

const fetchProfile = async () => {
  const username = route.params.username
  log('fetchProfile 호출. username:', username)
  if (!username) {
    modalText.value = '사용자 정보를 찾을 수 없습니다.'
    loading.value = false
    if (!auth.isAuthenticated) {
      log('username 없음, 로그인 페이지로 이동')
      router.push({ name: 'Login' })
    }
    return
  }
  try {
    loading.value = true
    const res = await axios.get(`/auth/profile/${username}/`)
    log('fetchProfile 성공:', res.data)
    profile.value = res.data
    editableProfile.value = { ...res.data, category_ids: res.data.categories.map((cat) => cat.id) }
  } catch (err) {
    log('fetchProfile 실패:', err)
    if (err.response?.status === 401 && !auth.isAuthenticated) {
      modalText.value = '로그인이 필요합니다.'
      log('401 에러, 로그인 페이지로 이동')
      router.push({ name: 'Login' })
    } else {
      handleError(err, '프로필 정보를 불러오는 데 실패했습니다.')
    }
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const res = await axios.get('/auth/categories/')
    log('fetchCategories 성공:', res.data)
    allCategories.value = res.data
  } catch (err) {
    log('fetchCategories 실패:', err)
    handleError(err, '카테고리 정보를 불러오는 데 실패했습니다.')
  }
}

const fetchData = async () => {
  log('fetchData 호출. isAuthenticated:', auth.isAuthenticated, 'accessToken:', auth.accessToken)
  if (auth.isAuthenticated && auth.accessToken) {
    log('인증 상태 OK, fetchProfile & fetchCategories 호출')
    await fetchProfile()
    await fetchCategories()
  } else {
    log('인증 상태 불충분, 데이터 fetch 스킵')
  }
}

const startEditing = () => {
  isEditing.value = true
  editableProfile.value = {
    weekly_read_time: profile.value.weekly_read_time,
    yearly_read_count: profile.value.yearly_read_count,
    category_ids: profile.value.categories.map((cat) => cat.id),
  }
  profilePictureFile.value = null
  profilePictureError.value = ''
  categoriesError.value = ''
}

const cancelEditing = () => {
  isEditing.value = false
  profilePictureFile.value = null
  profilePictureError.value = ''
  categoriesError.value = ''
}

const handleProfilePictureChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
      profilePictureError.value = '이미지 파일만 업로드 가능합니다.'
      profilePictureFile.value = null
    } else if (file.size > 5 * 1024 * 1024) {
      profilePictureError.value = '파일 크기가 5MB를 초과합니다.'
      profilePictureFile.value = null
    } else {
      profilePictureError.value = ''
      profilePictureFile.value = file
    }
  } else {
    profilePictureError.value = ''
    profilePictureFile.value = null
  }
}

const toggleCategory = (categoryId) => {
  if (!editableProfile.value.category_ids) {
    editableProfile.value.category_ids = []
  }
  const index = editableProfile.value.category_ids.indexOf(categoryId)
  if (index === -1) {
    editableProfile.value.category_ids.push(categoryId)
  } else {
    editableProfile.value.category_ids.splice(index, 1)
  }
  if (editableProfile.value.category_ids.length > 0) {
    categoriesError.value = ''
  }
}

const saveProfile = async () => {
  if (!editableProfile.value.category_ids || editableProfile.value.category_ids.length === 0) {
    categoriesError.value = '최소 하나의 관심 장르를 선택해주세요.'
    return
  }

  const formData = new FormData()

  if (editableProfile.value.weekly_read_time !== profile.value.weekly_read_time) {
    formData.append('weekly_read_time', editableProfile.value.weekly_read_time)
  }
  if (editableProfile.value.yearly_read_count !== profile.value.yearly_read_count) {
    formData.append('yearly_read_count', editableProfile.value.yearly_read_count)
  }

  const currentCategoryIds = profile.value.categories.map((cat) => cat.id).sort()
  const newCategoryIds = editableProfile.value.category_ids.sort()

  if (JSON.stringify(currentCategoryIds) !== JSON.stringify(newCategoryIds)) {
    editableProfile.value.category_ids.forEach((id) => {
      formData.append('category_ids', id)
    })
  }

  if (profilePictureFile.value) {
    formData.append('profile_picture', profilePictureFile.value)
  }

  if (formData.entries().next().done && !profilePictureFile.value) {
    modalText.value = '변경된 정보가 없습니다.'
    isEditing.value = false
    return
  }

  try {
    const res = await axios.patch(`/auth/profile/${profile.value.username}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    profile.value = res.data
    isEditing.value = false
    modalText.value = '프로필 정보가 수정되었습니다.'
    profilePictureFile.value = null
  } catch (err) {
    handleError(err, '프로필 정보 수정에 실패했습니다.')
  }
}

const toggleFollow = async () => {
  try {
    const res = await axios.post(`/auth/profile/${profile.value.username}/follow/`)
    profile.value.is_following = res.data.is_following
    profile.value.followers_count = res.data.followers_count
    modalText.value = res.data.is_following ? '팔로우 했습니다.' : '팔로우를 해제했습니다.'
  } catch (err) {
    handleError(err, '팔로우 처리에 실패했습니다.')
  }
}

function handleError(err, fallbackMsg = '오류가 발생했습니다.') {
  console.error(err)
  if (err.response && err.response.data) {
    if (err.response.data.weekly_read_time) {
      modalText.value = `주간 평균 독서 시간: ${err.response.data.weekly_read_time[0]}`
    } else if (err.response.data.yearly_read_count) {
      modalText.value = `연간 독서량: ${err.response.data.yearly_read_count[0]}`
    } else if (err.response.data.category_ids) {
      categoriesError.value = `관심 장르: ${err.response.data.category_ids[0]}`
      modalText.value = '프로필 정보 수정에 실패했습니다.'
    } else if (err.response.data.profile_picture) {
      profilePictureError.value = `프로필 사진: ${err.response.data.profile_picture[0]}`
      modalText.value = '프로필 정보 수정에 실패했습니다.'
    } else {
      modalText.value =
        err.response.data.detail || Object.values(err.response.data).flat().join(' ') || fallbackMsg
    }
  } else {
    modalText.value = err.message || fallbackMsg
  }
}

// 성별 한글 변환 함수
function genderToKorean(gender) {
  if (gender === 'male') return '남성'
  if (gender === 'female') return '여성'
  return gender || '미입력'
}

const goHome = () => {
  router.push('/')
}

onMounted(async () => {
  log('onMounted: isAuthenticated:', auth.isAuthenticated, 'accessToken:', auth.accessToken)
  if (auth.isAuthenticated && !auth.accessToken) {
    log('accessToken 없음, refreshToken 시도')
    const refreshed = await auth.refreshToken()
    log('refreshToken 결과:', refreshed, 'accessToken:', auth.accessToken)
    if (refreshed && auth.accessToken) {
      await fetchData()
    } else {
      log('refresh 실패, 로그인 페이지로 이동')
      router.push({ name: 'Login' })
    }
  } else {
    log('fetchData 바로 호출')
    await fetchData()
  }
})

watch(
  () => auth.isAuthenticated,
  (newVal, oldVal) => {
    console.log('ProfileView: isAuthenticated changed from', oldVal, 'to', newVal)
    if (newVal === true) {
      console.log('ProfileView: Authenticated state became true, fetching data.')
      fetchData()
    } else if (oldVal === true && newVal === false) {
      console.log(
        'ProfileView: Authenticated state became false. Profile data may become unavailable.',
      )
      profile.value = null
      editableProfile.value = {}
      isEditing.value = false
    }
  },
)

watch(
  () => route.params.username,
  (newUsername, oldUsername) => {
    console.log('ProfileView: username route param changed from', oldUsername, 'to', newUsername)
    if (newUsername && newUsername !== oldUsername) {
      if (auth.isAuthenticated && auth.accessToken) {
        console.log('ProfileView: username changed, fetching profile.')
        fetchProfile()
      } else {
        console.log('ProfileView: username changed but not authenticated, skipping profile fetch.')
      }
    }
  },
)
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2.5rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.profile-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.home-btn {
  background: #f7f7f7;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.home-btn:hover {
  background: #eaeaea;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.profile-header-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-picture {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1.5rem;
  border: 2px solid #e2e8f0;
  background-color: #f8fafc;
}

.profile-header h3 {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
}

.view-mode p {
  margin-bottom: 1rem;
  color: #475569;
  font-size: 1rem;
  line-height: 1.6;
}

.view-mode p strong {
  color: #1e293b;
  display: inline-block;
  width: 180px;
  font-weight: 600;
}

.edit-mode {
  background: #f8fafc;
  border-radius: 12px;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.7rem;
  color: #1e293b;
  font-weight: 600;
  font-size: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  color: #1e293b;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: #42b983;
  outline: none;
  background-color: #f8fafc;
}

.edit-mode .form-group input[type='file'] {
  padding: 0.7rem 0;
  border: none;
  background-color: transparent;
}

.edit-mode .form-group input[type='file']::file-selector-button {
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background-color: #e2e8f0;
  color: #1e293b;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.edit-mode .form-group input[type='file']::file-selector-button:hover {
  background-color: #cbd5e0;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.category-item {
  padding: 0.75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  background: #fff;
  font-size: 0.9rem;
  color: #1e293b;
}

.category-item:hover {
  border-color: #42b983;
  background-color: #f0fdf4;
}

.category-item.selected {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}

.edit-btn-group {
  display: flex;
  gap: 1.2rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
}

.edit-button,
.save-button,
.cancel-button {
  display: inline-block;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 1rem;
}

.edit-button {
  background: #42b983;
  color: white;
}

.edit-button:hover {
  background: #3aa876;
}

.save-button {
  background: #007bff;
  color: white;
}

.save-button:hover {
  background: #0056b3;
}

.cancel-button {
  background: #6c757d;
  color: white;
}

.cancel-button:hover {
  background: #545b62;
}

.error {
  color: #dc3545;
  font-size: 0.93rem;
  margin-top: 0.5rem;
  display: block;
}

.follow-info {
  margin-top: 0.5rem;
  color: #64748b;
  font-size: 0.95rem;
}

.follow-button {
  margin-top: 0.7rem;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  border: none;
  background: #42b983;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.follow-button:hover {
  background: #3aa876;
}
</style>
