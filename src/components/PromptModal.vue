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
            :class="size"
            role="dialog"
            aria-modal="true"
          >
            <div class="modal-header">
              <div class="modal-icon icon-info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div class="modal-title-wrap">
                <h3 class="modal-title">{{ resolvedTitle }}</h3>
                <p v-if="message" class="modal-desc">{{ message }}</p>
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

            <div class="modal-body">
              <div class="input-wrap" :class="{ focused: isFocused, 'has-error': inputError }">
                <input
                  v-if="inputType !== 'textarea'"
                  ref="inputRef"
                  v-model="inputValue"
                  :type="inputType"
                  :placeholder="resolvedPlaceholder"
                  class="prompt-input"
                  maxlength="200"
                  @focus="isFocused = true"
                  @blur="handleBlur"
                  @keyup.enter="handleConfirm"
                  @keyup.esc="handleClose"
                />
                <textarea
                  v-else
                  ref="inputRef"
                  v-model="inputValue"
                  :placeholder="resolvedPlaceholder"
                  class="prompt-input textarea"
                  :rows="textareaRows"
                  maxlength="1000"
                  @focus="isFocused = true"
                  @blur="handleBlur"
                  @keyup.esc="handleClose"
                ></textarea>
                <div v-if="showCounter" class="input-counter">
                  {{ inputValue.length }} / {{ inputType === 'textarea' ? 1000 : 200 }}
                </div>
                <div v-if="inputError" class="input-error">{{ inputError }}</div>
              </div>
            </div>

            <div class="modal-footer">
              <button
                class="modal-btn modal-btn-cancel"
                @click="handleCancel"
              >
                {{ resolvedCancelText }}
              </button>
              <button
                class="modal-btn modal-btn-confirm btn-info"
                :disabled="!!inputError"
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
import { ref, computed, watch, nextTick } from 'vue'
import { t } from '../utils/i18n'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  defaultValue: { type: String, default: '' },
  confirmText: { type: String, default: '' },
  cancelText: { type: String, default: '' },
  showClose: { type: Boolean, default: true },
  closeOnOverlay: { type: Boolean, default: false },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  inputType: { type: String, default: 'text', validator: (v) => ['text', 'textarea', 'number', 'password', 'email'].includes(v) },
  textareaRows: { type: Number, default: 4 },
  showCounter: { type: Boolean, default: true },
  required: { type: Boolean, default: true },
  minLength: { type: Number, default: 0 },
  maxLength: { type: Number, default: 0 },
  pattern: { type: [RegExp, String], default: null },
  patternError: { type: String, default: '' }
})

const emit = defineEmits(['confirm', 'cancel', 'close', 'update:visible'])

const inputRef = ref(null)
const inputValue = ref(props.defaultValue || '')
const isFocused = ref(false)
const inputError = ref('')

const resolvedTitle = computed(() => props.title || t('modal.titlePrompt'))
const resolvedPlaceholder = computed(() => props.placeholder || t('modal.promptPlaceholder'))
const resolvedConfirmText = computed(() => props.confirmText || t('modal.confirm'))
const resolvedCancelText = computed(() => props.cancelText || t('modal.cancel'))

const validate = () => {
  const val = inputValue.value
  if (props.required && !val.trim()) {
    inputError.value = t('modal.promptRequired')
    return false
  }
  if (props.minLength && val.length < props.minLength) {
    inputError.value = t('modal.promptMinLength', { n: props.minLength })
    return false
  }
  if (props.maxLength && val.length > props.maxLength) {
    inputError.value = t('modal.promptMaxLength', { n: props.maxLength })
    return false
  }
  if (props.pattern) {
    const reg = typeof props.pattern === 'string' ? new RegExp(props.pattern) : props.pattern
    if (!reg.test(val)) {
      inputError.value = props.patternError || t('modal.promptPatternError')
      return false
    }
  }
  inputError.value = ''
  return true
}

const handleBlur = () => {
  isFocused.value = false
  if (inputValue.value) validate()
}

const closeModal = () => {
  emit('update:visible', false)
}

const handleConfirm = () => {
  if (!validate()) return
  emit('confirm', inputValue.value)
  closeModal()
}

const handleCancel = () => {
  emit('cancel')
  closeModal()
}

const handleClose = () => {
  emit('close')
  closeModal()
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    emit('close')
    closeModal()
  }
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      inputValue.value = props.defaultValue || ''
      inputError.value = ''
      nextTick(() => {
        inputRef.value?.focus()
      })
    }
  }
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-overlay.modal-overlay-enter-active,
.modal-overlay.modal-overlay-leave-active {
  transition: background 0.3s ease;
}
.modal-overlay.modal-overlay-enter-from,
.modal-overlay.modal-overlay-leave-to {
  background: rgba(0, 0, 0, 0);
}

.modal-content {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 460px;
  overflow: hidden;
}
.modal-content.sm { max-width: 380px; }
.modal-content.lg { max-width: 560px; }

.modal-content.modal-content-enter-active,
.modal-content.modal-content-leave-active {
  transition: opacity 0.25s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
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
  padding: 28px 28px 12px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.modal-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}
.modal-icon svg { width: 22px; height: 22px; }

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

.modal-desc {
  margin-top: 6px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
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
.modal-close svg { width: 20px; height: 20px; }

.modal-body {
  padding: 8px 28px 0;
}

.input-wrap {
  position: relative;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  transition: all 0.2s ease;
  padding: 0;
  background: #fafafa;
}

.input-wrap.focused {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.input-wrap.has-error {
  border-color: #ef4444;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.08);
}

.prompt-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 12px 14px;
  font-size: 14px;
  color: #1f2937;
  font-family: inherit;
  line-height: 1.5;
  border-radius: 8px;
}

.prompt-input.textarea {
  resize: vertical;
  min-height: 100px;
  padding-top: 12px;
  padding-bottom: 12px;
}

.prompt-input::placeholder {
  color: #9ca3af;
}

.input-counter {
  position: absolute;
  bottom: 6px;
  right: 10px;
  font-size: 11px;
  color: #9ca3af;
  pointer-events: none;
}

.input-wrap.has-error .input-counter {
  bottom: 26px;
}

.input-error {
  padding: 4px 14px 8px;
  font-size: 12px;
  color: #ef4444;
  line-height: 1.4;
}

.modal-footer {
  padding: 22px 28px 28px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-btn {
  height: 40px;
  padding: 0 22px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  font-family: inherit;
}

.modal-btn-cancel {
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}
.modal-btn-cancel:hover {
  background: #e5e7eb;
}

.modal-btn-confirm {
  color: #ffffff;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}
.modal-btn-confirm:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
}
.modal-btn-confirm:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* 深色模式 */
html.dark .modal-content {
  background: #1a1a2e;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
html.dark .modal-title { color: #f0f0f0; }
html.dark .modal-desc { color: #888; }
html.dark .modal-close { color: #6b7280; }
html.dark .modal-close:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #d1d5db;
}
html.dark .input-wrap {
  border-color: #2d2d44;
  background: #15152a;
}
html.dark .input-wrap.focused {
  border-color: #3b82f6;
  background: #121226;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}
html.dark .input-wrap.has-error {
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12);
}
html.dark .prompt-input { color: #e0e0e0; }
html.dark .prompt-input::placeholder { color: #555; }
html.dark .modal-btn-cancel {
  background: #252540;
  color: #bbb;
  border-color: #2d2d44;
}
html.dark .modal-btn-cancel:hover {
  background: #2d2d44;
}

@media (max-width: 600px) {
  .modal-header { padding: 22px 18px 10px; gap: 12px; }
  .modal-icon { width: 40px; height: 40px; }
  .modal-icon svg { width: 20px; height: 20px; }
  .modal-title { font-size: 16px; }
  .modal-body { padding: 6px 18px 0; }
  .modal-footer { padding: 18px 18px 22px; }
}
</style>
