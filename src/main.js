import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'
import { initAdBlocker } from './utils/adBlocker'
import { supabase } from './utils/supabase'
import { createLogger, installGlobalLogging } from './utils/logger'
import { installLogUploader } from './utils/logUploader'
import { initAppearance } from './utils/appearance'

const log = createLogger('main')

log.info('入口脚本开始执行', { mode: import.meta.env.MODE, hash: window.location.hash || '(空)' })

initAppearance()
initAdBlocker()
installLogUploader()

// 处理邮箱确认链接的回跳：Supabase 会重定向到
// /?...#access_token=...&refresh_token=...（hash 路由会把它误判成路径）
async function handleAuthRedirect() {
  const hash = window.location.hash
  if (!hash.includes('access_token=') && !hash.includes('error_description=')) return

  log.info('检测到认证回跳链接，开始处理')
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const errorDesc = params.get('error_description')

  // 清掉 token，落到聊天室
  history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/chat`)

  if (errorDesc) {
    log.warn('认证回跳携带错误信息', errorDesc)
    sessionStorage.setItem('auth_redirect_error', errorDesc.replace(/\+/g, ' '))
    return
  }

  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')
  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token })
    if (error) log.error('认证回跳写入会话失败', error)
    else log.info('认证回跳会话写入成功')
  } else {
    log.warn('认证回跳缺少 access_token 或 refresh_token')
  }
}

handleAuthRedirect()
  .catch((e) => {
    log.error('认证回跳处理失败', e)
  })
  .finally(() => {
    log.debug('开始创建 Vue 应用')
    const app = createApp(App)
    installGlobalLogging(app, router)
    app.use(router)
    app.mount('#app')
    log.info('应用已挂载到 #app')
  })
