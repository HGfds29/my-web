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

const removedAds = new Set()

const matchAdText = (text) => {
  if (!text) return false
  const t = text.trim()
  if (!t || t.length > 500) return false
  return AD_TEXT_PATTERNS.some(pat => t.includes(pat))
}

const isAdElement = (el) => {
  if (!(el instanceof Element)) return false
  if (removedAds.has(el)) return false

  for (const sel of AD_SELECTORS) {
    try {
      if (el.matches && el.matches(sel)) return true
    } catch (e) {}
  }

  const cls = (el.className && typeof el.className === 'string') ? el.className : ''
  const id = el.id || ''

  for (const kw of AD_CLASS_KEYWORDS) {
    if (cls.includes(kw) || id.includes(kw)) return true
  }

  if (el.tagName === 'IFRAME') {
    const src = el.src || ''
    if (src.includes('ad') && !src.includes('vite')) return true
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
  target.style.display = 'none'
  setTimeout(() => {
    if (target.parentNode) {
      target.parentNode.removeChild(target)
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

  for (const sel of AD_SELECTORS) {
    try {
      const els = root.querySelectorAll(sel)
      els.forEach(el => removeAd(el))
    } catch (e) {}
  }

  const allEls = root.querySelectorAll('div, p, span, footer, iframe, ins, a')
  allEls.forEach(el => {
    if (isAdElement(el)) removeAd(el)
  })
}

const initAdBlocker = () => {
  if (typeof document === 'undefined') return

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanAds, { once: true })
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

  setInterval(() => {
    scanAds()
  }, 1000)
}

export { initAdBlocker }
