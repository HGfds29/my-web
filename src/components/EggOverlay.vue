<template>
  <Teleport to="body">
    <!-- 彩蛋 1：音频播完后整屏变白，白屏 4 秒 -->
    <div
      v-if="flash.show"
      class="egg-layer"
      :class="{ 'egg-white': flash.white }"
      @click="dismissFlash"
    >
      <img v-if="!flash.white" class="egg-think" :src="flash.src" alt="" />
    </div>

    <!-- 彩蛋 2：自动逐帧播放 1~13 的 foxy 画面 -->
    <div v-if="foxy.frame" class="egg-layer egg-foxy" @click="dismissFoxy">
      <img class="egg-foxy-img" :src="foxy.frame" alt="" />
    </div>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, watch } from 'vue'
import { easterEggEnabled, easterEggTrigger } from '../utils/easterEgg'
import { createLogger } from '../utils/logger'

const log = createLogger('EggOverlay')
const BASE = import.meta.env.BASE_URL

const FOXY_TOTAL = 13
const FOXY_FRAME_MS = 90
const WHITE_HOLD_MS = 4000
const THINK_SOUND = 'egg/thinkfastchuclkenuts.ogg'
const THINK_IMAGE = 'egg/thinkfastchucklenuts.png'
const FOXY_SOUND = 'egg/foxy/foxy_screamer.ogg'

const flash = reactive({ show: false, white: false, src: '' })
const foxy = reactive({ frame: '' })

let randomTimer = null
let whiteTimer = null
let frameTimer = null
let thinkFallbackTimer = null
let foxyFallbackTimer = null
let audio = null

const stopAudio = () => {
  if (!audio) return
  audio.pause()
  audio.currentTime = 0
  audio = null
}

// 播放音效；播放失败（被浏览器拦截）时走各自的兜底计时器
const playSound = (file, onEnded) => {
  stopAudio()
  const el = new Audio(BASE + file)
  el.volume = 0.9
  if (onEnded) el.addEventListener('ended', onEnded, { once: true })
  el.play().catch(() => log.warn('音频播放被浏览器拦截', file))
  audio = el
}

/* ===== 彩蛋 1：图片 + 音效 → 播完后白屏 4 秒 ===== */

const dismissFlash = () => {
  window.clearTimeout(whiteTimer)
  window.clearTimeout(thinkFallbackTimer)
  whiteTimer = null
  thinkFallbackTimer = null
  if (!flash.show) return
  flash.show = false
  flash.white = false
  stopAudio()
}

const runThink = () => {
  dismissFoxy()
  dismissFlash()

  flash.src = BASE + THINK_IMAGE
  flash.white = false
  flash.show = true

  let whited = false
  const turnWhite = () => {
    if (whited) return
    whited = true
    window.clearTimeout(thinkFallbackTimer)
    flash.white = true
    whiteTimer = window.setTimeout(dismissFlash, WHITE_HOLD_MS)
  }

  playSound(THINK_SOUND, turnWhite)
  // 音频播不出来时，1.2 秒后照样白屏，避免什么都没发生
  thinkFallbackTimer = window.setTimeout(turnWhite, 1200)
  log.info('触发彩蛋：thinkfast')
}

/* ===== 彩蛋 2：1~13 逐帧播放 ===== */

const dismissFoxy = () => {
  window.clearInterval(frameTimer)
  window.clearTimeout(foxyFallbackTimer)
  frameTimer = null
  foxyFallbackTimer = null
  if (!foxy.frame) return
  foxy.frame = ''
  stopAudio()
}

const runFoxy = () => {
  dismissFlash()
  dismissFoxy()

  let index = 1
  let framesDone = false
  let audioDone = false

  const finishIfReady = () => {
    if (framesDone && audioDone) dismissFoxy()
  }

  foxy.frame = `${BASE}egg/foxy/${index}.png`
  playSound(FOXY_SOUND, () => {
    audioDone = true
    finishIfReady()
  })

  frameTimer = window.setInterval(() => {
    if (index >= FOXY_TOTAL) {
      window.clearInterval(frameTimer)
      frameTimer = null
      framesDone = true
      finishIfReady()
      return
    }
    index += 1
    foxy.frame = `${BASE}egg/foxy/${index}.png`
  }, FOXY_FRAME_MS)

  // 音频与逐帧都没走完时的兜底，避免图案卡死在屏幕上
  foxyFallbackTimer = window.setTimeout(dismissFoxy, 4000)
  log.info('触发彩蛋：foxy')
}

/* ===== 随机调度：两个彩蛋随机挑一个 ===== */

const randomDelay = () => 45000 + Math.random() * 105000

const scheduleRandom = () => {
  window.clearTimeout(randomTimer)
  randomTimer = null
  if (!easterEggEnabled.value) return
  randomTimer = window.setTimeout(() => {
    if (easterEggEnabled.value && document.visibilityState !== 'hidden') {
      playRandomEgg()
    }
    scheduleRandom()
  }, randomDelay())
}

const onKeydown = (event) => {
  if (!easterEggEnabled.value || event.key !== 'Escape') return
  dismissFlash()
  dismissFoxy()
}

const playRandomEgg = () => {
  if (Math.random() < 0.5) runThink()
  else runFoxy()
}

watch(easterEggTrigger, () => {
  if (!easterEggEnabled.value) return
  playRandomEgg()
})

watch(easterEggEnabled, (enabled) => {
  if (enabled) {
    scheduleRandom()
    return
  }
  dismissFlash()
  dismissFoxy()
  window.clearTimeout(randomTimer)
  randomTimer = null
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  scheduleRandom()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.clearTimeout(randomTimer)
  dismissFlash()
  dismissFoxy()
})
</script>

<style scoped>
.egg-layer {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 8, 12, 0.55);
  cursor: pointer;
  animation: eggIn 0.16s ease-out;
  transition: background-color 0.18s linear;
}

/* 整屏变白：图片消失，只留白底 */
.egg-layer.egg-white {
  background: #fff;
  cursor: default;
}

.egg-think {
  width: min(46vw, 460px);
  height: auto;
  image-rendering: pixelated;
  filter: drop-shadow(0 24px 60px rgba(0, 0, 0, 0.5));
}

.egg-foxy {
  background: #000;
}

.egg-foxy-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
  animation: foxyShake 0.12s steps(2) infinite;
}

@keyframes eggIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes foxyShake {
  0% { transform: translate(0, 0) scale(1.02); }
  50% { transform: translate(-6px, 4px) scale(1.04); }
  100% { transform: translate(6px, -4px) scale(1.02); }
}

@media (prefers-reduced-motion: reduce) {
  .egg-foxy-img { animation: none; }
}

@media (max-width: 600px) {
  .egg-think { width: min(76vw, 340px); }
}
</style>
