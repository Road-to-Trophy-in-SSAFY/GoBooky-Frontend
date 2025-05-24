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
      const res = await axios.get('/books/threads/')
      threads.value = res.data
    } catch (err) {
      console.log(err)
    }
  }

  // 단일 쓰레드 조회
  const getThreadDetail = async (threadId) => {
    try {
      const res = await axios.get(`/books/threads/${threadId}/`)
      threadDetail.value = res.data
    } catch (err) {
      console.log(err)
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
      const res = await axios.post(
        `/books/threads/${threadId}/like/`,
        {},
        { headers: getAuthHeader() },
      )
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
