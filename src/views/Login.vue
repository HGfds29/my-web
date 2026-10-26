<template>
  <div class="login-page" :class="{ leaving: isLeaving }">
    <!-- 左侧：聊天室展示图 -->
    <section class="visual" ref="visualInner" @mousemove="onMove" @mouseleave="onLeave">
      <div class="visual-inner">
        <div class="visual-tilt" ref="tiltEl">
          <img class="visual-img" :src="chatImage" :alt="t('login.visualTitle')" />
          <div class="visual-caption">
            <h2>{{ t('login.visualTitle') }}</h2>
            <p>{{ t('login.visualDesc') }}</p>
          </div>
        </div>
      </div>

      <ul class="visual-features">
        <li
          v-for="f in features"
          :key="f.key"
          class="feature"
          :style="{ '--fd': f.delay }"
        >
          <span class="feature-icon"><AppIcon :name="f.icon" :size="17" /></span>
          <span class="feature-text">
            <strong>{{ t('login.' + f.key) }}</strong>
            <span>{{ t('login.' + f.key + 'Desc') }}</span>
          </span>
        </li>
      </ul>
    </section>

    <!-- 中间竖线：从上到下绘制 -->
    <div class="divider" aria-hidden="true"></div>

    <!-- 右侧：登录/注册表单 -->
    <section class="panel">
      <div class="panel-inner">
        <div class="stagger-item" :style="{ '--delay': '0.62s' }">
          <p class="eyebrow">CHAT ROOM</p>
          <h1>{{ mode === 'login' ? t('login.title') : t('login.signupTitle') }}</h1>
        </div>
        <form class="stagger-item form" :style="{ '--delay': '0.69s' }" @submit.prevent="submit">
          <div v-if="mode === 'signup'" class="field">
            <label>{{ t('login.username') }}</label>
            <input v-model="form.username" maxlength="12" required :placeholder="t('login.usernamePh')" />
            <p class="field-hint">{{ t('login.usernameHint') }}</p>
          </div>
          <div class="field">
            <label>{{ t('login.email') }}</label>
            <input v-model="form.email" type="email" required :placeholder="t('login.emailPh')" />
          </div>
          <div class="field">
            <label>{{ t('login.password') }}</label>
            <input
              v-model="form.password"
              type="password"
              :minlength="6"
              required
              :placeholder="mode === 'signup' ? t('login.passwordPhSignup') : t('login.passwordPh')"
            />
            <p v-if="mode === 'signup'" class="field-hint">{{ t('login.passwordHint') }}</p>
          </div>
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? t('login.loading') : (mode === 'login' ? t('login.login') : t('login.signup')) }}
          </button>
        </form>
        <div class="stagger-item switch" :style="{ '--delay': '0.78s' }">
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
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { isLeaving } from '../router'
import { t } from '../utils/i18n'
import { signIn, signUp, resendConfirm, isUsernameTaken } from '../utils/auth'
import { showError, showSuccess } from '../utils/modal'
import { createLogger } from '../utils/logger'
import AppIcon from '../components/AppIcon.vue'
import chatImage from '../assets/QQ20261024-010930.png'

const log = createLogger('Login')
// 模块初始化：登录 / 注册、用户名与密码校验、邮箱确认重发、登录后跳转
log.info('登录模块已初始化：登录/注册、输入校验、邮箱确认重发与登录后跳转')

const features = [
  { key: 'featureRealtime', icon: '消息_message-one', delay: '0.55s' },
  { key: 'featureGroup', icon: '用户_user', delay: '0.61s' },
  { key: 'featureImage', icon: '图片_image', delay: '0.67s' },
  { key: 'featureSecurity', icon: '信息加密_message-privacy', delay: '0.73s' }
]

const router = useRouter()
const route = useRoute()

/* ---------- 鼠标实时跟随：左图轻微 3D 倾斜 + 光斑 ---------- */
const visualInner = ref(null)
const tiltEl = ref(null)
const pos = { x: 0, y: 0, tx: 0, ty: 0 }
let raf = 0
let hovering = false

const applyTilt = () => {
  const wrap = visualInner.value
  const card = tiltEl.value
  if (!wrap || !card) return
  // 光斑位置交给 CSS 变量，避免每帧改样式表
  wrap.style.setProperty('--px', ((pos.x + 1) * 50).toFixed(1) + '%')
  wrap.style.setProperty('--py', ((pos.y + 1) * 50).toFixed(1) + '%')
  const rx = -pos.y * 4
  const ry = pos.x * 5
  const settled = Math.abs(pos.tx - pos.x) < 0.001 && Math.abs(pos.ty - pos.y) < 0.001
  // 归位后移除 transform，避免元素长期停留在合成层导致文字发虚
  card.style.transform =
    settled && !hovering
      ? 'none'
      : `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
}

const loop = () => {
  pos.x += (pos.tx - pos.x) * 0.12
  pos.y += (pos.ty - pos.y) * 0.12
  applyTilt()
  const settled = Math.abs(pos.tx - pos.x) < 0.001 && Math.abs(pos.ty - pos.y) < 0.001
  if (settled) {
    raf = 0
    return
  }
  raf = requestAnimationFrame(loop)
}

const onMove = (e) => {
  const el = visualInner.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const nx = ((e.clientX - r.left) / r.width) * 2 - 1
  const ny = ((e.clientY - r.top) / r.height) * 2 - 1
  pos.tx = Math.max(-1, Math.min(1, nx))
  pos.ty = Math.max(-1, Math.min(1, ny))
  hovering = true
  if (!raf) raf = requestAnimationFrame(loop)
}

const onLeave = () => {
  hovering = false
  pos.tx = 0
  pos.ty = 0
  if (!raf) raf = requestAnimationFrame(loop)
}

onBeforeUnmount(() => {
  log.debug('Login 页面已卸载，取消倾斜动画帧')
  if (raf) cancelAnimationFrame(raf)
  raf = 0
})

const mode = ref('login')
const loading = ref(false)
const form = reactive({ email: '', password: '', username: '' })
const pendingEmail = ref('')
const resending = ref(false)

/* 注册密码复杂度：至少 6 位，含大写、小写与数字 */
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/

const toggleMode = () => {
  mode.value = mode.value === 'login' ? 'signup' : 'login'
  log.info('切换认证模式', { mode: mode.value })
}

const resend = async () => {
  log.info('重新发送确认邮件')
  resending.value = true
  try {
    const { error } = await resendConfirm(pendingEmail.value)
    if (error) {
      log.error('重新发送确认邮件失败', error.message)
      return showError(error.message)
    }
    log.info('确认邮件已重新发送')
    showSuccess(t('login.resendDone'))
  } finally {
    resending.value = false
  }
}

onMounted(() => {
  log.info('Login 页面已加载', { mode: mode.value })
  const err = sessionStorage.getItem('auth_redirect_error')
  if (err) {
    log.info('读取到跳转前的错误提示', { length: err.length })
    sessionStorage.removeItem('auth_redirect_error')
    showError(err)
  }
})

const submit = async () => {
  loading.value = true
  log.info(mode.value === 'login' ? '开始登录' : '开始注册', { username: form.username })
  try {
    if (mode.value === 'login') {
      const { data, error } = await signIn({ email: form.email, password: form.password })
      if (error) {
        log.error('登录失败', error.message)
        if (/邮箱未确认|email not confirm/i.test(error.message)) {
          log.warn('登录被拒：邮箱尚未确认', { username: form.username })
        }
        showError(error.message)
        return
      }
      log.info('登录成功', { userId: data?.user?.id })
    } else {
      if (!form.username.trim()) {
        log.warn('校验失败：用户名为空')
        showError(t('login.usernameRequired'))
        return
      }
      if (!PASSWORD_RE.test(form.password)) {
        log.warn('校验失败：密码复杂度不足', { length: form.password.length })
        showError(t('login.passwordWeak'))
        return
      }
      const taken = await isUsernameTaken(form.username)
      if (taken === true) {
        log.warn('校验失败：用户名已被占用', { username: form.username })
        showError(t('login.usernameTaken'))
        return
      }
      const { data, error } = await signUp({ email: form.email, password: form.password, username: form.username.trim() })
      if (error) {
        log.error('注册失败', error.message)
        showError(error.message)
        return
      }
      // 开启了邮箱确认：注册后没有 session，需要先去邮箱点确认链接
      if (!data?.session) {
        log.info('注册成功，等待邮箱确认', { userId: data?.user?.id })
        pendingEmail.value = form.email
        mode.value = 'login'
        showSuccess(t('login.confirmSent', { email: form.email }))
        return
      }
      log.info('注册成功', { userId: data?.user?.id })
    }
    router.push(route.query.redirect || '/chat')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  position: relative;
  overflow: hidden;
  background: #fafafa;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  /* 用系统默认的次像素抗锯齿，避免文字发虚 */
  -webkit-font-smoothing: subpixel-antialiased;
  text-rendering: optimizeLegibility;
  /* 与 Home 一致的入场：从左向右滑入 */
  opacity: 0;
  transform: translateX(30px);
  animation: pageIn 0.45s ease 0.02s forwards;
}

@keyframes pageIn {
  to { opacity: 1; transform: none; }
}

/* ---------- 左侧展示图 ---------- */
.visual {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 4vh 2.5vw;
  overflow: hidden;
  animation: widenVisual 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.55s forwards;
}

@keyframes widenVisual {
  to { width: 56%; }
}

.visual-inner {
  position: relative;
  width: 100%;
  max-width: 680px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.16);
  opacity: 0;
  transform: translateX(30px);
  animation: visualIn 0.45s ease 0.1s forwards;
}

.visual-img {
  display: block;
  width: 100%;
  height: auto;
}

/* 跟随鼠标的 3D 倾斜容器（transform 由脚本写入） */
.visual-tilt {
  position: relative;
  border-radius: inherit;
  overflow: hidden;
  transform-origin: center;
}

/* 跟随鼠标的光斑 */
.visual-tilt::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: radial-gradient(
    340px circle at var(--px, 50%) var(--py, 50%),
    rgba(var(--accent-rgb, 66, 185, 131), 0.22),
    transparent 65%
  );
  opacity: 0;
  transition: opacity 0.35s ease;
}

.visual:hover .visual-tilt::after {
  opacity: 1;
}

.visual-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  padding: 28px 26px 24px;
  color: #fff;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.72));
  opacity: 0;
  transform: translateY(10px);
  animation: captionIn 0.4s ease 0.32s forwards;
}

@keyframes captionIn {
  to { opacity: 1; transform: none; }
}

.visual-caption h2 {
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.visual-caption p {
  margin: 0;
  font-size: 13px;
  opacity: 0.8;
  line-height: 1.5;
}

/* ---------- 左侧功能点 ---------- */
.visual-features {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  max-width: 680px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
}

.feature {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  opacity: 0;
  transform: translateY(8px);
  animation: featureIn 0.4s ease var(--fd) forwards;
}

@keyframes featureIn {
  to { opacity: 1; transform: none; }
}

.feature-icon {
  display: inline-flex;
  margin-top: 1px;
  color: var(--accent, #42b983);
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.feature:hover .feature-icon {
  transform: translateY(-2px) scale(1.15);
}

.feature-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.feature-text strong {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
  transition: color 0.2s ease;
}

.feature-text span {
  font-size: 12px;
  line-height: 1.4;
  color: #8a8a96;
  transition: color 0.2s ease;
}

.feature:hover .feature-text strong { color: var(--accent, #42b983); }
.feature:hover .feature-text span { color: #5b5b66; }
html.dark .feature:hover .feature-text span { color: #b0b0c0; }

/* 触屏或用户偏好减少动效时关闭跟随 */
@media (hover: none), (prefers-reduced-motion: reduce) {
  .visual-tilt { transform: none !important; }
  .visual:hover .visual-tilt::after { opacity: 0; }
}

@keyframes visualIn {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: none; }
}

/* ---------- 中间竖线 ---------- */
.divider {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #dcdcdc;
  transform: scaleY(0);
  transform-origin: top;
  animation:
    drawLine 0.45s ease 0.05s forwards,
    slideDivider 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.55s forwards;
}

@keyframes drawLine {
  from { transform: translateX(0) scaleY(0); }
  to { transform: translateX(0) scaleY(1); }
}

/* 画完后向右让出位置，登录区出现在线的右侧 */
@keyframes slideDivider {
  from { transform: translateX(0) scaleY(1); }
  to { transform: translateX(6vw) scaleY(1); }
}

/* ---------- 右侧表单 ---------- */
.panel {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 7vw 24px 6vw;
  animation: shrinkPanel 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.55s forwards;
}

@keyframes shrinkPanel {
  to { width: 44%; }
}

.panel-inner {
  width: 100%;
  max-width: 360px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--accent, #42b983);
}

.stagger-item {
  opacity: 0;
  transform: translateX(30px);
  animation: slideIn 0.45s ease forwards;
  animation-delay: var(--delay);
}

@keyframes slideIn {
  to { opacity: 1; transform: none; }
}

.leaving .stagger-item {
  animation: slideOut 0.4s ease forwards;
  animation-delay: 0s;
}

.leaving .visual-inner,
.leaving .divider {
  opacity: 0;
  transition: opacity 0.3s ease;
}

@keyframes slideOut {
  to { opacity: 0; transform: translateX(60px); }
}

h1 {
  margin: 0 0 26px;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  background: #fff;
}

.field input:focus {
  border-color: var(--accent, #42b983);
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb, 66, 185, 131), 0.15);
}

.field-hint {
  margin: 0;
  font-size: 11px;
  line-height: 1.4;
  color: #9a9aa5;
}

html.dark .field-hint {
  color: #8a8a9a;
}

.submit-btn {
  margin-top: 6px;
  background: var(--accent, #42b983);
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
}

.switch button {
  background: none;
  border: none;
  padding: 0;
  color: var(--accent, #42b983);
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
  color: var(--accent, #42b983);
  font-size: 13px;
  cursor: pointer;
}
.resend-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* ---------- 深色主题 ---------- */
html.dark .login-page { background: #101018; color: #e0e0e0; }
html.dark .divider { background: #2d2d44; }
html.dark h1 { color: #f0f0f0; }
html.dark .field label { color: #aaa; }
html.dark .field input { background: #16162a; border-color: #2d2d44; color: #e0e0e0; }
html.dark .field input:focus { background: #16162a; }
html.dark .visual-inner { box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55); }
html.dark .feature-text strong { color: #d8d8e0; }
html.dark .feature-text span { color: #8a8a9a; }
html.dark .confirm-tip { background: rgba(var(--accent-rgb, 66, 185, 131), 0.08); border-color: rgba(var(--accent-rgb, 66, 185, 131), 0.3); color: #8fd3b4; }

/* ---------- 移动端 ---------- */
@media (max-width: 768px) {
  .login-page { flex-direction: column; }

  .visual { width: 100%; height: 30vh; height: 30dvh; padding: 0; animation: none; }
  .visual-inner {
    max-width: none;
    width: 100%;
    height: 100%;
    border-radius: 0;
    box-shadow: none;
  }
  .visual-img { width: 100%; height: 100%; object-fit: cover; }
  .visual-caption { padding: 16px 18px 14px; }
  .visual-caption h2 { font-size: 16px; margin-bottom: 2px; }
  .visual-caption p { display: none; }
  .visual-features { display: none; }

  .divider {
    left: 0;
    right: 0;
    top: 30vh;
    top: 30dvh;
    bottom: auto;
    width: 100%;
    height: 1px;
    background: #dcdcdc;
    transform: scaleX(0);
    transform-origin: left;
    animation: drawLineX 0.45s ease 0.05s forwards;
  }
  html.dark .divider { background: #2d2d44; }
  @keyframes drawLineX { to { transform: scaleX(1); } }

  .panel {
    width: 100%;
    flex: 1;
    align-items: flex-start;
    padding: 24px 20px calc(24px + env(safe-area-inset-bottom));
    animation: none;
  }
  .panel-inner { max-width: 420px; margin: 0 auto; }
  h1 { margin-bottom: 22px; font-size: 24px; }
  .field input { font-size: 16px; }

  /* 移动端没有横线右移与宽度变化，整体节奏提前 */
  .stagger-item { animation-delay: calc(var(--delay) * 0.8); }
  .leaving .stagger-item { animation-delay: 0s; }
}
</style>
