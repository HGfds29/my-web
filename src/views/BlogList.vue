<template>
  <div class="blog-page" :class="{ leaving: isLeaving }">
    <div class="page-header stagger-item" :style="{ '--delay': '0.05s' }">
      <button class="back-btn" @click="goBack">{{ t('blogList.back') }}</button>
      <h1>{{ t('blogList.title') }}</h1>
      <p class="subtitle">{{ t('blogList.subtitle') }}</p>
    </div>

    <div class="post-list stagger-item" :style="{ '--delay': '0.15s' }">
      <h2 class="section-title">{{ t('blogList.allPosts') }}</h2>
      <Transition :name="pageDirection === 'forward' ? 'page-forward' : 'page-backward'" mode="out-in">
        <div :key="currentPage" class="page-content">
          <div
            class="post-item"
            v-for="(item, index) in currentPosts"
            :key="item.id"
            :style="{ '--item-delay': (index * 0.08) + 's' }"
            @click="goToDetail(item.id)"
          >
            <h3>{{ item.title }}</h3>
            <p class="date">{{ item.date }}</p>
            <p class="desc">{{ item.desc }}</p>
            <span class="read-more">{{ t('blogList.readMore') }}</span>
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
        {{ t('blogList.prev') }}
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
        {{ t('blogList.next') }}
      </button>
    </div>

    <footer class="footer stagger-item" :style="{ '--delay': '0.35s' }">
      <p>{{ t('blogList.footer') }}</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { isLeaving } from '../router'
import { t } from '../utils/i18n'
import blogList from '../data/blog.json'

console.log('[BlogList.vue] 组件初始化')
console.log('[BlogList.vue] 文章总数:', blogList.length)

const router = useRouter()
const currentPage = ref(1)
const pageSize = 5
const pageDirection = ref('forward')

const totalPages = computed(() => {
  const pages = Math.ceil(blogList.length / pageSize)
  console.log('[BlogList/totalPages] 总页数:', pages)
  return pages
})

const currentPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  const posts = blogList.slice(start, end)
  console.log('[BlogList/currentPosts] 第', currentPage.value, '页文章:', posts.map(p => p.title))
  return posts
})

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  console.log('[BlogList/goToPage] 跳转到第', page, '页')
  pageDirection.value = page > currentPage.value ? 'forward' : 'backward'
  console.log('[BlogList/goToPage] 动画方向:', pageDirection.value)
  currentPage.value = page
}

const prevPage = () => {
  if (currentPage.value > 1) {
    console.log('[BlogList/prevPage] 上一页')
    pageDirection.value = 'backward'
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    console.log('[BlogList/nextPage] 下一页')
    pageDirection.value = 'forward'
    currentPage.value++
  }
}

const goToDetail = (id) => {
  console.log('[BlogList/goToDetail] 跳转到文章详情 ID:', id)
  router.push(`/blog/${id}`)
}

const goBack = () => {
  console.log('[BlogList/goBack] 返回首页')
  router.push('/')
}

onMounted(() => {
  console.log('[BlogList/onMounted] 博客列表页已加载，当前第', currentPage.value, '页')
})
</script>

<style scoped>
.blog-page {
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

.post-list {
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

.post-item {
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

.post-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.post-item h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.date {
  color: #999;
  font-size: 13px;
  margin: 0 0 8px;
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

:global(.dark) .post-item {
  background: #1a1a2e;
  border-color: #2d2d44;
}

:global(.dark) .post-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
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
</style>
