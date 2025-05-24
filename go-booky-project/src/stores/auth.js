import { defineStore } from 'pinia'
import axios from '@/services/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    rememberMe: false,
    accessToken: null,
  }),
  actions: {
    /**
     * 로그인: 성공 시 토큰 및 사용자 정보 저장, 실패 시 에러 처리
     * @param {string} email
     * @param {string} password
     */
    async login(email, password, rememberMe = false) {
      this.isLoading = true
      this.error = null
      this.rememberMe = rememberMe
      try {
        const res = await axios.post('/auth/login/', { email, password })
        this.user = res.data.user
        this.isAuthenticated = true
        this.accessToken = res.data.access
      } catch (error) {
        this.user = null
        this.isAuthenticated = false
        this.accessToken = null
        this.error = error.response?.data?.detail || '로그인에 실패했습니다.'
      } finally {
        this.isLoading = false
      }
    },
    /**
     * 로그아웃: 모든 인증 정보 초기화
     */
    async logout() {
      this.isLoading = true
      this.error = null
      try {
        await axios.post('/auth/logout/')
      } catch (error) {
        this.error = error.response?.data?.detail || '로그아웃에 실패했습니다.'
      } finally {
        this.$reset()
      }
    },
    /**
     * 사용자 정보 수동 설정 (내부 전용)
     * @param {object} user
     */
    _setUser(user) {
      this.user = user
      this.isAuthenticated = Boolean(user)
    },
    async checkAuth() {
      console.log('checkAuth called. isAuthenticated:', this.isAuthenticated)
      if (!this.isAuthenticated) {
        console.log('checkAuth: Not authenticated, skipping refresh.')
        this.accessToken = null
        return false
      }

      if (this.isLoading) {
        console.log('checkAuth: Already loading, skipping refresh.')
        return false
      }

      this.isLoading = true
      this.error = null
      try {
        console.log('checkAuth: Attempting to refresh token.')
        const refreshRes = await axios.post('/auth/refresh/')
        console.log('checkAuth: Refresh successful.', refreshRes.data)
        this.user = refreshRes.data.user
        this.isAuthenticated = true
        this.accessToken = refreshRes.data.access
        return true
      } catch (error) {
        console.log('checkAuth: Refresh failed.', error.response?.status, error.message)
        if (error.response?.status === 401) {
          console.log('checkAuth: Received 401, resetting auth state.')
          this.$reset()
        } else {
          this.error = error.response?.data?.detail || '인증 상태 확인에 실패했습니다.'
          console.error('checkAuth: Other error:', error)
        }
        return false
      } finally {
        this.isLoading = false
      }
    },
    async refreshToken() {
      console.log('refreshToken called. isAuthenticated:', this.isAuthenticated)
      if (!this.isAuthenticated || this.isLoading) {
        console.log('refreshToken: Skipping due to not authenticated or loading.')
        this.accessToken = null
        return false
      }

      this.isLoading = true
      this.error = null
      try {
        console.log('refreshToken: Attempting refresh via standalone call.')
        const res = await axios.post('/auth/refresh/')
        console.log('refreshToken: Standalone refresh successful.', res.data)
        this.user = res.data.user
        this.isAuthenticated = true
        this.accessToken = res.data.access
        return true
      } catch (error) {
        console.log(
          'refreshToken: Standalone refresh failed.',
          error.response?.status,
          error.message,
        )
        if (error.response?.status === 401) {
          console.log('refreshToken: Received 401, resetting auth state.')
          this.$reset()
        } else {
          this.error =
            error.response?.data?.detail || '토큰 갱신에 실패했습니다. 다시 로그인해주세요.'
          console.error('refreshToken: Other error:', error)
        }
        this.accessToken = null
        return false
      } finally {
        this.isLoading = false
      }
    },
    clearError() {
      this.error = null
    },
    setRememberMe(value) {
      this.rememberMe = value
    },
    $reset() {
      this.user = null
      this.isAuthenticated = false
      this.isLoading = false
      this.error = null
      this.rememberMe = false
      this.accessToken = null
      console.log('Auth state reset.')
    },
  },
  persist: {
    storage: localStorage,
    paths: ['user', 'isAuthenticated', 'rememberMe'],
    serializer: {
      serialize: (state) =>
        JSON.stringify({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          rememberMe: state.rememberMe,
        }),
      deserialize: (data) => JSON.parse(data),
    },
  },
})
