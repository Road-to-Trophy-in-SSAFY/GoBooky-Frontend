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
  (config) => {
    const authStore = useAuthStore()
    // Access Token이 존재하고, refresh 요청이 아닌 경우에만 Authorization 헤더 추가
    // isAuthenticated 여부와 관계없이 토큰이 있다면 헤더 추가 시도
    if (authStore.accessToken && config.url !== '/auth/refresh/') {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
      console.log(
        `Axios Request Interceptor: Setting Authorization header: Bearer ${authStore.accessToken.substring(0, 10)}...`,
      ) // 로그 추가
    } else {
      console.log(
        `Axios Request Interceptor: No Authorization header set for ${config.url}. Access Token: ${authStore.accessToken ? 'Exists' : 'Null'}`,
      ) // 로그 추가
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

    // 로그아웃 요청에서 발생한 401 에러는 무한 루프 방지 및 상태 초기화
    if (error.response?.status === 401 && originalRequest.url === '/auth/logout/') {
      console.log('Logout 401 error. Resetting auth state.') // 로그 추가
      authStore.$reset()
      // 라우팅 처리는 authStore 내부 또는 컴포넌트에서 담당
      return Promise.reject(error)
    }

    // 토큰 만료로 인한 401 에러이고, 로그인 상태인 경우에만 토큰 갱신 시도
    // 이미 재시도한 요청이 아니고, refresh 요청 자체가 아닌 경우에만 갱신 시도
    if (
      error.response?.status === 401 &&
      authStore.isAuthenticated &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh/'
    ) {
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 대기
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((accessToken) => {
            if (accessToken) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`
              resolve(instance(originalRequest))
            } else {
              // 토큰 갱신 실패 시
              reject(new Error('Token refresh failed during retry'))
            }
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // authStore의 refreshToken 호출 (새 Access Token 및 user 정보 포함)
        const success = await authStore.refreshToken() // authStore.refreshToken은 성공 시 true 반환, 실패 시 false 또는 에러 throw

        if (success && authStore.accessToken) {
          // refreshToken 성공 및 새 Access Token 존재 확인
          isRefreshing = false
          // 갱신된 Access Token으로 대기 중 요청 처리
          onRefreshed(authStore.accessToken)
          // 현재 요청 헤더 업데이트 및 재시도
          originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`
          return instance(originalRequest)
        } else {
          // refreshToken 실패 또는 새 Access Token 받지 못한 경우
          throw new Error('Token refresh did not provide new access token')
        }
      } catch (refreshError) {
        isRefreshing = false
        onRefreshed(null) // 대기 중 요청들에게 실패 알림
        console.error('Token refresh failed:', refreshError)
        // 토큰 갱신 실패 시 인증 상태 초기화. 라우팅 처리는 authStore 내부 또는 컴포넌트에서 담당
        authStore.$reset()
        return Promise.reject(refreshError)
      }
    }

    // 기타 에러 응답 처리 (로그아웃 401, 토큰 갱신 401 제외)
    if (error.response) {
      console.error('Server error:', error.response.data, error.response.status)
      // 401 에러 중 refresh/logout 요청이 아닌 경우 (만료된 access token 사용 등)에만 상태 초기화 고려
      if (
        error.response.status === 401 &&
        originalRequest.url !== '/auth/refresh/' &&
        originalRequest.url !== '/auth/logout/'
      ) {
        console.log('Received 401 for non-auth endpoint. Resetting auth state.')
        authStore.$reset()
        // 라우팅 처리는 authStore 내부 또는 컴포넌트에서 담당
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
