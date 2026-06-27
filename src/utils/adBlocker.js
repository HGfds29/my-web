const AD_SELECTORS = [
  'iframe[src*="ad"]',
  'iframe[src*="advert"]',
  'iframe[src*="adsby"]',
  'div[class*="ad-"]',
  'div[class*="ad_"]',
  'div[class*="advert"]',
  'div[class*="adsby"]',
  'div[class*="google_ads"]',
  'div[id*="ad-"]',
  'div[id*="ad_"]',
  'div[id*="advert"]',
  'ins.adsbygoogle',
  'ins[data-ad-client]',
  'ins[data-ad-slot]',
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
  'AD',
  'ad.',
  'advert',
  '广告位'
]

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

console.log('[adBlocker] 广告拦截器模块加载')
console.log('[adBlocker] 广告选择器数量:', AD_SELECTORS.length)
console.log('[adBlocker] 广告关键词数量:', AD_CLASS_KEYWORDS.length)
console.log('[adBlocker] 广告文本模式数量:', AD_TEXT_PATTERNS.length)

const removedAds = new Set()
let firstScanDone = false

const matchAdText = (text) => {
  if (!text) return false
  const t = text.trim()
  if (!t || t.length > 500) return false
  const matched = AD_TEXT_PATTERNS.some(pat => t.includes(pat))
  if (matched) {
    console.log('[adBlocker/matchAdText] 匹配到广告文本:', t.substring(0, 50))
  }
  return matched
}

const isAdElement = (el) => {
  if (!(el instanceof Element)) return false
  if (removedAds.has(el)) return false

  for (const sel of AD_SELECTORS) {
    try {
      if (el.matches && el.matches(sel)) {
        console.log('[adBlocker/isAdElement] 选择器匹配:', sel)
        return true
      }
    } catch (e) {}
  }

  const cls = (el.className && typeof el.className === 'string') ? el.className : ''
  const id = el.id || ''

  for (const kw of AD_CLASS_KEYWORDS) {
    if (cls.includes(kw) || id.includes(kw)) {
      console.log('[adBlocker/isAdElement] 类名/ID关键词匹配:', kw)
      return true
    }
  }

  if (el.tagName === 'IFRAME') {
    const src = el.src || ''
    if (src.includes('ad') && !src.includes('vite')) {
      console.log('[adBlocker/isAdElement] iframe广告源匹配:', src)
      return true
    }
  }

  const text = (el.innerText || el.textContent || '').trim()
  if (matchAdText(text)) return true

  if (el.children && el.children.length <= 2) {
    const fullText = (el.innerText || el.textContent || '').trim()
    if (fullText && fullText.length < 200 && matchAdText(fullText)) {
      return true
    }
  }

  return false
}

const removeAd = (el) => {
  if (!el) return
  if (removedAds.has(el)) return

  const target = findAdContainer(el)
  if (!target || !target.parentNode) return

  removedAds.add(target)
  console.log('[adBlocker/removeAd] 移除广告元素, 已移除总数:', removedAds.size)
  target.style.display = 'none'
  setTimeout(() => {
    if (target.parentNode) {
      target.parentNode.removeChild(target)
      console.log('[adBlocker/removeAd] 广告元素已从DOM移除')
    }
  }, 10)
}

const findAdContainer = (el) => {
  let current = el
  let depth = 0
  while (current && current.parentNode && depth < 5) {
    const parent = current.parentNode
    if (parent === document.body) return current
    current = parent
    depth++
  }
  return el
}

const scanAds = (root = document.body) => {
  if (!root) return
  const isBodyScan = root === document.body
  if (isBodyScan && !firstScanDone) {
    console.log('[adBlocker/scanAds] 开始扫描广告, 根节点:', root.tagName || root.nodeName)
    firstScanDone = true
  }

  let foundCount = 0
  for (const sel of AD_SELECTORS) {
    try {
      const els = root.querySelectorAll(sel)
      if (els.length > 0) {
        foundCount += els.length
        console.log('[adBlocker/scanAds] 选择器找到', sel, els.length, '个元素')
      }
      els.forEach(el => removeAd(el))
    } catch (e) {}
  }

  const allEls = root.querySelectorAll('div, p, span, footer, iframe, ins, a')
  allEls.forEach(el => {
    if (isAdElement(el)) {
      foundCount++
      removeAd(el)
    }
  })

  if (foundCount > 0) {
    console.log('[adBlocker/scanAds] 扫描完成, 发现广告:', foundCount, '个')
  }
}

const initAdBlocker = () => {
  console.log('[adBlocker/initAdBlocker] 初始化广告拦截器')
  if (typeof document === 'undefined') {
    console.log('[adBlocker/initAdBlocker] 无document对象，跳过')
    return
  }

  if (document.readyState === 'loading') {
    console.log('[adBlocker/initAdBlocker] 等待DOM加载完成')
    document.addEventListener('DOMContentLoaded', () => {
      console.log('[adBlocker/initAdBlocker] DOM加载完成，开始首次扫描')
      scanAds()
    }, { once: true })
  } else {
    console.log('[adBlocker/initAdBlocker] DOM已加载，开始首次扫描')
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
    console.log('[adBlocker/MutationObserver] 检测到DOM变化, 突变数量:', mutations.length)
    for (const mut of mutations) {
      if (mut.type === 'childList') {
        mut.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (isAdElement(node)) {
              removeAd(node)
            } else {
              const text = (node.innerText || node.textContent || '').trim()
              if (matchAdText(text)) {
                removeAd(node)
              } else {
                scanAds(node)
              }
            }
          } else if (node.nodeType === 3) {
            if (matchAdText(node.textContent)) {
              const parent = node.parentNode
              if (parent) removeAd(parent)
            }
          }
        })
      }
    }
    scheduleScan()
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  })
  console.log('[adBlocker/initAdBlocker] MutationObserver已启动')

  setInterval(() => {
    scanAds()
  }, 1000)
  console.log('[adBlocker/initAdBlocker] 定时扫描已启动 (每1秒)')
  console.log('[adBlocker/initAdBlocker] 初始化完成')
}

export { initAdBlocker }
