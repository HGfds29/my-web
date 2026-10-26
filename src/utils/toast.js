import { ref } from 'vue'
import { createLogger } from './logger'

const log = createLogger('toast')

const VALID_TYPES = ['info', 'success', 'warning', 'error', 'loading']
const VALID_POSITIONS = ['top-right', 'top-left', 'top-center', 'bottom-right', 'bottom-left', 'bottom-center', 'center']

log.info('Toast 控制模块初始化')

const toasts = ref([])
const position = ref('top-right')
let _id = 0
const timers = new Map()
const paused = new Set()

const genId = () => ++_id

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

const pushToast = (options) => {
  const {
    type = 'info',
    title = '',
    message = '',
    duration = 3000,
    closeable = true,
    onClick = null,
    onClose = null
  } = options

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

  toasts.value.push(item)
  scheduleAutoDismiss(item)
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
  dismiss,
  pauseTimer,
  resumeTimer,
  clearAll,
  setPosition,
  pushToast as showToast,
  toastInfo,
  toastSuccess,
  toastWarning,
  toastError,
  toastLoading
}

export default {
  show: pushToast,
  info: toastInfo,
  success: toastSuccess,
  warning: toastWarning,
  error: toastError,
  loading: toastLoading,
  dismiss,
  clear: clearAll,
  position: setPosition
}
