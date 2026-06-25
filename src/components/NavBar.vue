<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/home" class="nav-logo">我的网站</router-link>
      <div class="nav-right">
        <div class="nav-links">
          <router-link to="/home" class="nav-link" active-class="active">首页</router-link>
          <router-link to="/blog" class="nav-link" active-class="active">博客</router-link>
          <router-link to="/photos" class="nav-link" active-class="active">照片集</router-link>
          <router-link to="/about" class="nav-link" active-class="active">关于</router-link>
        </div>
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换到浅色模式' : '切换到深色模式'">
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

const isDark = ref(false)

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
  const saved = localStorage.getItem('theme')
  if (saved) {
    isDark.value = saved === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme(isDark.value)
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
  gap: 20px;
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
