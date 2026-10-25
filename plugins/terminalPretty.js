/**
 * terminalPretty —— 零依赖的 Vite 终端美化插件
 *
 * 把 Vite 默认那一大段输出换成统一风格的方框：
 *   · 构建成功：耗时、产物数量、体积（含 gzip）、最大的几个文件 + 体积条
 *   · 开发启动：本地 / 局域网地址、base、就绪耗时
 *   · 构建失败：插件名、源代码位置、Vite 的代码帧、修复提示
 *
 * 颜色全部走 ANSI 转义；CJK 等宽字符按 2 列计算，方框不会歪。
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

/* -------------------------------- 颜色支持 -------------------------------- */
const useColor =
  !process.env.NO_COLOR &&
  process.env.TERM !== 'dumb' &&
  (process.stdout.isTTY || !!process.env.FORCE_COLOR)

const sgr = (code) => (useColor ? `\u001b[${code}m` : '')
const t = {
  reset: sgr(0),
  bold: sgr(1),
  dim: sgr(2),
  gray: sgr(90),
  red: sgr(31),
  green: sgr(32),
  yellow: sgr(33),
  cyan: sgr(36),
  white: sgr(97)
}

/* ------------------------------- 宽度与对齐 ------------------------------- */
const ANSI_RE = /\u001b\[[0-9;]*m/g
// 东亚宽字符：CJK 汉字、假名、谚文、全角标点等
const WIDE_RE =
  /[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]/

const strWidth = (s) => {
  let w = 0
  for (const ch of String(s).replace(ANSI_RE, '')) w += WIDE_RE.test(ch) ? 2 : 1
  return w
}

const pad = (s, n) => s + ' '.repeat(Math.max(0, n - strWidth(s)))
const padLeft = (s, n) => ' '.repeat(Math.max(0, n - strWidth(s))) + s

/* -------------------------------- 体积/时间 ------------------------------- */
const bytes = (n) => {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} kB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

const ms = (n) => (n < 1000 ? `${Math.round(n)} ms` : `${(n / 1000).toFixed(2)} s`)

/* --------------------------------- 进度条 -------------------------------- */
const BAR_FULL = '█'
const BAR_EMPTY = '░'
const bar = (ratio, width = 10) => {
  const r = Math.min(1, Math.max(0, Number.isFinite(ratio) ? ratio : 0))
  let filled = Math.round(r * width)
  if (r > 0 && filled === 0) filled = 1 // 占比再小也留一格，避免看起来是空的
  return BAR_FULL.repeat(filled) + BAR_EMPTY.repeat(Math.max(0, width - filled))
}

/* ---------------------------------- 方框 --------------------------------- */
/**
 * rows: 字符串，或 { text, right } —— right 会右对齐到同一行
 */
const box = (rows, options = {}) => {
  const { title = '', color = t.cyan, minWidth = 34 } = options
  const items = rows.map((r) => (typeof r === 'string' ? { text: r } : r))
  const widthOf = (it) => strWidth(it.text || '') + (it.right ? strWidth(it.right) + 2 : 0)
  const inner = Math.max(minWidth, title ? strWidth(title) + 4 : 0, ...items.map(widthOf))

  const header = title
    ? `${color}╭─ ${t.bold}${title}${t.reset}${color} ${'─'.repeat(Math.max(1, inner - strWidth(title) - 1))}╮${t.reset}`
    : `${color}╭${'─'.repeat(inner + 2)}╮${t.reset}`

  const body = items
    .map((it) => {
      const left = it.text || ''
      const line = it.right
        ? left + ' '.repeat(Math.max(1, inner - strWidth(left) - strWidth(it.right))) + it.right
        : pad(left, inner)
      return `${color}│${t.reset} ${line} ${color}│${t.reset}`
    })
    .join('\n')

  const footer = `${color}╰${'─'.repeat(inner + 2)}╯${t.reset}`
  return [header, body, footer].join('\n')
}

const emit = (block) =>
  process.stdout.write('\n' + block.split('\n').map((l) => '  ' + l).join('\n') + '\n\n')

/* --------------------------------- 包信息 -------------------------------- */
const pkg = (() => {
  try {
    return JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8'))
  } catch {
    return {}
  }
})()

/**
 * 版本来源优先级：options.version → 根目录 version 文件的「总版本」行 → package.json。
 * （package.json 常常是脚手架留下的 0.0.0，本项目真正的版本维护在 version 文件里）
 */
const readProjectVersion = () => {
  try {
    const text = readFileSync(fileURLToPath(new URL('../version', import.meta.url)), 'utf8')
    const m = text.match(/^总版本\s*[-:：]\s*(.+)$/m)
    if (m) return m[1].trim()
  } catch {}
  return ''
}

// 显示时去掉 semver 的 build metadata（`+` 之后那一段，更像环境信息），并保证带 v 前缀
const normalizeVersion = (raw) => {
  const base = String(raw || '').split('+')[0].trim()
  if (!base) return ''
  return /^v/i.test(base) ? base : `v${base}`
}

/* ------------------------------ 产物体积统计 ------------------------------ */
const TEXT_EXT = /\.(js|mjs|cjs|css|html|json|svg|txt|map)$/i
const gzipSize = (buf) => {
  try {
    return gzipSync(buf, { level: 9 }).length
  } catch {
    return 0
  }
}

const toBuffer = (item) => {
  if (item.type === 'asset') {
    return Buffer.isBuffer(item.source) ? item.source : Buffer.from(String(item.source))
  }
  return Buffer.from(item.code || '')
}

/* ------------------------------- 插件本体 -------------------------------- */
export function terminalPretty(options = {}) {
  const label = options.title || pkg.name || 'project'
  const topCount = options.top ?? 4
  const quiet = options.quiet !== false
  const barWidth = options.barWidth ?? 10
  const created = Date.now()

  let command = 'serve'
  let outDir = 'dist'
  let sourcemap = false
  let started = 0
  let files = []
  let failed = false

  const version = normalizeVersion(options.version || readProjectVersion() || pkg.version)

  return {
    name: 'terminalPretty',

    // 默认把 Vite 自己那套 info 输出静音，只留我们画的方框；
    // 警告与错误仍然照常输出。
    config() {
      if (!quiet) return
      return { logLevel: 'warn' }
    },

    configResolved(config) {
      command = config.command
      outDir = config.build.outDir
      sourcemap = config.build.sourcemap
    },

    buildStart() {
      if (command !== 'build') return
      started = Date.now()
      files = []
      failed = false
      process.stdout.write(
        `\n  ${t.cyan}▶${t.reset} ${t.bold}${label}${t.reset}` +
          `${version ? t.gray + ' ' + version + t.reset : ''}` +
          `${t.gray} 正在构建…${t.reset}\n`
      )
    },

    generateBundle(_options, bundle) {
      if (command !== 'build') return
      for (const [file, item] of Object.entries(bundle)) {
        const buf = toBuffer(item)
        files.push({
          file,
          size: buf.length,
          gzip: TEXT_EXT.test(file) ? gzipSize(buf) : 0
        })
      }
    },

    buildEnd(error) {
      if (!error) return
      failed = true

      const headline = String(error.message || error).split('\n')[0]
      const detail = String(error.message || '')
        .split('\n')
        .slice(1, 4)
        .filter(Boolean)

      const rows = [
        { text: `${t.red}${t.bold}✖${t.reset} ${t.bold}构建失败${t.reset}`, right: error.plugin ? `${t.gray}${error.plugin}${t.reset}` : '' },
        { text: '' }
      ]

      if (error.id) {
        const loc = error.loc ? `:${error.loc.line}:${error.loc.column}` : ''
        rows.push({ text: `${t.gray}文件${t.reset}  ${error.id}${loc}` })
      }
      rows.push({ text: `${t.white}${headline}${t.reset}` })

      const frame = typeof error.frame === 'string' ? error.frame.trimEnd().split('\n').slice(0, 7) : []
      if (frame.length) {
        rows.push({ text: '' })
        for (const line of frame) rows.push({ text: `${t.gray}${line}${t.reset}` })
      } else {
        for (const line of detail) rows.push({ text: `${t.gray}${line}${t.reset}` })
      }

      rows.push({ text: '' })
      rows.push({ text: `${t.gray}提示  修好后再跑一次 ${t.bold}vite build${t.reset}` })

      process.stdout.write('\n' + box(rows, { title: `${label} · 构建失败`, color: t.red }).split('\n').map((l) => '  ' + l).join('\n') + '\n\n')
    },

    closeBundle() {
      if (command !== 'build' || failed) return

      const duration = Date.now() - started
      const total = files.reduce((n, f) => n + f.size, 0)
      const totalGzip = files.reduce((n, f) => n + f.gzip, 0)
      const sorted = [...files].sort((a, b) => b.size - a.size)
      const biggest = sorted[0]?.size || 1
      const durationColor = duration < 3000 ? t.green : duration < 8000 ? t.yellow : t.red

      const rows = [
        {
          text: `${t.green}${t.bold}✔${t.reset} ${t.bold}构建完成${t.reset}`,
          right: `${durationColor}${ms(duration)}${t.reset}`
        },
        { text: '' },
        { text: `${t.gray}${pad('out', 6)}${t.reset}${outDir}`, right: `${t.gray}${files.length} 个文件${t.reset}` },
        {
          text: `${t.gray}${pad('size', 6)}${t.reset}${bytes(total)}`,
          right: totalGzip ? `${t.gray}gzip ${bytes(totalGzip)}${t.reset}` : ''
        }
      ]

      if (sourcemap) {
        const kind = sourcemap === true ? 'external' : String(sourcemap)
        rows.push({ text: `${t.gray}${pad('map', 6)}${t.reset}${t.yellow}${kind}${t.gray}（体积会明显变大）${t.reset}` })
      }

      if (biggest > 0) {
        rows.push({ text: '' })
        for (const f of sorted.slice(0, topCount)) {
          rows.push({
            text: `${t.gray}${pad(f.file, 34)}${t.reset} ${t.cyan}${bar(f.size / biggest, barWidth)}${t.reset}`,
            right: `${t.yellow}${bytes(f.size)}${t.reset}`
          })
        }
        if (sorted.length > topCount) {
          rows.push({ text: `${t.gray}…还有 ${sorted.length - topCount} 个文件${t.reset}` })
        }
      }

      emit(box(rows, { title: `${label}${version ? ' ' + version : ''} · BUILD`, color: t.green }))
    },

    configureServer(server) {
      const print = () => {
        const urls = server.resolvedUrls || {}
        const base = server.config.base || '/'
        const rows = [
          {
            text: `${t.green}${t.bold}⚡${t.reset} ${t.bold}开发服务器就绪${t.reset}`,
            right: `${t.gray}${ms(Date.now() - created)}${t.reset}`
          },
          { text: '' }
        ]

        if (urls.local?.length) {
          for (const url of urls.local) {
            rows.push({ text: `${t.gray}${pad('local', 6)}${t.reset}${t.cyan}${url}${t.reset}` })
          }
        }
        for (const url of urls.network || []) {
          rows.push({ text: `${t.gray}${pad('network', 6)}${t.reset}${t.cyan}${url}${t.reset}` })
        }
        rows.push({ text: `${t.gray}${pad('base', 6)}${t.reset}${base}` })
        rows.push({ text: '' })
        rows.push({ text: `${t.gray}按 ${t.bold}h + Enter${t.gray} 查看帮助，${t.bold}Ctrl + C${t.gray} 退出${t.reset}` })

        emit(box(rows, { title: `${label} · DEV`, color: t.cyan }))
      }

      if (server.httpServer) {
        // resolvedUrls 要等 listening 之后才写入，延迟一个宏任务再读
        server.httpServer.once('listening', () => setTimeout(print, 0))
      } else {
        print()
      }
    }
  }
}

export default terminalPretty
