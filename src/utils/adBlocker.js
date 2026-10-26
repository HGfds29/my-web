import { createLogger } from './logger'

const log = createLogger('adBlocker')

const AD_SELECTORS = [
  'iframe[src*="adsbygoogle"]',
  'iframe[src*="advert"]',
  'ins.adsbygoogle',
  'ins[data-ad-client]',
  'ins[data-ad-slot]',
  '.adsbygoogle',
  '[class^="ad-"]',
  '[class*=" ad-"]',
  '[class^="ad_"]',
  '[class*=" ad_"]',
  '[class^="advert"]',
  '[class*=" advert"]',
  '[id^="ad-"]',
  '[id^="ad_"]',
  '[id^="advert"]',
  '[class*="banner-ad"]',
  '[id*="banner-ad"]',
  '[class*="popup-ad"]',
  '[id*="popup-ad"]',
  '[class*="float-ad"]',
  '[id*="float-ad"]',
  '[class*="bottom-ad"]',
  '[id*="bottom-ad"]',
  '[class*="top-ad"]',
  '[id*="top-ad"]'
]

const AD_CLASS_KEYWORDS = [
  '广告',
  '推广',
  '赞助',
  '广告位'
]

// 英文只按完整词匹配，避免 shadow / badge / thread / download 等被误判
const AD_CLASS_TOKENS = new Set([
  'ad',
  'ads',
  'adv',
  'advert',
  'adverts',
  'advertisement',
  'adsbygoogle',
  'sponsor',
  'sponsored'
])

const hasAdToken = (value) => {
  if (!value) return false
  const tokens = value.toLowerCase().split(/[^a-z0-9]+/)
  return tokens.some(tok => AD_CLASS_TOKENS.has(tok))
}

const AD_TEXT_PATTERNS = [
  '2026促销',
  '香港特价空间',
  '最低仅需20元',
  '可永久使用',
  '三维免费空间',
  '友情提供',
  '本站空间由',
  '免费空间'
]

// 应用内部（聊天/讨论区等 UGC 内容）只用特征最明显的短语，避免误删正常内容
const AD_TEXT_PATTERNS_STRICT = [
  '2026促销',
  '香港特价空间',
  '三维免费空间'
]

const removedAds = new Set()
const reportedErrors = new Set()

// ============== 控制台日志 ==============
// 统一走 logger，日志会同样进入 Supabase 落库队列
const logInfo = (...args) => log.info(...args)
const logDebug = (...args) => log.debug(...args)
const logWarn = (...args) => log.warn(...args)
const logError = (...args) => log.error(...args)

const reportOnce = (key, level, ...args) => {
  if (reportedErrors.has(key)) return
  reportedErrors.add(key)
  level(...args)
}

// 把节点描述成 <div#id.class>，便于在控制台定位
const describeEl = (el) => {
  if (!el) return String(el)
  if (el.nodeType === 3) return `#text("${(el.textContent || '').slice(0, 30)}")`
  if (!el.tagName) return String(el)
  const id = el.id ? `#${el.id}` : ''
  const cls = (typeof el.className === 'string' && el.className.trim())
    ? `.${el.className.trim().split(/\s+/).join('.')}`
    : ''
  return `<${el.tagName.toLowerCase()}${id}${cls}>`
}

const matchAdText = (text, strict = false) => {
  if (!text) return false
  const t = text.trim()
  if (!t || t.length > 500) return false
  const patterns = strict ? AD_TEXT_PATTERNS_STRICT : AD_TEXT_PATTERNS
  return patterns.some(pat => t.includes(pat))
}

const isAdElement = (el) => {
  if (!(el instanceof Element)) return false
  if (removedAds.has(el)) return false

  for (const sel of AD_SELECTORS) {
    try {
      if (el.matches && el.matches(sel)) {
        return true
      }
    } catch (e) {
      reportOnce(`match:${sel}`, logError, `选择器匹配失败：${sel}`, e)
    }
  }

  const cls = (el.className && typeof el.className === 'string') ? el.className : ''
  const id = el.id || ''

  for (const kw of AD_CLASS_KEYWORDS) {
    if (cls.includes(kw) || id.includes(kw)) {
      return true
    }
  }

  if (hasAdToken(cls) || hasAdToken(id)) {
    return true
  }

  if (el.tagName === 'IFRAME') {
    const src = el.getAttribute('src') || ''
    if (src) {
      try {
        const url = new URL(src, window.location.href)
        if (hasAdToken(url.hostname) || hasAdToken(url.pathname)) {
          return true
        }
      } catch (e) {
        logDebug('iframe src 解析失败，跳过 URL 判定：', src, e)
      }
    }
  }

  // 应用内部按严格短语匹配，避免聊天/讨论区正文被误删
  const strictText = isInsideApp(el)
  const text = (el.innerText || el.textContent || '').trim()
  if (matchAdText(text, strictText)) return true

  if (el.children && el.children.length <= 2) {
    const fullText = (el.innerText || el.textContent || '').trim()
    if (fullText && fullText.length < 200 && matchAdText(fullText, strictText)) {
      return true
    }
  }

  return false
}

// 命中原因，仅在真正移除时计算，便于排查误杀
const describeAdMatch = (el) => {
  for (const sel of AD_SELECTORS) {
    try {
      if (el.matches && el.matches(sel)) return `选择器 ${sel}`
    } catch (e) {}
  }

  const cls = (typeof el.className === 'string') ? el.className : ''
  const id = el.id || ''
  for (const kw of AD_CLASS_KEYWORDS) {
    if (cls.includes(kw) || id.includes(kw)) return `关键词「${kw}」`
  }
  if (hasAdToken(cls) || hasAdToken(id)) return `class/id 词元（${cls || id}）`

  if (el.tagName === 'IFRAME') {
    const src = el.getAttribute('src') || ''
    if (hasAdToken(src)) return `iframe src（${src}）`
  }

  const text = (el.innerText || el.textContent || '').trim()
  const patterns = isInsideApp(el) ? AD_TEXT_PATTERNS_STRICT : AD_TEXT_PATTERNS
  const hit = patterns.find(pat => text.includes(pat))
  if (hit) return `文本特征「${hit}」`

  return '未知信号'
}

const getAppRoot = () => document.getElementById('app')

const isInsideApp = (node) => {
  const app = getAppRoot()
  return !!app && app.contains(node)
}

// 只保护 #app 本身及其祖先（防止删掉应用外壳导致白屏）；
// #app 的子孙节点允许被查杀，UGC 里注入的广告也就能正常移除
const isProtectedNode = (node) => {
  if (!node || node.nodeType !== 1) return true
  if (node === document.body || node === document.documentElement) return true
  const app = getAppRoot()
  return !!app && (node === app || node.contains(app))
}

const removeAd = (el) => {
  if (!el) return false
  if (removedAds.has(el)) {
    logDebug('跳过：该节点已处理过', describeEl(el))
    return false
  }

  const target = findAdContainer(el)
  if (!target || !target.parentNode) {
    logWarn('跳过：找不到可删除的父节点', describeEl(el))
    return false
  }
  if (isProtectedNode(target)) {
    logWarn('跳过受保护节点（#app 或其祖先），避免整站白屏', describeEl(target))
    return false
  }

  const reason = describeAdMatch(el)
  const where = isInsideApp(target) ? '#app 内' : '#app 外'
  removedAds.add(target)
  target.style.display = 'none'
  logInfo(`移除广告 ${describeEl(target)} | 命中：${reason} | 位置：${where}`)

  setTimeout(() => {
    try {
      if (target.parentNode) {
        target.parentNode.removeChild(target)
        logDebug('已从 DOM 中删除', describeEl(target))
      }
    } catch (e) {
      logError('删除节点时出错', describeEl(target), e)
    }
  }, 10)

  return true
}

const findAdContainer = (el) => {
  let current = el
  let depth = 0
  while (current && current.parentNode && depth < 5) {
    const parent = current.parentNode
    if (parent === document.body) {
      // 只在确认安全时扩大删除范围，否则退回元素自身
      if (isProtectedNode(current)) {
        logDebug('向上扩展命中受保护节点，改为只删除元素自身', describeEl(el))
        return el
      }
      return current
    }
    current = parent
    depth++
  }
  if (depth >= 5) {
    logDebug('向上查找达到深度上限，改为只删除元素自身', describeEl(el))
  }
  return el
}

const scanAds = (root = document.body) => {
  if (!root || root.nodeType !== 1) {
    logWarn('扫描跳过：无效的根节点', root)
    return
  }

  const startedAt = performance.now()
  const isBodyScan = root === document.body
  logDebug('开始扫描', describeEl(root), isBodyScan ? '（全量）' : '（局部）')

  let selectorHits = 0
  let removedCount = 0

  for (const sel of AD_SELECTORS) {
    try {
      const els = root.querySelectorAll(sel)
      els.forEach(el => {
        selectorHits++
        if (removeAd(el)) removedCount++
      })
    } catch (e) {
      reportOnce(`query:${sel}`, logError, `选择器执行失败：${sel}`, e)
    }
  }

  let candidates = 0
  const allEls = root.querySelectorAll('div, p, span, footer, iframe, ins, a')
  allEls.forEach(el => {
    candidates++
    if (isAdElement(el) && removeAd(el)) removedCount++
  })

  const cost = Math.round(performance.now() - startedAt)
  const summary = `${describeEl(root)} | 选择器命中 ${selectorHits} | 遍历 ${candidates} | 移除 ${removedCount} | 耗时 ${cost}ms`

  if (removedCount > 0 || isBodyScan) {
    logInfo('扫描完成：', summary)
  } else {
    logDebug('扫描完成：', summary)
  }

  if (cost > 100) {
    logWarn('扫描耗时偏长，可能存在性能问题：', summary)
  }
}

const initAdBlocker = () => {
  if (typeof document === 'undefined') {
    logWarn('初始化跳过：当前环境没有 document')
    return
  }

  logInfo('初始化广告拦截器', {
    readyState: document.readyState,
    appRoot: getAppRoot() ? '#app 已存在' : '#app 尚未挂载',
    selectors: AD_SELECTORS.length,
    textPatterns: AD_TEXT_PATTERNS.length
  })

  if (document.readyState === 'loading') {
    logDebug('文档尚未加载完成，等待 DOMContentLoaded 后首次扫描')
    document.addEventListener('DOMContentLoaded', () => {
      logDebug('DOMContentLoaded 触发，执行首次扫描')
      scanAds()
    }, { once: true })
  } else {
    scanAds()
  }

  let timeout = null
  const scheduleScan = () => {
    if (timeout) return
    timeout = setTimeout(() => {
      timeout = null
      scanAds()
    }, 30)
  }

  const observer = new MutationObserver((mutations) => {
    try {
      let needsScan = false

      for (const mut of mutations) {
        if (mut.type !== 'childList') continue

        mut.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            // 只保护 #app 本身及其祖先；#app 内部新增节点仍然要扫描（UGC 广告）
            if (isProtectedNode(node)) return
            // 应用外部变化才触发全量补扫，避免每次渲染都遍历整个 DOM
            if (!isInsideApp(node)) needsScan = true

            if (isAdElement(node)) {
              removeAd(node)
            } else {
              const text = (node.innerText || node.textContent || '').trim()
              if (matchAdText(text, isInsideApp(node))) {
                removeAd(node)
              } else {
                scanAds(node)
              }
            }
          } else if (node.nodeType === 3) {
            const parent = node.parentNode
            if (!parent || isProtectedNode(parent)) return
            if (matchAdText(node.textContent, isInsideApp(parent))) {
              removeAd(parent)
            }
          }
        })
      }

      if (mutations.length) {
        logDebug(`DOM 变化 ${mutations.length} 条，需要全量补扫：${needsScan}`)
      }
      if (needsScan) scheduleScan()
    } catch (e) {
      logError('MutationObserver 回调异常', e)
    }
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  })

  logInfo('已启动 MutationObserver 监听')
}

export { initAdBlocker }
