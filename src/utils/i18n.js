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
    switchLangTip: { zh: '切换语言', en: 'Switch language' },
    deskPet: { zh: '桌宠', en: 'Pet' },
    deskPetTip: { zh: '打开网页桌宠', en: 'Open desk pet' },
    renkt: { zh: 'Renkt Shell', en: 'Renkt Shell' },
    more: { zh: '更多', en: 'More' },
    moreTip: { zh: '更多', en: 'More' },
    menuDemo: { zh: '功能演示', en: 'Playground' },
    menuChat: { zh: '聊天室', en: 'Chat Room' },
    login: { zh: '登录', en: 'Login' },
    logout: { zh: '退出登录', en: 'Logout' }
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
  },
  renkt: {
    back: { zh: '← 返回首页', en: '← Back to Home' },
    title: { zh: 'Renkt Shell', en: 'Renkt Shell' },
    subtitle: { zh: '一个功能丰富的命令行工具，支持命令执行、脚本解析、环境变量管理等功能', en: 'A feature-rich command-line tool supporting command execution, script parsing, environment variable management, and more' },
    about: { zh: '功能特性', en: 'Features' },
    features: {
      cli: { zh: '命令行界面：交互式命令行，支持 Tab 自动补全', en: 'CLI: Interactive command line with Tab auto-completion' },
      ip: { zh: 'IP 查询：获取当前公网 IP 及地理位置信息', en: 'IP Query: Get current public IP and geolocation' },
      env: { zh: '环境变量管理：创建、读取、删除环境变量', en: 'Env Vars: Create, read, delete environment variables' },
      vsix: { zh: 'VS Code 插件下载：从 Marketplace 获取插件信息并下载', en: 'VS Code Extension: Fetch and download from Marketplace' },
      script: { zh: '脚本执行：支持 .rekt 脚本文件解析执行', en: 'Scripting: Parse and execute .rekt script files' },
      log: { zh: '日志系统：详细的日志记录，按时间命名', en: 'Logging: Detailed logs named by timestamp' },
      plugin: { zh: '插件系统：支持动态加载插件扩展功能', en: 'Plugins: Dynamically load plugins to extend features' },
      gui: { zh: 'GUI 界面：可选的图形化界面（需安装 PySimpleGUI）', en: 'GUI: Optional graphical interface (requires PySimpleGUI)' }
    },
    quickstart: { zh: '快速开始', en: 'Quick Start' },
    requirements: { zh: '环境要求', en: 'Requirements' },
    reqDesc: { zh: 'Python 3.8+，依赖库：requests, alive-progress, prompt_toolkit', en: 'Python 3.8+, Dependencies: requests, alive-progress, prompt_toolkit' },
    installDeps: { zh: '安装依赖', en: 'Install Dependencies' },
    run: { zh: '运行', en: 'Run' },
    commands: { zh: '命令列表', en: 'Commands' },
    cmdBasic: { zh: '基础命令', en: 'Basic Commands' },
    cmdEnv: { zh: '环境变量命令', en: 'Environment Variable Commands' },
    cmdVsix: { zh: 'VS Code 插件命令', en: 'VS Code Extension Commands' },
    cmdScript: { zh: '脚本命令', en: 'Script Commands' },
    colCmd: { zh: '命令', en: 'Command' },
    colDesc: { zh: '说明', en: 'Description' },
    colExample: { zh: '示例', en: 'Example' },
    rektScript: { zh: 'REKT 脚本', en: 'REKT Script' },
    rektIntro: { zh: '.rekt 是 Renkt Shell 的脚本文件格式，支持逐行执行命令。', en: '.rekt is the script file format for Renkt Shell, supporting line-by-line command execution.' },
    rektExample: { zh: '脚本示例', en: 'Script Example' },
    rektBuiltins: { zh: '内置命令', en: 'Built-in Commands' },
    rektConfig: { zh: '配置选项', en: 'Configuration' },
    rektConfigDesc: { zh: '在脚本开头添加配置选项：', en: 'Add configuration at the start of the script:' },
    projectStructure: { zh: '项目结构', en: 'Project Structure' },
    logSystem: { zh: '日志系统', en: 'Logging System' },
    logDesc: { zh: '日志文件保存在 logs/renkt_YYYY-MM-DD_HH-MM-SS.log', en: 'Logs are saved in logs/renkt_YYYY-MM-DD_HH-MM-SS.log' },
    pluginDev: { zh: '插件开发', en: 'Plugin Development' },
    pluginDevDesc: { zh: '在 plugins/ 目录下创建 .py 文件，定义 cmd_ 前缀的函数即可自动注册为命令。', en: 'Create a .py file in the plugins/ directory and define a function with the cmd_ prefix to auto-register it as a command.' },
    license: { zh: '许可证', en: 'License' },
    version: { zh: '下载版本', en: 'Download' },
    stable: { zh: '稳定版', en: 'Stable' },
    versionDesc: { zh: '当前最新稳定版本 v1.2.5，推荐下载使用。', en: 'Latest stable version v1.2.5, recommended for use.' },
    download: { zh: '下载 v1.2.5 (ZIP)', en: 'Download v1.2.5 (ZIP)' },
    history: { zh: '历史版本', en: 'History Versions' },
    downloadZip: { zh: '下载 ZIP', en: 'Download ZIP' },
    pluginDownload: { zh: '插件下载', en: 'Plugin Downloads' },
    pluginDownloadDesc: { zh: '官方插件列表，下载后放入 plugins/ 目录即可使用', en: 'Official plugins. Download and place in the plugins/ directory to use.' }
  },
  hero: {
    back: { zh: '← 返回首页', en: '← Back to Home' }
  },
  plugins: {
    back: { zh: '← 返回首页', en: '← Back to Home' },
    title: { zh: '插件中心', en: 'Plugin Hub' },
    subtitle: { zh: '为 Renkt Shell 扩展无限功能，浏览官方与社区精选插件', en: 'Extend Renkt Shell with curated official and community plugins' },
    catAll: { zh: '全部', en: 'All' },
    catOfficial: { zh: '官方', en: 'Official' },
    catCommunity: { zh: '社区', en: 'Community' },
    catTool: { zh: '实用工具', en: 'Tools' },
    catGui: { zh: '图形界面', en: 'GUI' },
    badgeOfficial: { zh: '官方', en: 'OFFICIAL' },
    badgeCommunity: { zh: '社区', en: 'COMMUNITY' },
    tagNew: { zh: 'NEW', en: 'NEW' },
    download: { zh: '下载', en: 'Download' },
    empty: { zh: '暂无该分类的插件，换个筛选条件试试？', en: 'No plugins in this category yet. Try a different filter!' },
    installTitle: { zh: '安装说明', en: 'Installation' },
    step1Title: { zh: '下载插件文件', en: 'Download the plugin file' },
    step1Desc: { zh: '点击插件卡片上的下载按钮，获取 .py 插件文件。', en: 'Click the download button on any plugin card to get the .py plugin file.' },
    step2Title: { zh: '放入 plugins 目录', en: 'Place in plugins directory' },
    step2Desc: { zh: '将下载的 .py 文件复制到 Renkt/plugins/ 目录下即可。', en: 'Copy the downloaded .py file into the Renkt/plugins/ directory.' },
    step3Title: { zh: '重启 Renkt 即可使用', en: 'Restart Renkt and use' },
    step3Desc: { zh: '重新启动 Renkt Shell，插件命令会自动加载，通过 plugins --list 可查看已安装插件。', en: 'Restart Renkt Shell and the plugin is auto-loaded. Run plugins --list to see installed plugins.' },
    devTitle: { zh: '插件开发指南', en: 'Plugin Development' },
    devDesc: { zh: '插件开发非常简单，只需创建一个 .py 文件，定义以 cmd_ 开头的函数即可自动注册为新命令。', en: 'Creating a plugin is easy: just create a .py file and define functions with the cmd_ prefix — they are auto-registered as new commands.' },
    devExample: { zh: '示例代码', en: 'Example Code' },
    devComment1: { zh: '定义 hello 命令', en: 'Define the hello command' },
    devComment2: { zh: '定义 add 命令，计算多个数字之和', en: 'Define add command that sums multiple numbers' },
    devTip1: { zh: '函数名以 cmd_ 开头，后面即为命令名（cmd_foo → 命令 foo）', en: 'Function name starts with cmd_ — what follows is the command (cmd_foo → foo)' },
    devTip2: { zh: '函数参数 args 是一个列表，包含命令行传入的所有参数', en: 'The args parameter is a list containing all CLI arguments passed in' },
    devTip3: { zh: '使用 docstring 写函数说明，help 命令会自动展示', en: 'Use docstrings for help text — it auto-appears in the help command output' },
    devTip4: { zh: '插件可直接使用 requests、json 等所有 Python 标准库及已安装的三方包', en: 'Plugins can use Python stdlib and any installed 3rd-party packages (requests, json, etc.)' },
    submitTitle: { zh: '分享你的作品', en: 'Submit Your Work' },
    submitDesc: { zh: '你也写了一个很棒的插件？欢迎提交到 Renkt Shell 官方仓库！', en: 'Built an awesome plugin? Contribute it to the official Renkt Shell repo!' },
    submitBtn: { zh: '前往提交', en: 'Go Submit' }
  },
  notFound: {
    desc: { zh: '诶呀，页面消失了，如果你认为这是bug请反馈', en: 'Oops, the page is gone. If you think this is a bug, please report it.' },
    backHome: { zh: '返回主页', en: 'Back to Home' }
  },
  chat: {
    back: { zh: '← 返回首页', en: '← Back to Home' },
    title: { zh: '聊天室', en: 'Chat Room' },
    subtitle: { zh: '和大家随便聊聊', en: 'Say hi to everyone' },
    online: { zh: '{n} 人在线', en: '{n} online' },
    editNick: { zh: '改昵称', en: 'Edit' },
    nickTitle: { zh: '设置昵称', en: 'Set Nickname' },
    nickMsg: { zh: '聊天室里显示的名字（1-12 个字符）', en: 'The name shown in the chat room (1-12 characters)' },
    nickPlaceholder: { zh: '输入昵称', en: 'Enter a nickname' },
    defaultNick: { zh: '访客{n}', en: 'Guest{n}' },
    placeholder: { zh: '说点什么...', en: 'Say something...' },
    send: { zh: '发送', en: 'Send' },
    empty: { zh: '还没有消息，来抢个沙发~', en: 'No messages yet. Be the first!' },
    loadError: { zh: '消息加载失败', en: 'Failed to load messages' },
    sendError: { zh: '发送失败', en: 'Failed to send' },
    connecting: { zh: '连接中...', en: 'Connecting...' },
    conn_connecting: { zh: '连接中', en: 'Connecting' },
    conn_online: { zh: '已连接', en: 'Online' },
    conn_offline: { zh: '已断开', en: 'Offline' },
    clear: { zh: '清空聊天', en: 'Clear chat' },
    emoji: { zh: '表情', en: 'Emoji' },
    image: { zh: '图片', en: 'Image' },
    copy: { zh: '复制', en: 'Copy' },
    copied: { zh: '已复制到剪贴板', en: 'Copied to clipboard' },
    copyFailed: { zh: '复制失败', en: 'Copy failed' },
    recall: { zh: '撤回', en: 'Recall' },
    recallError: { zh: '撤回失败', en: 'Recall failed' },
    recallDenied: { zh: '没有权限撤回这条消息', en: 'You cannot recall this message' },
    adminDelete: { zh: '管理员删除', en: 'Delete (admin)' },
    imageTypeError: { zh: '只能上传图片文件', en: 'Only image files are allowed' },
    imageSizeError: { zh: '图片不能超过 5MB', en: 'Image must be under 5MB' },
    imageUploadError: { zh: '图片上传失败', en: 'Image upload failed' },
    logout: { zh: '退出登录', en: 'Logout' },
    searchUser: { zh: '搜索用户名添加好友', en: 'Search username to add' },
    addFriend: { zh: '添加', en: 'Add' },
    publicRoom: { zh: '公共聊天室', en: 'Public Room' },
    friends: { zh: '好友', en: 'Friends' },
    groups: { zh: '群聊', en: 'Groups' },
    accept: { zh: '接受', en: 'Accept' },
    reject: { zh: '拒绝', en: 'Reject' },
    noFriends: { zh: '还没有好友', en: 'No friends yet' },
    noGroups: { zh: '还没有群聊', en: 'No groups yet' },
    createGroup: { zh: '创建群聊', en: 'Create Group' },
    groupNamePh: { zh: '群聊名称', en: 'Group name' },
    selectMembers: { zh: '选择成员（仅好友）', en: 'Select members (friends only)' },
    cancel: { zh: '取消', en: 'Cancel' },
    confirm: { zh: '创建', en: 'Create' },
    offlineHint: { zh: '对方离线也能收到', en: 'Works when recipient is offline' },
    emptyConv: { zh: '还没有消息', en: 'No messages yet' },
    cantSelf: { zh: '不能添加自己为好友', en: "Can't add yourself" },
    userNotFound: { zh: '未找到该用户', en: 'User not found' },
    requestSent: { zh: '好友请求已发送', en: 'Friend request sent' },
    groupInvalid: { zh: '请填写群名并选择成员', en: 'Enter name and select members' },
    banned: { zh: '你已被封禁', en: 'You are banned' },
    banReasonPh: { zh: '输入封禁原因（可留空）', en: 'Ban reason (optional)' },
    banDone: { zh: '已封禁', en: 'Banned' },
    unbanDone: { zh: '已解封', en: 'Unbanned' },
    admin: { zh: '管理员', en: 'Admin' },
    userManage: { zh: '用户管理', en: 'User Management' },
    search: { zh: '搜索', en: 'Search' },
    noUsers: { zh: '没有用户', en: 'No users' },
    ban: { zh: '封禁', en: 'Ban' },
    unban: { zh: '解封', en: 'Unban' },
    close: { zh: '关闭', en: 'Close' },
    manageMembers: { zh: '成员管理', en: 'Manage Members' },
    owner: { zh: '群主', en: 'Owner' },
    kick: { zh: '踢出', en: 'Kick' },
    kickDone: { zh: '已踢出', en: 'Kicked' },
    makeAdmin: { zh: '设为管理员', en: 'Make Admin' },
    revokeAdmin: { zh: '撤销管理员', en: 'Revoke Admin' },
    onlyOwner: { zh: '仅群主可操作', en: 'Only owner can do this' },
    roleUpdated: { zh: '角色已更新', en: 'Role updated' }
  },
  login: {
    title: { zh: '登录', en: 'Login' },
    signupTitle: { zh: '注册', en: 'Sign Up' },
    username: { zh: '用户名', en: 'Username' },
    usernamePh: { zh: '输入用户名（1-12字符）', en: 'Username (1-12 chars)' },
    usernameRequired: { zh: '请输入用户名', en: 'Username is required' },
    email: { zh: '邮箱', en: 'Email' },
    emailPh: { zh: '输入邮箱', en: 'Enter email' },
    password: { zh: '密码', en: 'Password' },
    passwordPh: { zh: '输入密码（至少6位）', en: 'Password (min 6 chars)' },
    login: { zh: '登录', en: 'Login' },
    signup: { zh: '注册', en: 'Sign Up' },
    loading: { zh: '处理中...', en: 'Processing...' },
    goSignup: { zh: '没有账号？去注册', en: "No account? Sign up" },
    goLogin: { zh: '已有账号？去登录', en: 'Have an account? Login' },
    confirmSent: { zh: '确认邮件已发送到 {email}，请点击邮件中的链接完成注册后再登录。', en: 'Confirmation email sent to {email}. Click the link in the email, then log in.' },
    resend: { zh: '重新发送确认邮件', en: 'Resend confirmation email' },
    resending: { zh: '发送中...', en: 'Sending...' },
    resendDone: { zh: '确认邮件已重新发送', en: 'Confirmation email resent' }
  },
  modal: {
    titleError: { zh: '错误', en: 'Error' },
    titleWarning: { zh: '警告', en: 'Warning' },
    titleInfo: { zh: '提示', en: 'Info' },
    titleSuccess: { zh: '成功', en: 'Success' },
    titlePrompt: { zh: '请输入', en: 'Please Input' },
    promptPlaceholder: { zh: '请输入内容...', en: 'Enter content...' },
    promptRequired: { zh: '此项不能为空', en: 'This field is required' },
    promptMinLength: { zh: '最少需要 {n} 个字符', en: 'At least {n} characters required' },
    promptMaxLength: { zh: '最多只能 {n} 个字符', en: 'Maximum {n} characters allowed' },
    promptPatternError: { zh: '输入格式不正确', en: 'Invalid input format' },
    loading: { zh: '加载中...', en: 'Loading...' },
    loadingProgress: { zh: '正在处理', en: 'Processing' },
    confirm: { zh: '确定', en: 'Confirm' },
    cancel: { zh: '取消', en: 'Cancel' },
    close: { zh: '关闭', en: 'Close' }
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
