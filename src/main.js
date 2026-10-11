import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'
import { initAdBlocker } from './utils/adBlocker'

initAdBlocker()

const app = createApp(App)
app.use(router)
app.mount('#app')

