import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Django 백엔드 주소
  withCredentials: true, // 쿠키를 주고받기 위해 필요
})

// 토큰 갱신 중인지 확인하는 플래그
let isRefreshing = false
// 갱신 대기 중인 요청들을 저장하는 배열
let refreshSubscribers = []

// 갱신 대기 중인 요청들을 처리하는 함수
const onRefreshed = (accessToken) => {
  refreshSubscribers.forEach((callback) => callback(accessToken))
  refreshSubscribers = []
}

// 갱신 대기 중인 요청을 추가하는 함수
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback)
}

// 쿠키에서 특정 이름의 값을 가져오는 함수
function getCookie(name) {
  let cookieValue = null
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}

// 요청 인터셉터
instance.interceptors.request.use(
  async (config) => {
    const authStore = useAuthStore()
    // 인증된 상태지만 accessToken이 없는 경우, 세션 쿠키로 토큰 갱신 시도
    if (authStore.isAuthenticated && !authStore.accessToken && config.url !== '/auth/refresh/') {
      try {
        await authStore.refreshToken()
      } catch {
        // 갱신 실패 시는 로그아웃 처리
        authStore.$reset()
        return config
      }
    }
    if (authStore.accessToken && config.url !== '/auth/refresh/') {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
      console.log(
        '[AXIOS][REQ] Authorization 헤더 추가:',
        config.headers.Authorization,
        'URL:',
        config.url,
      )
    } else {
      console.log(
        '[AXIOS][REQ] Authorization 헤더 없음. URL:',
        config.url,
        'accessToken:',
        authStore.accessToken,
      )
    }

    // POST, PUT, PATCH, DELETE 요청에 CSRF 토큰 추가
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method.toUpperCase())) {
      const csrfToken = getCookie('csrftoken')
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 응답 인터셉터
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore()

    if (error.response?.status === 401 && originalRequest.url === '/auth/logout/') {
      console.log('Logout 401 error. Resetting auth state.')
      authStore.$reset()
      return Promise.reject(error)
    }

    if (
      error.response?.status === 401 &&
      authStore.isAuthenticated &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh/'
    ) {
      originalRequest._retry = true
      try {
        const success = await authStore.refreshToken()
        if (success && authStore.accessToken) {
          // PATCH/PUT/POST/GET 등 모든 요청에서 헤더가 undefined일 수 있으므로 항상 객체로 초기화
          if (!originalRequest.headers || typeof originalRequest.headers !== 'object') {
            originalRequest.headers = {}
          }
          // Authorization 헤더 명확하게 덮어쓰기
          originalRequest.headers['Authorization'] = `Bearer ${authStore.accessToken}`
          console.log('[AXIOS][RES] 401 → refresh 성공, 원래 요청 재시도:', originalRequest.url)
          return instance(originalRequest)
        } else {
          throw new Error('Token refresh did not provide new access token')
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        authStore.$reset()
        return Promise.reject(refreshError)
      }
    }

    if (error.response) {
      console.error('Server error:', error.response.data, error.response.status)
      if (
        error.response.status === 401 &&
        originalRequest.url !== '/auth/refresh/' &&
        originalRequest.url !== '/auth/logout/'
      ) {
        console.log('Received 401 for non-auth endpoint. Resetting auth state.')
        authStore.$reset()
      }
    } else if (error.request) {
      console.error('Network error:', error.request)
    } else {
      console.error('Request setup error:', error.message)
    }

    return Promise.reject(error)
  },
)

export default instance
