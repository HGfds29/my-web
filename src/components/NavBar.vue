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
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { t, toggleLocale, locale } from '../utils/i18n'
import AppIcon from './AppIcon.vue'
import { currentUser, currentProfile, loadSession, watchAuth, signOut } from '../utils/auth'
import { supabase } from '../utils/supabase'
import { showPrompt, showError, showSuccess } from '../utils/modal'

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
  if (event.key === 'Escape') userOpen.value = false
}

const doLogout = async () => {
  await signOut()
  userOpen.value = false
  router.push('/home')
}

/* 修改密码：与注册使用同一套复杂度规则 */
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/

const changePassword = () => {
  userOpen.value = false
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
      const { error } = await supabase.auth.updateUser({ password: value })
      if (error) return showError(error.message)
      showSuccess(t('nav.passwordChanged'))
    }
  })
}

const copyUserId = async () => {
  userOpen.value = false
  const id = currentUser.value?.id
  if (!id) return
  try {
    await navigator.clipboard.writeText(id)
    showSuccess(t('nav.idCopied'))
  } catch {
    showError(t('nav.copyFailed'))
  }
}

const toggleLanguage = () => {
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
}

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
  color: #42b983;
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
  color: #42b983;
  border-color: #42b983;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.2);
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
  background: rgba(66, 185, 131, 0.15);
  color: #42b983;
  border-color: #42b983;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.3);
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
  color: #42b983;
  border-color: #42b983;
  transform: translateY(-2px) rotate(-10deg);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.25);
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
  background: rgba(66, 185, 131, 0.15);
  color: #42b983;
  border-color: #42b983;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
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
  color: #42b983;
}

.nav-link.active {
  color: #42b983;
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
  color: #42b983;
}

.dark .theme-toggle:hover {
  background: #2d2d44;
  color: #42b983;
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
  color: #42b983;
  border-color: #42b983;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.2);
}

.user-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #42b983;
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
  color: #42b983;
  border-color: #42b983;
}

.dark .user-btn {
  border-color: #2d2d44;
  color: #aaa;
}

.dark .user-menu:hover .user-btn,
.dark .user-menu.open .user-btn {
  background: rgba(66, 185, 131, 0.15);
  color: #42b983;
  border-color: #42b983;
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
  background: linear-gradient(135deg, #42b983, #2fa572);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 17px;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.28);
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
  background: rgba(66, 185, 131, 0.15);
  color: #42b983;
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
  color: #42b983;
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
  background: rgba(66, 185, 131, 0.15);
  color: #42b983;
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
  color: #42b983;
  border-color: #42b983;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.2);
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
  background: rgba(66, 185, 131, 0.15);
  color: #42b983;
  border-color: #42b983;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.3);
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
  color: #42b983;
}

.dark .more-item:hover {
  background: rgba(66, 185, 131, 0.15);
  color: #42b983;
}

.more-item.active {
  color: #42b983;
  font-weight: 500;
}

.icon {
  width: 20px;
  height: 20px;
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
