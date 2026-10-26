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
import { createLogger } from '../utils/logger'
import gameList from '../data/games.json'

const log = createLogger('MyGamesIntro')
// 模块初始化：游戏列表的分页浏览与详情跳转
log.info('游戏列表模块已初始化：游戏分页浏览与详情跳转')

const router = useRouter()
const currentPage = ref(1)
const pageSize = 5
const pageDirection = ref('forward')

const totalPages = computed(() => {
  const pages = Math.ceil(gameList.length / pageSize)
  log.debug('计算游戏总页数', { pages })
  return pages
})

const currentGames = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  const games = gameList.slice(start, end)
  log.debug('当前页游戏已就绪', { page: currentPage.value, count: games.length, ids: games.map(g => g.id) })
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
  if (page < 1 || page > totalPages.value) {
    log.warn('翻页被忽略：页码超出范围', { page, total: totalPages.value })
    return
  }
  log.info('翻页', { from: currentPage.value, to: page })
  pageDirection.value = page > currentPage.value ? 'forward' : 'backward'
  currentPage.value = page
}

const prevPage = () => {
  if (currentPage.value > 1) {
    log.info('上一页', { from: currentPage.value, to: currentPage.value - 1 })
    pageDirection.value = 'backward'
    currentPage.value--
  } else {
    log.debug('已在第一页，忽略上一页')
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    log.info('下一页', { from: currentPage.value, to: currentPage.value + 1 })
    pageDirection.value = 'forward'
    currentPage.value++
  } else {
    log.debug('已在最后一页，忽略下一页')
  }
}

const goToDetail = (id) => {
  log.info('打开游戏详情', { id, page: currentPage.value })
  router.push(`/games/${id}`)
}

const goBack = () => {
  log.info('返回首页')
  router.push('/')
}

onMounted(() => {
  log.debug('开始加载游戏列表', { source: 'src/data/games.json' })
  log.info('游戏列表加载完成', { total: gameList.length, pages: totalPages.value })
  log.info('MyGamesIntro 页面已加载', { page: currentPage.value })
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
  color: var(--accent, #42b983);
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
  border-bottom: 2px solid var(--accent, #42b983);
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
  color: var(--accent, #42b983);
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
  color: var(--accent, #42b983);
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
  border-color: var(--accent, #42b983);
  color: var(--accent, #42b983);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn.active {
  background: var(--accent, #42b983);
  color: #fff;
  border-color: var(--accent, #42b983);
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

/* 深色模式样式统一在 src/assets/css/global.css 中维护：
   作用域样式里的全局选择器写法会丢弃其后的后代选择器，
   无法命中挂在 html 上的深色类名下的元素。 */
</style>
