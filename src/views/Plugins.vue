<template>
  <div class="plugins-page" :class="{ leaving: isLeaving }">
    <div class="stagger-item" :style="{ '--delay': '0.05s' }">
      <button class="back-btn" @click="goBack">{{ t('plugins.back') }}</button>
    </div>

    <div class="stagger-item" :style="{ '--delay': '0.1s' }">
      <div class="page-header">
        <div class="header-icon"><AppIcon name="配置_config" :size="44" /></div>
        <div class="header-text">
          <h1>{{ t('plugins.title') }}</h1>
          <p class="subtitle">{{ t('plugins.subtitle') }}</p>
        </div>
      </div>
    </div>

    <!-- 筛选标签 -->
    <div class="stagger-item filter-bar" :style="{ '--delay': '0.15s' }">
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="filter-btn"
        :class="{ active: activeCategory === cat.key }"
        @click="activeCategory = cat.key"
      >
        <span class="filter-icon"><AppIcon :name="cat.icon" :size="15" /></span>
        <span class="filter-label">{{ cat.label }}</span>
        <span class="filter-count">{{ getCategoryCount(cat.key) }}</span>
      </button>
    </div>

    <!-- 插件列表 -->
    <div class="stagger-item plugin-grid" :style="{ '--delay': '0.2s' }">
      <div
        v-for="plugin in filteredPlugins"
        :key="plugin.name"
        class="plugin-card"
        :class="{ official: plugin.official }"
      >
        <div class="plugin-top">
          <div class="plugin-icon-wrap">
            <span class="plugin-icon">{{ plugin.icon }}</span>
            <span v-if="plugin.official" class="badge badge-official">{{ t('plugins.badgeOfficial') }}</span>
            <span v-else class="badge badge-community">{{ t('plugins.badgeCommunity') }}</span>
          </div>
          <div class="plugin-meta">
            <h3 class="plugin-name">{{ plugin.name }}</h3>
            <div class="plugin-tags">
              <span class="tag tag-version">v{{ plugin.version }}</span>
              <span v-if="plugin.size" class="tag tag-size">{{ plugin.size }}</span>
              <span v-if="plugin.new" class="tag tag-new">{{ t('plugins.tagNew') }}</span>
            </div>
          </div>
        </div>

        <p class="plugin-desc">{{ plugin.desc }}</p>

        <div v-if="plugin.features && plugin.features.length" class="plugin-features">
          <div v-for="(f, i) in plugin.features" :key="i" class="feature-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>{{ f }}</span>
          </div>
        </div>

        <div class="plugin-footer">
          <div class="plugin-author">
            <span class="author-icon">👤</span>
            <span>{{ plugin.author }}</span>
          </div>
          <button class="download-btn" @click="downloadPlugin(plugin)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {{ t('plugins.download') }}
          </button>
        </div>
      </div>

      <div v-if="filteredPlugins.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <p class="empty-text">{{ t('plugins.empty') }}</p>
      </div>
    </div>

    <!-- 安装说明 -->
    <div class="stagger-item section" :style="{ '--delay': '0.25s' }">
      <h2>{{ t('plugins.installTitle') }}</h2>
      <div class="install-steps">
        <div v-for="(step, i) in installSteps" :key="i" class="step-item">
          <div class="step-num">{{ i + 1 }}</div>
          <div class="step-content">
            <h3>{{ step.title }}</h3>
            <p v-if="step.desc">{{ step.desc }}</p>
            <pre v-if="step.code" class="code-block"><code>{{ step.code }}</code></pre>
          </div>
        </div>
      </div>
    </div>

    <!-- 开发指南 -->
    <div class="stagger-item section" :style="{ '--delay': '0.3s' }">
      <h2>{{ t('plugins.devTitle') }}</h2>
      <p class="desc">{{ t('plugins.devDesc') }}</p>

      <div class="dev-card">
        <h3>{{ t('plugins.devExample') }}</h3>
        <pre class="code-block"><code>def cmd_hello(args):
    """{{ t('plugins.devComment1') }}"""
    print("Hello, Renkt!")


def cmd_add(args):
    """{{ t('plugins.devComment2') }}"""
    if len(args) >= 2:
        total = sum(int(x) for x in args)
        print(f"Sum = {total}")</code></pre>
      </div>

      <div class="dev-tips">
        <div v-for="(tip, i) in devTips" :key="i" class="tip-item">
          <span class="tip-icon">💡</span>
          <span>{{ tip }}</span>
        </div>
      </div>
    </div>

    <!-- 提交作品 -->
    <div class="stagger-item submit-section" :style="{ '--delay': '0.35s' }">
      <div class="submit-content">
        <div>
          <h2>{{ t('plugins.submitTitle') }}</h2>
          <p class="submit-desc">{{ t('plugins.submitDesc') }}</p>
        </div>
        <button class="submit-btn" @click="goSubmit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          {{ t('plugins.submitBtn') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { isLeaving } from '../router'
import { t, locale } from '../utils/i18n'
import { createLogger } from '../utils/logger'
import AppIcon from '../components/AppIcon.vue'

const log = createLogger('Plugins')
// 模块初始化：插件分类筛选、插件下载与作品提交入口
log.info('插件页模块已初始化：插件分类筛选、下载与提交入口')

const router = useRouter()
const activeCategory = ref('all')

const categories = computed(() => [
  { key: 'all', icon: '全部_all-application', label: t('plugins.catAll') },
  { key: 'official', icon: '安全_shield', label: t('plugins.catOfficial') },
  { key: 'community', icon: '更多2_more-two', label: t('plugins.catCommunity') },
  { key: 'tool', icon: '工具_tool', label: t('plugins.catTool') },
  { key: 'gui', icon: '系统_system', label: t('plugins.catGui') }
])

const plugins = computed(() => [
  {
    name: 'GUI Viewer',
    version: '1.0',
    icon: '🖥️',
    official: true,
    category: ['official', 'gui'],
    new: false,
    size: '12 KB',
    author: locale.value === 'zh' ? 'Renkt 官方' : 'Renkt Team',
    desc: locale.value === 'zh'
      ? '图形化界面插件，提供可视化操作界面，支持窗口模式、拖拽交互、主题切换等功能。'
      : 'Graphical interface plugin with visual operations, window mode, drag & drop, theme switching and more.',
    features: locale.value === 'zh'
      ? ['窗口化 GUI 界面', '主题自定义', '命令快捷按钮']
      : ['Windowed GUI interface', 'Theme customization', 'Command quick buttons'],
    file: 'GUI Viewer.py'
  },
  {
    name: 'File Explorer',
    version: '1.2',
    icon: '📁',
    official: true,
    category: ['official', 'tool'],
    new: true,
    size: '18 KB',
    author: locale.value === 'zh' ? 'Renkt 官方' : 'Renkt Team',
    desc: locale.value === 'zh'
      ? '文件管理器插件，支持浏览目录、复制/移动/删除文件、快速预览文本和图片。'
      : 'File manager plugin for browsing directories, copy/move/delete files, quick preview text and images.',
    features: locale.value === 'zh'
      ? ['目录树浏览', '文件批量操作', '文本/图片预览']
      : ['Directory tree browsing', 'Batch file operations', 'Text/image preview'],
    file: 'File Explorer.py'
  },
  {
    name: 'Weather Lookup',
    version: '1.0',
    icon: '🌤️',
    official: false,
    category: ['community', 'tool'],
    new: true,
    size: '9 KB',
    author: '@hg_dev',
    desc: locale.value === 'zh'
      ? '天气查询插件，支持城市搜索、三日预报、空气质量指数、生活指数提示。'
      : 'Weather lookup plugin, supports city search, 3-day forecast, AQI and life index tips.',
    features: locale.value === 'zh'
      ? ['全球城市天气', '空气质量 AQI', '生活指数建议']
      : ['Global city weather', 'Air quality AQI', 'Life index suggestions'],
    file: 'Weather.py'
  },
  {
    name: 'Note Taker',
    version: '2.1',
    icon: '📝',
    official: true,
    category: ['official', 'tool'],
    new: false,
    size: '24 KB',
    author: locale.value === 'zh' ? 'Renkt 官方' : 'Renkt Team',
    desc: locale.value === 'zh'
      ? '笔记插件，支持 Markdown 语法、本地存储、搜索、标签分类和导出。'
      : 'Notes plugin with Markdown support, local storage, search, tag categories and export.',
    features: locale.value === 'zh'
      ? ['Markdown 渲染', '全文搜索', '标签/导出']
      : ['Markdown render', 'Full text search', 'Tags / Export'],
    file: 'Notes.py'
  },
  {
    name: 'Translator',
    version: '1.3',
    icon: '🌐',
    official: false,
    category: ['community', 'tool'],
    new: false,
    size: '15 KB',
    author: '@linguist',
    desc: locale.value === 'zh'
      ? '多语言翻译插件，支持中英日韩互译、批量翻译、结果缓存和发音播放。'
      : 'Multi-language translator, ZH/EN/JA/KR, batch translation, cache and TTS playback.',
    features: locale.value === 'zh'
      ? ['四语言互译', '批量翻译文件', '文本朗读']
      : ['4-lang translation', 'Batch file mode', 'Text to speech'],
    file: 'Translator.py'
  },
  {
    name: 'System Monitor',
    version: '1.1',
    icon: '📊',
    official: false,
    category: ['community', 'gui', 'tool'],
    new: true,
    size: '22 KB',
    author: '@sysadmin',
    desc: locale.value === 'zh'
      ? '系统资源监控插件，实时显示 CPU、内存、磁盘、网络占用，支持图表视图和告警。'
      : 'System resource monitor, real-time CPU, memory, disk, network, charts and alerts.',
    features: locale.value === 'zh'
      ? ['实时 CPU/内存曲线', '磁盘/网络占用', '阈值告警']
      : ['Realtime CPU/MEM curve', 'Disk/NET usage', 'Threshold alert'],
    file: 'SystemMonitor.py'
  }
])

const filteredPlugins = computed(() => {
  if (activeCategory.value === 'all') {
    log.debug('筛选插件列表', { category: 'all', count: plugins.value.length })
    return plugins.value
  }
  const list = plugins.value.filter(p => p.category.includes(activeCategory.value))
  log.debug('筛选插件列表', { category: activeCategory.value, count: list.length })
  return list
})

const getCategoryCount = (key) => {
  if (key === 'all') return plugins.value.length
  return plugins.value.filter(p => p.category.includes(key)).length
}

watch(activeCategory, (val) => {
  log.info('切换插件分类', { category: val, count: getCategoryCount(val) })
})

const installSteps = computed(() => [
  {
    title: t('plugins.step1Title'),
    desc: t('plugins.step1Desc'),
    code: null
  },
  {
    title: t('plugins.step2Title'),
    desc: t('plugins.step2Desc'),
    code: 'plugins/\n├── __init__.py\n├── GUI Viewer.py\n└── 你的插件.py'
  },
  {
    title: t('plugins.step3Title'),
    desc: t('plugins.step3Desc'),
    code: 'python main.py\n> plugins --list\n> hello\nHello, Renkt!'
  }
])

const devTips = computed(() => ([
  t('plugins.devTip1'),
  t('plugins.devTip2'),
  t('plugins.devTip3'),
  t('plugins.devTip4')
]))

const goBack = () => {
  log.info('返回首页')
  router.push('/')
}

const downloadPlugin = (plugin) => {
  log.info('点击下载插件', { name: plugin.name, version: plugin.version })
  const link = document.createElement('a')
  link.href = import.meta.env.BASE_URL + 'Renkt Shell/1.2.5/Renkt/plugins/' + plugin.file
  link.download = plugin.file
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const goSubmit = () => {
  log.info('跳转提交插件入口')
  router.push('/renkt')
}

onMounted(() => {
  log.debug('开始加载插件列表')
  log.info('插件列表加载完成', { plugins: plugins.value.length, categories: categories.value.length })
  log.info('Plugins 页面已加载', { category: activeCategory.value })
})
</script>

<style scoped>
.plugins-page {
  max-width: 960px;
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

/* 返回按钮 */
.back-btn {
  background: none;
  border: none;
  color: var(--accent, #42b983);
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  margin-bottom: 16px;
  align-self: flex-start;
}
.back-btn:hover { text-decoration: underline; }

/* 头部 */
.page-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 12px;
}
.header-icon {
  font-size: 48px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent, #42b983);
  background: linear-gradient(135deg, #f0f9f4 0%, #e8f5ef 100%);
  border-radius: 18px;
  flex-shrink: 0;
  border: 1px solid #d4f0e1;
}
.header-text h1 {
  margin: 0 0 6px;
  font-size: 34px;
}
.subtitle {
  color: #666;
  font-size: 15px;
  margin: 0;
  line-height: 1.6;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 28px 0 24px;
  padding: 10px;
  background: #f6faf8;
  border: 1px solid #e4efe9;
  border-radius: 14px;
}
.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  color: #555;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  transition: all 0.2s ease;
}
.filter-btn:hover {
  background: #ffffff;
  border-color: #d4f0e1;
  color: #2c7a52;
}
.filter-btn.active {
  background: #ffffff;
  border-color: var(--accent, #42b983);
  color: #2c7a52;
  box-shadow: 0 2px 8px rgba(var(--accent-rgb, 66, 185, 131), 0.15);
}
.filter-icon { display: flex; align-items: center; }
.filter-count {
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.15);
  color: #2c7a52;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}
.filter-btn.active .filter-count {
  background: var(--accent, #42b983);
  color: white;
}

/* 插件卡片网格 */
.plugin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 18px;
  margin-bottom: 44px;
}
.plugin-card {
  background: #ffffff;
  border: 1px solid #e8f0ea;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}
.plugin-card:hover {
  border-color: var(--accent, #42b983);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(var(--accent-rgb, 66, 185, 131), 0.15);
}
.plugin-card.official {
  background: linear-gradient(180deg, #fbfefc 0%, #ffffff 60%);
}

.plugin-top {
  margin-bottom: 12px;
}
.plugin-icon-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 10px;
}
.plugin-icon {
  width: 52px;
  height: 52px;
  font-size: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.1);
  border-radius: 12px;
}
.badge {
  position: absolute;
  top: -4px;
  right: -6px;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 8px;
  white-space: nowrap;
}
.badge-official {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}
.badge-community {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}
.plugin-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.plugin-name {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}
.plugin-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  background: #f3f4f6;
  color: #555;
}
.tag-version {
  background: #eaf3ee;
  color: #2c7a52;
  font-weight: 600;
}
.tag-new {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  animation: pulse 1.8s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}
.plugin-desc {
  color: #555;
  font-size: 13.5px;
  line-height: 1.65;
  margin: 0 0 14px;
  flex: 1;
}

.plugin-features {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  padding: 10px 12px;
  background: #f6faf8;
  border-radius: 8px;
}
.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12.5px;
  color: #444;
  line-height: 1.5;
}
.feature-item svg {
  width: 14px;
  height: 14px;
  color: var(--accent, #42b983);
  flex-shrink: 0;
  margin-top: 2px;
}

.plugin-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #eef3f0;
}
.plugin-author {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: #666;
}
.author-icon { font-size: 14px; }

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--accent, #42b983);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
  flex-shrink: 0;
}
.download-btn:hover {
  background: #3aa876;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(var(--accent-rgb, 66, 185, 131), 0.3);
}
.download-btn svg { width: 15px; height: 15px; }

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #888;
}
.empty-icon { font-size: 52px; margin-bottom: 12px; opacity: 0.6; }
.empty-text { margin: 0; font-size: 15px; }

/* section */
.section { margin-top: 44px; }
.section h2 {
  font-size: 22px;
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--accent, #42b983);
  display: inline-block;
}
.desc {
  color: #555;
  line-height: 1.8;
  font-size: 15px;
  margin-bottom: 16px;
}

/* 安装步骤 */
.install-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.step-item {
  display: flex;
  gap: 16px;
  padding: 18px;
  background: #f6faf8;
  border: 1px solid #e4efe9;
  border-radius: 12px;
  transition: all 0.25s ease;
}
.step-item:hover {
  border-color: var(--accent, #42b983);
  background: #fafefc;
}
.step-num {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  background: var(--accent, #42b983);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
}
.step-content h3 {
  margin: 0 0 6px;
  font-size: 16px;
  color: #1f2937;
}
.step-content p {
  margin: 0 0 8px;
  color: #555;
  font-size: 14px;
  line-height: 1.6;
}
.code-block {
  background: #1e1e2e;
  color: #cdd6f4;
  padding: 12px 14px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 6px 0 0 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12.5px;
  line-height: 1.6;
}

/* 开发指南 */
.dev-card {
  background: #f6faf8;
  border: 1px solid #e4efe9;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}
.dev-card h3 {
  margin: 0 0 14px;
  font-size: 16px;
  color: #1f2937;
}
.dev-tips {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 10px;
  margin-top: 16px;
}
.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: #fffaf0;
  border: 1px solid #fde7bd;
  border-radius: 10px;
  font-size: 13px;
  color: #6b4e16;
  line-height: 1.55;
}
.tip-icon { flex-shrink: 0; font-size: 16px; }

/* 提交作品 */
.submit-section {
  margin-top: 48px;
  margin-bottom: 32px;
}
.submit-content {
  background: linear-gradient(135deg, #f0f9f4 0%, #e4f1ff 100%);
  border: 1px solid #cde8d9;
  border-radius: 16px;
  padding: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.submit-content h2 {
  margin: 0 0 6px;
  font-size: 22px;
  color: #1f2937;
  border: none;
  padding: 0;
}
.submit-desc {
  margin: 0;
  color: #555;
  font-size: 14px;
  line-height: 1.6;
}
.submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  background: linear-gradient(135deg, var(--accent, #42b983) 0%, #2e8b63 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
  box-shadow: 0 4px 14px rgba(var(--accent-rgb, 66, 185, 131), 0.25);
}
.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--accent-rgb, 66, 185, 131), 0.35);
}
.submit-btn svg { width: 18px; height: 18px; }

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .header-icon {
    width: 64px;
    height: 64px;
    font-size: 36px;
    border-radius: 14px;
  }
  .header-icon .app-icon {
    width: 36px;
    height: 36px;
  }
  .header-text h1 { font-size: 26px; }
  .plugin-grid {
    grid-template-columns: 1fr;
  }
  .submit-content { padding: 20px; }
  .submit-content h2 { font-size: 18px; }
  .dev-tips { grid-template-columns: 1fr; }
  .filter-bar { padding: 8px; gap: 6px; }
  .filter-btn { padding: 6px 10px; font-size: 12.5px; }
}
</style>
