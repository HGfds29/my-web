import { ref } from 'vue'
import { createLogger } from './logger'
import { setSkin } from './toast'
import { syncLiquidBackground, WEBGL_GLASS_TARGETS, CSS_GLASS_TARGETS } from './liquidBackground'

/**
 * 外观自定义
 *
 * 所有可调项都落到 :root 的 CSS 变量上，配合 src 里的 var(--accent, …) 生效，
 * 不需要改组件样式；配置持久化在 localStorage.siteAppearance。
 */

const log = createLogger('appearance')
const STORAGE_KEY = 'siteAppearance'
const STYLE_ID = 'site-appearance-style'

export const ACCENT_PRESETS = [
  '#42b983',
  '#3b82f6',
  '#8b5cf6',
  '#06b6d4',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#94a3b8'
]

export const DEFAULTS = {
  accent: '#42b983',
  lightBg: '#fafafa',
  darkBg: '#0f0f1a',
  glass: false,
  glassBlur: 0,
  glassThickness: 41,
  glassIor: 1.1,
  glassNormalStrength: 6.4,
  glassTuning: 3,
  toastSkin: 'default',
  reduceMotion: false
}

// 与 toast.js 的 VALID_SKINS 保持一致
const TOAST_SKINS = ['default', 'light', 'tarkov']

// 按参考 demo 的滑杆默认值重置一次，旧配置里的雾面/弱折射参数不会自动生效
const GLASS_TUNING_VERSION = DEFAULTS.glassTuning

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

const sanitizeColor = (value, fallback) => {
  if (typeof value !== 'string' || !HEX_RE.test(value)) return fallback
  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toLowerCase()
  }
  return value.toLowerCase()
}

const hexToRgb = (hex) => {
  const value = hex.replace('#', '')
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16)
  ].join(', ')
}

const sanitizeNumber = (value, fallback, min, max) => {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return fallback
  return Math.min(max, Math.max(min, num))
}

const loadConfig = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    const tuned = raw.glassTuning === GLASS_TUNING_VERSION
    const glassNumber = (key, min, max) =>
      tuned ? sanitizeNumber(raw[key], DEFAULTS[key], min, max) : DEFAULTS[key]
    return {
      accent: sanitizeColor(raw.accent, DEFAULTS.accent),
      lightBg: sanitizeColor(raw.lightBg, DEFAULTS.lightBg),
      darkBg: sanitizeColor(raw.darkBg, DEFAULTS.darkBg),
      glass: raw.glass === true,
      glassBlur: glassNumber('glassBlur', 0, 5),
      glassThickness: glassNumber('glassThickness', 0, 50),
      glassIor: glassNumber('glassIor', 0.8, 1.5),
      glassNormalStrength: glassNumber('glassNormalStrength', 0.1, 10),
      glassTuning: GLASS_TUNING_VERSION,
      toastSkin: TOAST_SKINS.includes(raw.toastSkin) ? raw.toastSkin : DEFAULTS.toastSkin,
      reduceMotion: raw.reduceMotion === true
    }
  } catch {
    return { ...DEFAULTS }
  }
}

export const appearance = ref(loadConfig())

const ensureStyle = () => {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
body { background: var(--page-bg-light, #fafafa); }
html.dark, html.dark body { background: var(--page-bg-dark, #0f0f1a); }

/* ===== 液态玻璃（iOS 风格：强磨砂 + 半透明白，无底纹） ===== */
html.liquid-glass body {
  background-image: none;
  background-color: var(--page-bg-light, #fafafa);
}

html.dark.liquid-glass body {
  background-image: none;
  background-color: var(--page-bg-dark, #0f0f1a);
}

/* WebGL 液态背景挂在 body 最底层，页面内容需要压到它上面 */
html.lg-webgl #app {
  position: relative;
  z-index: 1;
}

/* 玻璃质感变量：顶边亮线、底边弱光、外投影 */
html.liquid-glass {
  --glass-fill: rgba(255, 255, 255, 0.55);
  --glass-border: rgba(255, 255, 255, 0.75);
  --glass-top: rgba(255, 255, 255, 0.95);
  --glass-bottom: rgba(255, 255, 255, 0.3);
  --glass-drop: rgba(0, 0, 0, 0.1);
  --glass-blur: 24px;
}

html.dark.liquid-glass {
  --glass-fill: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.18);
  --glass-top: rgba(255, 255, 255, 0.3);
  --glass-bottom: rgba(255, 255, 255, 0.08);
  --glass-drop: rgba(0, 0, 0, 0.5);
  --glass-blur: 24px;
}

/* 浮层面板：CSS 磨砂，透过它能看到背后页面 */
html.liquid-glass body :is(${CSS_GLASS_TARGETS.join(', ')}) {
  background-color: var(--glass-fill) !important;
  background-image: none !important;
  border: 1px solid var(--glass-border) !important;
  box-shadow:
    inset 0 1px 0 var(--glass-top),
    inset 0 -1px 0 var(--glass-bottom),
    0 10px 30px var(--glass-drop) !important;
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%);
  backdrop-filter: blur(var(--glass-blur)) saturate(180%);
}

/* 直接浮在壁纸上的面板：交给 WebGL 折射，CSS 只保留圆角和排版。
   深色主题原有的 html.dark .xxx .card { background: … !important } 优先级更高，
   这里把 lg-webgl/lg-glass/dark 全叠上去，否则面板底色会盖住 canvas 上的玻璃。 */
html.lg-webgl.lg-glass body :is(${WEBGL_GLASS_TARGETS.join(', ')}),
html.lg-webgl.lg-glass.dark body :is(${WEBGL_GLASS_TARGETS.join(', ')}) {
  background: transparent !important;
  background-image: none !important;
  border-color: transparent !important;
  box-shadow: none !important;
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}

/* 顶栏是 fixed，内容会从它下面滚过：WebGL 玻璃之外再补一层底衬和模糊，
   否则滚到导航栏下面的文字会直接透上来 */
html.lg-webgl.lg-glass body .navbar {
  background: rgba(255, 255, 255, 0.55) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.7) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85) !important;
  -webkit-backdrop-filter: blur(12px) saturate(160%);
  backdrop-filter: blur(12px) saturate(160%);
}

html.lg-webgl.lg-glass.dark body .navbar {
  background: rgba(10, 12, 20, 0.58) !important;
  border-bottom-color: rgba(255, 255, 255, 0.2) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.26) !important;
}

/* 顶栏压在照片壁纸上，默认的灰字对比度不够，单独把字色提亮/压深 */
html.lg-webgl.lg-glass body .navbar :is(.nav-logo, .lang-toggle, .theme-toggle, .settings-toggle, .more-btn, .user-btn) {
  color: #1f2937 !important;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.7);
}

html.lg-webgl.lg-glass body .navbar .nav-link:not(.active) {
  color: #374151 !important;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.7);
}

html.lg-webgl.lg-glass.dark body .navbar :is(.nav-logo, .lang-toggle, .theme-toggle, .settings-toggle, .more-btn, .user-btn) {
  color: #f2f2f6 !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

html.lg-webgl.lg-glass.dark body .navbar .nav-link:not(.active) {
  color: #e6e6ee !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

html.reduce-motion *,
html.reduce-motion *::before,
html.reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
`
  document.head.appendChild(style)
}

export const applyAppearance = () => {
  if (typeof document === 'undefined') return
  const cfg = appearance.value
  ensureStyle()

  const root = document.documentElement
  root.style.setProperty('--accent', cfg.accent)
  root.style.setProperty('--accent-rgb', hexToRgb(cfg.accent))
  root.style.setProperty('--page-bg-light', cfg.lightBg)
  root.style.setProperty('--page-bg-dark', cfg.darkBg)
  root.classList.toggle('liquid-glass', cfg.glass)
  root.classList.toggle('reduce-motion', cfg.reduceMotion)

  // Toast 皮肤是全局默认值，单条通知仍可用 skin 参数覆盖
  setSkin(cfg.toastSkin)

  // 开启液态玻璃时挂载 WebGL 背景，关闭时释放显存；变量已写好，这里读到的都是最新配色
  syncLiquidBackground(cfg.glass, {
    blurRadius: cfg.glassBlur,
    glassThickness: cfg.glassThickness,
    ior: cfg.glassIor,
    normalStrength: cfg.glassNormalStrength
  })
}

export const updateAppearance = (patch) => {
  appearance.value = { ...appearance.value, ...patch }
  applyAppearance()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance.value))
  } catch {
    // 隐私模式写不进去，仅本次会话生效
  }
  log.debug('外观已更新', appearance.value)
}

export const resetAppearance = () => {
  appearance.value = { ...DEFAULTS }
  applyAppearance()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance.value))
  } catch {
    // 忽略
  }
  log.info('外观已恢复默认')
}

export const initAppearance = () => {
  applyAppearance()
  log.info('外观配置已应用', appearance.value)
}
