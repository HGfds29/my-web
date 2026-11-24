import { ref } from 'vue'
import { createLogger } from './logger'

/**
 * 彩蛋开关
 *
 * 默认关闭，配置持久化在 localStorage.siteEasterEgg；
 * 实际的特效逻辑在 src/components/EggOverlay.vue。
 */

const log = createLogger('easterEgg')
const STORAGE_KEY = 'siteEasterEgg'

const loadEnabled = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on'
  } catch {
    // 隐私模式读不到，保持默认关闭
    return false
  }
}

export const easterEggEnabled = ref(loadEnabled())

// 手动触发信号：每次自增，EggOverlay 监听到后立刻放一个彩蛋
export const easterEggTrigger = ref(0)

export const triggerEasterEgg = () => {
  if (!easterEggEnabled.value) return
  easterEggTrigger.value += 1
  log.info('手动触发彩蛋')
}

export const setEasterEggEnabled = (enabled) => {
  easterEggEnabled.value = enabled
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off')
  } catch {
    // 写不进去，仅本次会话生效
  }
  log.info(`彩蛋已${enabled ? '开启' : '关闭'}`)
}
