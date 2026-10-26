<template>
  <div class="photos-page" :class="{ leaving: isLeaving }">
    <div class="page-header stagger-item" :style="{ '--delay': '0.05s' }">
      <button class="back-btn" @click="goBack">{{ t('photos.back') }}</button>
      <h1>{{ t('photos.title') }}</h1>
      <p class="subtitle">{{ t('photos.subtitle') }}</p>
    </div>

    <div class="main-content stagger-item" :style="{ '--delay': '0.15s' }">
      <div class="photo-area" :class="{ 'on-board': showBoard }" ref="boardRef">
        <div v-if="showBoard" class="cork-board">
          <div class="cork-texture"></div>
          <div class="board-frame"></div>
        </div>
        <div
          v-for="(photo, index) in photos"
          :key="photo.id"
          class="polaroid"
          :class="{
            dragging: photo.dragging,
            pinned: photo.pinned,
            'on-board': showBoard && photo.onBoard
          }"
          :style="{
            left: photo.x + 'px',
            top: photo.y + 'px',
            transform: `rotate(${photo.rotate}deg)`,
            zIndex: photo.zIndex
          }"
          @mousedown="startDrag($event, index)"
        >
          <div v-if="photo.pinned" class="pin">
            <div class="pin-head"></div>
            <div class="pin-shadow"></div>
          </div>
          <div class="photo-inner">
            <img :src="photo.src" :alt="photo.name || 'photo-' + index" draggable="false" />
          </div>
          <div class="polaroid-bottom">
            <span v-if="photo.date" class="photo-date">{{ photo.date }}</span>
            <span v-if="photo.name" class="photo-name">{{ photo.name }}</span>
          </div>
        </div>
      </div>

      <div class="toolbar">
        <div class="tool" :class="{ active: pinMode }" @click="togglePinMode" :title="t('photos.pinMode')">
          <AppIcon name="标签_tag" :size="20" />
          <span>{{ pinMode ? t('photos.pinSelected') : t('photos.pin') }}</span>
        </div>
        <div class="tool" :class="{ active: showBoard }" @click="toggleBoard" :title="t('photos.corkboard')">
          <AppIcon :name="showBoard ? '预览-关闭_preview-close' : '文件柜_file-cabinet'" :size="20" />
          <span>{{ showBoard ? t('photos.hideBoard') : t('photos.board') }}</span>
        </div>
        <div class="tool" @click="resetLayout" :title="t('photos.resetTitle')">
          <AppIcon name="删除_delete-two" :size="20" />
          <span>{{ t('photos.reset') }}</span>
        </div>
      </div>
    </div>

    <div v-if="pinMode" class="pin-hint">
      {{ t('photos.hint') }}
    </div>

    <div v-if="photos.length === 0" class="empty stagger-item" :style="{ '--delay': '0.15s' }">
      <AppIcon name="预览-打开_preview-open" :size="48" class="empty-icon" />
      <p>{{ t('photos.empty') }}</p>
      <p class="hint">{{ t('photos.emptyHint') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { isLeaving } from '../router'
import { t } from '../utils/i18n'
import AppIcon from '../components/AppIcon.vue'
import { showConfirm } from '../utils/modal'
import { createLogger } from '../utils/logger'
import photoConfig from '../data/photos.json'

const log = createLogger('Photos')
// 模块初始化：照片墙的拖拽、钉住、软木板、重置与位置持久化
log.info('照片墙模块已初始化：拖拽、钉住、软木板、重置与 Cookie 位置持久化')

const router = useRouter()
const boardRef = ref(null)

const photoModules = import.meta.glob('../assets/photos/*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG,GIF,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default'
})

log.debug('开始加载照片资源与配置', { local: Object.keys(photoModules).length, configured: photoConfig.length })

const samplePhotos = [
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20sunset%20over%20the%20ocean%20beach%20with%20palm%20trees%20warm%20golden%20hour&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20coffee%20shop%20interior%20with%20plants%20and%20warm%20lighting%20aesthetic&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mountain%20landscape%20with%20fog%20and%20pine%20trees%20nature%20photography&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cat%20sitting%20by%20window%20sunlight%20cozy%20home&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=city%20street%20at%20night%20with%20neon%20lights%20rain%20reflections%20cinematic&image_size=square_hd'
]

const COOKIE_KEY = 'photo_album_pos'

const photos = ref([])
const pinMode = ref(false)
const showBoard = ref(false)
let maxZ = 10
let dragIndex = -1
let startX = 0
let startY = 0
let startLeft = 0
let startTop = 0

const setCookie = (name, value, days = 365) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  try {
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires}; path=/`
    log.debug('照片位置已写入 Cookie', { count: Array.isArray(value?.photos) ? value.photos.length : 0, days })
  } catch (e) {
    log.error('照片位置写入 Cookie 失败', e?.message || e)
  }
}

const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  if (match) {
    try {
      const val = JSON.parse(decodeURIComponent(match[2]))
      log.debug('读取 Cookie 成功', { name, count: Array.isArray(val?.photos) ? val.photos.length : 0 })
      return val
    } catch (e) {
      log.warn('Cookie 数据解析失败，将使用默认布局', { name, message: e?.message || String(e) })
      return null
    }
  }
  return null
}

const generateId = (src, index) => {
  return index + 1
}

const initPhotos = () => {
  const localPhotos = Object.values(photoModules)
  const sources = localPhotos.length > 0 ? localPhotos : samplePhotos
  const configMap = new Map(photoConfig.map(c => [c.id, c]))

  return sources.map((src, i) => {
    const id = generateId(src, i)
    const cfg = configMap.get(id) || {}
    return {
      id,
      src,
      x: 60 + (i % 4) * 170 + Math.random() * 30 - 15,
      y: 30 + Math.floor(i / 4) * 230 + Math.random() * 30 - 15,
      rotate: Math.random() * 12 - 6,
      zIndex: i + 10,
      dragging: false,
      pinned: false,
      onBoard: false,
      date: cfg.date || '',
      name: cfg.name || ''
    }
  })
}

const loadFromCookie = () => {
  return getCookie(COOKIE_KEY)
}

const saveToCookie = () => {
  const data = {
    showBoard: showBoard.value,
    photos: photos.value.map(p => ({
      id: p.id,
      x: Math.round(p.x),
      y: Math.round(p.y),
      rotate: Math.round(p.rotate * 10) / 10,
      zIndex: p.zIndex,
      pinned: p.pinned,
      onBoard: p.onBoard
    }))
  }
  setCookie(COOKIE_KEY, data)
}

const loadPhotos = () => {
  const saved = loadFromCookie()
  const fresh = initPhotos()

  if (saved && saved.photos) {
    log.debug('应用已保存的照片位置', { count: saved.photos.length, board: saved.showBoard || false })
    showBoard.value = saved.showBoard || false
    const savedMap = new Map(saved.photos.map(p => [p.id, p]))
    return fresh.map(p => {
      const savedPhoto = savedMap.get(p.id)
      if (savedPhoto) {
        return { ...p, ...savedPhoto }
      }
      return p
    })
  }

  return fresh
}

onMounted(() => {
  photos.value = loadPhotos()
  log.info('Photos 页面已加载', { count: photos.value.length })
})

watch(showBoard, (val) => {
  if (val) {
    nextTick(() => {
      photos.value.forEach((p, i) => {
        if (p.onBoard) {
          maxZ = Math.max(maxZ, p.zIndex)
        }
      })
    })
  }
})

const startDrag = (e, index) => {
  log.debug('开始拖动照片', { index, id: photos.value[index].id })
  if (pinMode.value) {
    photos.value[index].pinned = !photos.value[index].pinned
    log.info(photos.value[index].pinned ? '钉住照片' : '取消钉住照片', { id: photos.value[index].id })
    saveToCookie()
    return
  }

  if (photos.value[index].pinned) {
    return
  }

  dragIndex = index
  maxZ++
  photos.value[index].zIndex = maxZ
  photos.value[index].dragging = true

  startX = e.clientX
  startY = e.clientY
  startLeft = photos.value[index].x
  startTop = photos.value[index].y

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (e) => {
  if (dragIndex < 0) return
  photos.value[dragIndex].x = startLeft + (e.clientX - startX)
  photos.value[dragIndex].y = startTop + (e.clientY - startY)
}

const stopDrag = () => {
  if (dragIndex >= 0) {
    photos.value[dragIndex].dragging = false
    if (showBoard.value) {
      photos.value[dragIndex].onBoard = true
    }
    log.debug('停止拖动并保存位置', { index: dragIndex, id: photos.value[dragIndex].id, onBoard: photos.value[dragIndex].onBoard })
    saveToCookie()
  }
  dragIndex = -1
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

const togglePinMode = () => {
  pinMode.value = !pinMode.value
  log.info('切换钉住模式', { pinMode: pinMode.value })
}

const toggleBoard = () => {
  showBoard.value = !showBoard.value
  log.info('切换软木板显示', { showBoard: showBoard.value })
  saveToCookie()
}

const resetLayout = () => {
  log.info('点击重置布局')
  // 用项目统一弹窗，避免原生 confirm 被浏览器扩展劫持后报错
  showConfirm(t('photos.confirmReset'), {
    title: t('photos.resetTitle'),
    confirmText: t('photos.reset'),
    cancelText: t('photos.cancel'),
    onConfirm: () => {
      try {
        document.cookie = `${COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
        log.debug('已清除照片位置 Cookie')
      } catch (e) {
        log.error('清除照片位置 Cookie 失败', e?.message || e)
      }
      pinMode.value = false
      showBoard.value = false
      photos.value = initPhotos()
      log.info('布局已重置', { count: photos.value.length })
    }
  })
}

const goBack = () => {
  log.info('返回上一页')
  router.back()
}
</script>

<style scoped>
.photos-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  position: relative;
}

.stagger-item {
  opacity: 0;
  transform: translateX(30px);
  animation: slideIn 0.45s ease forwards;
  animation-delay: var(--delay);
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.leaving .stagger-item {
  opacity: 1;
  transform: translateX(0);
  animation: slideOut 0.4s ease forwards;
  animation-delay: var(--delay);
}

@keyframes slideOut {
  to {
    opacity: 0;
    transform: translateX(60px);
  }
}

.page-header {
  text-align: center;
  padding: 20px 0 20px;
}

.back-btn {
  position: absolute;
  left: 20px;
  top: 20px;
  background: none;
  border: none;
  color: var(--accent, #42b983);
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}

.back-btn:hover {
  text-decoration: underline;
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: 32px;
}

.subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.main-content {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.photo-area {
  flex: 1;
  position: relative;
  height: 600px;
  background: #fafafa;
  border-radius: 12px;
  overflow: hidden;
}

.photo-area.on-board {
  background: transparent;
}

.cork-board {
  position: absolute;
  inset: 0;
  background: #c4956a;
  border-radius: 12px;
  overflow: hidden;
}

.cork-texture {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(0,0,0,0.08) 1px, transparent 1px),
    radial-gradient(circle at 80% 70%, rgba(0,0,0,0.06) 1px, transparent 1px),
    radial-gradient(circle at 40% 80%, rgba(0,0,0,0.07) 1px, transparent 1px),
    radial-gradient(circle at 60% 20%, rgba(0,0,0,0.05) 1px, transparent 1px);
  background-size: 20px 20px, 25px 25px, 18px 18px, 22px 22px;
  opacity: 0.8;
}

.board-frame {
  position: absolute;
  inset: 0;
  border: 12px solid #6b4423;
  border-radius: 12px;
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.3);
  pointer-events: none;
}

.toolbar {
  width: 70px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  height: fit-content;
}

.tool {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
  font-size: 11px;
}

.tool:hover {
  background: #f0f9f4;
  color: var(--accent, #42b983);
}

.tool.active {
  background: var(--accent, #42b983);
  color: white;
}

/* 图标尺寸由 AppIcon 的 size 属性控制，这里不再覆盖 */

.polaroid {
  position: absolute;
  width: 150px;
  cursor: grab;
  user-select: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: white;
  padding: 10px 10px 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 2px;
}

.polaroid:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  z-index: 100 !important;
}

.polaroid.dragging {
  cursor: grabbing;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  transition: box-shadow 0.1s ease;
}

.polaroid.pinned {
  cursor: default;
}

.polaroid.pinned:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: auto !important;
}

.photo-inner {
  width: 100%;
  height: 130px;
  overflow: hidden;
  background: #eee;
}

.photo-inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.polaroid-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 35px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  box-sizing: border-box;
  font-family: 'Courier New', monospace;
  font-size: 9px;
  color: #888;
}

.photo-date {
  letter-spacing: 0.5px;
}

.photo-name {
  letter-spacing: 0.5px;
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

.pin {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.pin-head {
  width: 14px;
  height: 14px;
  background: radial-gradient(circle at 30% 30%, #ff6b6b, #c92a2a);
  border-radius: 50%;
  position: relative;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

.pin-shadow {
  position: absolute;
  top: 10px;
  left: 2px;
  width: 10px;
  height: 3px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  filter: blur(2px);
}

.pin-hint {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #2c3e50;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1000;
}

.empty {
  text-align: center;
  padding: 80px 0;
  color: #999;
}

.empty .hint {
  font-size: 13px;
  margin-top: 8px;
}

.empty-icon {
  color: #dcdcdc;
  margin-bottom: 14px;
}

:global(.dark) .photos-page {
  color: #e0e0e0;
}

:global(.dark) .page-header h1 {
  color: #f0f0f0;
}

:global(.dark) .subtitle {
  color: #999;
}

:global(.dark) .photo-area {
  background: #1a1a2e;
}

:global(.dark) .toolbar {
  background: #1a1a2e;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

:global(.dark) .tool {
  color: #aaa;
}

:global(.dark) .tool:hover {
  background: #2d2d44;
  color: var(--accent, #42b983);
}

:global(.dark) .polaroid {
  background: #2a2a40;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

:global(.dark) .polaroid:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
}

:global(.dark) .polaroid.dragging {
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
}

:global(.dark) .polaroid.pinned:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

:global(.dark) .photo-inner {
  background: #1a1a2e;
}

:global(.dark) .polaroid-bottom {
  background: #2a2a40;
  color: #999;
}

:global(.dark) .empty {
  color: #888;
}
</style>
