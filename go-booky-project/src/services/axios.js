import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Django 백엔드 주소
  withCredentials: true, // 필요시 쿠키 인증 등
})

// 요청 인터셉터: access 토큰이 있으면 Authorization 헤더에 자동 첨부
instance.interceptors.request.use(
  (config) => {
    // Pinia store에서 access 토큰을 가져옴
    try {
      const auth = useAuthStore()
      if (auth.access) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${auth.access}`
      }
    } catch (e) {
      // Pinia store를 사용할 수 없는 환경(예: SSR)에서는 무시
    }
    return config
  },
  (error) => Promise.reject(error),
)

export default instance
