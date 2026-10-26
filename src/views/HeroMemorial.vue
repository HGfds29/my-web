<template>
  <div class="hero-page" :class="{ leaving: isLeaving }">
    <div class="stagger-item" :style="{ '--delay': '0.1s' }">
      <button class="back-btn" @click="goBack">{{ t('hero.back') }}</button>
    </div>
    <div class="stagger-item header-area" :style="{ '--delay': '0.15s' }">
      <div class="divider">
        <span class="line"></span>
        <span class="hero-text">
          ꧁꫞<span class="star">☆</span>{{ heroTitle }}<span class="star">☆</span>꫞꧂
        </span>
        <span class="line"></span>
      </div>
    </div>
    <div class="stagger-item video-area" :style="{ '--delay': '0.25s' }">
      <div class="video-wrapper">
        <iframe
          :src="videoUrl"
          scrolling="no"
          border="0"
          frameborder="no"
          framespacing="0"
          allowfullscreen="true"
          class="bilibili-video"
        ></iframe>
      </div>
    </div>
    <div class="stagger-item footer-area" :style="{ '--delay': '0.35s' }">
      <div class="divider small">
        <span class="line"></span>
        <span class="hero-sub">{{ heroSub }}</span>
        <span class="line"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { isLeaving } from '../router'
import { t, locale } from '../utils/i18n'
import { createLogger } from '../utils/logger'

const log = createLogger('HeroMemorial')
// 模块初始化：英雄纪念页展示纪念标题与致敬视频
log.info('英雄纪念页模块已初始化：展示纪念标题与致敬视频')

const router = useRouter()

const heroTitle = computed(() => {
  return locale.value === 'zh' ? '人民英雄永垂不朽' : 'Eternal Glory to the People\'s Heroes'
})

const heroSub = computed(() => {
  return locale.value === 'zh' ? '向所有为国家和人民献出生命的英雄致敬' : 'Tribute to all heroes who gave their lives for the country and people'
})

const videoUrl = 'https://player.bilibili.com/player.html?bvid=BV1jb7B6SEay&page=1&high_quality=1&autoplay=0'

const goBack = () => {
  log.info('返回首页')
  router.push('/')
}

onMounted(() => {
  log.info('HeroMemorial 页面已加载', { locale: locale.value })
  log.debug('纪念视频地址已就绪', { url: videoUrl })
})
</script>

<style scoped>
.hero-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 入场光晕背景 */
.hero-page::before {
  content: '';
  position: fixed;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(196, 30, 58, 0.25) 0%, rgba(255, 215, 0, 0.1) 40%, transparent 70%);
  transform: translate(-50%, -50%) scale(0);
  animation: glowExpand 1.6s ease-out forwards;
  pointer-events: none;
  z-index: 0;
}

@keyframes glowExpand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(30);
    opacity: 0;
  }
}

.stagger-item {
  opacity: 0;
  animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--delay);
  position: relative;
  z-index: 1;
}

@keyframes fadeUp {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.92);
    filter: blur(8px);
  }
  60% {
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

.leaving .stagger-item {
  animation: fadeDown 0.5s cubic-bezier(0.7, 0, 0.84, 0) forwards;
  animation-delay: var(--delay);
}

@keyframes fadeDown {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
    filter: blur(6px);
  }
}

.leaving::before {
  animation: glowCollapse 0.5s ease-in forwards;
}

@keyframes glowCollapse {
  0% {
    transform: translate(-50%, -50%) scale(30);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
}

.back-btn {
  background: none;
  border: none;
  color: var(--accent, #42b983);
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  margin-bottom: 20px;
  align-self: flex-start;
}

.back-btn:hover {
  text-decoration: underline;
}

.header-area {
  width: 100%;
  margin-bottom: 40px;
}

.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
}

.divider .line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, #c41e3a, transparent);
  max-width: 200px;
  transform: scaleX(0);
  transform-origin: center;
  animation: lineExpand 1s ease-out forwards;
  animation-delay: 0.3s;
}

@keyframes lineExpand {
  to {
    transform: scaleX(1);
  }
}

.hero-text {
  font-size: 28px;
  font-weight: 700;
  color: #c41e3a;
  letter-spacing: 4px;
  white-space: nowrap;
  text-shadow: 0 2px 8px rgba(196, 30, 58, 0.3);
}

.hero-text .star {
  color: #ffd700;
  margin: 0 6px;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
  display: inline-block;
  animation: starTwinkle 2s ease-in-out infinite;
}

@keyframes starTwinkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.15);
  }
}

.video-area {
  width: 100%;
  display: flex;
  justify-content: center;
}

.video-wrapper {
  width: 100%;
  max-width: 800px;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(196, 30, 58, 0.2);
}

.bilibili-video {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.footer-area {
  width: 100%;
  margin-top: 40px;
}

.divider.small .line {
  max-width: 100px;
  height: 1px;
}

.hero-sub {
  font-size: 14px;
  color: #888;
  letter-spacing: 2px;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .hero-text {
    font-size: 20px;
    letter-spacing: 2px;
  }
  
  .hero-sub {
    font-size: 12px;
    letter-spacing: 1px;
  }
  
  .divider {
    gap: 10px;
  }
  
  .divider .line {
    max-width: 60px;
  }
}
</style>
