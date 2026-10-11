<template>
  <div class="notfound-page" :class="{ leaving: isLeaving }">
    <h1 class="code stagger-item" :style="{ '--delay': '0.05s' }">404</h1>
    <p class="desc stagger-item" :style="{ '--delay': '0.15s' }">{{ t('notFound.desc') }}</p>
    <button class="home-btn stagger-item" :style="{ '--delay': '0.25s' }" @click="goHome">{{ t('notFound.backHome') }}</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { isLeaving } from '../router'
import { t } from '../utils/i18n'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.notfound-page {
  min-height: calc(100vh - 60px);
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
}

.stagger-item {
  opacity: 0;
  transform: translateY(24px);
  animation: fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--delay);
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.leaving .stagger-item {
  opacity: 1;
  transform: translateY(0);
  animation: fadeOut 0.4s ease forwards;
  animation-delay: var(--delay);
}

@keyframes fadeOut {
  to {
    opacity: 0;
    transform: translateY(-16px);
  }
}

.code {
  margin: 0;
  font-size: 72px;
}

.desc {
  margin-top: 12px;
  color: #666;
  font-size: 15px;
  line-height: 1.8;
}

.home-btn {
  margin-top: 32px;
  background: none;
  border: 1px solid #42b983;
  color: #42b983;
  padding: 10px 28px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.home-btn:hover {
  background: #f0f9f4;
}

html.dark .code {
  color: #f0f0f0;
}

html.dark .desc {
  color: #aaa;
}

html.dark .home-btn:hover {
  background: #1e2d3a;
}
</style>
