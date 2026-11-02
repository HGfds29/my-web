import { computed, ref } from 'vue'
import { createLogger } from './logger'

/**
 * 节日皮肤（beta）
 *
 * 每个节日一套皮肤：强调色、logo 挂饰、角落漂浮装饰、顶部横幅（含三角彩旗）。
 * 默认按日期自动生效，也可以在设置里手动指定某个节日或关闭。
 * 自动窗口：
 * - 万圣节 10/30 – 10/31
 * - 圣诞   12/24 – 12/25
 * - 元旦   12/31 – 1/1
 * - 情人节 2/13 – 2/14
 * - 春节   农历正月初一 – 初二
 * - 程序员节 10/24
 */

const log = createLogger('holiday')

const STYLE_ID = 'holiday-style'
const DECOR_ID = 'holiday-decor'
const DISMISS_KEY = 'holidayBannerDismissed'
const SKIN_KEY = 'holidaySkin'

const useLunarNewYear = () => {
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-chinese', {
      month: 'numeric',
      day: 'numeric'
    }).formatToParts(new Date())
    const month = Number(parts.find((p) => p.type === 'month')?.value)
    const day = Number(parts.find((p) => p.type === 'day')?.value)
    // 农历正月初一、初二
    return month === 1 && day >= 1 && day <= 2
  } catch {
    return false
  }
}

export const HOLIDAY_SKINS = [
  {
    id: 'halloween',
    labelKey: 'nav.skinHalloween',
    textKey: 'holiday.halloween',
    logo: '🎃',
    icons: ['🎃', '👻', '💀', '🦇'],
    decor: ['🎃', '👻', '💀', '🦇'],
    accent: '#ff7a18',
    accentRgb: '255, 122, 24',
    bg: 'linear-gradient(100deg, #1c0f2b 0%, #341447 45%, #5a2159 78%, #b8431a 100%)',
    flags: ['#ffd54a', '#ff7518', '#fff3d6'],
    rope: 'rgba(255, 240, 214, 0.55)',
    isSeason: (d) => d.getMonth() === 9 && (d.getDate() === 30 || d.getDate() === 31)
  },
  {
    id: 'coder',
    labelKey: 'nav.skinCoder',
    textKey: 'holiday.coder',
    logo: '💻',
    icons: ['💻', '⌨️', '🐛', '☕'],
    decor: ['💻', '⌨️', '🐛', '☕'],
    accent: '#12b886',
    accentRgb: '18, 184, 134',
    bg: 'linear-gradient(100deg, #05141a 0%, #0b2b36 45%, #0f4f52 78%, #12b886 100%)',
    flags: ['#2dd4bf', '#3b82f6', '#e6fffa'],
    rope: 'rgba(214, 255, 247, 0.55)',
    // 页面左右两侧浮动的代码（取自 Home.vue / Chat.vue / About.vue，100+ 行）
    code: [
      {
        id: 'home',
        top: '104px',
        lines: `<template>
  <div class="home-page" :class="{ leaving: isLeaving }">
    <div class="hero stagger-item">
      <h1>{{ t('home.welcome') }}</h1>
      <p class="subtitle">{{ t('home.subtitle') }}</p>
      <div class="nav-links">
        <router-link to="/blog">{{ t('home.browseBlog') }}</router-link>
        <router-link to="/photos">{{ t('home.photos') }}</router-link>
        <router-link to="/about">{{ t('home.about') }}</router-link>
      </div>
    </div>

    <div class="section stagger-item">
      <h2>{{ t('home.latestPosts') }}</h2>
      <div class="post-item" v-for="post in latestPosts" :key="post.id">
        <h3>{{ post.title }}</h3>
        <p class="date">{{ post.date }}</p>
        <p class="desc">{{ post.desc }}</p>
        <span class="read-more">{{ t('home.readMore') }}</span>
      </div>
      <router-link to="/blog">{{ t('home.viewAll') }}</router-link>
    </div>

    <div class="section stagger-item">
      <h2>{{ t('home.aboutSection') }}</h2>
      <p class="about-text">{{ t('home.aboutText') }}</p>
      <div class="tags">
        <span class="tag">Vue 3</span>
        <span class="tag">JavaScript</span>
        <span class="tag">CSS</span>
        <span class="tag">Vite</span>
      </div>
    </div>

    <footer class="footer stagger-item">
      <p>{{ t('home.footer') }}</p>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { isLeaving } from '../router'
import { t } from '../utils/i18n'
import { createLogger } from '../utils/logger'
import blogList from '../data/blog.json'

const log = createLogger('Home')
const router = useRouter()

const latestPosts = computed(() => {
  const posts = [...blogList]
  return posts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3)
})

const goToPost = (id) => {
  log.info('打开文章详情', { id })
  router.push('/blog/' + id)
}
</script>`
      },
      {
        id: 'chat',
        top: '104px',
        lines: `<template>
  <div class="chat-page" :class="{ leaving: isLeaving }">
    <div class="chat-container">
      <div v-if="sidebarOpen" class="sidebar-mask"
           @click="sidebarOpen = false"></div>

      <!-- 侧边栏 -->
      <aside class="sidebar" :class="{ open: sidebarOpen }">
        <div class="profile-bar">
          <div class="avatar">{{ avatarText }}</div>
          <div class="user-info">
            <div class="uname">{{ currentProfile?.username }}</div>
            <button @click="doLogout">{{ t('chat.logout') }}</button>
          </div>
        </div>

        <div class="search-row">
          <input v-model="searchUser"
                 :placeholder="t('chat.searchUser')" />
          <button @click="sendFriendRequest">
            {{ t('chat.addFriend') }}
          </button>
        </div>

        <div class="nav-section">
          <div class="nav-item" :class="{ active: view.type === 'public' }"
               @click="switchView({ type: 'public' })">
            <span class="dot public-dot"></span>
            {{ t('chat.publicRoom') }}
          </div>
        </div>
      </aside>

      <main class="main">
        <div class="main-head">
          <h2>{{ viewTitle }}</h2>
          <span v-if="view.type !== 'public'">
            {{ t('chat.offlineHint') }}
          </span>
        </div>

        <div class="msg-list" ref="listEl">
          <div v-for="msg in messages" :key="msg.id"
               class="msg-row" :class="{ mine: isMine(msg) }">
            <div class="bubble">
              <p class="meta">{{ msgDisplayUser(msg) }}</p>
              <p v-if="msg.content" class="content">
                {{ msg.content }}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { supabase } from '../utils/supabase'
import { t } from '../utils/i18n'

const messages = ref([])
const view = ref({ type: 'public' })
const sidebarOpen = ref(false)

const switchView = (next) => {
  view.value = next
  sidebarOpen.value = false
}

onMounted(() => {
  loadMessages()
})
</script>`
      },
      {
        id: 'about',
        top: '104px',
        lines: `<template>
  <div class="about-page" :class="{ leaving: isLeaving }">
    <div class="stagger-item">
      <button class="back-btn" @click="goBack">
        {{ t('about.back') }}
      </button>
    </div>
    <div class="stagger-item">
      <h1>{{ t('about.title') }}</h1>
    </div>
    <div class="stagger-item">
      <p class="intro">{{ t('about.intro') }}</p>
    </div>

    <div class="stagger-item section">
      <h2>{{ t('about.skills') }}</h2>
      <div class="skills">
        <span class="skill" v-for="skill in skills" :key="skill">
          {{ skill }}
        </span>
      </div>
    </div>

    <div class="stagger-item section">
      <h2>{{ t('about.hobbies') }}</h2>
      <ul class="hobbies">
        <li v-for="hobby in hobbies" :key="hobby">
          {{ t(hobby) }}
        </li>
      </ul>
    </div>

    <div class="stagger-item section">
      <h2>{{ t('about.contact') }}</h2>
      <p class="contact">{{ t('about.email') }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { isLeaving } from '../router'
import { t } from '../utils/i18n'
import { createLogger } from '../utils/logger'
import AppIcon from '../components/AppIcon.vue'

const log = createLogger('About')
const router = useRouter()

const skills = ['Vue 3', 'JavaScript', 'TypeScript', 'CSS']
const hobbies = ['about.hobby1', 'about.hobby2']

const goBack = () => {
  log.info('返回首页')
  router.push('/')
}

onMounted(() => {
  log.info('About 页面已加载')
})
</script>

<style scoped>
.about-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>`
      }
    ],
    isSeason: (d) => d.getMonth() === 9 && d.getDate() === 24
  },
  {
    id: 'christmas',
    labelKey: 'nav.skinChristmas',
    textKey: 'holiday.christmas',
    logo: '🎄',
    icons: ['🎄', '🎅', '⛄', '❄️'],
    decor: ['🎄', '🎅', '⛄', '❄️'],
    accent: '#e23b3b',
    accentRgb: '226, 59, 59',
    bg: 'linear-gradient(100deg, #0f2f1d 0%, #184a2c 45%, #1f6b3a 78%, #b8322c 100%)',
    flags: ['#e23b3b', '#1f9d55', '#fff3d6'],
    rope: 'rgba(255, 246, 224, 0.55)',
    isSeason: (d) => d.getMonth() === 11 && (d.getDate() === 24 || d.getDate() === 25)
  },
  {
    id: 'newyear',
    labelKey: 'nav.skinNewYear',
    textKey: 'holiday.newyear',
    logo: '🎆',
    icons: ['🎆', '🎉', '🎇', '🥳'],
    decor: ['🎆', '🎉', '🎇', '🥳'],
    accent: '#4f7cff',
    accentRgb: '79, 124, 255',
    bg: 'linear-gradient(100deg, #0b1030 0%, #15205c 45%, #2a2f7a 78%, #c04a37 100%)',
    flags: ['#ffd54a', '#4f7cff', '#fff3d6'],
    rope: 'rgba(230, 238, 255, 0.55)',
    isSeason: (d) =>
      (d.getMonth() === 11 && d.getDate() === 31) || (d.getMonth() === 0 && d.getDate() === 1)
  },
  {
    id: 'valentine',
    labelKey: 'nav.skinValentine',
    textKey: 'holiday.valentine',
    logo: '💗',
    icons: ['💌', '🌹', '💗', '🧸'],
    decor: ['💌', '🌹', '💗', '🧸'],
    accent: '#ff4d79',
    accentRgb: '255, 77, 121',
    bg: 'linear-gradient(100deg, #3a0d1e 0%, #5a1430 45%, #8d2145 78%, #ff6f91 100%)',
    flags: ['#ff6f91', '#ff4d79', '#ffe3ec'],
    rope: 'rgba(255, 232, 240, 0.55)',
    isSeason: (d) => d.getMonth() === 1 && (d.getDate() === 13 || d.getDate() === 14)
  },
  {
    id: 'spring',
    labelKey: 'nav.skinSpring',
    textKey: 'holiday.spring',
    logo: '🧧',
    icons: ['🧧', '🏮', '🥟', '🧨'],
    decor: ['🧧', '🏮', '🥟', '🧨'],
    accent: '#e22b2b',
    accentRgb: '226, 43, 43',
    bg: 'linear-gradient(100deg, #4a0d0d 0%, #7a1414 45%, #a81c1c 78%, #e0a33a 100%)',
    flags: ['#ffd54a', '#e22b2b', '#fff3d6'],
    rope: 'rgba(255, 236, 200, 0.55)',
    // 页面左右两侧的烟花
    fireworks: true,
    isSeason: useLunarNewYear
  }
]

const readSkin = () => {
  try {
    const raw = localStorage.getItem(SKIN_KEY)
    return raw === 'none' || HOLIDAY_SKINS.some((s) => s.id === raw) ? raw : 'auto'
  } catch {
    return 'auto'
  }
}

/** 当前皮肤设置：auto 自动 / 具体节日 id / none 关闭 */
export const holidaySkin = ref(readSkin())

/** 此刻生效的节日皮肤（无则 null），模板里可响应式使用 */
export const activeSkin = computed(() => {
  const choice = holidaySkin.value
  if (choice === 'none') return null
  if (choice === 'auto') return HOLIDAY_SKINS.find((s) => s.isSeason(new Date())) || null
  return HOLIDAY_SKINS.find((s) => s.id === choice) || null
})

/** 当前路由名：装饰代码跟随页面切换 */
const currentRoute = ref('')
const ROUTE_CODE_IDS = {
  Home: ['home', 'chat'],
  Chat: ['chat', 'about'],
  About: ['about', 'home']
}

/** 切换页面时更新左右两栏的代码来源 */
export const setHolidayRoute = (name) => {
  if (currentRoute.value === name) return
  currentRoute.value = name
  if (activeSkin.value?.code) ensureDecor(activeSkin.value)
}

const currentYear = () => String(new Date().getFullYear())

const readDismissed = () => {
  const empty = new Set()
  try {
    const raw = JSON.parse(localStorage.getItem(DISMISS_KEY) || '{}')
    return new Set(Object.keys(raw).filter((id) => raw[id] === currentYear()))
  } catch {
    return empty
  }
}

/** 用户今年关掉过横幅的皮肤 id 集合（响应式） */
export const dismissedBanners = ref(readDismissed())

/** 关掉某个节日皮肤的横幅：记住选择（按年份），文字向上收起，彩旗留在原位 */
export const dismissHolidayBanner = (skinId) => {
  if (!skinId) return
  const next = new Set(dismissedBanners.value)
  next.add(skinId)
  dismissedBanners.value = next
  try {
    const raw = JSON.parse(localStorage.getItem(DISMISS_KEY) || '{}')
    raw[skinId] = currentYear()
    localStorage.setItem(DISMISS_KEY, JSON.stringify(raw))
  } catch {
    /* 隐私模式下写入失败，仅本次生效 */
  }
  applySkin()
  log.info(`节日横幅已手动关闭：${skinId}`)
}

const ensureStyle = () => {
  if (document.getElementById(STYLE_ID)) return
  const skinRules = HOLIDAY_SKINS.map(
    (s) => `
html.skin-${s.id} {
  --accent: ${s.accent} !important;
  --accent-rgb: ${s.accentRgb} !important;
  --holiday-banner-height: 40px;
}
html.skin-${s.id} .nav-logo::after { content: '${s.logo}'; }`
  ).join('')

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
${skinRules}

html.holiday-skin { --holiday-banner-height: 40px; }

/* 横幅被关掉后：收起文字与底色，彩旗继续挂着，只占彩旗高度 */
html.holiday-skin.holiday-banner-off { --holiday-banner-height: 22px; }

html.holiday-skin .nav-logo::after {
  margin-left: 4px;
  font-size: 15px;
  vertical-align: -1px;
}

/* 只有横幅真正渲染时才让导航栏和页面内容下移，
   登录页 / 隐藏导航页不渲染横幅，保持 top: 0，避免导航栏收起后露出一截。 */
html.holiday-skin .holiday-banner ~ .navbar {
  top: var(--holiday-banner-height, 40px);
  border-bottom-color: transparent;
  transition: background 0.3s, border-color 0.3s,
    top 0.34s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

html.holiday-skin .holiday-banner ~ .page-wrapper:not(.no-nav) {
  padding-top: calc(60px + var(--holiday-banner-height, 40px));
  transition: padding-top 0.34s cubic-bezier(0.4, 0, 0.2, 1);
}

#holiday-decor {
  position: fixed;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
}

/* 页面内容压在装饰之上，装饰只作为最底层背景 */
html.holiday-skin .page-wrapper {
  position: relative;
  z-index: 3;
}

#holiday-decor .decor-emoji {
  position: absolute;
  font-size: 26px;
  line-height: 1;
  opacity: 0.72;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.18));
  animation: hd-float 10s ease-in-out infinite;
  will-change: transform;
}

/* 程序员节：左右浮动的代码片段（无底色边框，按语法上色） */
#holiday-decor .decor-code {
  position: absolute;
  margin: 0;
  padding: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 9.5px;
  line-height: 1.4;
  white-space: pre;
  max-width: 26vw;
  overflow: hidden;
  opacity: 0.55;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.22));
  animation: hd-code-float 11s ease-in-out infinite;
  will-change: transform;
}

#holiday-decor .decor-code .code-line {
  display: block;
}

#holiday-decor .decor-code .tok-key { color: #2dd4bf; }
#holiday-decor .decor-code .tok-str { color: #fbbf24; }
#holiday-decor .decor-code .tok-tag { color: #60a5fa; }
#holiday-decor .decor-code .tok-attr { color: #a5b4fc; }
#holiday-decor .decor-code .tok-cmd { color: #34d399; }
#holiday-decor .decor-code .tok-ok { color: #4ade80; }
#holiday-decor .decor-code .tok-comment { color: #94a3b8; }
#holiday-decor .decor-code .tok-plain { color: #cbd5e1; }

#holiday-decor .decor-code-left {
  left: 18px;
}

#holiday-decor .decor-code-right {
  right: 18px;
}

/* 春节：左右绽放的烟花 */
#holiday-decor .decor-fw {
  position: absolute;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: repeating-conic-gradient(
    from 0deg,
    var(--fw-color, #ffd54a) 0deg 1.4deg,
    transparent 1.4deg 30deg
  );
  -webkit-mask: radial-gradient(circle, transparent 12%, #000 34%, transparent 70%);
  mask: radial-gradient(circle, transparent 12%, #000 34%, transparent 70%);
  opacity: 0;
  animation: hd-firework 3.4s ease-out infinite;
  will-change: transform, opacity;
}

#holiday-decor .decor-fw-0 {
  left: 5vw;
  bottom: 20%;
  --fw-color: #ffd54a;
}

#holiday-decor .decor-fw-1 {
  left: 12vw;
  bottom: 44%;
  width: 40px;
  height: 40px;
  --fw-color: #ff8a5c;
  animation-delay: 1.2s;
}

#holiday-decor .decor-fw-2 {
  right: 5vw;
  bottom: 28%;
  --fw-color: #ffd54a;
  animation-delay: 0.7s;
}

#holiday-decor .decor-fw-3 {
  right: 12vw;
  bottom: 50%;
  width: 34px;
  height: 34px;
  --fw-color: #ffe9b0;
  animation-delay: 1.9s;
}

#holiday-decor .decor-0 {
  left: 22px;
  bottom: 22px;
  font-size: 34px;
  animation-delay: -2s;
}

#holiday-decor .decor-1 {
  right: 26px;
  bottom: 84px;
  animation-delay: -5s;
}

#holiday-decor .decor-2 {
  left: 14px;
  top: 140px;
  font-size: 24px;
  opacity: 0.62;
  animation-delay: -8s;
}

#holiday-decor .decor-3 {
  right: 12%;
  top: 126px;
  animation-delay: -1s;
}

@keyframes hd-float {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-12px) rotate(3deg); }
}

@keyframes hd-code-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-9px); }
}

@keyframes hd-firework {
  0% { transform: scale(0.35); opacity: 0; }
  12% { opacity: 0.95; }
  38% { transform: scale(1); opacity: 0.6; }
  70% { transform: scale(1.18); opacity: 0.1; }
  100% { transform: scale(1.22); opacity: 0; }
}

/* 窄屏先收起代码卡片，避免压住正文 */
@media (max-width: 1200px) {
  #holiday-decor .decor-code { display: none; }
}

@media (max-width: 640px) {
  #holiday-decor .decor-emoji { font-size: 20px; opacity: 0.6; }
  #holiday-decor .decor-0 { font-size: 26px; }
  #holiday-decor .decor-3 { top: 106px; right: 8%; }
  #holiday-decor .decor-1 { bottom: 72px; right: 14px; }
  #holiday-decor .decor-2 { top: 112px; left: 10px; }
  #holiday-decor .decor-fw { width: 42px; height: 42px; }
  #holiday-decor .decor-fw-1 { width: 30px; height: 30px; left: 18vw; }
  #holiday-decor .decor-fw-3 { width: 26px; height: 26px; right: 18vw; }
}

@media (prefers-reduced-motion: reduce) {
  #holiday-decor .decor-emoji { animation: none; }
  #holiday-decor .decor-code { animation: none; }
  #holiday-decor .decor-fw {
    animation: none;
    opacity: 0.55;
    transform: scale(0.9);
  }
  html.holiday-skin .holiday-banner ~ .navbar,
  html.holiday-skin .holiday-banner ~ .page-wrapper:not(.no-nav) {
    transition: none;
  }
}
`
  document.head.appendChild(style)
}

// 简易语法着色：按行判断代码类型，避免逐行手写颜色
const toneForLine = (line) => {
  const text = line.trim()
  if (text.startsWith('//') || text.startsWith('<!--')) return 'comment'
  if (text.startsWith('<')) return 'tag'
  if (/^(npm|git|vite)\b/.test(text)) return 'cmd'
  if (/^(import|export|const|let|function|return)\b/.test(text)) return 'key'
  if (text.includes("'") || text.includes('"')) return 'str'
  return 'plain'
}

const ensureDecor = (skin) => {
  document.getElementById(DECOR_ID)?.remove()
  const layer = document.createElement('div')
  layer.id = DECOR_ID
  layer.setAttribute('aria-hidden', 'true')

  skin.decor.forEach((icon, index) => {
    const span = document.createElement('span')
    span.className = `decor-emoji decor-${index}`
    span.textContent = icon
    layer.appendChild(span)
  })

  // 左右两侧的代码（程序员节）：按当前路由挑选两段
  if (skin.code) {
    // 没有登记的路由固定用 home + chat，避免多段代码叠在同一侧
    const ids = ROUTE_CODE_IDS[currentRoute.value] || ['home', 'chat']
    const blocks = ids
      .map((id) => skin.code.find((block) => block.id === id))
      .filter(Boolean)
    blocks.forEach((block, index) => {
      const code = document.createElement('pre')
      code.className = `decor-code decor-code-${index === 0 ? 'left' : 'right'}`
      code.style.top = block.top
      code.style.animationDelay = `${-2 - index * 2}s`
      block.lines.split(/\r?\n/).forEach((line) => {
        const span = document.createElement('span')
        span.className = `code-line tok-${toneForLine(line)}`
        span.textContent = line || '\u00A0'
        code.appendChild(span)
      })
      layer.appendChild(code)
    })
  }

  // 左右两侧的烟花（春节）
  if (skin.fireworks) {
    for (let index = 0; index < 4; index += 1) {
      const burst = document.createElement('span')
      burst.className = `decor-fw decor-fw-${index}`
      layer.appendChild(burst)
    }
  }

  document.body.appendChild(layer)
}

/** 把当前皮肤状态同步到页面：加/去类名、注入样式、挂/拆装饰 */
const applySkin = () => {
  const root = document.documentElement
  HOLIDAY_SKINS.forEach((s) => root.classList.remove(`skin-${s.id}`))
  root.classList.remove('holiday-skin', 'holiday-banner-off')

  const skin = activeSkin.value
  if (!skin) {
    document.getElementById(DECOR_ID)?.remove()
    return
  }

  root.classList.add('holiday-skin', `skin-${skin.id}`)
  if (dismissedBanners.value.has(skin.id)) root.classList.add('holiday-banner-off')
  ensureStyle()
  ensureDecor(skin)
}

/** 切换节日皮肤：auto 跟随日期 / 节日 id / none 关闭 */
export const setHolidaySkin = (skin) => {
  const valid =
    skin === 'auto' || skin === 'none' || HOLIDAY_SKINS.some((s) => s.id === skin)
  if (!valid) skin = 'auto'
  holidaySkin.value = skin
  try {
    localStorage.setItem(SKIN_KEY, skin)
  } catch {
    /* 隐私模式下写入失败，仅本次生效 */
  }
  applySkin()
  log.info(`节日皮肤已切换：${skin}`)
}

export const initHoliday = () => {
  if (typeof document === 'undefined') return false
  if (!activeSkin.value) return false

  applySkin()
  log.info(`节日皮肤已开启：${activeSkin.value.id}`)
  return true
}
