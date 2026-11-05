import { ref } from 'vue'
import { createLogger } from './logger'

const log = createLogger('toast')

const VALID_TYPES = ['info', 'success', 'warning', 'error', 'loading']
const VALID_POSITIONS = ['top-right', 'top-left', 'top-center', 'bottom-right', 'bottom-left', 'bottom-center', 'center']
// default：原来的白色卡片；light：轻提示；tarkov：塔科夫战术风
const VALID_SKINS = ['default', 'light', 'tarkov']
// 塔科夫通知最多同时显示 6 条，超出时移除最旧的一条
const TARKOV_MAX_VISIBLE = 6

log.info('Toast 控制模块初始化')

const toasts = ref([])
const position = ref('top-right')
const skin = ref('default')
let _id = 0
const timers = new Map()
const paused = new Set()

const genId = () => ++_id

let audioCtx = null

// 塔科夫提示音：单次方波短脉冲，模拟 EFT 通知的电台手感（纯 WebAudio 合成，无外部音频）
const playTarkovCue = (type = 'info', isBanner = false) => {
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext
    if (!Ctor) return
    audioCtx = audioCtx || new Ctor()
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {})
    const t0 = audioCtx.currentTime

    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'square'

    let baseFreq = 850
    if (type === 'success') baseFreq = 1100
    if (isBanner) baseFreq = 950

    osc.frequency.setValueAtTime(baseFreq, t0)
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, t0 + 0.03)

    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(0.04, t0 + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05)

    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start(t0)
    osc.stop(t0 + 0.06)
  } catch (error) {
    log.debug('塔科夫提示音播放失败（可能被浏览器自动播放策略拦截）', error)
  }
}

const removeToast = (id) => {
  const idx = toasts.value.findIndex((t) => t.id === id)
  if (idx !== -1) {
    toasts.value.splice(idx, 1)
  }
  clearTimeout(timers.get(id))
  timers.delete(id)
  paused.delete(id)
  log.debug('移除 Toast', { id, found: idx !== -1 })
}

const scheduleAutoDismiss = (item) => {
  if (item.duration <= 0) return
  clearTimeout(timers.get(item.id))
  const timer = setTimeout(() => {
    if (!paused.has(item.id)) {
      removeToast(item.id)
    }
  }, item.duration)
  timers.set(item.id, timer)
}

// 每种皮肤自带的落点：轻提示中上方，塔科夫右下角
const SKIN_POSITIONS = {
  default: null,
  light: 'top-center',
  tarkov: 'bottom-right'
}

const pushToast = (options) => {
  const {
    type = 'info',
    title = '',
    message = '',
    duration = 3000,
    closeable = true,
    onClick = null,
    onClose = null,
    skin: itemSkin = skin.value,
    position: requestedPosition = null
  } = options

  const resolvedSkin = VALID_SKINS.includes(itemSkin) ? itemSkin : 'default'
  const resolvedPosition =
    requestedPosition && VALID_POSITIONS.includes(requestedPosition)
      ? requestedPosition
      : SKIN_POSITIONS[resolvedSkin] || position.value

  if (!VALID_SKINS.includes(itemSkin)) {
    log.warn(`未知 Toast 皮肤：${itemSkin}，回退为 default`)
  }

  const id = genId()
  const item = {
    id,
    type,
    title,
    message,
    duration,
    closeable,
    onClick,
    onClose,
    skin: resolvedSkin,
    position: resolvedPosition,
    _remaining: duration,
    _startTime: Date.now()
  }

  if (!VALID_TYPES.includes(type)) {
    log.warn(`未知 Toast 类型：${type}，按原值渲染`)
  }

  log.info(`入队 Toast：id=${id}`, {
    type,
    duration,
    titleLength: String(title || '').length,
    messageLength: String(message || '').length,
    clickable: typeof onClick === 'function'
  })

  if (resolvedSkin === 'tarkov') {
    const tarkovItems = toasts.value.filter((t) => t.skin === 'tarkov')
    while (tarkovItems.length >= TARKOV_MAX_VISIBLE) {
      removeToast(tarkovItems.shift().id)
    }
  }

  toasts.value.push(item)
  scheduleAutoDismiss(item)
  if (resolvedSkin === 'tarkov') playTarkovCue(type, !!title)
  return id
}

const dismiss = (id) => {
  log.debug('关闭 Toast', { id })
  const item = toasts.value.find((t) => t.id === id)
  if (item && typeof item.onClose === 'function') {
    try {
      item.onClose()
    } catch (e) {
      log.error('Toast onClose 回调出错', e)
    }
  }
  removeToast(id)
}

const pauseTimer = (id) => {
  const item = toasts.value.find((t) => t.id === id)
  if (!item || item.duration <= 0) return
  // 拖拽/悬停会重复触发 pause，重复扣减会让剩余时间被多减一次
  if (paused.has(id)) return
  paused.add(id)
  const elapsed = Date.now() - item._startTime
  item._remaining = Math.max(0, item._remaining - elapsed)
  clearTimeout(timers.get(id))
  timers.delete(id)
  log.debug('暂停 Toast 计时', { id, remaining: item._remaining })
}

const resumeTimer = (id) => {
  const item = toasts.value.find((t) => t.id === id)
  if (!item || item.duration <= 0) return
  paused.delete(id)
  item._startTime = Date.now()
  const remaining = item._remaining
  clearTimeout(timers.get(id))
  const timer = setTimeout(() => {
    if (!paused.has(id)) {
      removeToast(id)
    }
  }, remaining)
  timers.set(id, timer)
  log.debug('恢复 Toast 计时', { id, remaining })
}

const clearAll = () => {
  log.debug('清除所有 Toast', { count: toasts.value.length })
  toasts.value = []
  timers.forEach((t) => clearTimeout(t))
  timers.clear()
  paused.clear()
}

const toastInfo = (message, opts = {}) => pushToast({ ...opts, type: 'info', message })
const toastSuccess = (message, opts = {}) => pushToast({ ...opts, type: 'success', message })
const toastWarning = (message, opts = {}) => pushToast({ ...opts, type: 'warning', message })
const toastError = (message, opts = {}) => pushToast({ ...opts, type: 'error', message })
const toastLoading = (message, opts = {}) => pushToast({ ...opts, type: 'loading', message, duration: opts.duration ?? 0 })
const toastLight = (message, opts = {}) => pushToast({ ...opts, type: opts.type || 'info', message, skin: 'light' })
const toastTarkov = (message, opts = {}) => pushToast({ ...opts, type: opts.type || 'info', message, skin: 'tarkov' })

/** 设置后续 Toast 的默认皮肤（单条仍可用 skin 覆盖） */
const setSkin = (next) => {
  if (!VALID_SKINS.includes(next)) {
    log.warn(`无效的 Toast 皮肤：${next}`)
    return
  }
  skin.value = next
  log.debug('设置默认 Toast 皮肤', { skin: next })
}

const setPosition = (pos) => {
  if (VALID_POSITIONS.includes(pos)) {
    position.value = pos
    log.debug('设置 Toast 位置', { position: pos })
  } else {
    log.warn(`无效的 Toast 位置：${pos}`)
  }
}

export {
  toasts,
  position,
  skin,
  dismiss,
  pauseTimer,
  resumeTimer,
  clearAll,
  setPosition,
  setSkin,
  pushToast as showToast,
  toastInfo,
  toastSuccess,
  toastWarning,
  toastError,
  toastLoading,
  toastLight,
  toastTarkov
}

export default {
  show: pushToast,
  info: toastInfo,
  success: toastSuccess,
  warning: toastWarning,
  error: toastError,
  loading: toastLoading,
  light: toastLight,
  tarkov: toastTarkov,
  dismiss,
  clear: clearAll,
  position: setPosition,
  skin: setSkin
}
