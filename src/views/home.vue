<template>
  <div class="home-page" :class="{ leaving: isLeaving }">
    <div class="hero stagger-item" :style="{ '--delay': '0.05s' }">
      <h1>你好，欢迎来到我的网站 👋</h1>
      <p class="subtitle">一个记录学习和生活的个人空间</p>
      <div class="nav-links">
        <router-link to="/blog" class="btn">浏览博客</router-link>
        <router-link to="/photos" class="btn btn-ghost">照片集</router-link>
        <router-link to="/about" class="btn btn-ghost">关于我</router-link>
      </div>
    </div>

    <div class="section stagger-item" :style="{ '--delay': '0.15s' }">
      <h2>最新文章</h2>
      <div class="post-item" v-for="(post, index) in latestPosts" :key="post.id" @click="goToPost(post.id)">
        <h3>{{ post.title }}</h3>
        <p class="date">{{ post.date }}</p>
        <p class="desc">{{ post.desc }}</p>
        <span class="read-more">阅读全文 →</span>
      </div>
      <router-link to="/blog" class="view-all">查看全部文章 →</router-link>
    </div>

    <div class="section stagger-item" :style="{ '--delay': '0.25s' }">
      <h2>关于我</h2>
      <p class="about-text">
        热爱前端开发，喜欢用代码创造有趣的东西。
        这里记录我的学习笔记、项目经验和生活思考。
      </p>
      <div class="tags">
        <span class="tag">Vue 3</span>
        <span class="tag">JavaScript</span>
        <span class="tag">CSS</span>
        <span class="tag">Vite</span>
      </div>
    </div>

    <footer class="footer stagger-item" :style="{ '--delay': '0.3s' }">
      <p>© 2026 个人网站</p>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { isLeaving } from '../router'
import blogList from '../data/blog.json'

const router = useRouter()

const latestPosts = computed(() => {
  return [...blogList].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3)
})

const goToPost = (id) => {
  router.push(`/blog/${id}`)
}
</script>

<style scoped>
.home-page {
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

.hero {
  text-align: center;
  padding: 60px 0 40px;
}

.hero h1 {
  margin: 0 0 12px;
  font-size: 32px;
}

.subtitle {
  color: #666;
  font-size: 16px;
  margin: 0 0 24px;
}

.nav-links {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  display: inline-block;
  padding: 10px 24px;
  background: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 14px;
  transition: background 0.3s;
}

.btn:hover {
  background: #3aa876;
}

.btn-ghost {
  background: transparent;
  color: #42b983;
  border: 1px solid #42b983;
}

.btn-ghost:hover {
  background: #f0f9f4;
}

.section {
  margin-top: 40px;
}

.section h2 {
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

.view-all {
  display: inline-block;
  margin-top: 16px;
  color: #42b983;
  text-decoration: none;
  font-size: 14px;
}

.view-all:hover {
  text-decoration: underline;
}

.about-text {
  color: #666;
  line-height: 1.8;
  margin: 0 0 20px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  padding: 6px 14px;
  background: #f0f9f4;
  color: #42b983;
  border-radius: 4px;
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
