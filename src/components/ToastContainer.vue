<template>
  <Teleport to="body">
    <div class="toast-container" :class="positionClass">
      <TransitionGroup name="toast-list">
        <div
          v-for="item in toasts"
          :key="item.id"
          class="toast-item"
          :class="[`toast-${item.type}`, { clickable: item.onClick }]"
          :style="{ '--delay': `${item.duration}ms` }"
          @click="handleClick(item)"
          @mouseenter="pauseTimer(item.id)"
          @mouseleave="resumeTimer(item.id)"
        >
          <div class="toast-icon" :class="`icon-${item.type}`">
            <svg v-if="item.type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <svg v-else-if="item.type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <svg v-else-if="item.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <svg v-else-if="item.type === 'loading'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <div class="toast-content">
            <div v-if="item.title" class="toast-title">{{ item.title }}</div>
            <div v-if="item.message" class="toast-message">{{ item.message }}</div>
          </div>
          <button
            v-if="item.closeable !== false"
            class="toast-close"
            @click.stop="dismiss(item.id)"
            :aria-label="t('modal.close')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="toast-progress" :class="`prog-${item.type}`"></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue'
import { t } from '../utils/i18n'
import { toasts, dismiss, pauseTimer, resumeTimer, position as _position } from '../utils/toast'

const position = computed(() => _position.value)

const positionClass = computed(() => {
  const map = {
    'top-right': 'pos-top-right',
    'top-left': 'pos-top-left',
    'top-center': 'pos-top-center',
    'bottom-right': 'pos-bottom-right',
    'bottom-left': 'pos-bottom-left',
    'bottom-center': 'pos-bottom-center',
    'center': 'pos-center'
  }
  return map[position.value] || 'pos-top-right'
})

const handleClick = (item) => {
  if (typeof item.onClick === 'function') {
    try {
      item.onClick()
    } catch (e) {
      console.error('[ToastContainer/handleClick] 点击回调出错:', e)
    }
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 20000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast-container > * {
  pointer-events: auto;
}

.pos-top-right {
  top: 24px;
  right: 24px;
}

.pos-top-left {
  top: 24px;
  left: 24px;
}

.pos-top-center {
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
}

.pos-bottom-right {
  bottom: 24px;
  right: 24px;
  flex-direction: column-reverse;
}

.pos-bottom-left {
  bottom: 24px;
  left: 24px;
  flex-direction: column-reverse;
}

.pos-bottom-center {
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
  flex-direction: column-reverse;
}

.pos-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  align-items: center;
}

.toast-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 280px;
  max-width: 400px;
  padding: 14px 16px;
  padding-right: 40px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.06);
  border-left: 4px solid transparent;
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.toast-item.clickable {
  cursor: pointer;
}

.toast-item.clickable:hover {
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.16),
    0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.toast-item.toast-error {
  border-left-color: #ef4444;
}

.toast-item.toast-warning {
  border-left-color: #f59e0b;
}

.toast-item.toast-info {
  border-left-color: #3b82f6;
}

.toast-item.toast-success {
  border-left-color: #10b981;
}

.toast-item.toast-loading {
  border-left-color: #8b5cf6;
}

.toast-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-icon svg {
  width: 16px;
  height: 16px;
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

.icon-loading {
  background: rgba(139, 92, 246, 0.12);
  color: #8b5cf6;
}

.icon-loading svg {
  animation: toastSpin 0.8s linear infinite;
}

@keyframes toastSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
  margin-bottom: 2px;
}

.toast-message {
  font-size: 13px;
  line-height: 1.5;
  color: #4b5563;
  word-break: break-word;
}

.toast-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  transition: all 0.15s ease;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #4b5563;
}

.toast-close svg {
  width: 14px;
  height: 14px;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  transform-origin: left center;
  animation: toastProgress var(--delay, 3000ms) linear forwards;
}

@keyframes toastProgress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

.prog-error { background: #ef4444; }
.prog-warning { background: #f59e0b; }
.prog-info { background: #3b82f6; }
.prog-success { background: #10b981; }
.prog-loading { background: #8b5cf6; }

/* 深色模式 */
html.dark .toast-item {
  background: #1a1a2e;
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.3);
}

html.dark .toast-title {
  color: #f0f0f0;
}

html.dark .toast-message {
  color: #bbb;
}

html.dark .toast-close {
  color: #6b7280;
}

html.dark .toast-close:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #d1d5db;
}

/* Toast 列表动画 */
.toast-list-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-list-leave-active {
  transition: all 0.25s ease;
  position: absolute;
}

.pos-top-right .toast-list-enter-from,
.pos-bottom-right .toast-list-enter-from {
  opacity: 0;
  transform: translateX(60px) scale(0.9);
}

.pos-top-left .toast-list-enter-from,
.pos-bottom-left .toast-list-enter-from {
  opacity: 0;
  transform: translateX(-60px) scale(0.9);
}

.pos-top-center .toast-list-enter-from,
.pos-center .toast-list-enter-from {
  opacity: 0;
  transform: translateY(-40px) scale(0.9);
}

.pos-bottom-center .toast-list-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(0.9);
}

.pos-top-right .toast-list-leave-to,
.pos-bottom-right .toast-list-leave-to {
  opacity: 0;
  transform: translateX(60px) scale(0.9);
}

.pos-top-left .toast-list-leave-to,
.pos-bottom-left .toast-list-leave-to {
  opacity: 0;
  transform: translateX(-60px) scale(0.9);
}

.pos-top-center .toast-list-leave-to,
.pos-bottom-center .toast-list-leave-to,
.pos-center .toast-list-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

.toast-list-move {
  transition: transform 0.3s ease;
}

@media (max-width: 600px) {
  .pos-top-right,
  .pos-top-left,
  .pos-bottom-right,
  .pos-bottom-left {
    left: 12px;
    right: 12px;
    transform: none;
  }

  .pos-top-right,
  .pos-top-left,
  .pos-top-center {
    top: 12px;
  }

  .pos-bottom-right,
  .pos-bottom-left,
  .pos-bottom-center {
    bottom: 12px;
  }

  .toast-item {
    min-width: 0;
    max-width: 100%;
    width: 100%;
    padding: 12px 14px;
    padding-right: 36px;
    border-radius: 10px;
  }
}
</style>
