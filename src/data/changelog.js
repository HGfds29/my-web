// 更新日志数据（按时间倒序）
import chatShot from '../assets/QQ20261024-010930.png'

// type 决定卡片顶部色条颜色，可以是单个类型，也可以是数组做拼色（如 ['beta', 'style'] 蓝+紫）：
// 可选字段 image / imageAlt：功能截图，会显示在详情页的倾斜预览框内
//   feature / fix → 绿色（加东西 / 修 bug）
//   beta          → 蓝色（实验性更新）
//   urgent        → 红色（紧急更新）
//   style         → 紫色（界面调整）
//   perf          → 橙色（性能优化）
//   docs          → 青色（文档）
//   refactor      → 靛蓝色（重构）
//   security      → 粉红色（安全修复）
//   test          → 灰蓝色（测试）
export const changelogTypes = {
  feature: 'nav.logTypeFeature',
  fix: 'nav.logTypeFix',
  beta: 'nav.logTypeBeta',
  urgent: 'nav.logTypeUrgent',
  style: 'nav.logTypeStyle',
  perf: 'nav.logTypePerf',
  docs: 'nav.logTypeDocs',
  refactor: 'nav.logTypeRefactor',
  security: 'nav.logTypeSecurity',
  test: 'nav.logTypeTest'
}

// 每种类型的卡片顶部色条颜色；type 支持数组，多个类型会拼成渐变（如 蓝+紫）
export const changelogTypeColors = {
  feature: '#22c55e',
  fix: '#22c55e',
  beta: '#3b82f6',
  urgent: '#ef4444',
  style: '#a855f7',
  perf: '#f59e0b',
  docs: '#06b6d4',
  refactor: '#6366f1',
  security: '#ec4899',
  test: '#64748b'
}

export const changelogEntries = [
  {
    version: 'v4.12.5',
    time: '2026-11-07 12:45',
    type: 'style',
    title: '全局手机端适配',
    items: [
      '全局兜底：图片/视频/画布不撑破容器，页面不再出现横向滚动，窄屏长文本与代码自动换行',
      '照片墙：窄屏改为上下布局，工具栏横置吸底，照片区高度适配竖屏',
      'RenktShell：功能与插件栅格收为单列，命令表格可横向滑动',
      '首页与关于页：窄屏标题与留白收紧'
    ]
  },
  {
    version: 'v4.12.4',
    time: '2026-11-07 00:26',
    type: 'style',
    title: '截图回到 2.5.0 条目里',
    items: [
      '去掉列表顶部的独立展示位，v2.5.0 和其它更新一样排在列表里',
      '带截图的条目在卡片右侧显示缩略图，样式与普通卡片统一',
      '缩略图按重点区域裁剪并左侧渐隐，窄屏自动收窄',
      '卡片高度、展开交互与之前保持一致'
    ]
  },
  {
    version: 'v4.12.3',
    time: '2026-11-07 00:09',
    type: 'style',
    title: '展示位补回版本信息',
    items: [
      '顶部展示位不再只有一张图片：左侧显示最新版本号、标题与时间',
      '右侧截图宽 50%，按重点区域裁剪并左侧渐隐融入卡片',
      '展示内容取自最新一条更新，不再是 v2.5.0'
    ]
  },
  {
    version: 'v4.12.2',
    time: '2026-11-07 00:06',
    type: 'style',
    title: '展示位只显示一张图片',
    items: [
      '顶部展示位就是一张普通截图，去掉倾斜、放大与左侧渐隐',
      '高度 108px，按重点区域裁剪（object-position 50% 30%）',
      'v2.5.0 的截图仍留在 v2.5.0 自己的条目里，列表顺序不受影响'
    ]
  },
  {
    version: 'v4.12.1',
    time: '2026-11-07 00:01',
    type: 'style',
    title: '展示位改为纯图预览',
    items: [
      '顶部展示位不再显示 v2.5.0 这类老版本信息，只保留一张倾斜界面截图',
      '高度由 150px 收紧到 108px，截图放大后只露出重点区域',
      '展示位改为纯装饰，不再可点击进入详情'
    ]
  },
  {
    version: 'v4.12.0',
    time: '2026-11-06 23:58',
    type: ['feature', 'style'],
    title: '倾斜展示位回到顶部',
    items: [
      '倾斜的功能截图不再跟着每一条更新走，改为列表顶部单独一个展示位',
      '展示位里固定放一张功能截图（当前为聊天室界面）',
      '更新条目回到紧凑卡片尺寸，版本号、时间与徽标同排显示',
      '点击展示位可直接进入该版本详情'
    ]
  },
  {
    version: 'v4.11.1',
    time: '2026-11-06 23:52',
    type: 'style',
    title: '收紧横幅卡片尺寸',
    items: ['卡片高度由 116px 收紧到 82px，字号、间距与截图宽度同步缩小，列表更紧凑']
  },
  {
    version: 'v4.11.0',
    time: '2026-11-06 23:44',
    type: ['feature', 'style'],
    title: '更新卡片改为横幅式倾斜布局',
    items: [
      '按参考稿重做：每条更新改为横向横幅卡片',
      '左侧为版本号、时间、类型徽标，右侧为倾斜功能截图',
      '截图以 3D 透视倾斜并左侧渐隐，融入卡片底色',
      '无截图的条目用类型配色生成抽象界面占位'
    ]
  },
  {
    version: 'v4.10.0',
    time: '2026-11-06 23:36',
    type: ['feature', 'style'],
    title: '更新日志视觉改造（初版）',
    items: [
      '更新日志顶部新增倾斜 UI 展示位，3D 透视 + 堆叠卡片效果',
      '支持在条目里放功能截图：给条目加 image 字段即可显示在倾斜窗口内',
      '无图时自动用该版本的标题与类型配色生成抽象界面占位',
      '点击展示位直接进入对应版本的完整详情'
    ]
  },
  {
    version: 'v4.9.1',
    time: '2026-11-06 23:28',
    type: 'fix',
    items: [
      '早期里程碑版本号重排为 v2.x，消除与 v2.5.7-beta 之间的版本跨度',
      '版本序列现在连续：v2.0.0 → v2.5.5 → v2.5.7-beta → v3.5.7-beta → v4.x'
    ]
  },
  {
    version: 'v4.9.0',
    time: '2026-11-06 23:25',
    type: ['docs', 'feature'],
    items: [
      '更新日志补齐全部历史记录，最早追溯到 2026-06-25 首次提交',
      '早期未启用版本号的提交按时间线归为 v2.x 里程碑',
      '全部条目按时间倒序排列，类型按实际改动性质标注'
    ]
  },
  {
    version: 'v4.8.1',
    time: '2026-11-06 23:12',
    type: 'style',
    items: ['设置与更新日志抽屉隐藏滚动条，保留滚轮与触摸滚动']
  },
  {
    version: 'v4.8.0',
    time: '2026-11-06 23:10',
    type: ['feature', 'style'],
    items: [
      '更新日志详情新增打字机效果，更新点逐字打出并带闪烁光标',
      '内联展开与完整详情共用同一份打字进度，同一条目切换视图不会重复打字',
      '尊重系统「减少动态效果」设置，开启时直接显示全文'
    ]
  },
  {
    version: 'v4.7.0',
    time: '2026-11-06 01:48',
    type: ['feature', 'style'],
    items: [
      '更新日志支持拼色：type 可传数组，顶部色条渲染为多色渐变',
      '多个类型各自显示徽标并使用对应颜色',
      '本条日志自身即为拼色示例（绿 + 紫）'
    ]
  },
  {
    version: 'v4.6.0',
    time: '2026-11-06 01:45',
    type: 'feature',
    items: [
      '更新日志类型新增 4 种配色：文档（青）、重构（靛蓝）、安全（粉）、测试（灰蓝）',
      '新增类型同步接入 i18n 中英文标签与 AGENTS.md 类型表'
    ]
  },
  {
    version: 'v4.5.1',
    time: '2026-11-06 01:41',
    type: 'style',
    items: ['更新日志蓝色类型标签由「Beta」改为「实验性更新」']
  },
  {
    version: 'v4.5.0',
    time: '2026-11-06 01:33',
    type: 'feature',
    items: [
      'v4.5.0 正式版发布，退出 beta 阶段',
      '更新日志入口、内联展开与「查看完整详情」完整流程上线',
      '「更多」菜单交互与鼠标判定区域统一',
      '设置抽屉新增状态页入口，新增 AGENTS.md 版本与日志规范'
    ]
  },
  {
    version: 'v4.4.2-beta',
    time: '2026-11-06 01:31',
    type: 'fix',
    items: [
      '恢复更新日志的内联展开手感，点卡片即展开详情',
      '展开后新增「查看完整详情」按钮，点击后抽屉拉宽显示完整详情',
      '去掉隐藏的「再点一次」规则，改为显式入口，返回后保留展开状态'
    ]
  },
  {
    version: 'v4.4.1-beta',
    time: '2026-11-06 01:28',
    type: 'fix',
    items: [
      '更新日志改为点一次直接进入完整详情，抽屉同步拉宽',
      '移除「再点一次才展开」的两段式交互，改为左上角返回按钮回到列表',
      '详情列表收起时显示右向箭头提示可进入详情'
    ]
  },
  {
    version: 'v4.4.0-beta',
    time: '2026-11-06 01:22',
    type: 'feature',
    items: [
      '更新日志抽屉加入两段式详情：点击展开，再点拉宽侧边栏显示完整详情',
      '更新日志入口移至「更多」菜单，不再占设置抽屉',
      '统一「更多」菜单各项鼠标判定区域',
      '新增 AGENTS.md，约定每次改代码同步升版本与写更新日志'
    ]
  },
  {
    version: 'v4.3.0-beta',
    time: '2026-11-06 00:35',
    type: 'beta',
    items: [
      '新增 AI 实验室页面',
      '新增 Toast 通知皮肤（默认 / 轻提示 / 塔科夫）',
      '新增 35 个界面图标',
      '设置抽屉增加状态页入口'
    ]
  },
  {
    version: 'v3.5.7-beta',
    time: '2026-11-02 23:13',
    type: 'feature',
    items: [
      '液态玻璃背景优化',
      '节日皮肤更新'
    ]
  },
  {
    version: 'v3.5.7-beta',
    time: '2026-10-27 00:06',
    type: 'fix',
    items: [
      '设置抽屉重新整理',
      '日志上传开关',
      '液态玻璃参数调整'
    ]
  },
  {
    version: 'v2.5.7-beta',
    time: '2026-10-25 21:24',
    type: 'feature',
    items: [
      '新增讨论区',
      '登录流程检查与修复'
    ]
  },
  {
    version: 'v2.5.5',
    time: '2026-10-24 23:05',
    type: 'style',
    items: ['登录界面美化（0.1beta）']
  },
  {
    version: 'v2.5.1',
    time: '2026-10-22 23:52',
    type: 'fix',
    items: ['修复已知 bug', '介绍页美化']
  },
  {
    version: 'v2.5.0',
    time: '2026-10-22 23:00',
    type: 'feature',
    image: chatShot,
    imageAlt: '聊天室界面',
    items: ['聊天室上线（0.3beta）']
  },
  {
    version: 'v2.4.2',
    time: '2026-10-22 22:12',
    type: 'fix',
    items: ['聊天室修复（0.2beta）']
  },
  {
    version: 'v2.4.1',
    time: '2026-10-22 22:11',
    type: 'fix',
    items: ['聊天室修复（0.1beta）']
  },
  {
    version: 'v2.4.0',
    time: '2026-10-21 23:43',
    type: 'feature',
    items: ['界面整体美化', '新增聊天室', '新增弹窗组件', '新增图标集', '登录页改进']
  },
  {
    version: 'v2.3.0',
    time: '2026-10-13 02:16',
    type: 'feature',
    items: ['阶段性功能更新']
  },
  {
    version: 'v2.2.4',
    time: '2026-10-12 22:45',
    type: 'refactor',
    items: ['重新构建产物']
  },
  {
    version: 'v2.2.3',
    time: '2026-10-12 00:58',
    type: 'refactor',
    items: ['.gitignore 规则调整']
  },
  {
    version: 'v2.2.2',
    time: '2026-10-12 00:36',
    type: 'style',
    items: ['美化与样式修复']
  },
  {
    version: 'v2.2.1',
    time: '2026-10-12 00:19',
    type: 'docs',
    items: ['README 美化']
  },
  {
    version: 'v2.2.0',
    time: '2026-10-12 00:06',
    type: 'feature',
    items: ['大更新：修复已知 bug', '新增游戏页面']
  },
  {
    version: 'v2.1.3',
    time: '2026-06-27 16:49',
    type: 'feature',
    items: ['添加中国链接']
  },
  {
    version: 'v2.1.2',
    time: '2026-06-27 16:21',
    type: 'docs',
    items: ['修改 README']
  },
  {
    version: 'v2.1.1',
    time: '2026-06-27 14:30',
    type: 'style',
    items: ['更新游戏界面']
  },
  {
    version: 'v2.1.0',
    time: '2026-06-26 01:24',
    type: 'feature',
    items: ['新增顶部导航栏', '新增深色模式']
  },
  {
    version: 'v2.0.1',
    time: '2026-06-25 23:49',
    type: 'fix',
    items: ['修复 bug', "添加部署路径 base: '/my-web/'"]
  },
  {
    version: 'v2.0.0',
    time: '2026-06-25 23:03',
    type: 'feature',
    items: ['首次提交个人网站']
  }
]
