import { ref } from 'vue'
import { supabase } from './supabase'

export const currentUser = ref(null)
export const currentProfile = ref(null)

let profilePromise = null
// 读取用户资料；触发器没生效时兜底创建一条
async function fetchProfile(user) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()
  if (error) return null
  if (data) return data

  const base = user.user_metadata?.username || (user.email || '').split('@')[0] || `user_${user.id.slice(0, 6)}`
  let username = base
  for (let i = 0; i < 3; i++) {
    const { data: created, error: insErr } = await supabase
      .from('profiles')
      .insert({ id: user.id, username })
      .select()
      .single()
    if (!insErr) return created
    // 用户名重复，加后缀重试
    if (insErr.code === '23505') { username = `${base}_${user.id.slice(0, 4)}`; continue }
    console.error('[auth] 创建用户资料失败', insErr)
    return null
  }
  return null
}

export async function loadSession() {
  // 用本地会话恢复登录态，避免 getUser() 依赖网络导致刷新后掉登录
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user || null
  currentUser.value = user
  if (!user) {
    currentProfile.value = null
    return null
  }
  await loadProfile()
  return user
}

function normalizeError(error) {
  if (!error) return error
  if (/failed to fetch|network|quic|timeout/i.test(error.message)) {
    error.message = '网络连接失败，请检查网络后重试'
  } else if (/email not confirmed/i.test(error.message)) {
    error.message = '邮箱未确认，请先到邮箱点击确认链接后再登录'
  }
  return error
}

export async function signUp({ email, password, username }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: `${window.location.origin}${window.location.pathname}`
    }
  })
  if (error) return { error: normalizeError(error) }
  currentUser.value = data.user
  return { data }
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: normalizeError(error) }
  currentUser.value = data.user
  await loadProfile()
  return { data }
}

export async function resendConfirm(email) {
  return supabase.auth.resend({ type: 'signup', email })
}

export async function signOut() {
  await supabase.auth.signOut()
  currentUser.value = null
  currentProfile.value = null
}

export async function loadProfile() {
  if (!currentUser.value) return null
  if (currentProfile.value) return currentProfile.value
  if (profilePromise) return profilePromise
  profilePromise = fetchProfile(currentUser.value)
    .then((p) => { currentProfile.value = p; return p })
    .finally(() => { profilePromise = null })
  return profilePromise
}

let sub = null
export function watchAuth() {
  if (sub) return
  sub = supabase.auth.onAuthStateChange(async (event, session) => {
    currentUser.value = session?.user || null
    if (session?.user) {
      await loadProfile()
    } else {
      currentProfile.value = null
    }
  })
}
