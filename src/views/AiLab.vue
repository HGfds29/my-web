<template>
  <div class="ai-page">
    <button class="back-btn" @click="goBack">{{ t('ai.back') }}</button>

    <header class="ai-header">
      <div class="ai-mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6.5" y="6.5" width="11" height="11" rx="2.5"/>
          <path d="M9.5 2.8v2.2M14.5 2.8v2.2M9.5 19v2.2M14.5 19v2.2M2.8 9.5H5M2.8 14.5H5M19 9.5h2.2M19 14.5h2.2"/>
          <circle cx="12" cy="12" r="2.2"/>
        </svg>
      </div>
      <div class="ai-heading">
        <h1>
          {{ t('ai.title') }}
          <span class="alpha-badge">{{ t('ai.alpha') }}</span>
        </h1>
        <p class="subtitle">{{ t('ai.subtitle') }}</p>
      </div>
    </header>

    <div class="runtime-chips">
      <span class="chip" :class="{ ok: webgpu }">
        <i class="dot"></i>WebGPU {{ webgpu ? t('ai.webgpuOk') : t('ai.webgpuNo') }}
      </span>
      <span class="chip"><i class="dot"></i>ONNX Runtime Web</span>
      <span class="chip"><i class="dot"></i>Transformers.js</span>
      <span class="chip"><i class="dot"></i>4bit / 8bit</span>
    </div>

    <div class="tabs">
      <button
        v-for="item in tabs"
        :key="item.key"
        class="tab-btn"
        :class="{ active: tab === item.key }"
        @click="tab = item.key"
      >
        {{ item.label }}
      </button>
    </div>

    <!-- 下载源连通性 -->
    <div v-if="probeList.length" class="probe-panel">
      <div class="probe-head">{{ t('ai.probeTitle') }}</div>
      <div v-for="item in probeList" :key="item.id" class="probe-row">
        <span class="probe-host">{{ item.host }}</span>
        <span class="probe-state" :class="{ ok: item.reachable }">
          {{ item.reachable ? t('ai.probeReachable') : t('ai.probeUnreachable') }}
        </span>
        <span v-for="check in item.results" :key="check.label" class="probe-check">
          {{ check.label === 'config.json' ? t('ai.probeConfig') : t('ai.probeWeights') }}
          · {{ check.status || '—' }} · {{ check.ms }}ms
        </span>
      </div>
    </div>

    <!-- 对话生成 -->
    <section v-if="tab === 'chat'" class="panel">
      <div class="controls">
        <label class="field">
          <span>{{ t('ai.model') }}</span>
          <select v-model="chatModel" :disabled="chat.loading || chat.busy">
            <option v-for="model in models" :key="model.id" :value="model.id">
              {{ model.label }} · {{ model.params }}
            </option>
          </select>
        </label>
        <label class="field">
          <span>{{ t('ai.precision') }}</span>
          <select v-model="precision" :disabled="chat.loading || chat.busy">
            <option v-for="item in precisionOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </label>
        <label class="field">
          <span>{{ t('ai.device') }}</span>
          <select v-model="device" :disabled="chat.loading || chat.busy">
            <option value="auto">{{ t('ai.deviceAuto') }}</option>
            <option value="webgpu" :disabled="!webgpu">WebGPU</option>
            <option value="wasm">WASM</option>
          </select>
        </label>
        <label class="field">
          <span>{{ t('ai.source') }}</span>
          <select v-model="source" :disabled="chat.loading || chat.busy">
            <option value="auto">{{ t('ai.sourceAuto') }}</option>
            <option v-for="item in sources" :key="item.id" :value="item.id">
              {{ item.label[locale] || item.label.zh }}
            </option>
          </select>
        </label>
        <label v-if="source === 'custom'" class="field">
          <span>{{ t('ai.customHost') }}</span>
          <input
            v-model="customHost"
            class="source-input"
            type="url"
            :placeholder="t('ai.customHostPh')"
            :disabled="chat.loading || chat.busy"
            @change="saveCustomHost"
          />
        </label>
        <p v-if="source === 'mirror'" class="source-warn">{{ t('ai.mirrorNoCors') }}</p>
        <div class="net-tools">
          <button class="ghost-btn small" :disabled="probing" @click="testNet">
            {{ probing ? t('ai.testing') : t('ai.testNet') }}
          </button>
          <button class="ghost-btn small" :disabled="clearing" @click="clearCache">
            {{ clearing ? t('ai.clearing') : t('ai.clearCache') }}
          </button>
        </div>
        <div class="control-actions">
          <button v-if="!chat.ready" class="primary-btn" :disabled="chat.loading" @click="loadChat">
            {{ chat.loading ? t('ai.loadingModel') : t('ai.loadModel') }}
          </button>
          <button v-else class="ghost-btn" :disabled="chat.busy" @click="unloadChat">{{ t('ai.unloadModel') }}</button>
        </div>
      </div>

      <p class="model-note">{{ modelNote }}</p>

      <div v-if="chat.loading || chat.error" class="progress-block">
        <div class="progress-bar">
          <i :style="{ width: `${chat.percent}%` }"></i>
        </div>
        <div class="progress-meta">
          <span>{{ chat.error ? t('ai.loadFailed') : statusText }}</span>
          <span>{{ chat.percent }}%</span>
        </div>
        <p v-if="chat.error" class="error-text">{{ chat.error }}</p>
        <p v-if="chat.error" class="hint">{{ t('ai.networkHint') }}</p>
      </div>

      <div v-if="chat.ready" class="engine-meta">
        {{ chat.device.toUpperCase() }} · {{ chat.dtype }} · {{ t('ai.modelReady') }}
        <span v-if="chat.elapsed">· {{ Math.round(chat.elapsed) }}ms · {{ chat.chars }} 字符</span>
      </div>

      <div ref="logRef" class="chat-log">
        <div v-if="!chat.messages.length" class="chat-empty">
          <p>{{ t('ai.chatEmpty') }}</p>
          <p class="chat-empty-hint">{{ t('ai.chatHint') }}</p>
        </div>
        <div v-for="item in chat.messages" :key="item.id" class="msg" :class="item.role">
          <span class="msg-role">{{ item.role === 'user' ? t('ai.userRole') : t('ai.aiRole') }}</span>
          <div class="msg-bubble">
            <span v-if="item.pending && !item.content" class="typing">···</span>
            <template v-else>{{ item.content }}</template>
          </div>
        </div>
      </div>

      <div class="composer">
        <textarea
          v-model="draft"
          rows="2"
          :placeholder="t('ai.chatPlaceholder')"
          :disabled="!chat.ready || chat.busy"
          @keydown.enter.exact.prevent="send"
        ></textarea>
        <div class="composer-actions">
          <button class="primary-btn" :disabled="!canSend" @click="send">{{ t('ai.send') }}</button>
          <button v-if="chat.busy" class="ghost-btn" @click="stopChat">{{ t('ai.stop') }}</button>
          <button v-if="chat.messages.length" class="ghost-btn" :disabled="chat.busy" @click="clearChat">{{ t('ai.clearChat') }}</button>
        </div>
      </div>
    </section>

    <!-- 语义向量 -->
    <section v-else class="panel">
      <p class="panel-desc">{{ t('ai.embedDesc') }}</p>
      <div class="embed-grid">
        <label class="field field-block">
          <span>{{ t('ai.embedA') }}</span>
          <textarea v-model="embedA" rows="3" :placeholder="t('ai.embedAPh')"></textarea>
        </label>
        <label class="field field-block">
          <span>{{ t('ai.embedB') }}</span>
          <textarea v-model="embedB" rows="3" :placeholder="t('ai.embedBPh')"></textarea>
        </label>
      </div>

      <div class="controls embed-controls">
        <div class="control-actions">
          <button class="primary-btn" :disabled="emb.loading || !canCompare" @click="compare">
            {{ emb.loading ? t('ai.comparing') : t('ai.compare') }}
          </button>
          <button v-if="emb.ready" class="ghost-btn" :disabled="emb.loading" @click="unloadEmbed">{{ t('ai.unloadModel') }}</button>
        </div>
        <span class="model-note">{{ EMBED_MODEL }} · q8</span>
      </div>

      <div v-if="emb.loading || emb.error" class="progress-block">
        <div class="progress-bar">
          <i :style="{ width: `${emb.percent}%` }"></i>
        </div>
        <div class="progress-meta">
          <span>{{ emb.error ? t('ai.loadFailed') : statusTextEmb }}</span>
          <span>{{ emb.percent }}%</span>
        </div>
        <p v-if="emb.error" class="error-text">{{ emb.error }}</p>
        <p v-if="emb.error" class="hint">{{ t('ai.networkHint') }}</p>
      </div>

      <div v-if="emb.similarity !== null" class="similarity">
        <div class="similarity-head">
          <span>{{ t('ai.cosine') }}</span>
          <strong>{{ (emb.similarity * 100).toFixed(1) }}%</strong>
        </div>
        <div class="similarity-bar"><i :style="{ width: `${Math.max(0, emb.similarity) * 100}%` }"></i></div>
        <p class="similarity-meta">{{ t('ai.dimension') }}: {{ emb.dim }}</p>
      </div>

      <p class="hint">{{ t('ai.semanticHint') }}</p>
    </section>

    <section class="notes">
      <h2>{{ t('ai.notesTitle') }}</h2>
      <ul>
        <li>{{ t('ai.note1') }}</li>
        <li>{{ t('ai.note2') }}</li>
        <li>{{ t('ai.note3') }}</li>
      </ul>
    </section>

    <details v-if="logs.length" class="logs">
      <summary>{{ t('ai.logsTitle') }}</summary>
      <div class="log-lines">
        <div v-for="(line, index) in logs" :key="index" class="log-line">{{ line }}</div>
      </div>
    </details>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { t, locale } from '../utils/i18n'
import { createLogger } from '../utils/logger'
import { showToast } from '../utils/toast'
import {
  CHAT_MODELS,
  EMBED_MODEL,
  MODEL_SOURCES,
  clearModelCache,
  createChatEngine,
  createEmbedEngine,
  detectWebGPU,
  getCustomHost,
  pickSource,
  probeSource,
  setCustomHost
} from '../utils/webai'

const log = createLogger('AiLab')
const router = useRouter()

const SYSTEM_PROMPT = 'You are a concise assistant living in a browser. Answer in the same language as the user.'

let alive = true
onBeforeUnmount(() => {
  alive = false
  chat.engine?.unload?.()
  emb.engine?.unload?.()
})

const tab = ref('chat')
const webgpu = ref(false)
const device = ref('auto')
const source = ref('auto')
const precision = ref('q4')
const chatModel = ref(CHAT_MODELS[0].id)
const draft = ref('')
const logRef = ref(null)
const logs = ref([])
const probing = ref(false)
const clearing = ref(false)
const probeList = ref([])
const customHost = ref(getCustomHost())

const saveCustomHost = () => setCustomHost(customHost.value)

const emb = reactive({
  loading: false,
  ready: false,
  percent: 0,
  status: '',
  error: '',
  engine: null,
  similarity: null,
  dim: 0
})
const embedA = ref('')
const embedB = ref('')

const chat = reactive({
  loading: false,
  ready: false,
  busy: false,
  percent: 0,
  status: '',
  error: '',
  engine: null,
  dtype: '',
  device: '',
  messages: [],
  elapsed: 0,
  chars: 0
})

const tabs = computed(() => [
  { key: 'chat', label: t('ai.tabChat') },
  { key: 'embed', label: t('ai.tabEmbed') }
])

const models = CHAT_MODELS
const sources = MODEL_SOURCES

const effectiveDevice = computed(() => {
  if (device.value === 'auto') return webgpu.value ? 'webgpu' : 'wasm'
  return device.value
})

const precisionOptions = computed(() => {
  const base = [
    { value: 'q4', label: t('ai.precisionQ4') },
    { value: 'q8', label: t('ai.precisionQ8') },
    { value: 'fp32', label: t('ai.precisionFp32') }
  ]
  if (effectiveDevice.value === 'webgpu') {
    base.splice(2, 0, { value: 'fp16', label: t('ai.precisionFp16') })
  }
  return base
})

watch(effectiveDevice, (value) => {
  if (value === 'wasm' && precision.value === 'fp16') precision.value = 'q8'
})

const modelNote = computed(() => {
  const model = CHAT_MODELS.find((item) => item.id === chatModel.value)
  if (!model) return ''
  return model.note[locale.value] || model.note.zh
})

const statusText = computed(() => chat.status || t('ai.stageDownload'))
const statusTextEmb = computed(() => emb.status || t('ai.stageDownload'))

const canSend = computed(() => chat.ready && !chat.busy && draft.value.trim().length > 0)
const canCompare = computed(() => embedA.value.trim().length > 0 && embedB.value.trim().length > 0)

let msgSeq = 0
const nextMsgId = () => ++msgSeq

const pushLog = (message) => {
  const time = new Date().toLocaleTimeString()
  logs.value.push(`[${time}] ${message}`)
  if (logs.value.length > 60) logs.value.splice(0, logs.value.length - 60)
  log.info(message)
}

const scrollLog = () => {
  nextTick(() => {
    const el = logRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

const goBack = () => router.push('/home')

const applyProgress = (target, payload) => {
  if (typeof payload.percent === 'number') target.percent = payload.percent
  if (payload.status === 'retry') {
    target.status = t('ai.stageRetry')
    pushLog(t('ai.stageRetry'))
  } else if (payload.status === 'source') {
    target.status = t('ai.stageSource')
    pushLog(`${t('ai.stageSource')} ${payload.source}`)
  } else if (payload.status === 'start') {
    target.status = t('ai.stageDownload')
  } else if (payload.status === 'ready') {
    target.percent = 100
  } else if (payload.file) {
    target.status = `${t('ai.stageDownload')} · ${payload.file}`
  }
}

const probeModelId = () => (tab.value === 'chat' ? chatModel.value : EMBED_MODEL)

const testNet = async () => {
  if (probing.value) return
  probing.value = true
  if (source.value === 'custom') saveCustomHost()
  pushLog(`${t('ai.stageProbe')} (${source.value})`)
  try {
    const modelId = probeModelId()
    probeList.value = source.value === 'auto'
      ? (await pickSource(modelId, { deep: true })).probes
      : [await probeSource({ sourceId: source.value, modelId, deep: true })]
    const ok = probeList.value.some((item) => item.reachable)
    pushLog(ok ? '下载源探测完成：至少一个源可达' : '下载源探测完成：全部不可达')
    showToast({ type: ok ? 'success' : 'error', message: ok ? t('ai.netOk') : t('ai.allSourcesDown') })
  } catch (error) {
    pushLog(`探测失败：${String(error?.message || error)}`)
    showToast({ type: 'error', message: t('ai.allSourcesDown') })
  } finally {
    probing.value = false
  }
}

const clearCache = async () => {
  if (clearing.value) return
  clearing.value = true
  try {
    const removed = await clearModelCache()
    pushLog(removed ? `已清理 ${removed} 个模型缓存` : '没有可清理的模型缓存')
    showToast({
      type: removed ? 'success' : 'info',
      message: t(removed ? 'ai.cacheCleared' : 'ai.cacheEmpty')
    })
  } finally {
    clearing.value = false
  }
}

const loadChat = async () => {
  if (chat.loading || chat.ready) return
  chat.loading = true
  if (source.value === 'custom') saveCustomHost()
  chat.error = ''
  chat.percent = 0
  chat.status = t('ai.stageRuntime')
  pushLog(`开始加载 ${chatModel.value} (${precision.value} / ${effectiveDevice.value} / ${source.value})`)
  try {
    const engine = await createChatEngine({
      modelId: chatModel.value,
      precision: precision.value,
      device: effectiveDevice.value,
      source: source.value,
      onProgress: (payload) => {
        if (alive) applyProgress(chat, payload)
      }
    })
    if (!alive) {
      await engine.unload?.()
      return
    }
    chat.engine = engine
    chat.ready = true
    chat.dtype = engine.dtype
    chat.device = engine.device
    chat.percent = 100
    chat.status = ''
    pushLog(`模型就绪：${engine.device} / ${engine.dtype}`)
    showToast({ type: 'success', message: t('ai.modelReady') })
  } catch (error) {
    chat.error = String(error?.message || error)
    chat.status = ''
    pushLog(`加载失败：${chat.error}`)
    showToast({ type: 'error', message: t('ai.loadFailed') })
  } finally {
    chat.loading = false
  }
}

const unloadChat = async () => {
  if (chat.busy) stopChat()
  await chat.engine?.unload?.()
  chat.engine = null
  chat.ready = false
  chat.dtype = ''
  chat.device = ''
  chat.percent = 0
  chat.status = ''
  chat.error = ''
  pushLog('已卸载对话模型')
}

const stopChat = () => {
  chat.engine?.stop?.()
  pushLog('请求停止生成')
}

const clearChat = () => {
  chat.messages = []
  chat.elapsed = 0
  chat.chars = 0
}

const send = async () => {
  if (!canSend.value) return
  const content = draft.value.trim().slice(0, 2000)
  draft.value = ''
  chat.messages.push({ id: nextMsgId(), role: 'user', content })
  chat.messages.push({ id: nextMsgId(), role: 'assistant', content: '', pending: true })
  const reply = chat.messages[chat.messages.length - 1]
  chat.busy = true
  chat.chars = 0
  chat.elapsed = 0
  scrollLog()

  const history = chat.messages
    .filter((item) => item.role === 'user' || (item.role === 'assistant' && !item.pending && item.content))
    .slice(-12)
    .map((item) => ({ role: item.role, content: item.content }))

  try {
    const { text, elapsed } = await chat.engine.generate({
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
      maxNewTokens: 384,
      onToken: (piece) => {
        reply.content += piece
        chat.chars += piece.length
        scrollLog()
      }
    })
    if (!reply.content) reply.content = text || t('ai.emptyReply')
    chat.elapsed = elapsed
  } catch (error) {
    reply.content = `⚠ ${String(error?.message || error)}`
    pushLog(`生成失败：${String(error)}`)
    showToast({ type: 'error', message: t('ai.loadFailed') })
  } finally {
    reply.pending = false
    chat.busy = false
    scrollLog()
  }
}

const loadEmbed = async () => {
  if (source.value === 'custom') saveCustomHost()
  emb.loading = true
  emb.error = ''
  emb.percent = 0
  emb.status = t('ai.stageRuntime')
  pushLog(`开始加载向量模型 ${EMBED_MODEL}`)
  try {
    const engine = await createEmbedEngine({
      source: source.value,
      onProgress: (payload) => {
        if (alive) applyProgress(emb, payload)
      }
    })
    if (!alive) {
      await engine.unload?.()
      return false
    }
    emb.engine = engine
    emb.ready = true
    emb.percent = 100
    pushLog('向量模型就绪')
    return true
  } catch (error) {
    emb.error = String(error?.message || error)
    pushLog(`向量模型加载失败：${emb.error}`)
    showToast({ type: 'error', message: t('ai.loadFailed') })
    return false
  } finally {
    emb.loading = false
  }
}

const compare = async () => {
  if (!canCompare.value || emb.loading) return
  if (!emb.ready && !(await loadEmbed())) return
  emb.loading = true
  emb.error = ''
  try {
    const [a, b] = await emb.engine.embed([embedA.value.trim(), embedB.value.trim()])
    emb.dim = a.length
    let dot = 0
    for (let i = 0; i < a.length; i++) dot += a[i] * b[i]
    emb.similarity = Math.max(-1, Math.min(1, dot))
    pushLog(`计算相似度：${(emb.similarity * 100).toFixed(1)}%`)
  } catch (error) {
    emb.error = String(error?.message || error)
    pushLog(`计算失败：${emb.error}`)
    showToast({ type: 'error', message: t('ai.loadFailed') })
  } finally {
    emb.loading = false
  }
}

const unloadEmbed = async () => {
  await emb.engine?.unload?.()
  emb.engine = null
  emb.ready = false
  emb.percent = 0
  emb.status = ''
  emb.similarity = null
  emb.dim = 0
  pushLog('已卸载向量模型')
}

onMounted(async () => {
  webgpu.value = await detectWebGPU()
  pushLog(`WebGPU ${webgpu.value ? '可用' : '不可用'}，默认后端 ${effectiveDevice.value}`)
})
</script>

<style scoped>
.ai-page {
  width: 100%;
  max-width: none;
  min-height: calc(100vh - 60px);
  margin: 0;
  padding: 16px clamp(16px, 2.4vw, 32px) 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
}

.back-btn {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  color: var(--accent, #42b983);
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  border-color: var(--accent, #42b983);
  box-shadow: 0 2px 8px rgba(var(--accent-rgb, 66, 185, 131), 0.18);
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 22px 0 14px;
}

.ai-mark {
  width: 54px;
  height: 54px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(135deg, var(--accent, #42b983) 0%, #2e8b63 100%);
  box-shadow: 0 8px 22px rgba(var(--accent-rgb, 66, 185, 131), 0.3);
}

.ai-mark svg {
  width: 28px;
  height: 28px;
}

.ai-heading h1 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 6px;
  font-size: 26px;
  letter-spacing: 0.02em;
}

.alpha-badge {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ffb74d;
  border: 1px solid rgba(255, 183, 77, 0.45);
  background: rgba(255, 183, 77, 0.12);
  border-radius: 6px;
  padding: 2px 7px;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.runtime-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #4b5563;
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.08);
  border: 1px solid rgba(var(--accent-rgb, 66, 185, 131), 0.18);
  border-radius: 999px;
  padding: 4px 11px;
}

.chip .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #9ca3af;
}

.chip.ok .dot {
  background: var(--accent, #42b983);
}

.tabs {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  margin-bottom: 16px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 10px;
}

.tab-btn {
  border: none;
  background: transparent;
  color: #4b5563;
  font-size: 13px;
  padding: 7px 16px;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: #fff;
  color: var(--accent, #42b983);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  font-weight: 600;
}

.panel {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.05);
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.panel-desc {
  margin: 0 0 14px;
  font-size: 13px;
  color: #6b7280;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.field select,
.field textarea,
.field .source-input {
  font-family: inherit;
  font-size: 13px;
  color: #2c3e50;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  padding: 7px 10px;
  outline: none;
  transition: border-color 0.2s ease;
}

.field select:focus,
.field textarea:focus,
.field .source-input:focus {
  border-color: var(--accent, #42b983);
}

.field select {
  min-width: 190px;
}

.field .source-input {
  min-width: 260px;
}

.source-warn {
  flex-basis: 100%;
  margin: -4px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: #b45309;
}

.field-block {
  width: 100%;
}

.field-block textarea {
  width: 100%;
  resize: vertical;
  line-height: 1.5;
}

.control-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.primary-btn,
.ghost-btn {
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn {
  border: none;
  color: #fff;
  background: var(--accent, #42b983);
  box-shadow: 0 4px 14px rgba(var(--accent-rgb, 66, 185, 131), 0.25);
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.primary-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(var(--accent-rgb, 66, 185, 131), 0.32);
}

.ghost-btn {
  border: 1px solid rgba(var(--accent-rgb, 66, 185, 131), 0.35);
  background: transparent;
  color: var(--accent, #42b983);
}

.ghost-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ghost-btn.small {
  padding: 6px 10px;
  font-size: 12px;
}

.net-tools {
  display: flex;
  gap: 8px;
}

.probe-panel {
  margin-bottom: 14px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(var(--accent-rgb, 66, 185, 131), 0.24);
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.06);
  font-size: 12px;
  color: #4b5563;
}

.probe-head {
  font-weight: 600;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
  color: var(--accent, #42b983);
}

.probe-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 3px 0;
}

.probe-host {
  font-family: Consolas, Monaco, monospace;
}

.probe-state {
  color: #ef4444;
}

.probe-state.ok {
  color: var(--accent, #42b983);
}

.probe-check {
  color: #8a919c;
}

.model-note {
  margin: 10px 0 0;
  font-size: 12px;
  color: #8a919c;
}

.progress-block {
  margin-top: 14px;
}

.progress-bar {
  height: 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.progress-bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--accent, #42b983);
  transition: width 0.25s ease;
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
}

.progress-meta span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error-text {
  margin: 8px 0 0;
  font-size: 12px;
  color: #ef4444;
  word-break: break-word;
}

.engine-meta {
  margin-top: 12px;
  font-size: 12px;
  color: var(--accent, #42b983);
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.08);
  border-radius: 8px;
  padding: 6px 10px;
  display: inline-block;
}

.chat-log {
  margin-top: 14px;
  flex: 1;
  min-height: 160px;
  max-height: none;
  overflow-y: auto;
  padding: 12px;
  border-radius: 10px;
  background: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.chat-empty {
  height: 100%;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

.chat-empty-hint {
  font-size: 12px;
  color: #b3b8c2;
  margin: 0;
}

.msg {
  margin-bottom: 14px;
}

.msg:last-child {
  margin-bottom: 0;
}

.msg-role {
  display: inline-block;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: #8a919c;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.msg-bubble {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 13.5px;
  line-height: 1.65;
  padding: 9px 12px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.msg.user .msg-bubble {
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.1);
  border-color: rgba(var(--accent-rgb, 66, 185, 131), 0.22);
}

.typing {
  color: #9ca3af;
  letter-spacing: 0.2em;
}

.composer {
  margin-top: 12px;
}

.composer textarea {
  width: 100%;
  resize: vertical;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  color: #2c3e50;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  padding: 10px 12px;
  outline: none;
  transition: border-color 0.2s ease;
}

.composer textarea:focus {
  border-color: var(--accent, #42b983);
}

.composer textarea:disabled {
  background: #f5f6f8;
}

.composer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 9px;
}

.embed-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.embed-controls {
  margin-top: 14px;
}

.similarity {
  margin-top: 16px;
}

.similarity-head {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #4b5563;
  margin-bottom: 8px;
}

.similarity-head strong {
  color: var(--accent, #42b983);
  font-size: 18px;
}

.similarity-bar {
  height: 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.similarity-bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent, #42b983), #2e8b63);
  transition: width 0.3s ease;
}

.similarity-meta {
  margin: 8px 0 0;
  font-size: 12px;
  color: #8a919c;
}

.hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: #8a919c;
}

.notes {
  margin-top: 26px;
}

.notes h2 {
  font-size: 16px;
  border-bottom: 2px solid var(--accent, #42b983);
  display: inline-block;
  padding-bottom: 4px;
  margin-bottom: 12px;
}

.notes ul {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  line-height: 1.8;
  color: #6b7280;
}

.logs {
  margin-top: 18px;
  border: 1px dashed rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 12px;
  color: #6b7280;
}

.logs summary {
  cursor: pointer;
  color: #8a919c;
}

.log-lines {
  margin-top: 8px;
  max-height: 160px;
  overflow-y: auto;
  font-family: Consolas, Monaco, monospace;
  line-height: 1.6;
}

.log-line {
  white-space: pre-wrap;
  word-break: break-all;
}

html.dark .ai-page {
  color: #e5e7eb;
}

html.dark .back-btn,
html.dark .panel {
  background: #1a1a2e;
  border-color: rgba(255, 255, 255, 0.08);
  color: #e5e7eb;
}

html.dark .subtitle,
html.dark .panel-desc,
html.dark .notes ul {
  color: #a9adbb;
}

html.dark .chip {
  color: #a9adbb;
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.12);
  border-color: rgba(var(--accent-rgb, 66, 185, 131), 0.25);
}

html.dark .tabs {
  background: rgba(255, 255, 255, 0.06);
}

html.dark .tab-btn {
  color: #a9adbb;
}

html.dark .tab-btn.active {
  background: #242438;
  color: var(--accent, #42b983);
  box-shadow: none;
}

html.dark .field select,
html.dark .field textarea,
html.dark .field .source-input,
html.dark .composer textarea {
  background: #14142a;
  border-color: rgba(255, 255, 255, 0.12);
  color: #e5e7eb;
}

html.dark .chat-log {
  background: #14142a;
  border-color: rgba(255, 255, 255, 0.08);
}

html.dark .msg-bubble {
  background: #1f1f36;
  border-color: rgba(255, 255, 255, 0.08);
  color: #e5e7eb;
}

html.dark .msg.user .msg-bubble {
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.18);
  border-color: rgba(var(--accent-rgb, 66, 185, 131), 0.3);
}

html.dark .progress-bar,
html.dark .similarity-bar {
  background: rgba(255, 255, 255, 0.1);
}

html.dark .logs {
  border-color: rgba(255, 255, 255, 0.12);
  color: #a9adbb;
}

html.dark .probe-panel {
  color: #a9adbb;
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.1);
  border-color: rgba(var(--accent-rgb, 66, 185, 131), 0.28);
}

@media (max-width: 720px) {
  .ai-page {
    padding: 14px;
  }

  .ai-heading h1 {
    font-size: 21px;
  }

  .controls {
    align-items: stretch;
  }

  .field,
  .field select {
    width: 100%;
  }

  .control-actions {
    width: 100%;
    margin-left: 0;
  }

  .control-actions button {
    flex: 1;
  }

  .net-tools {
    width: 100%;
  }

  .net-tools button {
    flex: 1;
  }

  .embed-grid {
    grid-template-columns: 1fr;
  }

  .chat-log {
    min-height: 180px;
  }
}
</style>
