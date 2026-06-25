<template>
  <div class="blog-detail" :class="{ leaving: isLeaving }">
    <div class="stagger-item" :style="{ '--delay': '0.05s' }">
      <button class="back-btn" @click="goBack">← 返回</button>
    </div>
    <article v-if="blog" class="stagger-item" :style="{ '--delay': '0.1s' }">
      <h1>{{ blog.title }}</h1>
      <p class="date">发布时间：{{ blog.date }}</p>
      <div class="content">
        <pre>{{ blog.content }}</pre>
      </div>
    </article>
    <p v-else class="not-found">文章不存在</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isLeaving } from '../router'
import blogList from '../data/blog.json'

const route = useRoute()
const router = useRouter()

const blog = computed(() => {
  const id = Number(route.params.id)
  return blogList.find(item => item.id === id)
})

const goBack = () => {
  router.back()
}
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
