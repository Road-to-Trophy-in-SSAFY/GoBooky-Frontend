import { defineStore } from 'pinia'
import axios from '@/services/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    access: null,
    refresh: null,
    isAuthenticated: false,
  }),
  actions: {
    async login(email, password) {
      const res = await axios.post('/auth/login/', { email, password })
      this.access = res.data.access
      this.refresh = res.data.refresh
      this.isAuthenticated = true
      this.user = { email } // 필요시 백엔드에서 유저 정보 반환하도록 개선 가능
    },
    logout() {
      this.user = null
      this.access = null
      this.refresh = null
      this.isAuthenticated = false
    },
    setUser(user) {
      this.user = user
      this.isAuthenticated = !!user
    },
  },
  persist: true,
})
