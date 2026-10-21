import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'
import { initAdBlocker } from './utils/adBlocker'
import { supabase } from './utils/supabase'

initAdBlocker()

// 处理邮箱确认链接的回跳：Supabase 会重定向到
// /?...#access_token=...&refresh_token=...（hash 路由会把它误判成路径）
async function handleAuthRedirect() {
  const hash = window.location.hash
  if (!hash.includes('access_token=') && !hash.includes('error_description=')) return

  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const errorDesc = params.get('error_description')

  // 清掉 token，落到聊天室
  history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/chat`)

  if (errorDesc) {
    sessionStorage.setItem('auth_redirect_error', errorDesc.replace(/\+/g, ' '))
    return
  }

  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')
  if (access_token && refresh_token) {
    await supabase.auth.setSession({ access_token, refresh_token })
  }
}

handleAuthRedirect().finally(() => {
  const app = createApp(App)
  app.use(router)
  app.mount('#app')
})
