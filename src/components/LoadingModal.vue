<template>
  <Teleport to="body">
    <Transition name="loading-overlay" appear :duration="{ enter: 250, leave: 320 }">
      <div
        v-if="visible"
        class="loading-overlay"
        :class="{ 'bg-transparent': transparent }"
      >
        <Transition name="loading-box" appear :duration="{ enter: 300, leave: 260 }">
          <div v-if="visible" class="loading-box" :class="size">
            <div class="spinner-wrap">
              <AppIcon name="加载4_loading-four" size="100%" spin />
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
import AppIcon from './AppIcon.vue'

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
  background: rgba(15, 15, 26, 0.58);
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

.loading-overlay.loading-overlay-enter-active {
  transition: background 0.25s ease;
}

/* 退场：遮罩比卡片多留 40ms */
.loading-overlay.loading-overlay-leave-active {
  transition: background 0.3s ease;
}

.loading-overlay.loading-overlay-enter-from,
.loading-overlay.loading-overlay-leave-to {
  background: rgba(0, 0, 0, 0);
  backdrop-filter: blur(0px);
}

.loading-box {
  position: relative;
  background: #fff;
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

.loading-box.loading-box-enter-active {
  transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 卡片退场必须挂在遮罩的过渡类上：两层 Transition 绑同一个 v-if 时，
   退场是父元素整体移除，子元素自己的退场钩子不会触发，卡片会硬消失 */
.loading-overlay.loading-overlay-leave-active .loading-box {
  transition: opacity 0.22s ease-in, transform 0.26s cubic-bezier(0.4, 0, 0.6, 1);
}

.loading-box.loading-box-enter-from {
  opacity: 0;
  transform: scale(0.85);
}

.loading-overlay.loading-overlay-leave-to .loading-box {
  opacity: 0;
  transform: scale(0.9) translateY(-8px);
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

/* 转圈动画由 AppIcon 的 spin 属性提供（图标颜色跟随文字色，不再是硬编码的蓝色） */

.spinner-percent {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
}

.loading-content {
  text-align: center;
  width: 100%;
}

.loading-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px;
  line-height: 1.4;
}
.loading-box.sm .loading-title { font-size: 14px; }
.loading-box.lg .loading-title { font-size: 18px; }

.loading-message {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.loading-bar {
  margin-top: 14px;
  width: 100%;
  height: 6px;
  background: #e8e8e8;
  border-radius: 3px;
  overflow: hidden;
}

.loading-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #42b983 0%, #42b983 100%);
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
  border: 1px solid #e8e8e8;
  background: #fafafa;
  color: #555;
  transition: all 0.15s ease;
  font-family: inherit;
}
.loading-cancel:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

/* 深色模式 */
html.dark .loading-box {
  background: #1a1a2e;
  box-shadow: 0 24px 70px rgba(15, 15, 26, 0.58);
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
