import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'
import { initAdBlocker } from './utils/adBlocker'

console.log('[main.js] 应用初始化开始')
console.log('[main.js] 当前环境:', import.meta.env.MODE)

initAdBlocker()
console.log('[main.js] 广告拦截器已初始化')

const app = createApp(App)
app.use(router)
app.mount('#app')

console.log('[main.js] Vue 应用已挂载到 #app')
console.log('[main.js] 应用初始化完成')
