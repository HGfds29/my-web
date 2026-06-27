<template>
  <div class="game-detail" :class="{ leaving: isLeaving }">
    <div class="stagger-item" :style="{ '--delay': '0.05s' }">
      <button class="back-btn" @click="goBack">← 返回</button>
    </div>
    <article v-if="game" class="stagger-item" :style="{ '--delay': '0.1s' }">
      <h1>{{ game.title }}</h1>
      <div class="meta">
        <span class="date">{{ game.date }}</span>
        <span class="platform">{{ game.platform }}</span>
      </div>
      <div v-if="game.images && game.images.length > 0" class="images">
        <img
          v-for="(img, idx) in game.images"
          :key="idx"
          :src="img"
          :alt="game.title + ' 图片' + (idx + 1)"
          class="article-image"
          @click="previewImage(img)"
        />
      </div>
      <div class="content">
        <pre>{{ game.content }}</pre>
      </div>
    </article>
    <p v-else class="not-found">游戏不存在</p>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isLeaving } from '../router'
import gameList from '../data/games.json'

console.log('[GameDetail.vue] 组件初始化')

const route = useRoute()
const router = useRouter()

const game = computed(() => {
  const id = Number(route.params.id)
  console.log('[GameDetail/game] 查找游戏 ID:', id)
  const found = gameList.find(item => item.id === id)
  console.log('[GameDetail/game] 找到游戏:', found ? found.title : '未找到')
  return found
})

const goBack = () => {
  console.log('[GameDetail/goBack] 返回游戏列表')
  router.back()
}

const previewImage = (src) => {
  console.log('[GameDetail/previewImage] 预览图片:', src)
  window.open(src, '_blank')
}

onMounted(() => {
  console.log('[GameDetail/onMounted] 游戏详情页已加载，游戏ID:', route.params.id)
})
</script>

<style scoped>
.game-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
}

.stagger-item {
  opacity: 0;
  transform: translateX(30px);
  animation: slideIn 0.45s ease forwards;
  animation-delay: var(--delay);
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.leaving .stagger-item {
  opacity: 1;
  transform: translateX(0);
  animation: slideOut 0.4s ease forwards;
  animation-delay: var(--delay);
}

@keyframes slideOut {
  to {
    opacity: 0;
    transform: translateX(60px);
  }
}

.back-btn {
  background: none;
  border: none;
  color: #42b983;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  margin-bottom: 20px;
}

.back-btn:hover {
  text-decoration: underline;
}

h1 {
  margin-top: 0;
  font-size: 28px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #999;
  font-size: 14px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.platform {
  background: #f0f9f4;
  color: #42b983;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.images {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-image {
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.article-image:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.content {
  margin-top: 24px;
  line-height: 1.8;
}

.content pre {
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 16px;
  margin: 0;
}

.not-found {
  text-align: center;
  color: #999;
  margin-top: 100px;
}

:global(.dark) .game-detail {
  color: #e0e0e0;
}

:global(.dark) h1 {
  color: #e0e0e0;
}

:global(.dark) .meta {
  color: #888;
}

:global(.dark) .platform {
  background: rgba(66, 185, 131, 0.2);
  color: #42b983;
}

:global(.dark) .article-image:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

:global(.dark) .content pre {
  color: #e0e0e0;
}

:global(.dark) .not-found {
  color: #888;
}
</style>
