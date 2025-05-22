// 인증 관련 스토어
import { defineStore } from 'pinia'
import { authService } from '@/services/api'

export const useAuthStore = defineStore('auth', {
  // 상태 관리
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    categories: [],
    loading: false,
    error: null,
  }),

  // 게터
  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    getError: (state) => state.error,
    getCategories: (state) => state.categories,
  },

  // 액션
  actions: {
    // 로그인 액션
    async login(username, password) {
      this.loading = true
      this.error = null

      try {
        const response = await authService.login({ username, password })

        // JWT 토큰 저장 (key 이름 확인)
        const { access, refresh, user } = response.data
        this.token = access
        localStorage.setItem('token', access)
        localStorage.setItem('refresh_token', refresh)

        // 사용자 정보와 인증 상태 저장
        this.user = user
        this.isAuthenticated = true

        return true
      } catch (error) {
        this.error = error.response?.data?.detail || '로그인 중 오류가 발생했습니다.'
        return false
      } finally {
        this.loading = false
      }
    },

    // 회원가입 액션
    async register(userData) {
      this.loading = true
      this.error = null

      try {
        // FormData 생성 (프로필 이미지 같은 파일이 포함되어 있을 수 있음)
        const formData = new FormData()

        // userData의 모든 필드를 formData에 추가
        Object.keys(userData).forEach((key) => {
          if (key === 'categories') {
            // 카테고리는 배열이므로 각각 추가
            userData[key].forEach((categoryId, index) => {
              formData.append(`categories[${index}]`, categoryId)
            })
          } else if (key === 'profile_image' && userData[key] instanceof File) {
            // 파일 객체 추가
            formData.append(key, userData[key])
          } else {
            formData.append(key, userData[key])
          }
        })

        const response = await authService.register(formData)

        return true
      } catch (error) {
        this.error = error.response?.data || '회원가입 중 오류가 발생했습니다.'
        return false
      } finally {
        this.loading = false
      }
    },

    // 로그아웃 액션
    async logout() {
      try {
        await authService.logout()
      } catch (error) {
        console.error('로그아웃 오류:', error)
      } finally {
        // 로컬 스토리지 및 상태 초기화
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        this.user = null
        this.token = null
        this.isAuthenticated = false
      }
    },

    // 사용자 정보 가져오기
    async fetchUserInfo() {
      if (!localStorage.getItem('token')) return false

      this.loading = true

      try {
        const response = await authService.getUserInfo()
        this.user = response.data
        this.isAuthenticated = true
        return true
      } catch (error) {
        this.error =
          error.response?.data?.detail || '사용자 정보를 가져오는 중 오류가 발생했습니다.'
        this.isAuthenticated = false
        return false
      } finally {
        this.loading = false
      }
    },

    // 카테고리 목록 가져오기
    async fetchCategories() {
      this.loading = true

      try {
        const response = await authService.getCategories()
        this.categories = response.data
        return this.categories
      } catch (error) {
        this.error =
          error.response?.data?.detail || '카테고리 정보를 가져오는 중 오류가 발생했습니다.'
        return []
      } finally {
        this.loading = false
      }
    },

    // 인증 초기화 (새로고침시 호출)
    async initialize() {
      const token = localStorage.getItem('token')

      if (token) {
        this.token = token
        return this.fetchUserInfo()
      }

      return false
    },

    // 명시적인 토큰 리프레시 처리
    async refreshAccessToken() {
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          throw new Error('리프레시 토큰이 없습니다')
        }

        const response = await authService.refreshToken(refreshToken)
        const { access } = response.data

        // 새 액세스 토큰 저장
        this.token = access
        localStorage.setItem('token', access)

        return true
      } catch (error) {
        console.error('토큰 리프레시 실패:', error)
        // 실패 시 로그아웃 처리
        await this.logout()
        return false
      }
    },
  },

  // 상태 영속화
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'auth_store',
        storage: localStorage,
        paths: ['token', 'isAuthenticated'], // 민감한 정보인 user는 제외
      },
    ],
  },
})
