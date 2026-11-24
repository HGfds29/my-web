<template>
  <div class="ui-page">
    <!-- ===== 顶栏 ===== -->
    <header class="nav">
      <div class="container nav-inner">
        <router-link to="/home" class="logo">
          <span class="logo-mark" aria-hidden="true"></span>
          <span class="logo-text">Crimson UI</span>
          <span class="logo-ver">v{{ version }}</span>
        </router-link>

        <nav class="nav-links">
          <a href="#features" @click.prevent="jump('features')">特性</a>
          <a href="#components" @click.prevent="jump('components')">组件</a>
          <a href="#data" @click.prevent="jump('data')">数据</a>
          <a href="#faq" @click.prevent="jump('faq')">问答</a>
        </nav>

        <div class="nav-actions">
          <button class="btn btn-quiet" @click="showToast('已复制主色 #D92D20')">复制主色</button>
          <router-link to="/home" class="btn btn-dark">返回主站</router-link>
        </div>
      </div>
    </header>

    <main class="container">
      <!-- ===== Hero ===== -->
      <section class="hero">
        <div class="hero-copy">
          <span class="pill">Design System · 红色主题</span>
          <h1>把好的界面，<br />做成随手可用的组件。</h1>
          <p class="hero-sub">
            一套为个人站点准备的 UI 组件库：按钮、表单、数据展示与反馈，
            统一在克制的红色主色下，直接复制就能用。
          </p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg" @click="jump('components')">浏览组件</button>
            <button class="btn btn-outline btn-lg" @click="modalOpen = true">打开示例对话框</button>
          </div>
          <ul class="hero-points">
            <li><i></i>纯 CSS，零依赖</li>
            <li><i></i>深浅两套状态</li>
            <li><i></i>支持减少动画</li>
          </ul>
        </div>

        <!-- 产品预览（纯 CSS 绘制的真实界面） -->
        <div class="preview">
          <div class="preview-glow" aria-hidden="true"></div>
          <div class="window">
            <div class="window-bar">
              <span class="wdot red"></span>
              <span class="wdot amber"></span>
              <span class="wdot green"></span>
              <span class="window-url">crimson.app / overview</span>
            </div>

            <div class="window-body">
              <aside class="side">
                <span class="side-logo" aria-hidden="true"></span>
                <span class="side-item active">概览</span>
                <span class="side-item">项目</span>
                <span class="side-item">成员</span>
                <span class="side-item">设置</span>
              </aside>

              <div class="main">
                <div class="main-head">
                  <b>概览</b>
                  <span class="main-pill">最近 7 天</span>
                </div>

                <div class="kpis">
                  <div v-for="(kpi, i) in kpis" :key="kpi.label" class="kpi">
                    <small>{{ kpi.label }}</small>
                    <strong>{{ kpi.shown }}</strong>
                    <em :class="kpi.up ? 'up' : 'down'">{{ kpi.delta }}</em>
                    <span class="kpi-index" aria-hidden="true">{{ i + 1 }}</span>
                  </div>
                </div>

                <div class="chart" aria-hidden="true">
                  <span v-for="(h, i) in bars" :key="i" class="bar" :style="{ '--h': h + '%', '--i': i }"></span>
                </div>

                <div class="rows">
                  <div v-for="person in people" :key="person.name" class="row">
                    <span class="row-avatar">{{ person.name.slice(0, 1) }}</span>
                    <span class="row-text"><b>{{ person.name }}</b><small>{{ person.role }}</small></span>
                    <span class="row-tag" :class="person.state">{{ person.stateText }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== 特性 ===== -->
      <section id="features" class="block" data-reveal>
        <div class="section-head">
          <span class="section-kicker">特性</span>
          <h2>一套能直接搬进项目的界面</h2>
          <p>颜色、间距、圆角、阴影都收敛成变量，换主题只改一处。</p>
        </div>

        <div class="features">
          <article v-for="(feature, i) in features" :key="feature.title" class="feature">
            <span class="feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path :d="feature.path" />
              </svg>
            </span>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
            <span class="feature-index" aria-hidden="true">0{{ i + 1 }}</span>
          </article>
        </div>
      </section>

      <!-- ===== 组件 ===== -->
      <section id="components" class="block" data-reveal>
        <div class="section-head">
          <span class="section-kicker">组件</span>
          <h2>按钮、表单与反馈，状态齐全</h2>
          <p>悬停、按下、禁用、加载都有对应样式，不靠临时补丁。</p>
        </div>

        <div class="showcase">
          <!-- 左：设置面板 -->
          <div class="card card-tall">
            <div class="card-head">
              <h3>账户设置</h3>
              <span class="card-tag">示例子面板</span>
            </div>

            <label class="field">
              <span class="label">邮箱</span>
              <input v-model="email" class="input" type="email" placeholder="you@example.com" />
            </label>

            <div class="field">
              <span class="label">套餐</span>
              <div class="segmented" :style="{ '--i': planIndex, '--n': plans.length }">
                <button
                  v-for="plan in plans"
                  :key="plan"
                  :class="{ on: currentPlan === plan }"
                  @click="currentPlan = plan"
                >
                  {{ plan }}
                </button>
                <span class="seg-thumb" aria-hidden="true"></span>
              </div>
            </div>

            <div class="field">
              <span class="label">通知</span>
              <button class="switch-row" @click="notify = !notify">
                <span class="switch" :class="{ on: notify }" role="switch" :aria-checked="notify">
                  <span class="switch-knob"></span>
                </span>
                <span class="switch-text">{{ notify ? '开启后通过邮件提醒' : '已关闭邮件提醒' }}</span>
              </button>
            </div>

            <div class="field">
              <span class="label">每日上限 <b>{{ volume }} 次</b></span>
              <input
                v-model.number="volume"
                class="range"
                type="range"
                min="0"
                max="100"
                :style="{ '--pct': volume + '%' }"
                aria-label="每日上限"
              />
            </div>

            <label class="check">
              <input v-model="agree" type="checkbox" />
              <span class="check-box" aria-hidden="true">
                <svg viewBox="0 0 16 16"><polyline points="3.5 8.5 6.5 11.5 12.5 5" /></svg>
              </span>
              <span>同时接收产品更新通知</span>
            </label>

            <div class="card-foot">
              <button class="btn btn-primary" :disabled="loading" @click="runLoading">
                <span v-if="loading" class="spinner" aria-hidden="true"></span>
                {{ loading ? '保存中' : '保存修改' }}
              </button>
              <button class="btn btn-outline" @click="showToast('已恢复上次的配置')">重置</button>
            </div>
          </div>

          <!-- 右：按钮 + 反馈 -->
          <div class="stack">
            <div class="card">
              <div class="card-head">
                <h3>按钮</h3>
                <span class="card-tag">4 种变体</span>
              </div>
              <div class="row">
                <button class="btn btn-primary" @click="showToast('主要操作')">主要按钮</button>
                <button class="btn btn-outline" @click="showToast('次要操作')">次要按钮</button>
                <button class="btn btn-quiet" @click="showToast('文字操作')">文字按钮</button>
                <button class="btn btn-danger-soft" @click="showToast('已取消')">删除</button>
                <button class="btn btn-outline btn-icon" :class="{ on: liked }" :aria-label="liked ? '取消收藏' : '收藏'" @click="liked = !liked">
                  <svg viewBox="0 0 24 24" :fill="liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="card">
              <div class="card-head">
                <h3>标签页</h3>
                <span class="card-tag">内容切换</span>
              </div>
              <div class="tabs" :style="{ '--i': activeTabIndex, '--n': tabs.length }">
                <button v-for="tab in tabs" :key="tab" class="tab" :class="{ on: activeTab === tab }" @click="activeTab = tab">
                  {{ tab }}
                </button>
                <span class="tab-indicator" aria-hidden="true"></span>
              </div>
              <p class="tab-body">{{ tabText }}</p>
            </div>

            <div class="card">
              <div class="card-head">
                <h3>通知与对话框</h3>
                <span class="card-tag">反馈</span>
              </div>
              <div class="row">
                <button class="btn btn-outline" @click="showToast('已复制到剪贴板')">显示 Toast</button>
                <button class="btn btn-outline" @click="modalOpen = true">打开对话框</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== 数据 ===== -->
      <section id="data" class="block" data-reveal>
        <div class="section-head">
          <span class="section-kicker">数据</span>
          <h2>表格、进度与成员，同一套视觉</h2>
          <p>数字用等宽对齐，状态用颜色区分，密度适合后台与个人站。</p>
        </div>

        <div class="data-grid">
          <div class="card">
            <div class="card-head">
              <h3>最近任务</h3>
              <span class="card-tag">{{ progressValue }}% 完成</span>
            </div>

            <div class="progress" role="progressbar" :aria-valuenow="progressValue" aria-valuemin="0" aria-valuemax="100">
              <span class="progress-fill" :style="{ '--pct': progressValue + '%' }"></span>
            </div>

            <div class="table">
              <div class="thead">
                <span>任务</span>
                <span>负责人</span>
                <span>状态</span>
              </div>
              <div v-for="task in tasks" :key="task.name" class="trow">
                <span class="tname">{{ task.name }}</span>
                <span class="towner"><i>{{ task.owner.slice(0, 1) }}</i>{{ task.owner }}</span>
                <span class="tstate" :class="task.state">{{ task.stateText }}</span>
              </div>
            </div>
          </div>

          <div class="stack">
            <div class="card">
              <div class="card-head">
                <h3>成员</h3>
                <span class="card-tag">3 在线</span>
              </div>
              <div class="members">
                <span v-for="person in people" :key="person.name" class="member">
                  <i>{{ person.name.slice(0, 1) }}</i>
                  <b>{{ person.name }}</b>
                  <small>{{ person.role }}</small>
                </span>
              </div>
              <div class="avatars">
                <span v-for="person in people" :key="person.name + 'a'" class="avatar">{{ person.name.slice(0, 1) }}</span>
                <span class="avatar avatar-more">+9</span>
                <span class="badge badge-green"><i></i>在线</span>
              </div>
            </div>

            <div class="card">
              <div class="card-head">
                <h3>骨架屏</h3>
                <span class="card-tag">加载中</span>
              </div>
              <div class="skeleton">
                <div class="sk-avatar"></div>
                <div class="sk-lines">
                  <span class="sk-line w70"></span>
                  <span class="sk-line w45"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== 问答 ===== -->
      <section id="faq" class="block" data-reveal>
        <div class="section-head">
          <span class="section-kicker">问答</span>
          <h2>常见问题</h2>
        </div>

        <div class="faq">
          <div v-for="(item, i) in faqs" :key="item.q" class="acc" :class="{ open: openAcc === i }">
            <button class="acc-head" :aria-expanded="openAcc === i" @click="openAcc = openAcc === i ? -1 : i">
              <span>{{ item.q }}</span>
              <span class="acc-sign" aria-hidden="true"></span>
            </button>
            <div class="acc-body"><p>{{ item.a }}</p></div>
          </div>
        </div>
      </section>

      <!-- ===== CTA ===== -->
      <section class="cta" data-reveal>
        <div>
          <h2>把它搬进你的下一个页面</h2>
          <p>复制变量与组件样式即可，不需要额外依赖。</p>
        </div>
        <div class="cta-actions">
          <button class="btn btn-light" @click="showToast('样式已复制')">复制样式</button>
          <router-link to="/home" class="btn btn-ghost-light">返回主站</router-link>
        </div>
      </section>

      <footer class="foot">
        <span>Crimson UI · 红色主题组件库</span>
        <span class="foot-ver">v{{ version }}</span>
      </footer>
    </main>

    <!-- ===== 对话框 ===== -->
    <Transition name="mask">
      <div v-if="modalOpen" class="mask" @click.self="modalOpen = false">
        <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
          <span class="dialog-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </span>
          <h3 id="dlg-title">确认删除这个项目？</h3>
          <p>删除后 30 天内可以在回收站恢复，之后将无法找回。</p>
          <div class="dialog-actions">
            <button class="btn btn-outline" @click="modalOpen = false">取消</button>
            <button class="btn btn-danger" @click="confirmDialog">确认删除</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ===== Toast ===== -->
    <TransitionGroup name="toast" tag="div" class="toasts">
      <div v-for="item in toasts" :key="item.id" class="toast">
        <span class="toast-check" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        {{ item.text }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const version = '4.13.4'

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap'

const prefersReduce = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  document.documentElement.classList.contains('reduce-motion')

/* 按钮 */
const liked = ref(true)
const loading = ref(false)
let loadingTimer = 0
const runLoading = () => {
  if (loading.value) return
  loading.value = true
  loadingTimer = window.setTimeout(() => {
    loading.value = false
    showToast('修改已保存')
  }, 1000)
}

/* 表单 */
const email = ref('')
const plans = ['月付', '年付', '永久']
const currentPlan = ref('年付')
const planIndex = computed(() => Math.max(0, plans.indexOf(currentPlan.value)))
const notify = ref(true)
const volume = ref(64)
const agree = ref(true)

/* 页面内容 */
const kpis = ref([
  { label: '活跃用户', value: 12480, delta: '+12.4%', up: true, shown: '0' },
  { label: '转化率', value: 3.82, delta: '+0.9%', up: true, shown: '0%' },
  { label: '平均时长', value: 252, delta: '-2.1%', up: false, shown: '0s' }
])
const bars = [38, 52, 44, 66, 58, 78, 70, 86, 62, 74, 90, 68]
const people = [
  { name: '林小满', role: '产品设计', state: 'ok', stateText: '在线' },
  { name: '陈亦然', role: '前端开发', state: 'ok', stateText: '在线' },
  { name: '周惟', role: '内容运营', state: 'away', stateText: '离开' }
]
const tasks = [
  { name: '整理组件变量', owner: '林小满', state: 'done', stateText: '已完成' },
  { name: '补充按钮状态', owner: '陈亦然', state: 'doing', stateText: '进行中' },
  { name: '深色模式校对', owner: '周惟', state: 'todo', stateText: '待开始' }
]
const features = [
  {
    title: '统一主色',
    desc: '所有强调色来自同一个红色变量，改一处就能整站生效。',
    path: 'M12 3a9 9 0 1 0 9 9c0-.5-.4-.9-.9-.9H18a3 3 0 0 1 0-6h1.1c.5 0 .9-.4.9-.9A9 9 0 0 0 12 3z'
  },
  {
    title: '完整状态',
    desc: '悬停、按下、聚焦、禁用、加载，每个交互都有对应样式。',
    path: 'M4 4h16v6H4zM4 14h16v6H4zM9 7h1M9 17h1'
  },
  {
    title: '可降级',
    desc: '尊重系统的减少动画设置，关闭动效后布局仍然完整。',
    path: 'M13 2 3 14h7l-1 8 10-12h-7l1-8z'
  }
]

/* 标签页 */
const tabs = ['概览', '用法', '注意']
const activeTab = ref('概览')
const activeTabIndex = computed(() => Math.max(0, tabs.indexOf(activeTab.value)))
const tabText = computed(
  () =>
    ({
      概览: '这一页把组件按用途分组：表单、按钮、数据与反馈，找一个能直接复制的例子。',
      用法: '复制对应的 class 与 CSS 变量即可；颜色、圆角、阴影都来自统一变量。',
      注意: '按钮在加载态保留原有宽度，避免文字切换时页面跳动。'
    })[activeTab.value]
)

/* 问答 */
const faqs = [
  { q: '需要安装依赖吗？', a: '不需要。所有样式都是原生 CSS，复制到任意 Vue 或普通页面即可。' },
  { q: '深色模式怎么处理？', a: '把颜色变量换成深色值即可；本页固定浅色，避免和主站的主题冲突。' },
  { q: '动画会不会影响性能？', a: '只动画 transform 与 opacity，滚动揭示由 IntersectionObserver 一次性触发。' }
]
const openAcc = ref(0)

/* 对话框 */
const modalOpen = ref(false)
const confirmDialog = () => {
  modalOpen.value = false
  showToast('项目已删除')
}

/* Toast */
let seed = 0
const toasts = ref([])
const toastTimers = []
const showToast = (text) => {
  const id = ++seed
  toasts.value.push({ id, text })
  const timer = window.setTimeout(() => {
    toasts.value = toasts.value.filter((item) => item.id !== id)
  }, 2200)
  toastTimers.push(timer)
}

const jump = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReduce() ? 'auto' : 'smooth', block: 'start' })
}

/* KPI 数字滚动 */
const runKpis = () => {
  if (prefersReduce()) {
    kpis.value = kpis.value.map((item, i) => ({
      ...item,
      shown: i === 1 ? `${item.value}%` : i === 2 ? `${Math.floor(item.value / 60)}m ${item.value % 60}s` : item.value.toLocaleString()
    }))
    return
  }
  const start = performance.now()
  const duration = 1200
  const step = (now) => {
    const p = Math.min(1, (now - start) / duration)
    const eased = 1 - Math.pow(1 - p, 3)
    kpis.value = kpis.value.map((item, i) => {
      const v = item.value * eased
      const shown =
        i === 1 ? `${v.toFixed(2)}%` : i === 2 ? `${Math.floor(v / 60)}m ${Math.round(v % 60)}s` : Math.round(v).toLocaleString()
      return { ...item, shown }
    })
    if (p < 1) kpiFrame = requestAnimationFrame(step)
  }
  kpiFrame = requestAnimationFrame(step)
}
let kpiFrame = 0

/* 生命周期 */
let observer = null
let prevBodyBg = ''

onMounted(async () => {
  prevBodyBg = document.body.style.backgroundColor
  document.body.style.backgroundColor = '#ffffff'

  if (!document.querySelector('link[data-ui-font]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = FONT_HREF
    link.dataset.uiFont = '1'
    document.head.appendChild(link)
  }

  await nextTick()

  const targets = Array.from(document.querySelectorAll('[data-reveal]'))
  if (prefersReduce() || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'))
  } else {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-in')
          observer?.unobserve(entry.target)
        })
      },
      { threshold: 0.12 }
    )
    targets.forEach((el) => observer.observe(el))
  }

  runKpis()
})

onBeforeUnmount(() => {
  if (kpiFrame) cancelAnimationFrame(kpiFrame)
  window.clearTimeout(loadingTimer)
  toastTimers.forEach((timer) => window.clearTimeout(timer))
  observer?.disconnect()
  document.querySelector('link[data-ui-font]')?.remove()
  document.body.style.backgroundColor = prevBodyBg
})
</script>

<style scoped>
.ui-page {
  --red: #d92d20;
  --red-hover: #b42318;
  --red-soft: #fef3f2;
  --red-border: #fecdca;
  --ink: #101828;
  --ink-2: #475467;
  --ink-3: #667085;
  --ink-4: #98a2b3;
  --line: #eaecf0;
  --line-2: #e4e7ec;
  --bg: #ffffff;
  --bg-soft: #f9fafb;
  --radius: 12px;
  --shadow-xs: 0 1px 2px rgba(16, 24, 40, 0.05);
  --shadow-sm: 0 1px 3px rgba(16, 24, 40, 0.08), 0 1px 2px rgba(16, 24, 40, 0.04);
  --shadow-md: 0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03);
  --shadow-lg: 0 24px 48px -12px rgba(16, 24, 40, 0.18);
  --e-out: cubic-bezier(0.22, 1, 0.36, 1);
  --e-spring: cubic-bezier(0.34, 1.4, 0.64, 1);
  --f: 'Manrope', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  position: relative;
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--f);
  -webkit-font-smoothing: antialiased;
  overflow-x: clip;
}

/* 本页固定浅色，覆盖主站深色模式下对标题的全局染色 */
.ui-page h1,
.ui-page h2,
.ui-page h3 {
  color: var(--ink);
}

.ui-page ::selection {
  background: rgba(217, 45, 32, 0.16);
}

.ui-page :focus-visible {
  outline: 2px solid rgba(217, 45, 32, 0.6);
  outline-offset: 2px;
}

.container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ===== 顶栏 ===== */
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.86);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  height: 64px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--ink);
  text-decoration: none;
}

.logo-mark {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: var(--red);
  box-shadow: inset 0 -6px 10px rgba(0, 0, 0, 0.16);
}

.logo-text {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.logo-ver {
  padding: 2px 7px;
  border: 1px solid var(--line-2);
  border-radius: 999px;
  color: var(--ink-3);
  font-size: 10.5px;
  font-weight: 500;
}

.nav-links {
  display: flex;
  gap: 4px;
}

.nav-links a {
  padding: 7px 11px;
  border-radius: 8px;
  color: var(--ink-2);
  font-size: 13.5px;
  text-decoration: none;
  transition: background 0.18s, color 0.18s;
}

.nav-links a:hover {
  background: var(--bg-soft);
  color: var(--ink);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ===== 按钮 ===== */
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 38px;
  padding: 0 15px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: 0.005em;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s, color 0.18s, box-shadow 0.18s, transform 0.1s;
}

.btn svg {
  width: 15px;
  height: 15px;
}

.btn:active:not(:disabled) {
  transform: scale(0.985);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-primary {
  color: #fff;
  background: var(--red);
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.08), inset 0 -1px 1px rgba(0, 0, 0, 0.12);
}

.btn-primary:hover:not(:disabled) {
  background: var(--red-hover);
}

.btn-outline {
  color: var(--ink-2);
  background: #fff;
  border-color: var(--line-2);
  box-shadow: var(--shadow-xs);
}

.btn-outline:hover {
  color: var(--ink);
  border-color: #d0d5dd;
  background: var(--bg-soft);
}

.btn-quiet {
  color: var(--ink-2);
}

.btn-quiet:hover {
  color: var(--ink);
  background: var(--bg-soft);
}

.btn-dark {
  color: #fff;
  background: var(--ink);
  text-decoration: none;
}

.btn-dark:hover {
  background: #1d2939;
}

.btn-danger {
  color: #fff;
  background: #d92d20;
}

.btn-danger:hover {
  background: #b42318;
}

.btn-danger-soft {
  color: var(--red);
  background: var(--red-soft);
  border-color: var(--red-border);
}

.btn-danger-soft:hover {
  background: #fee4e2;
}

.btn-light {
  color: var(--red-hover);
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.btn-light:hover {
  background: #fff5f5;
}

.btn-ghost-light {
  color: rgba(255, 255, 255, 0.86);
  text-decoration: none;
}

.btn-ghost-light:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
}

.btn-lg {
  height: 44px;
  padding: 0 20px;
  font-size: 14px;
}

.btn-icon {
  width: 38px;
  padding: 0;
}

.btn-icon.on {
  color: var(--red);
  border-color: var(--red-border);
  background: var(--red-soft);
}

.spinner {
  width: 13px;
  height: 13px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ===== Hero ===== */
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  align-items: center;
  gap: 48px;
  padding: 72px 0 68px;
}

.pill {
  display: inline-block;
  padding: 5px 11px;
  border: 1px solid var(--red-border);
  border-radius: 999px;
  background: var(--red-soft);
  color: var(--red-hover);
  font-size: 11.5px;
  font-weight: 600;
}

.hero h1 {
  margin: 18px 0 16px;
  font-size: clamp(32px, 4.2vw, 50px);
  font-weight: 700;
  line-height: 1.16;
  letter-spacing: -0.025em;
  text-wrap: balance;
}

.hero-sub {
  max-width: 460px;
  color: var(--ink-2);
  font-size: 15px;
  line-height: 1.75;
  text-wrap: pretty;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 26px;
}

.hero-points {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 22px;
  padding: 0;
  list-style: none;
  color: var(--ink-3);
  font-size: 12.5px;
}

.hero-points li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.hero-points i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--red);
}

/* ===== 产品预览 ===== */
.preview {
  position: relative;
}

.preview-glow {
  position: absolute;
  inset: -18% -12% -14%;
  background: radial-gradient(closest-side, rgba(217, 45, 32, 0.16), transparent 72%);
  filter: blur(26px);
  pointer-events: none;
}

.window {
  position: relative;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: #fff;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: rise 0.8s var(--e-out) 0.1s both;
}

.window-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px;
  border-bottom: 1px solid var(--line);
  background: var(--bg-soft);
}

.wdot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.wdot.red { background: #f97066; }
.wdot.amber { background: #fdb022; }
.wdot.green { background: #32d583; }

.window-url {
  margin-left: 10px;
  color: var(--ink-4);
  font-size: 10.5px;
}

.window-body {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr);
}

.side {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 8px;
  border-right: 1px solid var(--line);
  background: #fcfcfd;
}

.side-logo {
  width: 18px;
  height: 18px;
  margin: 0 0 10px 6px;
  border-radius: 6px;
  background: var(--red);
}

.side-item {
  padding: 6px 8px;
  border-radius: 6px;
  color: var(--ink-3);
  font-size: 11px;
}

.side-item.active {
  background: var(--red-soft);
  color: var(--red-hover);
  font-weight: 600;
}

.main {
  padding: 12px 14px 14px;
}

.main-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 12.5px;
}

.main-pill {
  padding: 2px 8px;
  border: 1px solid var(--line-2);
  border-radius: 999px;
  color: var(--ink-3);
  font-size: 10px;
}

.kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
}

.kpi {
  position: relative;
  padding: 8px 9px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: #fff;
  overflow: hidden;
}

.kpi small {
  display: block;
  color: var(--ink-3);
  font-size: 9.5px;
}

.kpi strong {
  display: block;
  margin-top: 3px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}

.kpi em {
  font-style: normal;
  font-size: 9.5px;
  font-weight: 600;
}

.kpi em.up { color: #067647; }
.kpi em.down { color: var(--red); }

.kpi-index {
  position: absolute;
  top: 7px;
  right: 8px;
  color: #e4e7ec;
  font-size: 9px;
}

.chart {
  display: flex;
  align-items: flex-end;
  gap: 5px;
  height: 92px;
  margin-top: 12px;
  padding: 8px 2px 0;
  border-bottom: 1px solid var(--line);
}

.bar {
  flex: 1;
  height: var(--h, 40%);
  border-radius: 3px 3px 0 0;
  background: linear-gradient(180deg, #f97066, var(--red));
  transform-origin: bottom;
  animation: barIn 0.7s var(--e-out) both;
  animation-delay: calc(0.3s + var(--i) * 45ms);
}

.rows {
  margin-top: 10px;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  border-bottom: 1px solid #f2f4f7;
}

.row:last-child {
  border-bottom: 0;
}

.row-avatar {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--red-soft);
  color: var(--red-hover);
  font-size: 9.5px;
  font-weight: 600;
}

.row-text {
  flex: 1;
  min-width: 0;
}

.row-text b {
  display: block;
  font-size: 10.5px;
  font-weight: 600;
}

.row-text small {
  color: var(--ink-4);
  font-size: 9px;
}

.row-tag {
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 600;
}

.row-tag.ok {
  background: #ecfdf3;
  color: #067647;
}

.row-tag.away {
  background: #fffaeb;
  color: #b54708;
}

/* ===== 区块 ===== */
.block {
  padding: 64px 0;
  border-top: 1px solid var(--line);
  scroll-margin-top: 72px;
}

.section-head {
  max-width: 620px;
  margin-bottom: 32px;
}

.section-kicker {
  display: inline-block;
  margin-bottom: 10px;
  color: var(--red);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.section-head h2 {
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.02em;
  text-wrap: balance;
}

.section-head p {
  margin-top: 10px;
  color: var(--ink-2);
  font-size: 14.5px;
  line-height: 1.7;
}

/* 特性 */
.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.feature {
  position: relative;
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: #fff;
  transition: border-color 0.24s, box-shadow 0.28s var(--e-out), transform 0.28s var(--e-out);
}

.feature:hover {
  transform: translateY(-2px);
  border-color: #d0d5dd;
  box-shadow: var(--shadow-md);
}

.feature-icon {
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--red-soft);
  color: var(--red);
}

.feature-icon svg {
  width: 19px;
  height: 19px;
}

.feature h3 {
  margin: 14px 0 6px;
  font-size: 15.5px;
  font-weight: 600;
}

.feature p {
  color: var(--ink-2);
  font-size: 13.5px;
  line-height: 1.7;
}

.feature-index {
  position: absolute;
  top: 20px;
  right: 22px;
  color: #e4e7ec;
  font-size: 12px;
  font-weight: 700;
}

/* 展示 */
.showcase {
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: #fff;
  box-shadow: var(--shadow-xs);
}

.card-tall {
  padding-bottom: 18px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.card-head h3 {
  font-size: 15px;
  font-weight: 600;
}

.card-tag {
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--bg-soft);
  color: var(--ink-3);
  font-size: 10.5px;
  font-weight: 500;
}

.card-foot {
  display: flex;
  gap: 8px;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 表单 */
.field {
  display: block;
  margin-bottom: 16px;
}

.label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 7px;
  color: var(--ink-2);
  font-size: 12.5px;
  font-weight: 500;
}

.label b {
  margin-left: auto;
  color: var(--ink);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--line-2);
  border-radius: 9px;
  background: #fff;
  color: var(--ink);
  font-family: inherit;
  font-size: 13.5px;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
  caret-color: var(--red);
}

.input::placeholder {
  color: var(--ink-4);
}

.input:focus {
  border-color: var(--red);
  box-shadow: 0 0 0 3px rgba(217, 45, 32, 0.12);
}

.segmented {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 3px;
  border: 1px solid var(--line-2);
  border-radius: 10px;
  background: var(--bg-soft);
}

.segmented button {
  position: relative;
  z-index: 2;
  height: 32px;
  border: 0;
  background: transparent;
  color: var(--ink-3);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.18s;
}

.segmented button.on {
  color: var(--ink);
}

.seg-thumb {
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 3px;
  width: calc((100% - 6px) / var(--n, 3));
  border-radius: 7px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(16, 24, 40, 0.12);
  transform: translateX(calc(var(--i, 0) * 100%));
  transition: transform 0.3s var(--e-spring);
}

.switch-row {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--ink-2);
  font-family: inherit;
  font-size: 12.5px;
  cursor: pointer;
}

.switch {
  position: relative;
  flex: none;
  width: 40px;
  height: 24px;
  border-radius: 999px;
  background: #d0d5dd;
  transition: background 0.22s;
}

.switch.on {
  background: var(--red);
}

.switch-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(16, 24, 40, 0.2);
  transition: transform 0.26s var(--e-spring);
}

.switch.on .switch-knob {
  transform: translateX(16px);
}

.range {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--red) var(--pct), #eaecf0 var(--pct));
  outline: none;
  cursor: pointer;
}

.range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: var(--red);
  box-shadow: 0 0 0 1px var(--red), 0 2px 6px rgba(16, 24, 40, 0.2);
  transition: transform 0.15s;
}

.range::-webkit-slider-thumb:hover {
  transform: scale(1.12);
}

.range::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: var(--red);
}

.check {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ink-2);
  font-size: 12.5px;
  cursor: pointer;
  user-select: none;
}

.check input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.check-box {
  display: grid;
  place-items: center;
  flex: none;
  width: 17px;
  height: 17px;
  border: 1.5px solid #d0d5dd;
  border-radius: 5px;
  background: #fff;
  transition: background 0.18s, border-color 0.18s;
}

.check-box svg {
  width: 11px;
  height: 11px;
  fill: none;
  stroke: #fff;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.check-box polyline {
  stroke-dasharray: 18;
  stroke-dashoffset: 18;
  transition: stroke-dashoffset 0.2s ease 0.03s;
}

.check input:checked + .check-box {
  border-color: var(--red);
  background: var(--red);
}

.check input:checked + .check-box polyline {
  stroke-dashoffset: 0;
}

.check input:focus-visible + .check-box {
  outline: 2px solid rgba(217, 45, 32, 0.6);
  outline-offset: 2px;
}

/* 标签页 */
.tabs {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--n, 3), 1fr);
  border-bottom: 1px solid var(--line);
}

.tab {
  height: 36px;
  border: 0;
  background: transparent;
  color: var(--ink-3);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.18s;
}

.tab:hover {
  color: var(--ink-2);
}

.tab.on {
  color: var(--ink);
}

.tab-indicator {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: calc(100% / var(--n, 3));
  height: 2px;
  border-radius: 2px;
  background: var(--red);
  transform: translateX(calc(var(--i, 0) * 100%));
  transition: transform 0.28s var(--e-out);
}

.tab-body {
  margin-top: 14px;
  color: var(--ink-2);
  font-size: 13px;
  line-height: 1.75;
  animation: fadeUp 0.3s var(--e-out) both;
}

/* 数据 */
.data-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.progress {
  height: 8px;
  margin-bottom: 18px;
  border-radius: 999px;
  background: #f2f4f7;
  overflow: hidden;
}

.progress-fill {
  display: block;
  height: 100%;
  width: 0;
  border-radius: 999px;
  background: var(--red);
}

[data-reveal].is-in .progress-fill {
  width: var(--pct);
  transition: width 1s var(--e-out) 0.15s;
}

.table {
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
}

.thead,
.trow {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) 1fr 84px;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
}

.thead {
  background: var(--bg-soft);
  color: var(--ink-3);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.trow {
  border-top: 1px solid var(--line);
  font-size: 12.5px;
}

.tname {
  font-weight: 500;
}

.towner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ink-2);
  font-size: 12px;
}

.towner i {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--bg-soft);
  color: var(--ink-3);
  font-style: normal;
  font-size: 9.5px;
}

.tstate {
  justify-self: start;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
}

.tstate.done {
  background: #ecfdf3;
  color: #067647;
}

.tstate.doing {
  background: var(--red-soft);
  color: var(--red-hover);
}

.tstate.todo {
  background: #f2f4f7;
  color: var(--ink-3);
}

.members {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.member {
  display: flex;
  align-items: center;
  gap: 9px;
}

.member i {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--red-soft);
  color: var(--red-hover);
  font-style: normal;
  font-size: 11px;
  font-weight: 600;
}

.member b {
  font-size: 12.5px;
  font-weight: 600;
}

.member small {
  margin-left: auto;
  color: var(--ink-3);
  font-size: 11px;
}

.avatars {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}

.avatar {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  margin-left: -8px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: var(--red-soft);
  color: var(--red-hover);
  font-size: 11px;
  font-weight: 600;
}

.avatar:first-child {
  margin-left: 0;
}

.avatar-more {
  background: #f2f4f7;
  color: var(--ink-3);
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: 4px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
}

.badge-green {
  background: #ecfdf3;
  color: #067647;
}

.badge-green i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #12b76a;
}

.skeleton {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sk-avatar,
.sk-line {
  position: relative;
  overflow: hidden;
  background: #f2f4f7;
}

.sk-avatar {
  flex: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
}

.sk-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sk-line {
  height: 9px;
  border-radius: 999px;
}

.sk-line.w70 { width: 70%; }
.sk-line.w45 { width: 45%; }

.sk-avatar::after,
.sk-line::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent 20%, rgba(255, 255, 255, 0.9) 50%, transparent 80%);
  transform: translateX(-100%);
  animation: shimmer 1.6s ease-in-out infinite;
}

/* 问答 */
.faq {
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 4px 22px;
  background: #fff;
}

.acc {
  border-bottom: 1px solid var(--line);
}

.acc:last-child {
  border-bottom: 0;
}

.acc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 16px 0;
  border: 0;
  background: none;
  color: var(--ink);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}

.acc-head:hover {
  color: var(--red);
}

.acc-sign {
  position: relative;
  flex: none;
  width: 13px;
  height: 13px;
  color: var(--ink-3);
}

.acc-sign::before,
.acc-sign::after {
  content: '';
  position: absolute;
  background: currentColor;
  transition: transform 0.26s var(--e-out), opacity 0.26s;
}

.acc-sign::before {
  top: 6px;
  left: 0;
  width: 13px;
  height: 1.4px;
}

.acc-sign::after {
  top: 0;
  left: 5.8px;
  width: 1.4px;
  height: 13px;
}

.acc.open .acc-sign::after {
  transform: scaleY(0);
  opacity: 0;
}

.acc-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s var(--e-out);
}

.acc.open .acc-body {
  grid-template-rows: 1fr;
}

.acc-body p {
  overflow: hidden;
  color: var(--ink-2);
  font-size: 13.5px;
  line-height: 1.75;
  opacity: 0;
  transition: opacity 0.26s ease, padding 0.3s var(--e-out);
}

.acc.open .acc-body p {
  padding-bottom: 16px;
  opacity: 1;
  transition-delay: 0.05s;
}

/* CTA */
.cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin: 64px 0 0;
  padding: 36px 40px;
  border-radius: 18px;
  background:
    radial-gradient(120% 160% at 100% 0%, #f04438 0%, transparent 55%),
    linear-gradient(120deg, #b42318, #d92d20 60%);
  color: #fff;
  scroll-margin-top: 72px;
}

.cta h2 {
  color: #fff;
  font-size: clamp(22px, 2.6vw, 28px);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.cta p {
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 14px;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex: none;
}

/* 页脚 */
.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 28px 0 44px;
  color: var(--ink-3);
  font-size: 12.5px;
}

.foot-ver {
  font-variant-numeric: tabular-nums;
}

/* 对话框 */
.mask {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(16, 24, 40, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.dialog {
  width: min(420px, 100%);
  padding: 24px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 24px 48px -12px rgba(16, 24, 40, 0.32);
  animation: dialogIn 0.24s var(--e-out) both;
}

.dialog-icon {
  display: inline-grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--red-soft);
  color: var(--red);
}

.dialog-icon svg {
  width: 20px;
  height: 20px;
}

.dialog h3 {
  margin: 14px 0 6px;
  font-size: 17px;
  font-weight: 600;
}

.dialog p {
  color: var(--ink-2);
  font-size: 13.5px;
  line-height: 1.7;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 22px;
}

/* Toast */
.toasts {
  position: fixed;
  right: 20px;
  bottom: 22px;
  z-index: 3100;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 15px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #fff;
  color: var(--ink);
  font-size: 13px;
  box-shadow: 0 12px 24px -6px rgba(16, 24, 40, 0.16);
}

.toast-check {
  display: grid;
  place-items: center;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: #ecfdf3;
  color: #067647;
}

.toast-check svg {
  width: 11px;
  height: 11px;
}

/* 过渡与关键帧 */
.mask-enter-active,
.mask-leave-active {
  transition: opacity 0.2s ease;
}

.mask-enter-from,
.mask-leave-to {
  opacity: 0;
}

.mask-leave-active .dialog {
  animation: dialogOut 0.15s ease both;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.22s, transform 0.3s var(--e-out);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(14px);
}

.toast-move {
  transition: transform 0.28s var(--e-out);
}

@keyframes rise {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: none; }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}

@keyframes barIn {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

@keyframes dialogIn {
  from { opacity: 0; transform: scale(0.97) translateY(6px); }
  to { opacity: 1; transform: none; }
}

@keyframes dialogOut {
  from { opacity: 1; transform: none; }
  to { opacity: 0; transform: scale(0.98); }
}

[data-reveal] > * {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.6s var(--e-out), transform 0.6s var(--e-out);
}

[data-reveal].is-in > * {
  opacity: 1;
  transform: none;
}

[data-reveal].is-in > *:nth-child(2) {
  transition-delay: 0.08s;
}

/* 响应式 */
@media (max-width: 960px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 36px;
    padding: 48px 0 44px;
  }

  .features {
    grid-template-columns: 1fr;
  }

  .showcase,
  .data-grid {
    grid-template-columns: 1fr;
  }

  .nav-links {
    display: none;
  }
}

@media (max-width: 720px) {
  .container {
    padding: 0 18px;
  }

  .nav-actions .btn-quiet {
    display: none;
  }

  .window-body {
    grid-template-columns: 1fr;
  }

  .side {
    display: none;
  }

  .cta {
    flex-direction: column;
    align-items: flex-start;
    padding: 28px 24px;
  }

  .cta-actions {
    width: 100%;
  }

  .block {
    padding: 48px 0;
  }
}

@media (max-width: 480px) {
  .hero h1 {
    font-size: 30px;
  }

  .btn {
    height: 40px;
  }

  .hero-actions .btn {
    flex: 1;
  }

  .kpis {
    grid-template-columns: 1fr;
  }

  .chart {
    height: 72px;
  }

  .dialog-actions {
    flex-direction: column-reverse;
  }

  .dialog-actions .btn {
    width: 100%;
  }

  .toasts {
    left: 14px;
    right: 14px;
    bottom: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ui-page *,
  .ui-page *::before,
  .ui-page *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  [data-reveal] > *,
  .window {
    opacity: 1 !important;
    transform: none !important;
  }
}

:global(html.reduce-motion) .ui-page [data-reveal] > *,
:global(html.reduce-motion) .ui-page .window {
  opacity: 1 !important;
  transform: none !important;
}
</style>
