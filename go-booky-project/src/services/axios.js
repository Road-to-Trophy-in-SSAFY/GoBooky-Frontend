import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Django 백엔드 주소
  withCredentials: true, // 필요시 쿠키 인증 등
})

export default instance
