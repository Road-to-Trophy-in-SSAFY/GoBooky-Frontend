<template>
  <div class="profile-container">
    <h1>내 프로필</h1>

    <div v-if="isLoading" class="loading">로딩 중...</div>

    <div v-else-if="user" class="profile-info">
      <!-- 프로필 이미지 -->
      <div class="profile-image">
        <img :src="user.profile_image || '/default-profile.png'" alt="프로필 이미지" />
      </div>

      <!-- 사용자 정보 -->
      <div class="user-details">
        <h2>{{ user.username }}</h2>
        <p><strong>이메일:</strong> {{ user.email }}</p>
        <p><strong>성별:</strong> {{ user.gender === 'M' ? '남성' : '여성' }}</p>
        <p><strong>나이:</strong> {{ user.age }}세</p>
        <p><strong>연간 독서 권수:</strong> {{ user.annual_reading_count }}권</p>
        <p v-if="user.weekly_avg_reading_time">
          <strong>주간 평균 독서 시간:</strong> {{ user.weekly_avg_reading_time }}시간
        </p>

        <!-- 관심 장르 -->
        <div class="categories">
          <h3>관심 장르</h3>
          <ul>
            <li v-for="category in user.categories" :key="category.id">
              {{ category.name }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="error-message">
      <p>사용자 정보를 불러올 수 없습니다.</p>
      <button @click="loadUserData">다시 시도</button>
    </div>

    <!-- 로그아웃 버튼 -->
    <div class="actions">
      <button @click="logout" class="logout-btn">로그아웃</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/authStore'

// 라우터와 스토어 초기화
const router = useRouter()
const authStore = useAuthStore()

// 상태 가져오기
const isLoading = computed(() => authStore.loading)
const user = computed(() => authStore.user)

// 컴포넌트 마운트 시 사용자 데이터 로드
onMounted(() => {
  loadUserData()
})

// 사용자 데이터 로드 함수
const loadUserData = async () => {
  const success = await authStore.fetchUserInfo()
  if (!success) {
    // 인증 실패 시 로그인 페이지로
    router.push('/login')
  }
}

// 로그아웃 처리
const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
