import { ref, reactive } from 'vue'
import { createLogger } from './logger'

const log = createLogger('modal')

log.info('弹窗控制模块初始化（通用对话框 / 输入弹窗 / 加载弹窗）')

// ============== 通用对话框 (ErrorModal) ==============
const visible = ref(false)
const config = reactive({
  type: 'info',
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
  showCancel: false,
  showClose: true,
  closeOnOverlay: false,
  size: 'md'
})

let confirmCallback = null
let cancelCallback = null
let closeCallback = null

const resetCallbacks = () => {
  confirmCallback = null
  cancelCallback = null
  closeCallback = null
}

const openModal = (options = {}) => {
  if (options.type && !['error', 'warning', 'info', 'success'].includes(options.type)) {
    log.warn(`未知弹窗类型：${options.type}`)
  }
  if (options.size && !['sm', 'md', 'lg'].includes(options.size)) {
    log.warn(`未知弹窗尺寸：${options.size}`)
  }

  config.type = options.type || 'info'
  config.title = options.title || ''
  config.message = options.message || ''
  config.confirmText = options.confirmText || ''
  config.cancelText = options.cancelText || ''
  config.showCancel = !!options.showCancel
  config.showClose = options.showClose !== false
  config.closeOnOverlay = !!options.closeOnOverlay
  config.size = options.size || 'md'

  confirmCallback = options.onConfirm || null
  cancelCallback = options.onCancel || null
  closeCallback = options.onClose || null

  log.info('打开通用弹窗', {
    type: config.type,
    size: config.size,
    titleLength: String(config.title).length,
    hasConfirm: typeof confirmCallback === 'function',
    hasCancel: typeof cancelCallback === 'function',
    hasClose: typeof closeCallback === 'function'
  })

  visible.value = true
}

const closeModal = () => {
  log.debug('关闭通用弹窗')
  visible.value = false
  setTimeout(() => {
    resetCallbacks()
  }, 300)
}

const handleConfirm = () => {
  log.debug('通用弹窗确认回调触发')
  if (typeof confirmCallback === 'function') {
    try {
      confirmCallback()
    } catch (e) {
      log.error('通用弹窗确认回调执行出错', e)
    }
  }
}

const handleCancel = () => {
  log.debug('通用弹窗取消回调触发')
  if (typeof cancelCallback === 'function') {
    try {
      cancelCallback()
    } catch (e) {
      log.error('通用弹窗取消回调执行出错', e)
    }
  }
}

const handleClose = () => {
  log.debug('通用弹窗关闭回调触发')
  if (typeof closeCallback === 'function') {
    try {
      closeCallback()
    } catch (e) {
      log.error('通用弹窗关闭回调执行出错', e)
    }
  }
}

const showError = (message, options = {}) => {
  log.debug('显示错误弹窗', { messageLength: message ? String(message).length : 0 })
  return openModal({ ...options, type: 'error', message })
}

const showWarning = (message, options = {}) => {
  log.debug('显示警告弹窗', { messageLength: message ? String(message).length : 0 })
  return openModal({ ...options, type: 'warning', message })
}

const showInfo = (message, options = {}) => {
  log.debug('显示信息弹窗', { messageLength: message ? String(message).length : 0 })
  return openModal({ ...options, type: 'info', message })
}

const showSuccess = (message, options = {}) => {
  log.debug('显示成功弹窗', { messageLength: message ? String(message).length : 0 })
  return openModal({ ...options, type: 'success', message })
}

const showConfirm = (message, options = {}) => {
  log.debug('显示确认弹窗', { messageLength: message ? String(message).length : 0 })
  return openModal({ ...options, type: 'warning', message, showCancel: true })
}

// ============== 输入弹窗 (PromptModal) ==============
const promptVisible = ref(false)
const promptConfig = reactive({
  title: '',
  message: '',
  placeholder: '',
  defaultValue: '',
  confirmText: '',
  cancelText: '',
  showClose: true,
  closeOnOverlay: false,
  size: 'md',
  inputType: 'text',
  textareaRows: 4,
  showCounter: true,
  required: true,
  minLength: 0,
  maxLength: 0,
  pattern: null,
  patternError: ''
})

let promptConfirmCallback = null
let promptCancelCallback = null
let promptCloseCallback = null

const showPrompt = (options = {}) => {
  if (options.inputType && !['text', 'textarea', 'number', 'password', 'email'].includes(options.inputType)) {
    log.warn(`未知输入框类型：${options.inputType}`)
  }

  promptConfig.title = options.title || ''
  promptConfig.message = options.message || ''
  promptConfig.placeholder = options.placeholder || ''
  promptConfig.defaultValue = options.defaultValue || ''
  promptConfig.confirmText = options.confirmText || ''
  promptConfig.cancelText = options.cancelText || ''
  promptConfig.showClose = options.showClose !== false
  promptConfig.closeOnOverlay = !!options.closeOnOverlay
  promptConfig.size = options.size || 'md'
  promptConfig.inputType = options.inputType || 'text'
  promptConfig.textareaRows = options.textareaRows || 4
  promptConfig.showCounter = options.showCounter !== false
  promptConfig.required = options.required !== false
  promptConfig.minLength = options.minLength || 0
  promptConfig.maxLength = options.maxLength || 0
  promptConfig.pattern = options.pattern || null
  promptConfig.patternError = options.patternError || ''

  promptConfirmCallback = options.onConfirm || null
  promptCancelCallback = options.onCancel || null
  promptCloseCallback = options.onClose || null

  log.info('打开输入弹窗', {
    inputType: promptConfig.inputType,
    size: promptConfig.size,
    titleLength: String(promptConfig.title).length,
    required: promptConfig.required,
    hasDefaultValue: !!promptConfig.defaultValue,
    hasConfirm: typeof promptConfirmCallback === 'function'
  })

  promptVisible.value = true
}

const handlePromptConfirm = (value) => {
  log.info('输入弹窗确认', {
    valueLength: value ? String(value).length : 0,
    hasCallback: typeof promptConfirmCallback === 'function'
  })
  if (typeof promptConfirmCallback === 'function') {
    try {
      promptConfirmCallback(value)
    } catch (e) {
      log.error('输入弹窗确认回调出错', e)
    }
  }
  setTimeout(() => {
    promptConfirmCallback = null
    promptCancelCallback = null
    promptCloseCallback = null
  }, 300)
}

const handlePromptCancel = () => {
  log.debug('输入弹窗取消')
  if (typeof promptCancelCallback === 'function') {
    try {
      promptCancelCallback()
    } catch (e) {
      log.error('输入弹窗取消回调出错', e)
    }
  }
}

const handlePromptClose = () => {
  log.debug('输入弹窗关闭')
  if (typeof promptCloseCallback === 'function') {
    try {
      promptCloseCallback()
    } catch (e) {
      log.error('输入弹窗关闭回调出错', e)
    }
  }
}

// ============== 加载弹窗 (LoadingModal) ==============
const loadingVisible = ref(false)
const loadingConfig = reactive({
  title: '',
  message: '',
  cancelable: false,
  cancelText: '',
  transparent: false,
  size: 'md',
  percent: -1
})

let loadingCancelCallback = null

const showLoading = (options = {}) => {
  if (typeof options.percent === 'number' && (options.percent < -1 || options.percent > 100)) {
    log.warn(`加载进度超出范围：${options.percent}`)
  }

  loadingConfig.title = options.title || ''
  loadingConfig.message = options.message || ''
  loadingConfig.cancelable = !!options.cancelable
  loadingConfig.cancelText = options.cancelText || ''
  loadingConfig.transparent = !!options.transparent
  loadingConfig.size = options.size || 'md'
  loadingConfig.percent = typeof options.percent === 'number' ? options.percent : -1

  loadingCancelCallback = options.onCancel || null

  log.info('显示加载弹窗', {
    size: loadingConfig.size,
    cancelable: loadingConfig.cancelable,
    percent: loadingConfig.percent,
    titleLength: String(loadingConfig.title).length
  })

  loadingVisible.value = true
}

const updateLoading = (updates = {}) => {
  if ('title' in updates) loadingConfig.title = updates.title
  if ('message' in updates) loadingConfig.message = updates.message
  if ('percent' in updates) loadingConfig.percent = updates.percent
  if ('cancelable' in updates) loadingConfig.cancelable = updates.cancelable
  log.debug('更新加载弹窗', { keys: Object.keys(updates), percent: loadingConfig.percent })
}

const hideLoading = () => {
  log.debug('隐藏加载弹窗')
  loadingVisible.value = false
  setTimeout(() => {
    loadingCancelCallback = null
  }, 300)
}

const handleLoadingCancel = () => {
  log.debug('加载弹窗取消')
  if (typeof loadingCancelCallback === 'function') {
    try {
      loadingCancelCallback()
    } catch (e) {
      log.error('加载弹窗取消回调出错', e)
    }
  }
}

// ============== 导出 ==============
export {
  // 通用对话框
  visible,
  config,
  openModal,
  closeModal,
  handleConfirm,
  handleCancel,
  handleClose,
  showError,
  showWarning,
  showInfo,
  showSuccess,
  showConfirm,
  // 输入弹窗
  promptVisible,
  promptConfig,
  showPrompt,
  handlePromptConfirm,
  handlePromptCancel,
  handlePromptClose,
  // 加载弹窗
  loadingVisible,
  loadingConfig,
  showLoading,
  updateLoading,
  hideLoading,
  handleLoadingCancel
}

export default {
  // 通用对话框
  open: openModal,
  close: closeModal,
  error: showError,
  warning: showWarning,
  info: showInfo,
  success: showSuccess,
  confirm: showConfirm,
  // 输入弹窗
  prompt: showPrompt,
  // 加载弹窗
  loading: showLoading,
  updateLoading,
  hideLoading
}
