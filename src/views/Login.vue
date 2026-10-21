<template>
  <div class="login-page" :class="{ leaving: isLeaving }">
    <div class="card">
      <div class="stagger-item" :style="{ '--delay': '0.05s' }">
        <h1>{{ mode === 'login' ? t('login.title') : t('login.signupTitle') }}</h1>
      </div>
      <form class="stagger-item form" :style="{ '--delay': '0.1s' }" @submit.prevent="submit">
        <div v-if="mode === 'signup'" class="field">
          <label>{{ t('login.username') }}</label>
          <input v-model="form.username" maxlength="12" required :placeholder="t('login.usernamePh')" />
        </div>
        <div class="field">
          <label>{{ t('login.email') }}</label>
          <input v-model="form.email" type="email" required :placeholder="t('login.emailPh')" />
        </div>
        <div class="field">
          <label>{{ t('login.password') }}</label>
          <input v-model="form.password" type="password" :minlength="6" required :placeholder="t('login.passwordPh')" />
        </div>
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? t('login.loading') : (mode === 'login' ? t('login.login') : t('login.signup')) }}
        </button>
      </form>
      <div class="stagger-item switch" :style="{ '--delay': '0.15s' }">
        <button @click="toggleMode">
          {{ mode === 'login' ? t('login.goSignup') : t('login.goLogin') }}
        </button>
      </div>
      <div v-if="pendingEmail" class="confirm-tip">
        <p>{{ t('login.confirmSent', { email: pendingEmail }) }}</p>
        <button class="resend-btn" :disabled="resending" @click="resend">
          {{ resending ? t('login.resending') : t('login.resend') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { isLeaving } from '../router'
import { t } from '../utils/i18n'
import { signIn, signUp, resendConfirm } from '../utils/auth'
import { showError, showSuccess } from '../utils/modal'

const router = useRouter()
const route = useRoute()

const mode = ref('login')
const loading = ref(false)
const form = reactive({ email: '', password: '', username: '' })
const pendingEmail = ref('')
const resending = ref(false)

const toggleMode = () => {
  mode.value = mode.value === 'login' ? 'signup' : 'login'
}

const resend = async () => {
  resending.value = true
  try {
    const { error } = await resendConfirm(pendingEmail.value)
    if (error) return showError(error.message)
    showSuccess(t('login.resendDone'))
  } finally {
    resending.value = false
  }
}

onMounted(() => {
  const err = sessionStorage.getItem('auth_redirect_error')
  if (err) {
    sessionStorage.removeItem('auth_redirect_error')
    showError(err)
  }
})

const submit = async () => {
  loading.value = true
  try {
    if (mode.value === 'login') {
      const { error } = await signIn({ email: form.email, password: form.password })
      if (error) {
        showError(error.message)
        return
      }
    } else {
      if (!form.username.trim()) {
        showError(t('login.usernameRequired'))
        return
      }
      const { data, error } = await signUp({ email: form.email, password: form.password, username: form.username.trim() })
      if (error) {
        showError(error.message)
        return
      }
      // 开启了邮箱确认：注册后没有 session，需要先去邮箱点确认链接
      if (!data?.session) {
        pendingEmail.value = form.email
        mode.value = 'login'
        showSuccess(t('login.confirmSent', { email: form.email }))
        return
      }
    }
    router.push(route.query.redirect || '/chat')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
}

.card {
  width: 100%;
  max-width: 380px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 32px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
}

.stagger-item {
  opacity: 0;
  transform: translateX(30px);
  animation: slideIn 0.45s ease forwards;
  animation-delay: var(--delay);
}

@keyframes slideIn {
  to { opacity: 1; transform: translateX(0); }
}

.leaving .stagger-item {
  animation: slideOut 0.4s ease forwards;
  animation-delay: var(--delay);
}

@keyframes slideOut {
  to { opacity: 0; transform: translateX(60px); }
}

h1 {
  margin: 0 0 24px;
  font-size: 26px;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 13px;
  color: #666;
}

.field input {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fafafa;
}

.field input:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.15);
  background: #fff;
}

.submit-btn {
  margin-top: 8px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 11px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.submit-btn:hover:not(:disabled) {
  background: #3aa876;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switch {
  margin-top: 18px;
  text-align: center;
}

.switch button {
  background: none;
  border: none;
  color: #42b983;
  cursor: pointer;
  font-size: 14px;
}

.switch button:hover { text-decoration: underline; }

.confirm-tip {
  margin-top: 16px;
  padding: 12px;
  border: 1px solid #d6ecdf;
  background: #f2fbf6;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #3a7a5e;
}
.confirm-tip p { margin: 0 0 8px; }
.resend-btn {
  background: none;
  border: none;
  padding: 0;
  color: #42b983;
  font-size: 13px;
  cursor: pointer;
}
.resend-btn:disabled { opacity: 0.6; cursor: not-allowed; }

html.dark .login-page { color: #e0e0e0; }
html.dark .card { background: #1a1a2e; border-color: #2d2d44; }
html.dark h1 { color: #f0f0f0; }
html.dark .field label { color: #aaa; }
html.dark .field input { background: #14142a; border-color: #2d2d44; color: #e0e0e0; }
html.dark .field input:focus { background: #14142a; }
html.dark .confirm-tip { background: rgba(66, 185, 131, 0.08); border-color: rgba(66, 185, 131, 0.3); color: #8fd3b4; }
</style>
