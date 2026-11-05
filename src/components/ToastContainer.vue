<template>
  <Teleport to="body">
    <div
      v-for="group in groups"
      :key="group.key"
      class="toast-container"
      :class="[group.className, { 'has-tarkov': group.hasTarkov }]"
    >
      <TransitionGroup name="toast-list">
        <div
          v-for="item in group.items"
          :key="item.id"
          class="toast-item"
          :class="[`toast-${item.type}`, `toast-skin-${item.skin}`, { clickable: item.onClick, 'tk-no-title': item.skin === 'tarkov' && !item.title, 'tk-banner': item.skin === 'tarkov' && item.title }]"
          :style="{ '--delay': `${item.duration}ms` }"
          @click="handleClick(item)"
          @mouseenter="pauseTimer(item.id)"
          @mouseleave="resumeTimer(item.id)"
        >
          <!-- 塔科夫：单行通知 / 双行任务横幅 -->
          <div v-if="item.skin === 'tarkov'" class="tk-body">
            <template v-if="item.title">
              <div class="tk-banner-star">
                <svg viewBox="0 0 24 24">
                  <path d="M12 1 L14.5 8.5 L22 11 L14.5 13.5 L12 21 L9.5 13.5 L2 11 L9.5 8.5 Z" fill="#D3D3D3"/>
                </svg>
              </div>
              <div class="tk-banner-content">
                <div class="tk-banner-title">{{ item.title }}</div>
                <div class="tk-banner-desc">
                  <span class="tk-banner-text">{{ item.message }}</span>
                  <svg class="tk-blue-check" viewBox="0 0 24 24">
                    <path d="M4 12 L10 18 L20 4"/>
                  </svg>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="tk-icon" :class="`tk-icon-${tkShape(item.type)}`">
                <svg v-if="tkShape(item.type) === 'warn'" viewBox="0 0 24 24">
                  <path d="M12 3.5 L21.5 20 H2.5 Z" :fill="item.type === 'error' ? '#D9382A' : '#A2C63B'" :stroke="item.type === 'error' ? '#D9382A' : '#A2C63B'" stroke-width="1" stroke-linejoin="miter"/>
                  <path d="M11 9 H13 V14 H11 Z M11 16 H13 V18 H11 Z" fill="#121212"/>
                </svg>
                <AppIcon v-else-if="tkShape(item.type) === 'info'" name="报错_caution" :size="18" />
                <svg v-else viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="8" fill="none" stroke="#D3B25B" stroke-width="2.5"/>
                  <path d="M6.5 12 L10.5 16 L20 4" fill="none" stroke="#D3B25B" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter"/>
                </svg>
              </div>
              <div class="tk-single-text">{{ item.message }}</div>
            </template>
          </div>
          <div v-else class="toast-main">
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
import { computed, getCurrentInstance, onMounted, onUnmounted } from 'vue'
import AppIcon from './AppIcon.vue'
import { t } from '../utils/i18n'
import { createLogger } from '../utils/logger'
import {
  toasts,
  dismiss as dismissToast,
  pauseTimer as pauseToastTimer,
  resumeTimer as resumeToastTimer,
  position as _position
} from '../utils/toast'

const log = createLogger('ToastContainer')

log.info('Toast 容器组件已初始化（固定定位 + 列表过渡）')

const POSITION_CLASS = {
  'top-right': 'pos-top-right',
  'top-left': 'pos-top-left',
  'top-center': 'pos-top-center',
  'bottom-right': 'pos-bottom-right',
  'bottom-left': 'pos-bottom-left',
  'bottom-center': 'pos-bottom-center',
  center: 'pos-center'
}

// 不同皮肤自带落点，按位置分组渲染，各组独立做进出场动画
const groups = computed(() => {
  const buckets = new Map()
  toasts.value.forEach((item) => {
    const key = item.position || _position.value
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key).push(item)
  })
  return Array.from(buckets, ([key, items]) => ({
    key,
    className: POSITION_CLASS[key] || 'pos-top-right',
    hasTarkov: items.some((item) => item.skin === 'tarkov'),
    items
  }))
})

// 塔科夫皮肤图标：黄绿/红三角（警告/错误）、绿色感叹号（提示）、金色圆圈（成功）
const tkShape = (type) => {
  if (type === 'warning' || type === 'error') return 'warn'
  if (type === 'info' || type === 'loading') return 'info'
  return 'ok'
}

// 在组件侧补一层交互日志，模板保持原样
const dismiss = (id) => {
  log.debug('点击关闭 Toast', { id })
  dismissToast(id)
}

const pauseTimer = (id) => {
  log.debug('鼠标移入，暂停 Toast 计时', { id })
  pauseToastTimer(id)
}

const resumeTimer = (id) => {
  log.debug('鼠标移出，恢复 Toast 计时', { id })
  resumeToastTimer(id)
}

const handleClick = (item) => {
  log.debug('点击 Toast 内容', { id: item.id, type: item.type, clickable: typeof item.onClick === 'function' })
  if (typeof item.onClick === 'function') {
    try {
      item.onClick()
    } catch (e) {
      log.error('Toast 点击回调出错', e)
    }
  }
}

onMounted(() => {
  log.debug('Toast 容器已挂载', { positionGroups: groups.value.map((group) => group.key) })
})

onUnmounted(() => {
  log.debug('Toast 容器已卸载')
})
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
  flex-direction: column;
  justify-content: flex-end;
}

.pos-bottom-left {
  bottom: 24px;
  left: 24px;
  flex-direction: column;
  justify-content: flex-end;
}

.pos-bottom-center {
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
  flex-direction: column;
  justify-content: flex-end;
}

.pos-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  align-items: center;
}

.toast-item {
  position: relative;
  display: block;
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

.toast-main {
  display: flex;
  align-items: flex-start;
  gap: 12px;
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

/* ===== 轻提示皮肤：无图标底、无左侧色条，浮在内容上的一行小字 ===== */
.toast-skin-light {
  width: 320px;
  min-width: 0;
  max-width: calc(100vw - 32px);
  padding: 9px 32px 9px 12px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-left-width: 1px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.08);
  -webkit-backdrop-filter: blur(14px) saturate(160%);
  backdrop-filter: blur(14px) saturate(160%);
}

.toast-skin-light .toast-main {
  align-items: center;
  gap: 8px;
}

.toast-skin-light .toast-icon {
  width: 18px;
  height: 18px;
  background: none;
}

.toast-skin-light .toast-icon svg {
  width: 15px;
  height: 15px;
}

.toast-skin-light .toast-title {
  font-size: 13px;
  margin-bottom: 0;
}

.toast-skin-light .toast-message {
  font-size: 12.5px;
  color: #6b7280;
}

.toast-skin-light .toast-close {
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
}

.toast-skin-light .toast-progress {
  height: 2px;
  opacity: 0.7;
}

/* 用同等权重覆盖类型色，轻提示不要左侧色条 */
.toast-item.toast-skin-light {
  border-left-color: rgba(255, 255, 255, 0.9);
}

html.dark .toast-skin-light {
  background: rgba(24, 26, 38, 0.78);
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.45);
}

html.dark .toast-item.toast-skin-light {
  border-left-color: rgba(255, 255, 255, 0.14);
}

html.dark .toast-skin-light .toast-message {
  color: #a9adbb;
}

/* 塔科夫通知贴死右下角，条与条之间留 2px */
.pos-bottom-right.has-tarkov {
  bottom: 0;
  right: 0;
  gap: 2px;
  align-items: flex-end;
}

/* ===== 塔科夫皮肤：EFT 风格通知（单行 30px / 双行任务横幅 48px） ===== */
.toast-skin-tarkov {
  width: auto;
  min-width: 440px;
  max-width: calc(100vw - 8px);
  height: 30px;
  display: flex;
  align-items: center;
  padding: 0 26px 0 10px;
  background: rgba(12, 12, 12, 0.9);
  border: none;
  border-radius: 0;
  box-shadow: none;
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
  font-family: "Oswald", "Rajdhani", "SimHei", "Microsoft YaHei", sans-serif;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
}

.toast-item.toast-skin-tarkov {
  border-left-color: transparent;
}

.toast-item.toast-skin-tarkov.toast-warning {
  background: rgba(12, 12, 12, 0.9);
}

.toast-item.toast-skin-tarkov.toast-success {
  background: rgba(28, 32, 22, 0.85);
}

.toast-item.toast-skin-tarkov.toast-error {
  background: rgba(15, 5, 5, 0.9);
}

/* 塔科夫皮肤不显示进度条 */
.toast-skin-tarkov .toast-progress {
  display: none;
}

.tk-body {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
}

/* 左侧图标：黄绿/红三角警告、金色圆圈勾选 */
.tk-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: 8px;
  flex-shrink: 0;
}

.tk-icon svg {
  width: 18px;
  height: 18px;
  display: block;
  overflow: visible;
}

.tk-icon-warn svg {
  filter: drop-shadow(0 0 2px rgba(162, 198, 59, 0.9)) drop-shadow(0 0 5px rgba(162, 198, 59, 0.4));
}

.tk-icon-info {
  color: #A2C63B;
  filter: drop-shadow(0 0 2px rgba(162, 198, 59, 0.9)) drop-shadow(0 0 5px rgba(162, 198, 59, 0.4));
}

.toast-item.toast-error .tk-icon-warn svg {
  filter: drop-shadow(0 0 2px rgba(217, 56, 42, 0.9)) drop-shadow(0 0 5px rgba(217, 56, 42, 0.4));
}

.tk-icon-ok svg {
  filter: drop-shadow(0 0 2px rgba(211, 178, 91, 0.9)) drop-shadow(0 0 5px rgba(211, 178, 91, 0.4));
}

/* 右侧单行文本：内容由调用方传入 */
.tk-single-text {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff;
}

/* 双行任务横幅：左侧斜切缺口 + 深色渐变底 */
.toast-item.toast-skin-tarkov.tk-banner {
  height: 48px;
  min-width: 520px;
  padding: 0 26px 0 22px;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 16px 50%);
  background: linear-gradient(103deg, #050505 46px, rgba(28, 28, 28, 0.9) 46.5px);
}

.tk-banner-star {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  margin-right: 10px;
  flex-shrink: 0;
}

.tk-banner-star svg {
  width: 22px;
  height: 22px;
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.6));
}

.tk-banner-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-width: 0;
  gap: 2px;
}

.tk-banner-title {
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: #B8A780;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.9);
}

.tk-banner-desc {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: #fff;
}

.tk-banner-text {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tk-blue-check {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  fill: none;
  stroke: #00E5FF;
  stroke-width: 4;
  stroke-linecap: square;
  stroke-linejoin: miter;
  filter: drop-shadow(0 0 2px rgba(0, 229, 255, 0.9)) drop-shadow(0 0 5px rgba(0, 229, 255, 0.5));
}

.toast-skin-tarkov .toast-close {
  top: 50%;
  right: 6px;
  width: 18px;
  height: 18px;
  transform: translateY(-50%);
  color: #8b887c;
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.1s linear;
}

.toast-skin-tarkov:hover .toast-close {
  opacity: 1;
}

.toast-skin-tarkov .toast-close svg {
  width: 11px;
  height: 11px;
}

.toast-skin-tarkov .toast-close:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #e6e2d5;
}

/* 深色模式保持同一套配色 */
html.dark .toast-skin-tarkov {
  background: rgba(12, 12, 12, 0.9);
}

html.dark .toast-item.toast-skin-tarkov.toast-success {
  background: rgba(28, 32, 22, 0.85);
}

html.dark .toast-item.toast-skin-tarkov.toast-error {
  background: rgba(15, 5, 5, 0.9);
}

html.dark .toast-item.toast-skin-tarkov.tk-banner {
  background: linear-gradient(103deg, #050505 46px, rgba(28, 28, 28, 0.9) 46.5px);
}

html.dark .toast-skin-tarkov .toast-close {
  color: #8b887c;
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

/* 轻提示：从中上方落下 */
.pos-top-center .toast-skin-light.toast-list-enter-active,
.pos-top-center .toast-skin-light.toast-list-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease;
}

.pos-top-center .toast-skin-light.toast-list-enter-from {
  opacity: 0;
  transform: translateY(-18px) scale(0.96);
}

.pos-top-center .toast-skin-light.toast-list-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.97);
}

/* 塔科夫：瞬间淡入淡出（0.1s），旧通知被新通知用 0.1s 顶上 */
.pos-bottom-right .toast-skin-tarkov.toast-list-enter-active {
  transition: opacity 0.1s linear;
}

.pos-bottom-right .toast-skin-tarkov.toast-list-leave-active {
  transition: opacity 0.1s linear;
}

.pos-bottom-right .toast-skin-tarkov.toast-list-enter-from,
.pos-bottom-right .toast-skin-tarkov.toast-list-leave-to {
  opacity: 0;
}

/* 塔科夫堆叠位移：FLIP 顶推动画 */
.pos-bottom-right.has-tarkov .toast-list-move {
  transition: transform 0.1s cubic-bezier(0.2, 0.8, 0.4, 1);
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

  .toast-item.toast-skin-tarkov {
    width: 100%;
    min-width: 0;
    height: auto;
    min-height: 30px;
    padding: 4px 26px 4px 10px;
    border-radius: 0;
  }

  .toast-item.toast-skin-tarkov.tk-banner {
    min-height: 48px;
    padding: 4px 26px 4px 22px;
  }
}
</style>
