import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { terminalPretty } from './plugins/terminalPretty.js'

const versionFile = fileURLToPath(new URL('./version', import.meta.url))

// sourcemap 默认不生成（会让产物从 ~645 KB 涨到 ~2.9 MB）。
// 需要调试时用 Vite 原生参数开启：
//   npm run build -- --sourcemap
//   npm run build:map        （等价，见 package.json）
// 注意 `npm run build -map` 不行：npm 会把单横杠参数按短选项拆成 -m -a -p 自己吃掉，
// 参数根本到不了 Vite；即使硬传（`-- -map`），Vite 的 CLI 也会以 Unknown option 拒绝。

// 每次构建把当前时间写进 version 文件
const buildStamp = () => ({
  name: 'build-stamp',
  apply: 'build',
  closeBundle() {
    if (!existsSync(versionFile)) return
    const d = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const stamp =
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
      `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    const line = `构建时间 - ${stamp}`

    const content = readFileSync(versionFile, 'utf8')
    let next
    if (/^构建时间 - .*$/m.test(content)) {
      next = content.replace(/^构建时间 - .*$/m, line)
    } else if (/^许可证 - .*$/m.test(content)) {
      next = content.replace(/^(许可证 - .*)$/m, `$1\n${line}`)
    } else {
      next = `${content.trimEnd()}\n\n${line}\n`
    }
    writeFileSync(versionFile, next, 'utf8')
  }
})

export default defineConfig({
  plugins: [vue(), buildStamp(), terminalPretty({ title: '个人网站' })],
  base: '/my-web/',

  server: {
    port: 8080,        // 端口
    open: true,        // 启动自动打开浏览器
    host: "0.0.0.0"    // 局域网其他设备访问
  },

  build: {
    outDir: "dist",    // 输出文件夹
    assetsDir: "static",
    minify: "esbuild", // 压缩
    // sourcemap 交给 Vite 默认值（false）；需要时用 CLI 的 --sourcemap 覆盖
  },

  preview: {
    host: '0.0.0.0',
    port: 8888
  },

})
