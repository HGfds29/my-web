<template>
  <div class="games-page" :class="{ leaving: isLeaving }">
    <div class="page-header stagger-item" :style="{ '--delay': '0.05s' }">
      <button class="back-btn" @click="goBack">{{ t('games.back') }}</button>
      <h1>{{ t('games.title') }}</h1>
      <p class="subtitle">{{ t('games.subtitle') }}</p>
    </div>

    <div class="game-list stagger-item" :style="{ '--delay': '0.15s' }">
      <h2 class="section-title">{{ t('games.allGames') }}</h2>
      <Transition :name="pageDirection === 'forward' ? 'page-forward' : 'page-backward'" mode="out-in">
        <div :key="currentPage" class="page-content">
          <div
            class="game-item"
            v-for="(item, index) in currentGames"
            :key="item.id"
            :style="{ '--item-delay': (index * 0.08) + 's' }"
            @click="goToDetail(item.id)"
          >
            <div class="game-icon">{{ getEmoji(item.platform) }}</div>
            <div class="game-content">
              <h3>{{ item.title }}</h3>
              <div class="meta">
                <span class="date">{{ item.date }}</span>
                <span class="platform">{{ item.platform }}</span>
              </div>
              <p class="desc">{{ item.desc }}</p>
              <span class="read-more">{{ t('games.viewDetail') }}</span>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <div v-if="totalPages > 1" class="pagination stagger-item" :style="{ '--delay': '0.25s' }">
      <button
        class="page-btn prev-btn"
        :disabled="currentPage === 1"
        @click="prevPage"
      >
        {{ t('games.prev') }}
      </button>
      <div class="page-numbers">
        <button
          v-for="page in totalPages"
          :key="page"
          class="page-btn page-num"
          :class="{ active: currentPage === page }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </div>
      <button
        class="page-btn next-btn"
        :disabled="currentPage === totalPages"
        @click="nextPage"
      >
        {{ t('games.next') }}
      </button>
    </div>

    <footer class="footer stagger-item" :style="{ '--delay': '0.35s' }">
      <p>{{ t('games.footer') }}</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { isLeaving } from '../router'
import { t } from '../utils/i18n'
import gameList from '../data/games.json'

console.log('[MyGamesIntro.vue] 组件初始化')
console.log('[MyGamesIntro.vue] 游戏总数:', gameList.length)

const router = useRouter()
const currentPage = ref(1)
const pageSize = 5
const pageDirection = ref('forward')

const totalPages = computed(() => {
  const pages = Math.ceil(gameList.length / pageSize)
  console.log('[MyGamesIntro/totalPages] 总页数:', pages)
  return pages
})

const currentGames = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  const games = gameList.slice(start, end)
  console.log('[MyGamesIntro/currentGames] 第', currentPage.value, '页游戏:', games.map(g => g.title))
  return games
})

const getEmoji = (platform) => {
  if (platform.includes('Switch')) return '🎮'
  if (platform.includes('PC')) return '⌨️'
  if (platform.includes('PS')) return '🕹️'
  if (platform.includes('全平台')) return '🌍'
  return '🎮'
}

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  console.log('[MyGamesIntro/goToPage] 跳转到第', page, '页')
  pageDirection.value = page > currentPage.value ? 'forward' : 'backward'
  console.log('[MyGamesIntro/goToPage] 动画方向:', pageDirection.value)
  currentPage.value = page
}

const prevPage = () => {
  if (currentPage.value > 1) {
    console.log('[MyGamesIntro/prevPage] 上一页')
    pageDirection.value = 'backward'
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    console.log('[MyGamesIntro/nextPage] 下一页')
    pageDirection.value = 'forward'
    currentPage.value++
  }
}

const goToDetail = (id) => {
  console.log('[MyGamesIntro/goToDetail] 跳转到游戏详情 ID:', id)
  router.push(`/games/${id}`)
}

const goBack = () => {
  console.log('[MyGamesIntro/goBack] 返回首页')
  router.push('/')
}

onMounted(() => {
  console.log('[MyGamesIntro/onMounted] 游戏列表页已加载，当前第', currentPage.value, '页')
})
</script>

<style scoped>
.games-page {
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

.page-header {
  text-align: center;
  padding: 40px 0 30px;
}

.back-btn {
  position: absolute;
  left: 20px;
  top: 20px;
  background: none;
  border: none;
  color: #42b983;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}

.back-btn:hover {
  text-decoration: underline;
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: 32px;
}

.subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.game-list {
  margin-top: 20px;
  min-height: 400px;
}

.section-title {
  font-size: 22px;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #42b983;
  display: inline-block;
}

.page-forward-enter-active,
.page-forward-leave-active,
.page-backward-enter-active,
.page-backward-leave-active {
  transition: all 0.3s ease;
}

.page-forward-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-forward-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.page-backward-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.page-backward-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.game-item {
  display: flex;
  gap: 16px;
  margin: 16px 0;
  border: 1px solid #eee;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.3s, transform 0.2s;
  animation: fadeInUp 0.4s ease backwards;
  animation-delay: var(--item-delay);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.game-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.game-icon {
  font-size: 48px;
  flex-shrink: 0;
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-content {
  flex: 1;
  min-width: 0;
}

.game-content h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #999;
  flex-wrap: wrap;
}

.platform {
  background: #f0f9f4;
  color: #42b983;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.desc {
  color: #666;
  font-size: 14px;
  margin: 0 0 10px;
}

.read-more {
  color: #42b983;
  font-size: 13px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 30px;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: #fff;
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  border-color: #42b983;
  color: #42b983;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn.active {
  background: #42b983;
  color: #fff;
  border-color: #42b983;
}

.page-num {
  min-width: 36px;
  padding: 8px 0;
  text-align: center;
}

.footer {
  margin-top: 60px;
  padding-top: 24px;
  border-top: 1px solid #eee;
  text-align: center;
  color: #999;
  font-size: 13px;
}

:global(.dark) .games-page {
  color: #e0e0e0;
}

:global(.dark) .page-header h1 {
  color: #e0e0e0;
}

:global(.dark) .subtitle {
  color: #aaa;
}

:global(.dark) .section-title {
  color: #e0e0e0;
}

:global(.dark) .game-item {
  background: #1a1a2e;
  border-color: #2d2d44;
}

:global(.dark) .game-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

:global(.dark) .game-content h3 {
  color: #e0e0e0;
}

:global(.dark) .meta {
  color: #888;
}

:global(.dark) .platform {
  background: rgba(66, 185, 131, 0.2);
  color: #42b983;
}

:global(.dark) .desc {
  color: #aaa;
}

:global(.dark) .read-more {
  color: #42b983;
}

:global(.dark) .page-btn {
  background: #1a1a2e;
  border-color: #2d2d44;
  color: #aaa;
}

:global(.dark) .page-btn:hover:not(:disabled) {
  border-color: #42b983;
  color: #42b983;
}

:global(.dark) .page-btn.active {
  background: #42b983;
  color: #fff;
}

:global(.dark) .footer {
  border-top-color: #2d2d44;
  color: #888;
}
</style>
