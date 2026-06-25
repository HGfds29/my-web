<template>
  <div class="blog-page" :class="{ leaving: isLeaving }">
    <div class="page-header stagger-item" :style="{ '--delay': '0.05s' }">
      <button class="back-btn" @click="goBack">← 返回首页</button>
      <h1>我的博客</h1>
      <p class="subtitle">记录学习与思考的地方</p>
    </div>

    <div class="post-list stagger-item" :style="{ '--delay': '0.15s' }">
      <h2 class="section-title">全部文章</h2>
      <div
        class="post-item"
        v-for="(item, index) in blogList"
        :key="item.id"
        :style="{ '--item-delay': (index * 0.08) + 's' }"
        @click="goToDetail(item.id)"
      >
        <h3>{{ item.title }}</h3>
        <p class="date">{{ item.date }}</p>
        <p class="desc">{{ item.desc }}</p>
        <span class="read-more">阅读全文 →</span>
      </div>
    </div>

    <footer class="footer stagger-item" :style="{ '--delay': '0.35s' }">
      <p>© 2026 个人网站</p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { isLeaving } from '../router'
import blogList from '../data/blog.json'

const router = useRouter()

const goToDetail = (id) => {
  router.push(`/blog/${id}`)
}

const goBack = () => {
  router.push('/')
}
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
}

.section-title {
  font-size: 22px;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #42b983;
  display: inline-block;
}

.post-item {
  margin: 16px 0;
  border: 1px solid #eee;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.3s;
}

.post-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
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

.footer {
  margin-top: 60px;
  padding-top: 24px;
  border-top: 1px solid #eee;
  text-align: center;
  color: #999;
  font-size: 13px;
}
</style>
