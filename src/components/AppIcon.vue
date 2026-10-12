<template>
  <span
    class="app-icon"
    :class="{ 'is-spinning': spin }"
    :style="iconStyle"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
  ></span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** public/svg 下的文件名（不含 .svg），例如 游戏手柄_game-handle */
  name: { type: String, required: true },
  /** 尺寸，数字按 px 处理 */
  size: { type: [Number, String], default: 18 },
  /** 是否持续旋转（用于加载图标） */
  spin: { type: Boolean, default: false },
  /** 无障碍名称；留空则视为纯装饰 */
  label: { type: String, default: '' }
})

/**
 * 用 mask 而不是 <img>：SVG 只作为形状遮罩，颜色交给 CSS 的 currentColor，
 * 这样图标能自动跟随深色模式、悬停态、以及错误/警告等状态色。
 * 文件名含中文，必须编码后再拼进 URL。
 */
const iconStyle = computed(() => {
  const file = `${import.meta.env.BASE_URL}svg/${encodeURIComponent(props.name)}.svg`
  return {
    '--icon-url': `url("${file}")`,
    '--icon-size': typeof props.size === 'number' ? `${props.size}px` : props.size
  }
})
</script>

<style scoped>
.app-icon {
  display: inline-block;
  flex: 0 0 auto;
  width: var(--icon-size);
  height: var(--icon-size);
  background-color: currentColor;
  vertical-align: -0.15em;
  -webkit-mask-image: var(--icon-url);
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
  mask-image: var(--icon-url);
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
}

.app-icon.is-spinning {
  animation: app-icon-spin 0.9s linear infinite;
}

@keyframes app-icon-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-icon.is-spinning {
    animation-duration: 2.4s;
  }
}
</style>
