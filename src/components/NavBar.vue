<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/home" class="nav-logo">{{ t('nav.title') }}</router-link>
      <div class="nav-right">
        <div class="nav-links">
          <router-link to="/home" class="nav-link" active-class="active">{{ t('nav.home') }}</router-link>
          <router-link to="/blog" class="nav-link" active-class="active">{{ t('nav.blog') }}</router-link>
          <router-link to="/photos" class="nav-link" active-class="active">{{ t('nav.photos') }}</router-link>
          <router-link to="/games" class="nav-link" active-class="active">{{ t('nav.games') }}</router-link>
          <router-link to="/about" class="nav-link" active-class="active">{{ t('nav.about') }}</router-link>
        </div>
        <button class="lang-toggle" @click="toggleLanguage" :class="{ switching: isSwitching }" :title="t('nav.switchLangTip')">
          <span class="lang-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </span>
          <span class="lang-text">{{ t('nav.switchLang') }}</span>
        </button>
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
import { ref, onMounted, watch } from 'vue'
import { t, toggleLocale } from '../utils/i18n'

console.log('[NavBar] 组件初始化')

const isDark = ref(false)
const isSwitching = ref(false)

const toggleLanguage = () => {
  console.log('[NavBar/toggleLanguage] 切换语言')
  isSwitching.value = true
  toggleLocale()
  setTimeout(() => {
    isSwitching.value = false
  }, 400)
}

const applyTheme = (dark) => {
  console.log('[NavBar/applyTheme] 应用主题:', dark ? '深色' : '浅色')
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const toggleTheme = () => {
  console.log('[NavBar/toggleTheme] 切换主题，当前:', isDark.value ? '深色' : '浅色')
  isDark.value = !isDark.value
  console.log('[NavBar/toggleTheme] 切换后:', isDark.value ? '深色' : '浅色')
}

onMounted(() => {
  console.log('[NavBar/onMounted] 组件已挂载')
  const saved = localStorage.getItem('theme')
  console.log('[NavBar/onMounted] 本地存储主题:', saved)
  if (saved) {
    isDark.value = saved === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    console.log('[NavBar/onMounted] 使用系统主题偏好:', isDark.value ? '深色' : '浅色')
  }
  applyTheme(isDark.value)
  console.log('[NavBar/onMounted] 最终主题:', isDark.value ? '深色' : '浅色')
})

watch(isDark, (val) => {
  console.log('[NavBar/watch] isDark 变化:', val)
  applyTheme(val)
  localStorage.setItem('theme', val ? 'dark' : 'light')
  console.log('[NavBar/watch] 主题已保存到 localStorage')
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
  transition: background 0.3s, border-color 0.3s;
}

:global(.dark) .navbar {
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

:global(.dark) .nav-logo {
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

.lang-icon svg {
  width: 16px;
  height: 16px;
  transition: transform 0.3s;
}

.lang-toggle:hover .lang-icon svg {
  transform: rotate(180deg);
}

.lang-text {
  font-weight: 500;
  letter-spacing: 0.5px;
}

:global(.dark) .lang-toggle {
  border-color: #2d2d44;
  color: #aaa;
}

:global(.dark) .lang-toggle:hover {
  background: rgba(66, 185, 131, 0.15);
  color: #42b983;
  border-color: #42b983;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.3);
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

:global(.dark) .nav-link {
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

:global(.dark) .theme-toggle {
  color: #aaa;
}

.theme-toggle:hover {
  background: #f0f0f0;
  color: #42b983;
}

:global(.dark) .theme-toggle:hover {
  background: #2d2d44;
  color: #42b983;
}

.icon {
  width: 20px;
  height: 20px;
}
</style>
