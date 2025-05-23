import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

export const useThreadStore = defineStore('thread', () => {
  const threads = ref([])
  const threadDetail = ref(null)
  const API_URL = 'http://127.0.0.1:8000'
  const authStore = useAuthStore()

  // API 요청 헤더 설정 함수
  const getAuthHeader = () => {
    return authStore.access ? { Authorization: `Bearer ${authStore.access}` } : {}
  }

  // 전체 쓰레드 조회
  const getThreads = async () => {
    try {
      const res = await axios.get(`${API_URL}/books/threads/`)
      threads.value = res.data
    } catch (err) {
      console.log(err)
    }
  }

  // 단일 쓰레드 조회
  const getThreadDetail = async (threadId) => {
    try {
      const res = await axios.get(`${API_URL}/books/threads/${threadId}/`)
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
      const res = await axios.post(`${API_URL}/books/threads/create/`, payload, {
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
      const res = await axios.put(`${API_URL}/books/threads/${threadId}/update/`, payload, {
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
      await axios.delete(`${API_URL}/books/threads/${threadId}/delete/`, {
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
        `${API_URL}/books/threads/${threadId}/like/`,
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
