#!/usr/bin/env node
/**
 * screenshots.mjs —— 用无头浏览器（Edge / Chrome）批量拍摄站点截图，供 README 使用。
 *
 * 做的事：构建产物 → 起一个临时静态服务（带 vite 里配置的 base 前缀）
 *        → 启动无头浏览器 → 走 CDP 逐页截图（可强制深浅色、可点按钮开弹窗）→ 清理。
 *
 * 用法：
 *   node plugins/screenshots.mjs                 # 构建 + 拍全部
 *   node plugins/screenshots.mjs --no-build      # 用现有 dist，不重新构建
 *   node plugins/screenshots.mjs --only home-light,blog-light
 *   node plugins/screenshots.mjs --width 1400 --height 900 --out docs/screenshots
 *
 * 环境变量：
 *   BROWSER_PATH   指定浏览器可执行文件（找不到时用它）
 *
 * 要求 Node.js 22+（用到内置的 WebSocket 客户端）。
 */
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const IS_WIN = process.platform === 'win32'

/* ------------------------------- 命令行参数 ------------------------------- */
function parseArgs(argv) {
  const opts = {
    build: true,
    out: join('docs', 'screenshots'),
    width: 1200,
    height: 780,
    port: 4319,
    debugPort: 9333,
    settle: 1800,
    only: null,
    keepOpen: false
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = () => argv[++i]
    if (a === '--no-build') opts.build = false
    else if (a === '--build') opts.build = true
    else if (a === '--out') opts.out = next()
    else if (a === '--width') opts.width = Number(next())
    else if (a === '--height') opts.height = Number(next())
    else if (a === '--port') opts.port = Number(next())
    else if (a === '--debug-port') opts.debugPort = Number(next())
    else if (a === '--settle') opts.settle = Number(next())
    else if (a === '--only') opts.only = next().split(',').map((s) => s.trim()).filter(Boolean)
    else if (a === '--keep-open') opts.keepOpen = true
    else if (a === '-h' || a === '--help') {
      console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 22).join('\n').replace(/^ \* ?/gm, ''))
      process.exit(0)
    }
  }
  return opts
}

/* --------------------------------- 小工具 --------------------------------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const paint = process.stdout.isTTY && !process.env.NO_COLOR
const c = (code) => (s) => (paint ? `\u001b[${code}m${s}\u001b[0m` : String(s))
const green = c(32)
const dim = c(90)
const bold = c(1)
const cyan = c(36)
const yellow = c(33)
const red = c(31)

const log = (msg) => console.log(`${cyan('›')} ${msg}`)
const warn = (msg) => console.warn(`${yellow('!')} ${msg}`)
const die = (msg) => {
  console.error(`${red('✖')} ${msg}`)
  process.exitCode = 1
}

/* ------------------------------ 读 vite 的 base ----------------------------- */
function readBase() {
  try {
    const src = readFileSync(join(ROOT, 'vite.config.js'), 'utf8')
    const m = src.match(/\bbase\s*:\s*['"`]([^'"`]+)['"`]/)
    if (m) return m[1].startsWith('/') ? m[1] : `/${m[1]}`
  } catch {}
  return '/'
}

/* ------------------------------- 静态文件服务 ------------------------------ */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.zip': 'application/zip'
}

function serveDist(distDir, base, port) {
  const root = resolve(distDir)
  const server = createServer((req, res) => {
    try {
      const url = decodeURIComponent((req.url || '/').split('?')[0])
      if (!url.startsWith(base)) {
        res.writeHead(404).end('not found')
        return
      }
      let rel = url.slice(base.length)
      if (rel === '' || rel.endsWith('/')) rel += 'index.html'
      const file = resolve(join(root, rel))
      if (!file.startsWith(root + sep) || !existsSync(file) || statSync(file).isDirectory()) {
        res.writeHead(404).end('not found')
        return
      }
      res.writeHead(200, {
        'content-type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
        'cache-control': 'no-store'
      })
      res.end(readFileSync(file))
    } catch (e) {
      res.writeHead(500).end(String(e))
    }
  })
  return new Promise((res, rej) => {
    server.once('error', rej)
    server.listen(port, '127.0.0.1', () => res(server))
  })
}

/* -------------------------------- 找浏览器 -------------------------------- */
function findBrowser() {
  const cands = [
    process.env.BROWSER_PATH,
    IS_WIN && join(process.env['ProgramFiles(x86)'] || '', 'Microsoft\\Edge\\Application\\msedge.exe'),
    IS_WIN && join(process.env.ProgramFiles || '', 'Microsoft\\Edge\\Application\\msedge.exe'),
    IS_WIN && join(process.env.ProgramFiles || '', 'Google\\Chrome\\Application\\chrome.exe'),
    IS_WIN && join(process.env['ProgramFiles(x86)'] || '', 'Google\\Chrome\\Application\\chrome.exe'),
    IS_WIN && process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe'),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ].filter(Boolean)
  return cands.find((p) => {
    try { return existsSync(p) } catch { return false }
  })
}

/* ------------------------------- CDP 客户端 ------------------------------- */
function connectCDP(wsUrl) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(wsUrl)
    const pending = new Map()
    let seq = 0
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg)
        pending.delete(msg.id)
      }
    })
    ws.addEventListener('error', () => rej(new Error('CDP 连接失败')))
    ws.addEventListener('open', () => {
      const send = (method, params = {}) =>
        new Promise((done) => {
          const id = ++seq
          pending.set(id, done)
          ws.send(JSON.stringify({ id, method, params }))
        })
      const evaluate = async (expression) => {
        const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
        if (r?.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.text || 'evaluate 失败')
        return r?.result?.result?.value
      }
      res({ send, evaluate, close: () => ws.close() })
    })
  })
}

async function waitForTargets(debugPort, ms = 20000) {
  const deadline = Date.now() + ms
  while (Date.now() < deadline) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (page) return page
    } catch {}
    await sleep(250)
  }
  throw new Error('等不到浏览器调试端口，可能浏览器启动失败')
}

/* --------------------------------- 截图清单 -------------------------------- */
const DEFAULT_SHOTS = [
  { name: 'home-light', hash: '#/home', theme: 'light' },
  { name: 'home-dark', hash: '#/home', theme: 'dark' },
  { name: 'blog-light', hash: '#/blog', theme: 'light' },
  { name: 'games-light', hash: '#/games', theme: 'light' },
  { name: 'discussion-light', hash: '#/discussion', theme: 'light' },
  { name: 'plugins-dark', hash: '#/plugins', theme: 'dark' },
  { name: 'login-light', hash: '#/login', theme: 'light' },
  { name: 'demo-modal-dark', hash: '#/demo', theme: 'dark', click: '成功' }
]

/* ---------------------------------- 主流程 -------------------------------- */
async function main() {
  if (typeof WebSocket !== 'function') {
    die('需要 Node.js 22 以上（本脚本用到内置 WebSocket），当前 ' + process.version)
    return
  }
  const opts = parseArgs(process.argv.slice(2))
  const base = readBase()
  const distDir = join(ROOT, 'dist')
  const outDir = resolve(ROOT, opts.out)

  const shots = opts.only
    ? DEFAULT_SHOTS.filter((s) => opts.only.includes(s.name))
    : DEFAULT_SHOTS
  if (!shots.length) {
    warn(`--only 没有匹配到任何截图，可选：${DEFAULT_SHOTS.map((s) => s.name).join(', ')}`)
    return
  }

  // 1) 构建（直接调 Vite 的 API，不额外开子进程；
  //    terminalPretty 插件会在本进程里打印构建方框）
  if (opts.build) {
    log(`构建中 ${dim('(vite build)')}`)
    try {
      const { build } = await import('vite')
      await build({ root: ROOT })
    } catch {
      die('构建失败，已中止截图')
      return
    }
  }
  if (!existsSync(join(distDir, 'index.html'))) {
    die(`找不到 ${join(distDir, 'index.html')}，先跑一次构建`)
    return
  }

  // 2) 静态服务
  const server = await serveDist(distDir, base, opts.port)
  const origin = `http://127.0.0.1:${opts.port}${base}`
  log(`静态服务 ${green(origin)}`)

  // 3) 启动浏览器
  const exe = findBrowser()
  if (!exe) {
    server.close()
    die('没找到 Edge / Chrome，可用 BROWSER_PATH 指定')
    return
  }
  const profile = join(ROOT, 'node_modules', '.cache', 'screenshots-profile')
  mkdirSync(profile, { recursive: true })
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${opts.debugPort}`,
    'about:blank'
  ]
  const browser = spawn(exe, args, { stdio: 'ignore', detached: false })
  const cleanup = () => {
    try { browser.kill() } catch {}
    try { server.close() } catch {}
  }
  process.on('SIGINT', () => { cleanup(); process.exit(130) })

  let cdp
  try {
    const target = await waitForTargets(opts.debugPort)
    cdp = await connectCDP(target.webSocketDebuggerUrl)
    await cdp.send('Page.enable')
    await cdp.send('Runtime.enable')
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: opts.width,
      height: opts.height,
      deviceScaleFactor: 1,
      mobile: false
    })

    mkdirSync(outDir, { recursive: true })
    log(`浏览器 ${dim(exe)}`)
    console.log('')

    const waitReady = async () => {
      for (let i = 0; i < 120; i++) {
        if ((await cdp.evaluate('document.readyState')) === 'complete') return
        await sleep(100)
      }
    }

    // 先落到同源页面，才能写 localStorage
    await cdp.send('Page.navigate', { url: `${origin}?boot=1#/home` })
    await waitReady()
    await sleep(300)

    const rows = []
    let index = 0
    for (const shot of shots) {
      index++
      await cdp.evaluate(`localStorage.setItem('theme', ${JSON.stringify(shot.theme)})`)
      // 唯一 query 参数强制整页加载，hash 决定页面
      await cdp.send('Page.navigate', {
        url: `${origin}?shot=${Date.now()}-${index}#${shot.hash.replace(/^#/, '')}`
      })
      await waitReady()
      await sleep(opts.settle)

      let extra = ''
      if (shot.click) {
        const hit = await cdp.evaluate(`(() => {
          const el = [...document.querySelectorAll('.demo-btn')].find(b => b.textContent.includes(${JSON.stringify(shot.click)}));
          if (el) el.click();
          return !!el;
        })()`)
        if (!hit) warn(`${shot.name}：找不到含「${shot.click}」的按钮`)
        await sleep(900)
        extra = hit ? '  + 弹窗' : ''
      }

      const state = JSON.parse(
        await cdp.evaluate(`JSON.stringify({
          dark: document.documentElement.classList.contains('dark'),
          hash: location.hash
        })`)
      )

      const cap = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
      const data = cap?.result?.data
      if (!data) {
        warn(`${shot.name}：截图失败`)
        continue
      }
      const file = join(outDir, `${shot.name}.png`)
      writeFileSync(file, Buffer.from(data, 'base64'))
      const kb = Math.round(statSync(file).size / 1024)
      rows.push({ name: shot.name, kb, hash: state.hash, theme: state.dark ? 'dark' : 'light', extra })
      console.log(
        `  ${green('✔')} ${shot.name.padEnd(20)} ${dim(`${state.hash} · ${state.dark ? 'dark' : 'light'}`)}${extra}  ${yellow(kb + ' KB')}`
      )
    }

    console.log('')
    log(`${bold(rows.length + ' 张')} 已保存到 ${green(opts.out)}${dim('（合计 ' + rows.reduce((n, r) => n + r.kb, 0) + ' KB）')}`)
  } finally {
    if (cdp) cdp.close()
    if (!opts.keepOpen) cleanup()
  }
}

main().catch((e) => {
  die(e?.stack || String(e))
})
