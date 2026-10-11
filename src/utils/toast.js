import { ref } from 'vue'

console.log('[toast.js] Toast 控制模块初始化')

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

  console.log(`[toast/pushToast] 显示Toast，id=${id}, type=${type}`)

  toasts.value.push(item)
  scheduleAutoDismiss(item)
  return id
}

const dismiss = (id) => {
  console.log(`[toast/dismiss] 移除Toast，id=${id}`)
  const item = toasts.value.find((t) => t.id === id)
  if (item && typeof item.onClose === 'function') {
    try {
      item.onClose()
    } catch (e) {
      console.error('[toast/dismiss] onClose 回调出错:', e)
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
  console.log(`[toast/pauseTimer] 暂停Toast，id=${id}, 剩余=${item._remaining}ms`)
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
  console.log(`[toast/resumeTimer] 恢复Toast，id=${id}, 剩余=${remaining}ms`)
}

const clearAll = () => {
  console.log('[toast/clearAll] 清除所有Toast')
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
  const valid = ['top-right', 'top-left', 'top-center', 'bottom-right', 'bottom-left', 'bottom-center', 'center']
  if (valid.includes(pos)) {
    console.log(`[toast/setPosition] 设置Toast位置: ${pos}`)
    position.value = pos
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
