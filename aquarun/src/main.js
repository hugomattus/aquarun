import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { registerServiceWorker } from './utils/push'
import './style.css'

registerServiceWorker()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
