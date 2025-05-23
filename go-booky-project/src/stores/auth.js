import { defineStore } from 'pinia'
import axios from '@/services/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, // 사용자 정보 객체
    access: null, // JWT access token
    refresh: null, // JWT refresh token
    isAuthenticated: false, // 인증 여부
  }),
  actions: {
    /**
     * 로그인: 성공 시 토큰 및 사용자 정보 저장, 실패 시 에러 처리
     * @param {string} email
     * @param {string} password
     */
    async login(email, password) {
      try {
        const res = await axios.post('/auth/login/', { email, password })
        this.access = res.data.access
        this.refresh = res.data.refresh
        this.isAuthenticated = true
        this.user = res.data.user || { email }
      } catch (error) {
        // 인증 실패 시 상태만 초기화, 불필요한 logout() 호출 제거
        this.user = null
        this.access = null
        this.refresh = null
        this.isAuthenticated = false
        throw error
      }
    },
    /**
     * 로그아웃: 모든 인증 정보 초기화
     */
    logout() {
      this.user = null
      this.access = null
      this.refresh = null
      this.isAuthenticated = false
    },
    /**
     * 사용자 정보 수동 설정 (내부 전용)
     * @param {object} user
     */
    _setUser(user) {
      this.user = user
      this.isAuthenticated = Boolean(user)
    },
  },
  persist: true,
})
