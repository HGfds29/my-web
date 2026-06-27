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

    <div class="section open-source-section stagger-item" :style="{ '--delay': '0.35s' }">
      <h2>开源项目</h2>
      <p class="about-text">
        这个网站是开源的，代码托管在 GitHub 上，欢迎 Star 和 Fork~
      </p>
      <a
        href="https://github.com/HGfds29/my-web"
        target="_blank"
        rel="noopener noreferrer"
        class="github-link"
      >
        <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        <span>HGfds29/my-web</span>
      </a>
    </div>

    <footer class="footer stagger-item" :style="{ '--delay': '0.4s' }">
      <p>© 2026 个人网站</p>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { isLeaving } from '../router'
import blogList from '../data/blog.json'

console.log('[Home.vue] 组件初始化')

const router = useRouter()

const latestPosts = computed(() => {
  const posts = [...blogList].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3)
  console.log('[Home/latestPosts] 最新文章:', posts.map(p => p.title))
  return posts
})

const goToPost = (id) => {
  console.log('[Home/goToPost] 跳转到文章 ID:', id)
  router.push(`/blog/${id}`)
}

onMounted(() => {
  console.log('[Home/onMounted] 首页已加载完成')
})
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

.open-source-section {
  margin-top: 40px;
}

.github-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #24292e;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 14px;
  transition: background 0.3s, transform 0.2s;
}

.github-link:hover {
  background: #2d333b;
  transform: translateY(-2px);
}

.github-icon {
  width: 18px;
  height: 18px;
}

:global(.dark) .github-link {
  background: #2d333b;
}

:global(.dark) .github-link:hover {
  background: #373e47;
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
