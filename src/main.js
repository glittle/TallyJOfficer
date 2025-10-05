import { createApp } from 'vue'
import router from './router'
import i18n from './i18n'
import App from './App.vue'
import { shared } from '@/shared.js'

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js')
}

const app = createApp(App)

// Provide shared state globally
app.provide('shared', shared)

// Make shared available as a global property (for compatibility)
app.config.globalProperties.$shared = shared

app.use(router)
app.use(i18n)

app.mount('#app')