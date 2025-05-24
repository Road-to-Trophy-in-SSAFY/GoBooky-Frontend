import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

// Pinia 생성 및 플러그인 추가
const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// 세션 쿠키로 토큰 갱신 및 사용자 정보 확인
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
// 페이지 로드 시 쿠키 기반 리프레시 시도 후 앱 마운트
authStore.checkAuth().finally(() => {
  app.use(router)
  app.mount('#app')
})
