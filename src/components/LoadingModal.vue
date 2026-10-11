<template>
  <Teleport to="body">
    <Transition name="loading-overlay">
      <div
        v-if="visible"
        class="loading-overlay"
        :class="{ 'bg-transparent': transparent }"
      >
        <Transition name="loading-box" appear>
          <div v-if="visible" class="loading-box" :class="size">
            <div class="spinner-wrap">
              <svg class="spinner" viewBox="0 0 50 50">
                <circle class="spinner-bg" cx="25" cy="25" r="20" fill="none"/>
                <circle class="spinner-fg" cx="25" cy="25" r="20" fill="none"/>
              </svg>
              <div v-if="showPercent" class="spinner-percent">{{ percent }}%</div>
            </div>
            <div class="loading-content">
              <h4 class="loading-title">{{ resolvedTitle }}</h4>
              <p v-if="message" class="loading-message">{{ message }}</p>
              <div v-if="showPercent" class="loading-bar">
                <div class="loading-bar-inner" :style="{ width: `${percent}%` }"></div>
              </div>
            </div>
            <button
              v-if="cancelable"
              class="loading-cancel"
              @click="handleCancel"
            >
              {{ resolvedCancelText }}
            </button>
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
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  cancelable: { type: Boolean, default: false },
  cancelText: { type: String, default: '' },
  transparent: { type: Boolean, default: false },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  percent: { type: Number, default: -1 }
})

const emit = defineEmits(['cancel', 'update:visible'])

const showPercent = computed(() => props.percent >= 0 && props.percent <= 100)

const resolvedTitle = computed(() => {
  if (props.title) return props.title
  return showPercent.value ? t('modal.loadingProgress') : t('modal.loading')
})
const resolvedCancelText = computed(() => props.cancelText || t('modal.cancel'))

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  z-index: 30000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-overlay.bg-transparent {
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(1px);
}

.loading-overlay.loading-overlay-enter-active,
.loading-overlay.loading-overlay-leave-active {
  transition: background 0.25s ease;
}
.loading-overlay.loading-overlay-enter-from,
.loading-overlay.loading-overlay-leave-to {
  background: rgba(0, 0, 0, 0);
  backdrop-filter: blur(0px);
}

.loading-box {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.22);
  padding: 30px 28px 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  min-width: 260px;
  max-width: 360px;
  width: 100%;
}
.loading-box.sm { padding: 22px 18px 18px; min-width: 200px; }
.loading-box.lg { padding: 38px 34px 32px; min-width: 320px; max-width: 440px; }

.loading-box.loading-box-enter-active,
.loading-box.loading-box-leave-active {
  transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.loading-box.loading-box-enter-from {
  opacity: 0;
  transform: scale(0.85);
}
.loading-box.loading-box-leave-to {
  opacity: 0;
  transform: scale(0.92);
}

.spinner-wrap {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.loading-box.sm .spinner-wrap { width: 48px; height: 48px; }
.loading-box.lg .spinner-wrap { width: 84px; height: 84px; }

.spinner {
  width: 100%;
  height: 100%;
  animation: spinRotate 1.6s linear infinite;
}

@keyframes spinRotate {
  to { transform: rotate(360deg); }
}

.spinner-bg {
  stroke-width: 4;
  stroke: #e5e7eb;
}

.spinner-fg {
  stroke-width: 4;
  stroke: url(#spinnerGradient);
  stroke: #3b82f6;
  stroke-linecap: round;
  stroke-dasharray: 90 130;
}

.spinner-percent {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

.loading-content {
  text-align: center;
  width: 100%;
}

.loading-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px;
  line-height: 1.4;
}
.loading-box.sm .loading-title { font-size: 14px; }
.loading-box.lg .loading-title { font-size: 18px; }

.loading-message {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.loading-bar {
  margin-top: 14px;
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.loading-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.loading-cancel {
  margin-top: 4px;
  height: 36px;
  padding: 0 22px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #4b5563;
  transition: all 0.15s ease;
  font-family: inherit;
}
.loading-cancel:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

/* 深色模式 */
html.dark .loading-box {
  background: #1a1a2e;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55);
}
html.dark .spinner-bg { stroke: #2d2d44; }
html.dark .spinner-percent { color: #e0e0e0; }
html.dark .loading-title { color: #f0f0f0; }
html.dark .loading-message { color: #888; }
html.dark .loading-bar { background: #2d2d44; }
html.dark .loading-cancel {
  background: #252540;
  color: #bbb;
  border-color: #2d2d44;
}
html.dark .loading-cancel:hover {
  background: #2d2d44;
}

@media (max-width: 600px) {
  .loading-box { min-width: 0; padding: 24px 20px 20px; }
  .spinner-wrap { width: 52px; height: 52px; }
  .loading-title { font-size: 15px; }
}
</style>
