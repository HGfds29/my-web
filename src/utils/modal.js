import { ref, reactive } from 'vue'

console.log('[modal.js] 弹窗控制模块初始化')

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
  console.log(`[modal/openModal] 打开弹窗，类型: ${options.type || 'info'}`)
  console.log('[modal/openModal] 配置:', JSON.stringify(options))

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

  visible.value = true
}

const closeModal = () => {
  console.log('[modal/closeModal] 关闭弹窗')
  visible.value = false
  setTimeout(() => {
    resetCallbacks()
  }, 300)
}

const handleConfirm = () => {
  console.log('[modal/handleConfirm] 确认回调触发')
  if (typeof confirmCallback === 'function') {
    try {
      confirmCallback()
    } catch (e) {
      console.error('[modal/handleConfirm] 确认回调执行出错:', e)
    }
  }
}

const handleCancel = () => {
  console.log('[modal/handleCancel] 取消回调触发')
  if (typeof cancelCallback === 'function') {
    try {
      cancelCallback()
    } catch (e) {
      console.error('[modal/handleCancel] 取消回调执行出错:', e)
    }
  }
}

const handleClose = () => {
  console.log('[modal/handleClose] 关闭回调触发')
  if (typeof closeCallback === 'function') {
    try {
      closeCallback()
    } catch (e) {
      console.error('[modal/handleClose] 关闭回调执行出错:', e)
    }
  }
}

const showError = (message, options = {}) => {
  console.log('[modal/showError] 显示错误弹窗')
  return openModal({ ...options, type: 'error', message })
}

const showWarning = (message, options = {}) => {
  console.log('[modal/showWarning] 显示警告弹窗')
  return openModal({ ...options, type: 'warning', message })
}

const showInfo = (message, options = {}) => {
  console.log('[modal/showInfo] 显示信息弹窗')
  return openModal({ ...options, type: 'info', message })
}

const showSuccess = (message, options = {}) => {
  console.log('[modal/showSuccess] 显示成功弹窗')
  return openModal({ ...options, type: 'success', message })
}

const showConfirm = (message, options = {}) => {
  console.log('[modal/showConfirm] 显示确认弹窗')
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
  console.log('[modal/showPrompt] 显示输入弹窗')
  console.log('[modal/showPrompt] 配置:', JSON.stringify(options))

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

  promptVisible.value = true
}

const handlePromptConfirm = (value) => {
  console.log(`[modal/handlePromptConfirm] 输入确认，值: ${value}`)
  if (typeof promptConfirmCallback === 'function') {
    try {
      promptConfirmCallback(value)
    } catch (e) {
      console.error('[modal/handlePromptConfirm] 回调出错:', e)
    }
  }
  setTimeout(() => {
    promptConfirmCallback = null
    promptCancelCallback = null
    promptCloseCallback = null
  }, 300)
}

const handlePromptCancel = () => {
  console.log('[modal/handlePromptCancel] 输入取消')
  if (typeof promptCancelCallback === 'function') {
    try {
      promptCancelCallback()
    } catch (e) {
      console.error('[modal/handlePromptCancel] 回调出错:', e)
    }
  }
}

const handlePromptClose = () => {
  console.log('[modal/handlePromptClose] 输入弹窗关闭')
  if (typeof promptCloseCallback === 'function') {
    try {
      promptCloseCallback()
    } catch (e) {
      console.error('[modal/handlePromptClose] 回调出错:', e)
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
  console.log('[modal/showLoading] 显示加载弹窗')
  console.log('[modal/showLoading] 配置:', JSON.stringify(options))

  loadingConfig.title = options.title || ''
  loadingConfig.message = options.message || ''
  loadingConfig.cancelable = !!options.cancelable
  loadingConfig.cancelText = options.cancelText || ''
  loadingConfig.transparent = !!options.transparent
  loadingConfig.size = options.size || 'md'
  loadingConfig.percent = typeof options.percent === 'number' ? options.percent : -1

  loadingCancelCallback = options.onCancel || null

  loadingVisible.value = true
}

const updateLoading = (updates = {}) => {
  console.log('[modal/updateLoading] 更新加载弹窗:', JSON.stringify(updates))
  if ('title' in updates) loadingConfig.title = updates.title
  if ('message' in updates) loadingConfig.message = updates.message
  if ('percent' in updates) loadingConfig.percent = updates.percent
  if ('cancelable' in updates) loadingConfig.cancelable = updates.cancelable
}

const hideLoading = () => {
  console.log('[modal/hideLoading] 隐藏加载弹窗')
  loadingVisible.value = false
  setTimeout(() => {
    loadingCancelCallback = null
  }, 300)
}

const handleLoadingCancel = () => {
  console.log('[modal/handleLoadingCancel] 加载取消')
  if (typeof loadingCancelCallback === 'function') {
    try {
      loadingCancelCallback()
    } catch (e) {
      console.error('[modal/handleLoadingCancel] 回调出错:', e)
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
