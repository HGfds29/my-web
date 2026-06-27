<template>
  <div class="blog-detail" :class="{ leaving: isLeaving }">
    <div class="stagger-item" :style="{ '--delay': '0.05s' }">
      <button class="back-btn" @click="goBack">{{ t('blogDetail.back') }}</button>
    </div>
    <article v-if="blog" class="stagger-item" :style="{ '--delay': '0.1s' }">
      <h1>{{ blog.title }}</h1>
      <p class="date">{{ blog.date }}</p>
      <div v-if="blog.images && blog.images.length > 0" class="images">
        <img
          v-for="(img, idx) in blog.images"
          :key="idx"
          :src="img"
          :alt="t('blogDetail.imageAlt', { title: blog.title, n: idx + 1 })"
          class="article-image"
          @click="previewImage(img)"
        />
      </div>
      <div class="content">
        <pre>{{ blog.content }}</pre>
      </div>
    </article>
    <p v-else class="not-found">{{ t('blogDetail.notFound') }}</p>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isLeaving } from '../router'
import { t } from '../utils/i18n'
import blogList from '../data/blog.json'

console.log('[BlogDetail.vue] 组件初始化')

const route = useRoute()
const router = useRouter()

const blog = computed(() => {
  const id = Number(route.params.id)
  console.log('[BlogDetail/blog] 查找文章 ID:', id)
  const found = blogList.find(item => item.id === id)
  console.log('[BlogDetail/blog] 找到文章:', found ? found.title : '未找到')
  return found
})

const goBack = () => {
  console.log('[BlogDetail/goBack] 返回博客列表')
  router.back()
}

const previewImage = (src) => {
  console.log('[BlogDetail/previewImage] 预览图片:', src)
  window.open(src, '_blank')
}

onMounted(() => {
  console.log('[BlogDetail/onMounted] 文章详情页已加载，文章ID:', route.params.id)
})
</script>

<style scoped>
.blog-detail {
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
.blog-detail h1 {
  margin-top: 0;
  color: #2c3e50;
}
.date {
  color: #999;
  font-size: 14px;
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
  margin-top: 20px;
  line-height: 1.8;
}
.content pre {
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 16px;
}
.not-found {
  text-align: center;
  color: #999;
  margin-top: 100px;
}
</style>
