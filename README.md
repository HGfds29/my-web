<p align="center">
  <img src="https://raw.githubusercontent.com/HGfds29/my-web/main/src/assets/logo.png" alt="logo" width="80" />
</p>

<h1 align="center">My Personal Website</h1>

<p align="center">
  <em>A personal website built with Vue 3 — recording learning, life, and thoughts</em>
</p>

<p align="center">
  <a href="https://HGfds29.github.io/my-web" target="_blank">🔗 Live Demo</a>
  <a href="http://qwe159259.3vkj.vip/" target="_blank">🔗 Live Demo (中国)</a>
</p>

<p align="center">
  <a href="#zh">🇨🇳 中文</a> · <a href="#en">🇬🇧 English</a>
</p>

---

## 🇨🇳 中文 <span id="zh"></span>

> 一个基于 Vue 3 的个人网站 — 记录学习、生活与思考

### 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API, `<script setup>`) |
| 构建工具 | Vite 6 |
| 路由 | vue-router 4 (Hash 模式) |
| 样式 | 原生 CSS (Scoped) + 深色/浅色主题 |
| 数据 | 本地 JSON 文件（无后端依赖） |

### 页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 🏠 首页 | `#/home` | 欢迎页，展示最新文章与个人信息 |
| 📝 博客列表 | `#/blog` | 分页展示全部文章，带翻页动画 |
| 📄 博客详情 | `#/blog/:id` | 文章详细内容 |
| 📸 照片集 | `#/photos` | 可拖拽、钉住的宝丽来风格相册 |
| 👤 关于 | `#/about` | 个人信息、技能栈与联系方式 |

### 特色

- 页面左右滑入动画，Stagger 延迟效果
- 深色/浅色主题切换，自动跟随系统偏好，持久化到 `localStorage`
- 照片集：拖拽排序、钉子固定、软木板模式，位置持久化到 Cookie
- 内置广告拦截（MutationObserver + 定时扫描）
- 响应式设计，移动端友好

### 快速开始

```bash
npm install
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览构建结果
```

### 项目结构

```
src/
├── main.js              # 应用入口
├── App.vue              # 根组件
├── router/index.js      # 路由配置 (Hash 模式)
├── views/               # 页面组件
│   ├── Home.vue         # 首页
│   ├── BlogList.vue     # 博客列表（分页）
│   ├── BlogDetail.vue   # 博客详情
│   ├── Photos.vue       # 照片集
│   └── About.vue        # 关于
├── components/
│   └── NavBar.vue       # 导航栏（含主题切换）
├── data/                # JSON 数据文件
│   ├── blog.json
│   └── photos.json
├── utils/
│   └── adBlocker.js     # 广告拦截工具
└── assets/
    ├── css/global.css   # 全局样式
    ├── logo.png
    └── photos/          # 照片资源
```

### 许可证

MIT © [HGfds29](https://github.com/HGfds29)

---

## 🇬🇧 English <span id="en"></span>

> A personal website built with Vue 3 — documenting learning, life, and thoughts

### Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build Tool | Vite 6 |
| Router | vue-router 4 (Hash mode) |
| Styling | Native CSS (Scoped) + Dark/Light themes |
| Data | Local JSON files (no backend) |

### Pages

| Page | Route | Description |
|------|-------|-------------|
| 🏠 Home | `#/home` | Welcome page with latest posts and personal info |
| 📝 Blog | `#/blog` | Paginated blog list with page transition animations |
| 📄 Blog Detail | `#/blog/:id` | Full article content |
| 📸 Photos | `#/photos` | Drag & drop Polaroid-style album with pushpin and corkboard |
| 👤 About | `#/about` | Personal info, skills, and contact |

### Features

- Page transition animations with staggered slide-in effects
- Dark/Light theme toggle, auto-detects system preference, persisted to `localStorage`
- Photo album: drag to rearrange, pin in place, corkboard mode, positions saved in Cookie
- Built-in ad blocker (MutationObserver + periodic scanning)
- Responsive design, mobile-friendly

### Quick Start

```bash
npm install
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Project Structure

```
src/
├── main.js              # Entry point
├── App.vue              # Root component
├── router/index.js      # Route config (Hash mode)
├── views/               # Page components
│   ├── Home.vue         # Home page
│   ├── BlogList.vue     # Blog list (paginated)
│   ├── BlogDetail.vue   # Blog detail
│   ├── Photos.vue       # Photo album
│   └── About.vue        # About page
├── components/
│   └── NavBar.vue       # Nav bar (with theme toggle)
├── data/                # JSON data files
│   ├── blog.json
│   └── photos.json
├── utils/
│   └── adBlocker.js     # Ad blocker utility
└── assets/
    ├── css/global.css   # Global styles
    ├── logo.png
    └── photos/          # Photo assets
```

### License

MIT © [HGfds29](https://github.com/HGfds29)
