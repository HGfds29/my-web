<template>
  <div
    class="holiday-banner"
    :class="{ 'is-closed': closed }"
    :style="{ background: skin.bg }"
    :aria-hidden="closed"
    role="note"
  >
    <span class="banner-icon" aria-hidden="true">{{ skin.icons[0] }}</span>
    <span class="banner-icon" aria-hidden="true">{{ skin.icons[1] }}</span>
    <span class="banner-text">{{ t(skin.textKey) }}</span>
    <span class="banner-icon" aria-hidden="true">{{ skin.icons[2] }}</span>
    <span class="banner-icon" aria-hidden="true">{{ skin.icons[3] }}</span>

    <button
      class="banner-close"
      type="button"
      :aria-label="t('nav.close')"
      :title="t('nav.close')"
      :tabindex="closed ? -1 : 0"
      @click="onClose"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    </button>

    <!-- 节日三角彩旗：沿下垂弧线悬挂，配色随皮肤切换 -->
    <div class="bunting-clip" aria-hidden="true">
      <div class="bunting" :class="{ receded }">
        <span
          v-for="n in flagCount"
          :key="n"
          class="flag"
          :style="flagStyle(n - 1)"
        ></span>
        <svg class="rope" viewBox="0 0 1000 18" preserveAspectRatio="none">
          <path
            d="M0,0 Q500,16 1000,0"
            fill="none"
            :stroke="skin.rope"
            stroke-width="1"
            vector-effect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { t } from '../utils/i18n'

const props = defineProps({
  // 当前节日皮肤的配置（color / icons / textKey / flags …）
  skin: { type: Object, required: true },
  // 用户之前已经关掉横幅文字：只留彩旗
  dismissed: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

// 组件内自己记一份：点 ✕ 立刻收起文字，父级状态同步进来也一样
const closed = ref(props.dismissed)
watch(
  () => props.dismissed,
  (value) => {
    closed.value = value
  }
)
watch(
  () => props.skin.id,
  () => {
    closed.value = props.dismissed
  }
)

const onClose = () => {
  closed.value = true
  emit('close')
}

// 鼠标靠近顶部时彩旗自动收回，移开再垂下来；关掉横幅文字后彩旗一直留着
const hovering = ref(false)
const receded = computed(() => hovering.value && !closed.value)
// 感应区高度：略高于横幅本体，鼠标一靠上就收旗
const HOVER_ZONE = 44

const onPointerMove = (event) => {
  if (event.pointerType && event.pointerType !== 'mouse') return
  hovering.value = event.clientY <= HOVER_ZONE
}

const onPointerLeave = () => {
  hovering.value = false
}

// 弧线最大下垂量（与下方 SVG 的二次贝塞尔控制点保持视觉一致）
const SAG = 8
const FLAG_WIDTH = 24

const flagCount = ref(24)

const updateFlagCount = () => {
  const width = typeof window === 'undefined' ? 1200 : window.innerWidth
  flagCount.value = Math.max(10, Math.round(width / FLAG_WIDTH))
}

// 旗子沿弧线排布：左右两端贴顶，越靠中间越往下垂，颜色按皮肤三色循环
const flagStyle = (index) => {
  const count = flagCount.value
  const t = (index + 0.5) / count
  const sag = 4 * t * (1 - t) * SAG
  return {
    left: `${(index / count) * 100}%`,
    width: `calc(100% / ${count})`,
    transform: `translateY(${sag.toFixed(2)}px)`,
    background: props.skin.flags[index % props.skin.flags.length]
  }
}

updateFlagCount()

onMounted(() => {
  updateFlagCount()
  window.addEventListener('resize', updateFlagCount)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('mouseleave', onPointerLeave)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateFlagCount)
  window.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('mouseleave', onPointerLeave)
})
</script>

<style scoped>
.holiday-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  height: var(--holiday-banner-height, 40px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-bottom: 18px;
  box-sizing: border-box;
  overflow: hidden;
  pointer-events: none;
  color: #fff;
  font-size: 12.5px;
  letter-spacing: 0.06em;
  box-shadow: 0 2px 12px rgba(24, 8, 34, 0.28);
  transition: height 0.34s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease,
    box-shadow 0.3s ease;
}

/* 缓慢扫过的光带，增加一点节日动态 */
.holiday-banner::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 18px;
  left: 0;
  width: 38%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.14), transparent);
  animation: hd-sheen 7s linear infinite;
  transition: opacity 0.3s ease;
}

.banner-icon {
  position: relative;
  z-index: 1;
  font-size: 13px;
  line-height: 1;
  opacity: 0.95;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.banner-text {
  position: relative;
  z-index: 1;
  font-weight: 600;
  white-space: nowrap;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.45);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

/* 右侧关闭按钮：点掉后横幅文字向上收起，彩旗留下 */
.banner-close {
  position: absolute;
  top: 0;
  right: 4px;
  bottom: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  padding: 0;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: rgba(255, 255, 255, 0.66);
  cursor: pointer;
  pointer-events: auto;
  transition: color 0.15s ease, background 0.15s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease;
}

.banner-close:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
}

.banner-close:focus-visible {
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
  outline: 2px solid #fff;
  outline-offset: -3px;
}

.banner-close svg {
  width: 11px;
  height: 11px;
}

/* 彩旗的裁剪窗口：收起时沿窗口上沿滑出，不会跑到文字行里 */
.bunting-clip {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 18px;
  overflow: hidden;
  pointer-events: none;
}

.bunting {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 18px;
  transition: transform 0.34s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease;
}

/* 收到裁剪窗口上方，让鼠标可以安稳地操作顶栏 */
.bunting.receded {
  transform: translateY(-100%);
  opacity: 0;
}

.bunting .flag {
  position: absolute;
  top: 0;
  height: 10px;
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  opacity: 0.95;
}

.bunting .rope {
  position: absolute;
  left: 0;
  bottom: 0;
  display: block;
  width: 100%;
  height: 18px;
}

@keyframes hd-sheen {
  from { transform: translateX(-120%); }
  to { transform: translateX(320%); }
}

/* 关掉横幅文字与底色：文字向上淡出，彩旗继续挂在原位 */
.holiday-banner.is-closed {
  background: transparent !important;
  box-shadow: none;
}

.holiday-banner.is-closed .banner-icon,
.holiday-banner.is-closed .banner-text,
.holiday-banner.is-closed .banner-close {
  transform: translateY(-16px);
  opacity: 0;
  pointer-events: none;
}

.holiday-banner.is-closed::after {
  opacity: 0;
  animation: none;
}

@media (max-width: 480px) {
  .holiday-banner {
    gap: 6px;
    padding-right: 32px;
    font-size: 11px;
    letter-spacing: 0.02em;
  }

  .banner-icon {
    font-size: 11px;
  }

  /* 窄屏只留两个装饰，避免长文案被右侧关闭按钮压住 */
  .banner-icon:nth-child(2),
  .banner-icon:nth-child(5) {
    display: none;
  }

  .banner-close {
    right: 2px;
    width: 26px;
  }
}

@media (max-width: 360px) {
  .banner-icon {
    display: none;
  }

  .banner-text {
    font-size: 10.5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .holiday-banner,
  .bunting,
  .banner-icon,
  .banner-text,
  .banner-close {
    transition: none;
  }

  .holiday-banner::after {
    animation: none;
  }
}
</style>
