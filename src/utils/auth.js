import { ref } from 'vue'
import { supabase } from './supabase'
import { createLogger } from './logger'

const log = createLogger('auth')

// 邮箱脱敏后打日志，避免把完整邮箱写进控制台
const maskEmail = (email) => {
  if (!email) return '(空)'
  const [name = '', domain = ''] = String(email).split('@')
  return `${name.slice(0, 2)}***@${domain}`
}

export const currentUser = ref(null)
export const currentProfile = ref(null)

let profilePromise = null
// 读取用户资料；触发器没生效时兜底创建一条
async function fetchProfile(user) {
  log.debug('读取用户资料', user.id)
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()
  if (error) {
    log.warn('读取用户资料失败', error.message)
    return null
  }
  if (data) {
    log.debug('用户资料读取成功', { id: data.id, username: data.username })
    return data
  }

  log.warn('用户资料不存在，尝试自动创建')
  const base = user.user_metadata?.username || (user.email || '').split('@')[0] || `user_${user.id.slice(0, 6)}`
  let username = base
  for (let i = 0; i < 3; i++) {
    const { data: created, error: insErr } = await supabase
      .from('profiles')
      .insert({ id: user.id, username })
      .select()
      .single()
    if (!insErr) {
      log.info('已自动创建用户资料', { username })
      return created
    }
    // 用户名重复，加后缀重试
    if (insErr.code === '23505') {
      log.warn(`用户名「${username}」已被占用，追加后缀重试`)
      username = `${base}_${user.id.slice(0, 4)}`
      continue
    }
    log.error('创建用户资料失败', insErr)
    return null
  }
  log.error('创建用户资料失败：重试 3 次仍未成功')
  return null
}

export async function loadSession() {
  // 用本地会话恢复登录态，避免 getUser() 依赖网络导致刷新后掉登录
  log.debug('恢复登录态：getSession()')
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user || null
  currentUser.value = user
  if (!user) {
    log.info('当前未登录')
    currentProfile.value = null
    return null
  }
  log.info('登录态恢复成功', user.id)
  await loadProfile()
  return user
}

function normalizeError(error) {
  if (!error) return error
  const raw = error.message
  if (/failed to fetch|network|quic|timeout/i.test(raw)) {
    error.message = '网络连接失败，请检查网络后重试'
  } else if (/email not confirmed/i.test(raw)) {
    error.message = '邮箱未确认，请先到邮箱点击确认链接后再登录'
  } else if (/duplicate key|database error saving new user/i.test(raw)) {
    error.message = '该用户名已被占用，请换一个'
  }
  if (error.message !== raw) {
    log.warn('认证错误已转换为友好提示', { raw, friendly: error.message })
  }
  return error
}

// 注册前预查用户名是否已被占用；接口不可用时返回 null 表示跳过预检
export async function isUsernameTaken(username) {
  const name = (username || '').trim()
  if (!name) return false
  log.debug('校验用户名是否被占用', name)
  const { data, error } = await supabase.rpc('username_taken', { name })
  if (error) {
    log.warn('用户名重复校验失败，跳过预检', error.message)
    return null
  }
  log.debug('用户名校验结果', { name, taken: data === true })
  return data === true
}

export async function signUp({ email, password, username }) {
  log.info('开始注册', { username })
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: `${window.location.origin}${window.location.pathname}`
    }
  })
  if (error) {
    log.error('注册失败', error.message)
    return { error: normalizeError(error) }
  }
  currentUser.value = data.user
  log.info('注册成功', { username, needConfirm: !data.session })
  return { data }
}

export async function signIn({ email, password }) {
  log.info('开始登录', { email: maskEmail(email) })
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    log.error('登录失败', error.message)
    return { error: normalizeError(error) }
  }
  currentUser.value = data.user
  log.info('登录成功', data.user?.id)
  await loadProfile()
  return { data }
}

export async function resendConfirm(email) {
  log.info('重新发送确认邮件', maskEmail(email))
  const result = await supabase.auth.resend({ type: 'signup', email })
  if (result.error) log.error('确认邮件发送失败', result.error.message)
  else log.info('确认邮件已发送')
  return result
}

export async function signOut() {
  log.info('退出登录')
  const { error } = await supabase.auth.signOut()
  if (error) log.error('退出登录失败', error.message)
  currentUser.value = null
  currentProfile.value = null
  log.debug('本地用户状态已清空')
}

export async function loadProfile() {
  if (!currentUser.value) {
    log.debug('跳过读取资料：当前未登录')
    return null
  }
  if (currentProfile.value) {
    log.debug('使用缓存的用户资料')
    return currentProfile.value
  }
  if (profilePromise) {
    log.debug('复用进行中的资料请求')
    return profilePromise
  }
  profilePromise = fetchProfile(currentUser.value)
    .then((p) => { currentProfile.value = p; return p })
    .finally(() => { profilePromise = null })
  return profilePromise
}

let sub = null
export function watchAuth() {
  if (sub) {
    log.debug('认证状态监听已存在，跳过重复注册')
    return
  }
  log.info('开始监听认证状态变化')
  sub = supabase.auth.onAuthStateChange(async (event, session) => {
    log.info('认证状态变化', event)
    currentUser.value = session?.user || null
    if (session?.user) {
      await loadProfile()
    } else {
      currentProfile.value = null
    }
  })
}
