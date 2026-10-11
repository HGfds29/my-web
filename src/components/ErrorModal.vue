<template>
  <Teleport to="body">
    <Transition name="modal-overlay">
      <div
        v-if="visible"
        class="modal-overlay"
        @click.self="handleOverlayClick"
      >
        <Transition name="modal-content" appear>
          <div
            v-if="visible"
            class="modal-content"
            :class="[`modal-${type}`, size]"
            role="dialog"
            aria-modal="true"
          >
            <div class="modal-header">
              <div class="modal-icon" :class="`icon-${type}`">
                <svg v-if="type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <svg v-else-if="type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <svg v-else-if="type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
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
import { computed } from 'vue'
import { t } from '../utils/i18n'

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
  emit('close')
  closeModal()
}

const handleConfirm = () => {
  emit('confirm')
  closeModal()
}

const handleCancel = () => {
  emit('cancel')
  closeModal()
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    emit('close')
    closeModal()
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-overlay.modal-overlay-enter-active,
.modal-overlay.modal-overlay-leave-active {
  transition: background 0.3s ease, backdrop-filter 0.3s ease;
}

.modal-overlay.modal-overlay-enter-from,
.modal-overlay.modal-overlay-leave-to {
  background: rgba(0, 0, 0, 0);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
}

.modal-content {
  position: relative;
  background: #ffffff;
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

.modal-content.modal-content-enter-active,
.modal-content.modal-content-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-content.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.85) translateY(20px);
}

.modal-content.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
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

.modal-icon svg {
  width: 26px;
  height: 26px;
}

.icon-error {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.icon-warning {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
}

.icon-info {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}

.icon-success {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.modal-title-wrap {
  flex: 1;
  min-width: 0;
  padding-top: 10px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
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
  color: #9ca3af;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #4b5563;
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
  color: #4b5563;
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
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.modal-btn-cancel:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.modal-btn-confirm {
  color: #ffffff;
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
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.btn-error:hover {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.btn-warning:hover {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}

.btn-info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.btn-info:hover {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.btn-success:hover {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
}

/* 深色模式 */
html.dark .modal-content {
  background: #1a1a2e;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.06) inset;
}

html.dark .modal-title {
  color: #f0f0f0;
}

html.dark .modal-message {
  color: #bbb;
}

html.dark .modal-close {
  color: #6b7280;
}

html.dark .modal-close:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #d1d5db;
}

html.dark .modal-btn-cancel {
  background: #252540;
  color: #bbb;
  border-color: #2d2d44;
}

html.dark .modal-btn-cancel:hover {
  background: #2d2d44;
  border-color: #383858;
}

html.dark .icon-error {
  background: rgba(239, 68, 68, 0.18);
}

html.dark .icon-warning {
  background: rgba(245, 158, 11, 0.18);
}

html.dark .icon-info {
  background: rgba(59, 130, 246, 0.18);
}

html.dark .icon-success {
  background: rgba(16, 185, 129, 0.18);
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

  .modal-icon svg {
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
