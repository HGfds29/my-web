<template>
  <div class="about-page" :class="{ leaving: isLeaving }">
    <div class="stagger-item" :style="{ '--delay': '0.05s' }">
      <button class="back-btn" @click="goBack">← 返回首页</button>
    </div>
    <div class="stagger-item" :style="{ '--delay': '0.1s' }">
      <h1>关于我</h1>
    </div>
    <div class="stagger-item" :style="{ '--delay': '0.15s' }">
      <p class="intro">你好！我是一名前端开发者，热爱用代码创造有趣的东西。</p>
    </div>
    <div class="stagger-item section" :style="{ '--delay': '0.2s' }">
      <h2>技能栈</h2>
      <div class="skills">
        <span class="skill" v-for="(skill, i) in skills" :key="skill">{{ skill }}</span>
      </div>
    </div>
    <div class="stagger-item section" :style="{ '--delay': '0.25s' }">
      <h2>兴趣爱好</h2>
      <ul class="hobbies">
        <li v-for="hobby in hobbies" :key="hobby">{{ hobby }}</li>
      </ul>
    </div>
    <div class="stagger-item section" :style="{ '--delay': '0.3s' }">
      <h2>联系方式</h2>
	  <p class="contact">邮箱：3656754515@qq.com</p>
      <p class="contact">邮箱：qwe15925906016@qq.com</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { isLeaving } from '../router'

const router = useRouter()

const skills = ['Vue 3', 'JavaScript', 'TypeScript', 'CSS', 'Vite', 'Node.js']
const hobbies = ['写代码', '听音乐', '打游戏']

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.about-page {
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
  margin-bottom: 16px;
}
.back-btn:hover {
  text-decoration: underline;
}

h1 {
  margin-top: 0;
  font-size: 32px;
}

.intro {
  color: #666;
  font-size: 16px;
  line-height: 1.8;
}

.section {
  margin-top: 32px;
}

.section h2 {
  font-size: 22px;
  color: #2c3e50;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #42b983;
  display: inline-block;
}

.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill {
  padding: 6px 16px;
  background: #f0f9f4;
  color: #42b983;
  border-radius: 4px;
  font-size: 14px;
}

.hobbies {
  color: #666;
  line-height: 2;
  padding-left: 20px;
}

.contact {
  color: #666;
}
</style>
