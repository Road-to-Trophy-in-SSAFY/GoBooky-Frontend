// 백엔드 API와 통신하는 서비스
import axios from 'axios'

// axios 인스턴스 생성
const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키를 주고받기 위해 설정
})

// 요청 인터셉터 - 토큰이 있으면 헤더에 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 응답 인터셉터 - 토큰 만료 등의 에러 처리
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // 에러 응답이 없는 경우 바로 리젝트 (네트워크 오류 등)
    if (!error.response) {
      return Promise.reject(error)
    }

    // 토큰이 만료되었고, 재시도하지 않았다면
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // 로컬 스토리지에서 리프레시 토큰 가져오기
        const refreshToken = localStorage.getItem('refresh_token')

        // 리프레시 토큰이 없으면 로그아웃 처리
        if (!refreshToken) {
          throw new Error('리프레시 토큰이 없습니다.')
        }

        // 리프레시 토큰으로 새 액세스 토큰 요청
        const response = await axios.post(
          'http://localhost:8000/dj-rest-auth/token/refresh/',
          { refresh: refreshToken },
          { withCredentials: true },
        )

        // 응답에서 새 액세스 토큰 추출
        const { access } = response.data

        // 새 토큰 저장
        localStorage.setItem('token', access)

        // 원래 요청 헤더에 새 토큰 설정
        originalRequest.headers.Authorization = `Bearer ${access}`

        // 원래 요청 재시도
        return api(originalRequest)
      } catch (refreshError) {
        console.error('토큰 리프레시 실패:', refreshError)
        // 리프레시 실패 시 로그아웃 처리
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        // 로그인 페이지로 리다이렉트
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// 인증 관련 API 서비스
const authService = {
  // 회원가입
  register: (userData) => {
    // FormData인 경우 Content-Type을 설정하지 않으면 브라우저가 자동으로 설정
    const headers = userData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}

    return api.post('/dj-rest-auth/registration/', userData, { headers })
  },

  // 로그인
  login: (credentials) => {
    return api.post('/dj-rest-auth/login/', credentials)
  },

  // 로그아웃
  logout: () => {
    return api.post('/dj-rest-auth/logout/')
  },

  // 사용자 정보 가져오기
  getUserInfo: () => {
    return api.get('/dj-rest-auth/user/')
  },

  // 비밀번호 변경
  changePassword: (passwordData) => {
    return api.post('/dj-rest-auth/password/change/', passwordData)
  },

  // 비밀번호 재설정 이메일 요청
  resetPassword: (email) => {
    return api.post('/dj-rest-auth/password/reset/', { email })
  },

  // 카테고리 목록 가져오기
  getCategories: () => {
    return api.get('/api/accounts/categories/')
  },

  // 명시적인 토큰 리프레시 함수
  refreshToken: (refreshToken) => {
    return axios.post(
      'http://localhost:8000/dj-rest-auth/token/refresh/',
      { refresh: refreshToken },
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  },
}

export { api, authService }
