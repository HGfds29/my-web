<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/home" class="nav-logo">{{ t('nav.title') }}</router-link>
      <div class="nav-right">
        <div class="nav-links">
          <router-link to="/home" class="nav-link" active-class="active"><AppIcon name="全部_all-application" :size="15" />{{ t('nav.home') }}</router-link>
          <router-link to="/blog" class="nav-link" active-class="active"><AppIcon name="标签_tag" :size="15" />{{ t('nav.blog') }}</router-link>
          <router-link to="/photos" class="nav-link" active-class="active"><AppIcon name="预览-打开_preview-open" :size="15" />{{ t('nav.photos') }}</router-link>
          <router-link to="/games" class="nav-link" active-class="active"><AppIcon name="游戏手柄_game-handle" :size="15" />{{ t('nav.games') }}</router-link>
          <router-link to="/about" class="nav-link" active-class="active"><AppIcon name="更多2_more-two" :size="15" />{{ t('nav.about') }}</router-link>
          <div
            class="more-menu"
            :class="{ open: moreOpen }"
            @mouseenter="moreOpen = true"
            @mouseleave="moreOpen = false"
          >
            <button
              class="more-btn"
              :title="t('nav.moreTip')"
              aria-haspopup="true"
              :aria-expanded="moreOpen"
              @click="moreOpen = !moreOpen"
            >
              <AppIcon name="更多2_more-two" :size="15" />
              <span class="more-text">{{ t('nav.more') }}</span>
              <svg class="more-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 15 12 9 18 15" />
              </svg>
            </button>
            <div class="more-dropdown">
              <router-link to="/demo" class="more-item" active-class="active" @click="moreOpen = false">
                <AppIcon name="系统_system" :size="16" />
                <span>{{ t('nav.menuDemo') }}</span>
              </router-link>
              <router-link to="/chat" class="more-item" active-class="active" @click="moreOpen = false">
                <AppIcon name="沟通_communication" :size="16" />
                <span>{{ t('nav.menuChat') }}</span>
              </router-link>
              <router-link to="/discussion" class="more-item" active-class="active" @click="moreOpen = false">
                <AppIcon name="评论_comments" :size="16" />
                <span>{{ t('nav.menuDiscussion') }}</span>
              </router-link>
            </div>
          </div>
        </div>
        <button class="lang-toggle" @click="toggleLanguage" :class="{ switching: isSwitching }" :title="t('nav.switchLangTip')">
          <span class="lang-icon">
            <AppIcon :name="locale === 'zh' ? '英文_english' : '中文_chinese'" :size="16" />
          </span>
          <span class="lang-text">{{ t('nav.switchLang') }}</span>
        </button>
        <div ref="userMenuRef" class="user-menu" :class="{ open: userOpen }">
          <button
            v-if="currentProfile"
            class="user-btn"
            aria-haspopup="true"
            :aria-expanded="userOpen"
            @click.stop="userOpen = !userOpen"
          >
            <span class="user-avatar">{{ (currentProfile.username || '?').slice(0, 1).toUpperCase() }}</span>
            <span class="user-name">{{ currentProfile.username }}</span>
            <svg class="more-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 15 12 9 18 15" />
            </svg>
          </button>
          <router-link v-else to="/login" class="user-btn user-login">
            <AppIcon name="用户_user" :size="16" />
            <span>{{ t('nav.login') }}</span>
          </router-link>

          <div v-if="currentProfile" class="user-card">
            <div class="user-card-head">
              <span class="user-card-avatar">{{ (currentProfile.username || '?').slice(0, 1).toUpperCase() }}</span>
              <div class="user-card-info">
                <p class="user-card-name">
                  {{ currentProfile.username }}
                  <span v-if="isAdmin" class="role-badge">{{ t('nav.adminBadge') }}</span>
                </p>
                <p class="user-card-email">{{ currentUser?.email || '' }}</p>
              </div>
            </div>
            <div class="user-card-divider"></div>
            <router-link to="/chat" class="user-card-item" @click="userOpen = false">
              <AppIcon name="沟通_communication" :size="16" />
              <span>{{ t('nav.menuChat') }}</span>
            </router-link>
            <router-link to="/discussion" class="user-card-item" @click="userOpen = false">
              <AppIcon name="评论_comments" :size="16" />
              <span>{{ t('nav.menuDiscussion') }}</span>
            </router-link>
            <button class="user-card-item" @click="changePassword">
              <AppIcon name="设置_setting" :size="16" />
              <span>{{ t('nav.changePassword') }}</span>
            </button>
            <button class="user-card-item" @click="copyUserId">
              <AppIcon name="复制_copy" :size="16" />
              <span>{{ t('nav.copyId') }}</span>
            </button>
            <div class="user-card-divider"></div>
            <button class="user-card-item danger" @click="doLogout">
              <AppIcon name="退出_exit" :size="16" />
              <span>{{ t('nav.logout') }}</span>
            </button>
          </div>
        </div>
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? t('nav.themeLight') : t('nav.themeDark')">
          <svg v-if="isDark" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
        <button
          class="settings-toggle"
          :class="{ active: settingsOpen }"
          :title="t('nav.settings')"
          :aria-label="t('nav.settings')"
          @click="openSettings"
        >
          <AppIcon name="设置配置_setting-config" :size="18" />
        </button>
      </div>
    </div>
  </nav>

  <Teleport to="body">
    <div class="settings-layer" :class="{ open: settingsOpen }" :aria-hidden="!settingsOpen">
      <div class="settings-overlay" @click="closeSettings"></div>
      <aside
        class="settings-drawer"
        role="dialog"
        aria-modal="true"
        :aria-label="t('nav.settings')"
      >
        <div class="settings-head">
          <span class="settings-title">{{ t('nav.settings') }}</span>
          <button class="settings-close" :aria-label="t('nav.close')" @click="closeSettings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>
        <div class="settings-body">
          <div class="setting-item">
            <div class="setting-text">
              <span class="setting-label">{{ t('nav.uploadLogs') }}</span>
              <span class="setting-desc">{{ t('nav.uploadLogsDesc') }}</span>
            </div>
            <button
              class="setting-switch"
              :class="{ on: uploadEnabled }"
              role="switch"
              :aria-checked="uploadEnabled"
              :aria-label="t('nav.uploadLogs')"
              @click="toggleUpload"
            >
              <span class="switch-knob"></span>
            </button>
          </div>
          <p class="settings-note">{{ t('nav.uploadLogsNote') }}</p>

          <div class="settings-divider"></div>
          <div class="settings-section">
            <p class="section-label">{{ t('nav.appearance') }}</p>

            <div class="appearance-row">
              <span class="appearance-label">{{ t('nav.accentColor') }}</span>
              <div class="swatch-list">
                <button
                  v-for="color in accentPresets"
                  :key="color"
                  class="swatch"
                  :class="{ active: appearance.accent === color }"
                  :style="{ background: color }"
                  :aria-label="color"
                  @click="setAccent(color)"
                ></button>
                <label class="color-pick" :title="t('nav.customColor')">
                  <input type="color" :value="appearance.accent" @input="onAccentInput" />
                </label>
              </div>
            </div>

            <div class="appearance-row">
              <span class="appearance-label">{{ t('nav.bgLight') }}</span>
              <input
                class="color-input"
                type="color"
                :value="appearance.lightBg"
                @input="onLightBgInput"
              />
            </div>

            <div class="appearance-row">
              <span class="appearance-label">{{ t('nav.bgDark') }}</span>
              <input
                class="color-input"
                type="color"
                :value="appearance.darkBg"
                @input="onDarkBgInput"
              />
            </div>

            <div class="setting-item">
              <div class="setting-text">
                <span class="setting-label">{{ t('nav.glassNav') }}</span>
                <span class="setting-desc">{{ t('nav.glassNavDesc') }}</span>
              </div>
              <button
                class="setting-switch"
                :class="{ on: appearance.glass }"
                role="switch"
                :aria-checked="appearance.glass"
                :aria-label="t('nav.glassNav')"
                @click="toggleGlass"
              >
                <span class="switch-knob"></span>
              </button>
            </div>

            <div v-if="appearance.glass" class="glass-params">
              <div class="param-row">
                <span class="param-label">{{ t('nav.glassBlur') }}</span>
                <input
                  class="param-range"
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  :value="appearance.glassBlur"
                  @input="onGlassParam('glassBlur', $event)"
                />
                <span class="param-value">{{ appearance.glassBlur.toFixed(1) }}</span>
              </div>
              <div class="param-row">
                <span class="param-label">{{ t('nav.glassThickness') }}</span>
                <input
                  class="param-range"
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  :value="appearance.glassThickness"
                  @input="onGlassParam('glassThickness', $event)"
                />
                <span class="param-value">{{ Math.round(appearance.glassThickness) }}</span>
              </div>
              <div class="param-row">
                <span class="param-label">{{ t('nav.glassIor') }}</span>
                <input
                  class="param-range"
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.01"
                  :value="appearance.glassIor"
                  @input="onGlassParam('glassIor', $event)"
                />
                <span class="param-value">{{ appearance.glassIor.toFixed(2) }}</span>
              </div>
              <div class="param-row">
                <span class="param-label">{{ t('nav.glassNormalStrength') }}</span>
                <input
                  class="param-range"
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  :value="appearance.glassNormalStrength"
                  @input="onGlassParam('glassNormalStrength', $event)"
                />
                <span class="param-value">{{ appearance.glassNormalStrength.toFixed(1) }}</span>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-text">
                <span class="setting-label">{{ t('nav.reduceMotion') }}</span>
                <span class="setting-desc">{{ t('nav.reduceMotionDesc') }}</span>
              </div>
              <button
                class="setting-switch"
                :class="{ on: appearance.reduceMotion }"
                role="switch"
                :aria-checked="appearance.reduceMotion"
                :aria-label="t('nav.reduceMotion')"
                @click="toggleMotion"
              >
                <span class="switch-knob"></span>
              </button>
            </div>

            <button class="appearance-reset" @click="onResetAppearance">
              {{ t('nav.resetAppearance') }}
            </button>
          </div>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { t, toggleLocale, locale } from '../utils/i18n'
import AppIcon from './AppIcon.vue'
import { currentUser, currentProfile, loadSession, watchAuth, signOut } from '../utils/auth'
import { supabase } from '../utils/supabase'
import { showPrompt, showError, showSuccess } from '../utils/modal'
import { isLogUploadEnabled, enableLogUpload, disableLogUpload } from '../utils/logUploader'
import { appearance, updateAppearance, resetAppearance, ACCENT_PRESETS } from '../utils/appearance'
import { createLogger } from '../utils/logger'

const log = createLogger('NavBar')

log.info('顶部导航栏已初始化（导航菜单 / 用户卡片 / 主题 / 语言）')

const router = useRouter()
const isDark = ref(false)
const isSwitching = ref(false)
const moreOpen = ref(false)
const userOpen = ref(false)
const userMenuRef = ref(null)

const isAdmin = computed(() => currentProfile.value?.is_admin === true)

const closeUserMenu = (event) => {
  if (userOpen.value && userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    userOpen.value = false
  }
}

const onKeydown = (event) => {
  if (event.key !== 'Escape') return
  userOpen.value = false
  closeSettings()
}

/* 设置抽屉：仅承载「提交日志到数据库」开关 */
const settingsOpen = ref(false)
const uploadEnabled = ref(false)

const openSettings = () => {
  settingsOpen.value = true
  uploadEnabled.value = isLogUploadEnabled()
  log.info('打开设置抽屉', { uploadEnabled: uploadEnabled.value })
}

const closeSettings = () => {
  if (!settingsOpen.value) return
  settingsOpen.value = false
  log.debug('关闭设置抽屉')
}

const toggleUpload = () => {
  if (uploadEnabled.value) {
    disableLogUpload()
    showSuccess(t('nav.uploadLogsOff'))
  } else {
    enableLogUpload()
    showSuccess(t('nav.uploadLogsOn'))
  }
  uploadEnabled.value = isLogUploadEnabled()
  log.info('日志上传开关切换', { enabled: uploadEnabled.value })
}

/* 外观自定义 */
const accentPresets = ACCENT_PRESETS

const setAccent = (color) => {
  updateAppearance({ accent: color })
  log.debug('强调色已修改', color)
}

const onAccentInput = (event) => updateAppearance({ accent: event.target.value })
const onLightBgInput = (event) => updateAppearance({ lightBg: event.target.value })
const onDarkBgInput = (event) => updateAppearance({ darkBg: event.target.value })
const toggleGlass = () => updateAppearance({ glass: !appearance.value.glass })
const toggleMotion = () => updateAppearance({ reduceMotion: !appearance.value.reduceMotion })

const onGlassParam = (key, event) => {
  updateAppearance({ [key]: Number(event.target.value) })
}

const onResetAppearance = () => {
  resetAppearance()
  showSuccess(t('nav.appearanceReset'))
}

const doLogout = async () => {
  userOpen.value = false
  log.info('用户触发退出登录')
  await signOut()
  router.push('/home')
}

/* 修改密码：与注册使用同一套复杂度规则 */
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/

const changePassword = () => {
  userOpen.value = false
  log.info('打开修改密码弹窗')
  showPrompt({
    title: t('nav.changePassword'),
    message: t('nav.passwordRule'),
    placeholder: t('nav.newPasswordPh'),
    inputType: 'password',
    pattern: PASSWORD_RE,
    patternError: t('nav.passwordRule'),
    confirmText: t('nav.save'),
    cancelText: t('nav.cancel'),
    onConfirm: async (value) => {
      log.debug('提交新密码', { length: value ? String(value).length : 0 })
      const { error } = await supabase.auth.updateUser({ password: value })
      if (error) {
        log.error('修改密码失败', error.message)
        return showError(error.message)
      }
      log.info('修改密码成功')
      showSuccess(t('nav.passwordChanged'))
    }
  })
}

const copyUserId = async () => {
  userOpen.value = false
  const id = currentUser.value?.id
  if (!id) {
    log.warn('复制用户 ID 跳过：当前未登录')
    return
  }
  try {
    await navigator.clipboard.writeText(id)
    log.info('复制用户 ID 成功')
    showSuccess(t('nav.idCopied'))
  } catch (e) {
    log.error('复制用户 ID 失败', e)
    showError(t('nav.copyFailed'))
  }
}

const toggleLanguage = () => {
  log.debug('点击语言切换', {
    from: locale.value,
    to: locale.value === 'zh' ? 'en' : 'zh'
  })
  isSwitching.value = true
  toggleLocale()
  setTimeout(() => {
    isSwitching.value = false
  }, 400)
}

const openDeskPet = () => {
  window.open(import.meta.env.BASE_URL + 'desk-pet/加载.html', '_blank')
}

const applyTheme = (dark) => {
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  log.info(`主题切换为${isDark.value ? '深色' : '浅色'}模式`)
}

watch(userOpen, (val) => {
  log.debug(val ? '用户卡片展开' : '用户卡片收起')
})

/* 抽屉打开时锁定页面滚动 */
watch(settingsOpen, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

onMounted(() => {
  loadSession()
  watchAuth()
  document.addEventListener('click', closeUserMenu)
  document.addEventListener('keydown', onKeydown)
  const saved = localStorage.getItem('theme')
  if (saved) {
    isDark.value = saved === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme(isDark.value)
})

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenu)
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
  log.debug('导航栏已卸载')
})

watch(isDark, (val) => {
  applyTheme(val)
  localStorage.setItem('theme', val ? 'dark' : 'light')
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-bottom: 1px solid #eee;
  z-index: 1000;
  will-change: transform;
  transition: background 0.3s, border-color 0.3s,
    transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 登录页：顶栏向上滑出隐藏 */
.navbar.nav-hidden {
  transform: translateY(-100%);
}

.dark .navbar {
  background: #12121f;
  border-bottom: 1px solid #252540;
}

.nav-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  transition: color 0.3s;
}

.dark .nav-logo {
  color: #e0e0e0;
}

.nav-logo:hover {
  color: var(--accent, #42b983);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lang-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid #ddd;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 20px;
  color: #666;
  font-size: 13px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.lang-toggle:hover {
  background: #f0f9f4;
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(var(--accent-rgb, 66, 185, 131), 0.2);
}

.lang-toggle:active {
  transform: translateY(0);
  box-shadow: none;
}

.lang-toggle.switching {
  animation: langPulse 0.4s ease;
}

.lang-toggle.switching .lang-icon {
  animation: globeSpin 0.4s ease;
}

.lang-toggle.switching .lang-text {
  animation: textFade 0.4s ease;
}

@keyframes langPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes globeSpin {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}

@keyframes textFade {
  0% { opacity: 1; }
  25% { opacity: 0; transform: translateX(-5px); }
  50% { opacity: 0; transform: translateX(5px); }
  75% { opacity: 1; }
  100% { opacity: 1; transform: translateX(0); }
}

.lang-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.lang-icon {
  transition: transform 0.3s;
}

.lang-toggle:hover .lang-icon {
  transform: rotate(180deg);
}

.lang-text {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.dark .lang-toggle {
  border-color: #2d2d44;
  color: #aaa;
}

.dark .lang-toggle:hover {
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.15);
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
  box-shadow: 0 2px 8px rgba(var(--accent-rgb, 66, 185, 131), 0.3);
}

.desk-pet-btn {
  background: none;
  border: 1px solid #ddd;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.desk-pet-btn:hover {
  background: #f0f9f4;
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
  transform: translateY(-2px) rotate(-10deg);
  box-shadow: 0 4px 12px rgba(var(--accent-rgb, 66, 185, 131), 0.25);
}

.desk-pet-btn:active {
  transform: translateY(0) rotate(0deg);
  box-shadow: none;
}

.dark .desk-pet-btn {
  border-color: #2d2d44;
  color: #aaa;
}

.dark .desk-pet-btn:hover {
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.15);
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
  box-shadow: 0 4px 12px rgba(var(--accent-rgb, 66, 185, 131), 0.3);
}

.desk-pet-btn .icon {
  width: 18px;
  height: 18px;
}

.nav-links {
  display: flex;
  gap: 18px;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.dark .nav-link {
  color: #aaa;
}

.nav-link:hover {
  color: var(--accent, #42b983);
}

.nav-link.active {
  color: var(--accent, #42b983);
  font-weight: 500;
}

.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s, color 0.3s;
}

.dark .theme-toggle {
  color: #aaa;
}

.theme-toggle:hover {
  background: #f0f0f0;
  color: var(--accent, #42b983);
}

.dark .theme-toggle:hover {
  background: #2d2d44;
  color: var(--accent, #42b983);
}

.more-menu {
  position: relative;
}

.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid #ddd;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 20px;
  color: #666;
  font-size: 13px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.user-login:hover {
  background: #f0f9f4;
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(var(--accent-rgb, 66, 185, 131), 0.2);
}

.user-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent, #42b983);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
}

.user-name {
  font-weight: 500;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu:hover .user-btn,
.user-menu.open .user-btn {
  background: #f0f9f4;
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
}

.dark .user-btn {
  border-color: #2d2d44;
  color: #aaa;
}

.dark .user-menu:hover .user-btn,
.dark .user-menu.open .user-btn {
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.15);
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
}

.user-menu .more-arrow {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.user-menu.open .more-arrow {
  transform: rotate(180deg);
}

/* ---------- 用户 Hover Card ---------- */
.user-card {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 268px;
  padding: 8px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 14px;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.14);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px) scale(0.97);
  transform-origin: top right;
  pointer-events: none;
  transition: opacity 0.22s ease, transform 0.26s cubic-bezier(0.34, 1.56, 0.64, 1),
    visibility 0.22s;
  z-index: 1002;
}

.user-menu.open .user-card {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.user-card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 10px 14px;
}

.user-card-avatar {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent, #42b983), #2fa572);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 17px;
  box-shadow: 0 4px 12px rgba(var(--accent-rgb, 66, 185, 131), 0.28);
}

.user-card-info {
  min-width: 0;
}

.user-card-name {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
}

.role-badge {
  padding: 1px 6px;
  border-radius: 10px;
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.15);
  color: var(--accent, #42b983);
  font-size: 10px;
  font-weight: 600;
}

.user-card-email {
  margin: 3px 0 0;
  font-size: 12px;
  color: #999;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-card-divider {
  height: 1px;
  margin: 4px 8px;
  background: #f0f0f0;
}

.user-card-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 9px 10px;
  border: none;
  border-radius: 8px;
  background: none;
  color: #555;
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
}

.user-card-item:hover {
  background: #f0f9f4;
  color: var(--accent, #42b983);
}

.user-card-item.danger {
  color: #e05a5a;
}

.user-card-item.danger:hover {
  background: rgba(224, 90, 90, 0.1);
  color: #d24b4b;
}

.dark .user-card {
  background: #1a1a2e;
  border-color: #252540;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.5);
}

.dark .user-card-name {
  color: #e8e8e8;
}

.dark .user-card-divider {
  background: #252540;
}

.dark .user-card-item {
  color: #bbb;
}

.dark .user-card-item:hover {
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.15);
  color: var(--accent, #42b983);
}

.dark .user-card-item.danger {
  color: #e05a5a;
}

.dark .user-card-item.danger:hover {
  background: rgba(224, 90, 90, 0.16);
  color: #ff7b7b;
}

@media (max-width: 480px) {
  .user-card {
    width: 240px;
  }
}

.more-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid #ddd;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 20px;
  color: #666;
  font-size: 13px;
  transition: all 0.3s ease;
}

.more-text {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.more-arrow {
  width: 14px;
  height: 14px;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.more-menu:hover .more-btn,
.more-menu:focus-within .more-btn,
.more-menu.open .more-btn {
  background: #f0f9f4;
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(var(--accent-rgb, 66, 185, 131), 0.2);
}

.more-menu:hover .more-arrow,
.more-menu:focus-within .more-arrow,
.more-menu.open .more-arrow {
  transform: rotate(180deg);
}

.dark .more-btn {
  border-color: #2d2d44;
  color: #aaa;
}

.dark .more-menu:hover .more-btn,
.dark .more-menu:focus-within .more-btn,
.dark .more-menu.open .more-btn {
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.15);
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
  box-shadow: 0 2px 8px rgba(var(--accent-rgb, 66, 185, 131), 0.3);
}

.more-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 160px;
  padding: 6px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px) scale(0.96);
  transform-origin: top right;
  pointer-events: none;
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
    visibility 0.25s;
}

/* 悬停桥：补上按钮与面板之间的空隙，防止鼠标移动时收起 */
.more-dropdown::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -12px;
  height: 12px;
}

.more-menu:hover .more-dropdown,
.more-menu:focus-within .more-dropdown,
.more-menu.open .more-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.dark .more-dropdown {
  background: #1a1a2e;
  border-color: #252540;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}

.more-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  color: #555;
  text-decoration: none;
  font-size: 13px;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s;
}

.dark .more-item {
  color: #bbb;
}

.more-item:hover {
  background: #f0f9f4;
  color: var(--accent, #42b983);
}

.dark .more-item:hover {
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.15);
  color: var(--accent, #42b983);
}

.more-item.active {
  color: var(--accent, #42b983);
  font-weight: 500;
}

.icon {
  width: 20px;
  height: 20px;
}

/* 顶栏最右侧：设置按钮 */
.settings-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s, color 0.3s, transform 0.3s;
}

.dark .settings-toggle {
  color: #aaa;
}

.settings-toggle:hover,
.settings-toggle.active {
  background: #f0f0f0;
  color: var(--accent, #42b983);
}

.dark .settings-toggle:hover,
.dark .settings-toggle.active {
  background: #2d2d44;
  color: var(--accent, #42b983);
}

/* 宽屏：贴到顶栏最右侧边缘，与居中的导航内容分离 */
@media (min-width: 980px) {
  .settings-toggle {
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
  }
}

/* 设置抽屉 */
.settings-layer {
  position: fixed;
  inset: 0;
  z-index: 1400;
  pointer-events: none;
}

.settings-layer.open {
  pointer-events: auto;
}

.settings-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.38);
  opacity: 0;
  transition: opacity 0.32s ease;
}

.settings-layer.open .settings-overlay {
  opacity: 1;
}

.settings-drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 320px;
  max-width: 86vw;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-left: 1px solid #eee;
  box-shadow: -12px 0 36px rgba(0, 0, 0, 0.12);
  transform: translateX(100%);
  transition: transform 0.42s cubic-bezier(0.16, 1, 0.3, 1),
    background 0.3s, border-color 0.3s;
}

.settings-layer.open .settings-drawer {
  transform: translateX(0);
}

.dark .settings-drawer {
  background: #12121f;
  border-left-color: #252540;
  box-shadow: -12px 0 36px rgba(0, 0, 0, 0.55);
}

.settings-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid #eee;
}

.dark .settings-head {
  border-bottom-color: #252540;
}

.settings-title {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 0.5px;
}

.dark .settings-title {
  color: #e8e8e8;
}

.settings-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 6px;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}

.settings-close svg {
  width: 16px;
  height: 16px;
}

.settings-close:hover {
  background: #f0f0f0;
  color: var(--accent, #42b983);
}

.dark .settings-close:hover {
  background: #2d2d44;
  color: var(--accent, #42b983);
}

.settings-body {
  flex: 1;
  overflow-y: auto;
  padding: 18px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fafafa;
}

.dark .setting-item {
  background: #1a1a2e;
  border-color: #252540;
}

.setting-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.setting-label {
  font-size: 13.5px;
  font-weight: 500;
  color: #2c3e50;
}

.dark .setting-label {
  color: #e0e0e0;
}

.setting-desc {
  font-size: 11.5px;
  line-height: 1.5;
  color: #999;
}

.dark .setting-desc {
  color: #888;
}

.setting-switch {
  flex: 0 0 auto;
  position: relative;
  width: 40px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 11px;
  background: #d8d8d8;
  cursor: pointer;
  transition: background 0.28s ease;
}

.setting-switch.on {
  background: var(--accent, #42b983);
}

.dark .setting-switch {
  background: #3a3a52;
}

.glass-params {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fafafa;
}

.dark .glass-params {
  background: #1a1a2e;
  border-color: #252540;
}

.param-row {
  display: grid;
  grid-template-columns: 76px 1fr 34px;
  align-items: center;
  gap: 10px;
}

.param-label {
  font-size: 12px;
  color: #666;
}

.dark .param-label {
  color: #aaa;
}

.param-value {
  font-size: 11.5px;
  color: #999;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.param-range {
  width: 100%;
  height: 18px;
  accent-color: var(--accent, #42b983);
  cursor: pointer;
}

.dark .setting-switch.on {
  background: var(--accent, #42b983);
}

.switch-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.setting-switch.on .switch-knob {
  transform: translateX(18px);
}

.settings-note {
  margin: 12px 2px 0;
  font-size: 11.5px;
  line-height: 1.6;
  color: #aaa;
}

.dark .settings-note {
  color: #777;
}

/* 外观自定义 */
.settings-divider {
  height: 1px;
  background: #eee;
  margin: 18px -18px 16px;
}

.dark .settings-divider {
  background: #252540;
}

.section-label {
  margin-bottom: 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #aaa;
}

.dark .section-label {
  color: #777;
}

.appearance-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.appearance-label {
  font-size: 13px;
  color: #2c3e50;
  white-space: nowrap;
}

.dark .appearance-label {
  color: #e0e0e0;
}

.swatch-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.swatch {
  width: 18px;
  height: 18px;
  padding: 0;
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s;
}

.dark .swatch {
  border-color: #12121f;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.swatch:hover {
  transform: scale(1.15);
}

.swatch.active {
  border-color: #fff;
  box-shadow: 0 0 0 2px var(--accent, #42b983);
}

.dark .swatch.active {
  border-color: #12121f;
}

.color-pick {
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  background: conic-gradient(#f87171, #fbbf24, #34d399, #60a5fa, #a78bfa, #f87171);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dark .color-pick {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.16);
}

.color-pick:hover {
  transform: scale(1.15);
}

.color-pick input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  opacity: 0;
  border: none;
  cursor: pointer;
}

.color-input {
  width: 40px;
  height: 24px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
}

.dark .color-input {
  border-color: #3a3a52;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 2px;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

.setting-item + .setting-item {
  margin-top: 10px;
}

.appearance-reset {
  width: 100%;
  margin-top: 14px;
  padding: 9px;
  border: 1px solid #eee;
  border-radius: 10px;
  background: transparent;
  color: #777;
  font-size: 12.5px;
  cursor: pointer;
  transition: color 0.25s, border-color 0.25s, background 0.25s;
}

.dark .appearance-reset {
  border-color: #252540;
  color: #999;
}

.appearance-reset:hover {
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.08);
}

@media (max-width: 480px) {
  .settings-drawer {
    width: 100%;
    max-width: 100%;
  }
}

/* 窄屏隐藏导航图标，避免挤压换行 */
@media (max-width: 680px) {
  .nav-link .app-icon {
    display: none;
  }

  .nav-links {
    gap: 12px;
  }
}
</style>
