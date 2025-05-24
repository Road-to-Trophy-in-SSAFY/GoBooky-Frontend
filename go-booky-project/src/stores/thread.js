import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from '@/services/axios'
import { useAuthStore } from './auth'

export const useThreadStore = defineStore('thread', () => {
  const threads = ref([])
  const threadDetail = ref(null)
  const authStore = useAuthStore()

  // API 요청 헤더 설정 함수
  const getAuthHeader = () => {
    return authStore.accessToken ? { Authorization: `Bearer ${authStore.accessToken}` } : {}
  }

  // 전체 쓰레드 조회
  const getThreads = async () => {
    try {
      // 타임스탬프를 URL에 추가하여 캐시를 우회
      const timestamp = new Date().getTime()
      const res = await axios.get(`/books/threads/?_t=${timestamp}`)
      threads.value = res.data
    } catch (err) {
      console.log(err)
    }
  }

  // 단일 쓰레드 조회
  const getThreadDetail = async (threadId) => {
    try {
      // 유효하지 않은 ID 체크
      if (!threadId || threadId === 'undefined') {
        console.error('유효하지 않은 쓰레드 ID로 API 호출 시도:', threadId)
        return null
      }

      // 타임스탬프를 URL에 추가하여 캐시를 우회
      const timestamp = new Date().getTime()
      const res = await axios.get(`/books/threads/${threadId}/?_t=${timestamp}`)
      threadDetail.value = res.data
      return res.data
    } catch (err) {
      console.log('쓰레드 상세 조회 오류:', err)
      return null
    }
  }

  // 쓰레드 생성
  const createThread = async (payload) => {
    try {
      const headers = getAuthHeader()
      if (!headers.Authorization) {
        throw new Error('No token found')
      }
      const res = await axios.post('/books/threads/create/', payload, {
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      })
      return res.data
    } catch (err) {
      console.error('쓰레드 생성 에러:', err)
      throw err
    }
  }

  // 쓰레드 수정
  const updateThread = async (threadId, payload) => {
    try {
      const res = await axios.put(`/books/threads/${threadId}/update/`, payload, {
        headers: getAuthHeader(),
      })
      return res.data
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  // 쓰레드 삭제
  const deleteThread = async (threadId) => {
    try {
      await axios.delete(`/books/threads/${threadId}/delete/`, {
        headers: getAuthHeader(),
      })
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  // 쓰레드 좋아요
  const likeThread = async (threadId) => {
    try {
      // 유효하지 않은 ID 체크
      if (!threadId || threadId === 'undefined') {
        console.error('유효하지 않은 쓰레드 ID로 좋아요 시도:', threadId)
        return null
      }

      const res = await axios.post(
        `/books/threads/${threadId}/like/`,
        {},
        { headers: getAuthHeader() },
      )

      // 좋아요/취소 후 서버의 최신 데이터로 동기화
      // 타임스탬프를 URL에 추가하여 캐시를 우회
      const timestamp = new Date().getTime()
      const threadsResponse = await axios.get(`/books/threads/?_t=${timestamp}`)
      threads.value = threadsResponse.data

      // threadDetail이 현재 보고 있는 쓰레드이면 해당 데이터도 업데이트
      if (threadDetail.value && threadDetail.value.id === parseInt(threadId, 10)) {
        const detailResponse = await axios.get(`/books/threads/${threadId}/?_t=${timestamp}`)
        threadDetail.value = detailResponse.data
      }

      return res.data
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  return {
    threads,
    threadDetail,
    getThreads,
    getThreadDetail,
    createThread,
    updateThread,
    deleteThread,
    likeThread,
  }
})
