import { ref, watch } from 'vue'

const LOCALE_KEY = 'locale'
const _locale = ref(localStorage.getItem(LOCALE_KEY) || 'zh')

const applyLocale = (val) => {
  localStorage.setItem(LOCALE_KEY, val)
  document.documentElement.setAttribute('lang', val)
}

applyLocale(_locale.value)

watch(_locale, (val) => {
  applyLocale(val)
})

const messages = {
  nav: {
    title: { zh: '我的网站', en: 'My Website' },
    home: { zh: '首页', en: 'Home' },
    blog: { zh: '博客', en: 'Blog' },
    photos: { zh: '照片集', en: 'Photos' },
    games: { zh: '游戏', en: 'Games' },
    about: { zh: '关于', en: 'About' },
    themeLight: { zh: '切换到浅色模式', en: 'Switch to light mode' },
    themeDark: { zh: '切换到深色模式', en: 'Switch to dark mode' },
    switchLang: { zh: 'EN', en: '中' },
    switchLangTip: { zh: '切换语言', en: 'Switch language' }
  },
  home: {
    welcome: { zh: '你好，欢迎来到我的网站 👋', en: 'Hi, welcome to my website 👋' },
    subtitle: { zh: '一个记录学习和生活的个人空间', en: 'A personal space for learning and life' },
    browseBlog: { zh: '浏览博客', en: 'Blog' },
    photos: { zh: '照片集', en: 'Photos' },
    about: { zh: '关于我', en: 'About Me' },
    latestPosts: { zh: '最新文章', en: 'Latest Posts' },
    readMore: { zh: '阅读全文 →', en: 'Read more →' },
    viewAll: { zh: '查看全部文章 →', en: 'View all posts →' },
    aboutSection: { zh: '关于我', en: 'About Me' },
    aboutText: { zh: '热爱前端开发，喜欢用代码创造有趣的东西。这里记录我的学习笔记、项目经验和生活思考。', en: 'Love front-end development, enjoy creating interesting things with code. This is where I document my learning notes, project experience, and life thoughts.' },
    openSource: { zh: '开源项目', en: 'Open Source' },
    openSourceText: { zh: '这个网站是开源的，代码托管在 GitHub 上，欢迎 Star 和 Fork~', en: 'This website is open source, hosted on GitHub. Star and Fork are welcome~' },
    footer: { zh: '© 2026 个人网站', en: '© 2026 Personal Website' }
  },
  blogList: {
    back: { zh: '← 返回首页', en: '← Back to Home' },
    title: { zh: '我的博客', en: 'My Blog' },
    subtitle: { zh: '记录学习与思考的地方', en: 'Where I document learning and thoughts' },
    allPosts: { zh: '全部文章', en: 'All Posts' },
    readMore: { zh: '阅读全文 →', en: 'Read more →' },
    prev: { zh: '上一页', en: 'Prev' },
    next: { zh: '下一页', en: 'Next' },
    footer: { zh: '© 2026 个人网站', en: '© 2026 Personal Website' }
  },
  blogDetail: {
    back: { zh: '← 返回', en: '← Back' },
    notFound: { zh: '文章不存在', en: 'Article not found' },
    imageAlt: { zh: '{title} 图片 {n}', en: '{title} Image {n}' }
  },
  photos: {
    back: { zh: '← 返回', en: '← Back' },
    title: { zh: '照片集', en: 'Photos' },
    subtitle: { zh: '那些值得被记住的瞬间', en: 'Moments worth remembering' },
    pinMode: { zh: '钉子模式', en: 'Pin mode' },
    pinSelected: { zh: '钉选中', en: 'Pin selected' },
    pin: { zh: '钉子', en: 'Pin' },
    corkboard: { zh: '软木板', en: 'Corkboard' },
    hideBoard: { zh: '收起板子', en: 'Hide board' },
    board: { zh: '板子', en: 'Board' },
    resetTitle: { zh: '重置位置', en: 'Reset positions' },
    reset: { zh: '重置', en: 'Reset' },
    hint: { zh: '💡 点击照片钉住/取消钉住，钉住的照片不能拖动', en: '💡 Click photo to pin/unpin. Pinned photos cannot be dragged.' },
    empty: { zh: '暂无照片', en: 'No photos yet' },
    emptyHint: { zh: '把照片放到 src/assets/photos/ 文件夹里就会自动显示啦', en: 'Put photos in the src/assets/photos/ folder and they will appear automatically' },
    confirmReset: { zh: '确定要重置位置吗？所有照片会回到初始位置。', en: 'Reset all positions? All photos will return to their initial positions.' }
  },
  about: {
    back: { zh: '← 返回首页', en: '← Back to Home' },
    title: { zh: '关于我', en: 'About Me' },
    intro: { zh: '你好！我是一名前端开发者，热爱用代码创造有趣的东西。', en: "Hi! I'm a front-end developer who loves creating interesting things with code." },
    skills: { zh: '技能栈', en: 'Skills' },
    hobbies: { zh: '兴趣爱好', en: 'Hobbies' },
    hobby1: { zh: '写代码', en: 'Coding' },
    hobby2: { zh: '听音乐', en: 'Music' },
    hobby3: { zh: '打游戏', en: 'Gaming' },
    contact: { zh: '联系方式', en: 'Contact' },
    email: { zh: '邮箱', en: 'Email' }
  },
  games: {
    back: { zh: '← 返回首页', en: '← Back to Home' },
    title: { zh: '游戏笔记', en: 'Game Notes' },
    subtitle: { zh: '记录我玩过的游戏', en: "Games I've played" },
    allGames: { zh: '全部游戏', en: 'All Games' },
    viewDetail: { zh: '查看详情 →', en: 'View details →' },
    prev: { zh: '上一页', en: 'Prev' },
    next: { zh: '下一页', en: 'Next' },
    footer: { zh: '© 2026 个人网站', en: '© 2026 Personal Website' }
  }
}

function t(key, params = {}) {
  const keys = key.split('.')
  let msg = messages
  for (const k of keys) {
    if (msg && msg[k] !== undefined) {
      msg = msg[k]
    } else {
      return key
    }
  }
  const result = msg && msg[_locale.value] !== undefined ? msg[_locale.value] : key
  if (typeof result === 'string' && Object.keys(params).length > 0) {
    return result.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`)
  }
  return result
}

function setLocale(loc) {
  _locale.value = loc
}

function toggleLocale() {
  _locale.value = _locale.value === 'zh' ? 'en' : 'zh'
}

export { _locale as locale, t, setLocale, toggleLocale }
