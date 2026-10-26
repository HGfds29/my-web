<template>
  <Teleport to="body">
    <Transition name="modal-overlay" appear :duration="{ enter: 300, leave: 360 }">
      <div
        v-if="visible"
        class="modal-overlay"
        @click.self="handleOverlayClick"
      >
        <Transition name="modal-content" appear :duration="{ enter: 350, leave: 300 }">
          <div
            v-if="visible"
            class="modal-content"
            :class="[`modal-${type}`, size]"
            role="dialog"
            aria-modal="true"
          >
            <div class="modal-header">
              <div class="modal-icon" :class="`icon-${type}`">
                <AppIcon :name="typeIcon" :size="26" />
              </div>
              <div class="modal-title-wrap">
                <h3 class="modal-title">{{ resolvedTitle }}</h3>
              </div>
              <button
                v-if="showClose"
                class="modal-close"
                @click="handleClose"
                :aria-label="t('modal.close')"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div v-if="message" class="modal-body">
              <p class="modal-message">{{ resolvedMessage }}</p>
            </div>

            <div class="modal-footer">
              <button
                v-if="showCancel"
                class="modal-btn modal-btn-cancel"
                @click="handleCancel"
              >
                {{ resolvedCancelText }}
              </button>
              <button
                class="modal-btn modal-btn-confirm"
                :class="`btn-${type}`"
                @click="handleConfirm"
              >
                {{ resolvedConfirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue'
import { t } from '../utils/i18n'
import { createLogger } from '../utils/logger'
import AppIcon from './AppIcon.vue'

const log = createLogger('ErrorModal')

log.info('通用对话框组件已初始化（按类型渲染图标与按钮）')

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info',
    validator: (val) => ['error', 'warning', 'info', 'success'].includes(val)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: ''
  },
  cancelText: {
    type: String,
    default: ''
  },
  showCancel: {
    type: Boolean,
    default: false
  },
  showClose: {
    type: Boolean,
    default: true
  },
  closeOnOverlay: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['sm', 'md', 'lg'].includes(val)
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close', 'update:visible'])

/** 弹窗类型 → public/svg 下的图标文件名 */
const TYPE_ICONS = {
  error: '报错_caution',
  warning: '警报_alarm',
  success: '邮件发送成功_email-successfully',
  info: '系统_system'
}

const typeIcon = computed(() => TYPE_ICONS[props.type] || TYPE_ICONS.info)

const defaultTitles = {
  error: 'modal.titleError',
  warning: 'modal.titleWarning',
  info: 'modal.titleInfo',
  success: 'modal.titleSuccess'
}

const resolvedTitle = computed(() => {
  if (props.title) return props.title
  return t(defaultTitles[props.type] || 'modal.titleInfo')
})

const resolvedMessage = computed(() => props.message)

const resolvedConfirmText = computed(() => {
  return props.confirmText || t('modal.confirm')
})

const resolvedCancelText = computed(() => {
  return props.cancelText || t('modal.cancel')
})

const closeModal = () => {
  emit('update:visible', false)
}

const handleClose = () => {
  log.debug('点击关闭按钮')
  emit('close')
  closeModal()
}

const handleConfirm = () => {
  log.info('用户确认', { type: props.type, titleLength: String(resolvedTitle.value).length })
  emit('confirm')
  closeModal()
}

const handleCancel = () => {
  log.info('用户取消', { type: props.type })
  emit('cancel')
  closeModal()
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    log.debug('点击遮罩关闭', { type: props.type })
    emit('close')
    closeModal()
  }
}

watch(
  () => props.visible,
  (val) => {
    log.debug(val ? '弹窗显示' : '弹窗关闭', {
      type: props.type,
      size: props.size,
      titleLength: String(resolvedTitle.value).length
    })
  }
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 15, 26, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-overlay.modal-overlay-enter-active {
  transition: background 0.3s ease, backdrop-filter 0.3s ease;
}

/* 退场：遮罩比卡片多留 40ms，避免卡片还没缩完背景就没了 */
.modal-overlay.modal-overlay-leave-active {
  transition: background 0.34s ease, backdrop-filter 0.34s ease;
}

.modal-overlay.modal-overlay-enter-from,
.modal-overlay.modal-overlay-leave-to {
  background: rgba(0, 0, 0, 0);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
}

.modal-content {
  position: relative;
  background: #fff;
  border-radius: 16px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  width: 100%;
  max-width: 440px;
  overflow: hidden;
  transform-origin: center center;
}

.modal-content.sm {
  max-width: 360px;
}

.modal-content.lg {
  max-width: 560px;
}

.modal-content.modal-content-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 卡片退场：这里必须挂在遮罩的过渡类上。
   两层 Transition 绑同一个 v-if 时，退场阶段是「父元素整体移除」，
   子元素自己的 Transition 退场钩子根本不会触发（入场因为父元素先插入、子元素再挂载，所以正常），
   结果就是只有遮罩在淡出、卡片硬消失。改为由遮罩的 leave 类以后代选择器驱动卡片退场。 */
.modal-overlay.modal-overlay-leave-active .modal-content {
  transition:
    opacity 0.26s ease-in,
    transform 0.3s cubic-bezier(0.4, 0, 0.6, 1);
}

.modal-content.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.85) translateY(20px);
}

.modal-overlay.modal-overlay-leave-to .modal-content {
  opacity: 0;
  transform: scale(0.92) translateY(-14px);
}

.modal-header {
  position: relative;
  padding: 28px 28px 16px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.modal-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.modal-content.modal-content-enter-active .modal-icon {
  animation: iconPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}

@keyframes iconPop {
  0% {
    transform: scale(0) rotate(-30deg);
  }
  60% {
    transform: scale(1.15) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

/* 图标颜色由 .icon-* 的 color 决定，尺寸由 AppIcon 的 size 属性决定 */

.icon-error {
  background: rgba(224, 82, 75, 0.12);
  color: #e0524b;
}

.icon-warning {
  background: rgba(217, 147, 43, 0.12);
  color: #d9932b;
}

.icon-info {
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.12);
  color: var(--accent, #42b983);
}

.icon-success {
  background: rgba(79, 192, 141, 0.12);
  color: #4FC08D;
}

.modal-title-wrap {
  flex: 1;
  min-width: 0;
  padding-top: 10px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
  margin: 0;
}

.modal-close {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #555;
  transform: rotate(90deg);
}

.modal-close svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 4px 28px 0;
}

.modal-message {
  font-size: 15px;
  line-height: 1.7;
  color: #555;
  margin: 0;
  word-break: break-word;
}

.modal-footer {
  padding: 24px 28px 28px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-btn {
  height: 42px;
  padding: 0 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-family: inherit;
}

.modal-btn-cancel {
  background: #f5f5f5;
  color: #555;
  border: 1px solid #e8e8e8;
}

.modal-btn-cancel:hover {
  background: #e8e8e8;
  border-color: #ccc;
}

.modal-btn-confirm {
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modal-btn-confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

.modal-btn-confirm:active {
  transform: translateY(0);
}

.btn-error {
  background: linear-gradient(135deg, #e0524b 0%, #c0453f 100%);
}

.btn-error:hover {
  background: linear-gradient(135deg, #e2837c 0%, #e0524b 100%);
}

.btn-warning {
  background: linear-gradient(135deg, #d9932b 0%, #b87a1f 100%);
}

.btn-warning:hover {
  background: linear-gradient(135deg, #e0b064 0%, #d9932b 100%);
}

.btn-info {
  background: linear-gradient(135deg, var(--accent, #42b983) 0%, #2c7a52 100%);
}

.btn-info:hover {
  background: linear-gradient(135deg, #4FC08D 0%, var(--accent, #42b983) 100%);
}

.btn-success {
  background: linear-gradient(135deg, #4FC08D 0%, #3aa876 100%);
}

.btn-success:hover {
  background: linear-gradient(135deg, #6fd3a8 0%, #4FC08D 100%);
}

/* 深色模式 */
html.dark .modal-content {
  background: #1a1a2e;
  box-shadow:
    0 20px 60px rgba(15, 15, 26, 0.55),
    0 0 0 1px rgba(255, 255, 255, 0.06) inset;
}

html.dark .modal-title {
  color: #f0f0f0;
}

html.dark .modal-message {
  color: #bbb;
}

html.dark .modal-close {
  color: #666;
}

html.dark .modal-close:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ccc;
}

html.dark .modal-btn-cancel {
  background: #252540;
  color: #bbb;
  border-color: #2d2d44;
}

html.dark .modal-btn-cancel:hover {
  background: #2d2d44;
  border-color: #23233c;
}

html.dark .icon-error {
  background: rgba(224, 82, 75, 0.18);
}

html.dark .icon-warning {
  background: rgba(217, 147, 43, 0.18);
}

html.dark .icon-info {
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.18);
}

html.dark .icon-success {
  background: rgba(79, 192, 141, 0.18);
}

@media (max-width: 600px) {
  .modal-overlay {
    padding: 12px;
  }

  .modal-header {
    padding: 20px 20px 12px;
    gap: 12px;
  }

  .modal-icon {
    width: 42px;
    height: 42px;
  }

  .modal-icon .app-icon {
    width: 22px;
    height: 22px;
  }

  .modal-title {
    font-size: 16px;
  }

  .modal-body {
    padding: 4px 20px 0;
  }

  .modal-message {
    font-size: 14px;
  }

  .modal-footer {
    padding: 18px 20px 20px;
    gap: 10px;
  }

  .modal-btn {
    height: 40px;
    padding: 0 20px;
    font-size: 13px;
    border-radius: 9px;
  }
}
</style>
