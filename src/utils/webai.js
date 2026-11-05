import { createLogger } from './logger'

const log = createLogger('webai')

// Transformers.js 的 dist 包已内置 onnxruntime-web；直接从 CDN 动态加载，避免把几 MB 运行时打进主包
// 国内网络下 cdn.jsdelivr.net 不稳定，优先走 fastly 节点，再依次降级
const CDN_ENTRIES = [
  'https://fastly.jsdelivr.net/npm/@huggingface/transformers@3/dist/transformers.min.js',
  'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3/dist/transformers.min.js',
  'https://unpkg.com/@huggingface/transformers@3/dist/transformers.min.js'
]

export const CHAT_MODELS = [
  {
    id: 'onnx-community/Qwen2.5-0.5B-Instruct',
    label: 'Qwen2.5 0.5B Instruct',
    params: '0.5B',
    note: { zh: '中文友好，加载最快', en: 'Good Chinese, fastest to load' }
  },
  {
    id: 'onnx-community/Llama-3.2-1B-Instruct',
    label: 'Llama 3.2 1B Instruct',
    params: '1.2B',
    note: { zh: '英文更强，占用更多内存', en: 'Stronger English, more memory' }
  },
  {
    id: 'onnx-community/Qwen2.5-1.5B-Instruct',
    label: 'Qwen2.5 1.5B Instruct',
    params: '1.5B',
    note: { zh: '效果更好，速度较慢', en: 'Better quality, slower' }
  }
]

export const EMBED_MODEL = 'Xenova/all-MiniLM-L6-v2'

// 浏览器里只能用带 CORS 的源；hf-mirror 仅为 CLI/脚本下载设计，前端 fetch 会被 CORS 拦截
export const MODEL_SOURCES = [
  { id: 'hf', host: 'https://huggingface.co', label: { zh: 'HuggingFace 官方', en: 'HuggingFace' } },
  { id: 'mirror', host: 'https://hf-mirror.com', label: { zh: 'hf-mirror（无 CORS，仅命令行）', en: 'hf-mirror (no CORS)' } },
  { id: 'custom', host: '', label: { zh: '自定义代理地址', en: 'Custom host' } }
]

const CUSTOM_HOST_KEY = 'webai.customHost'
let customHost = ''
try {
  customHost = localStorage.getItem(CUSTOM_HOST_KEY) || ''
} catch (error) {
  log.debug('读取自定义下载源失败', error)
}

/** 设置自定义下载源（需支持 CORS），例如自建的 HF 反向代理 */
export const setCustomHost = (host) => {
  customHost = String(host || '').trim().replace(/\/+$/, '')
  try {
    localStorage.setItem(CUSTOM_HOST_KEY, customHost)
  } catch (error) {
    log.debug('保存自定义下载源失败', error)
  }
  log.info('自定义下载源', { host: customHost })
  return customHost
}

export const getCustomHost = () => customHost

const hostOf = (sourceId) => {
  if (sourceId === 'custom') return customHost
  const found = MODEL_SOURCES.find((item) => item.id === sourceId) || MODEL_SOURCES[0]
  return found.host
}

const applySource = (lib, source) => {
  const host = hostOf(source)
  if (!host) {
    log.warn('下载源地址为空，保持当前源', { source })
    return false
  }
  try {
    lib.env.remoteHost = host
    log.info('模型下载源', { host })
    return true
  } catch (error) {
    log.debug('设置模型下载源失败', error)
    return false
  }
}

/** 给 transformers.js 的 fetch 加重试：大文件下载偶发断连时可以自愈 */
const createRetryFetch = (attempts = 3) => async (input, init = {}) => {
  let lastError = null
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(input, init)
    } catch (error) {
      lastError = error
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 900 * (i + 1)))
      }
    }
  }
  throw lastError
}

const probeUrl = async (url, { headers, timeout = 10000 } = {}) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  const startedAt = performance.now()
  try {
    const response = await fetch(url, { signal: controller.signal, headers, cache: 'no-store' })
    return {
      ok: response.ok,
      status: response.status,
      ms: Math.round(performance.now() - startedAt),
      message: ''
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      ms: Math.round(performance.now() - startedAt),
      message: String(error?.message || error)
    }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 探测某个下载源是否可用。
 * deep=true 时额外用 Range 请求探测权重文件，验证大文件链路（不会真的下载整个模型）。
 */
export const probeSource = async ({ sourceId, modelId, deep = false }) => {
  const host = hostOf(sourceId)
  const id = sourceId || MODEL_SOURCES[0].id
  if (!host) {
    return {
      id,
      host: '',
      reachable: false,
      results: [{ label: 'config.json', ok: false, status: 0, ms: 0, message: '未配置自定义地址' }]
    }
  }
  const base = `${host}/${modelId}/resolve/main`
  const checks = [{ label: 'config.json', url: `${base}/config.json` }]
  if (deep) {
    checks.push({ label: 'model_q4f16.onnx', url: `${base}/onnx/model_q4f16.onnx`, headers: { Range: 'bytes=0-1023' } })
  }
  const results = await Promise.all(
    checks.map(async (item) => ({ label: item.label, ...(await probeUrl(item.url, { headers: item.headers })) }))
  )
  // 只要拿到了 HTTP 响应就说明链路通（404 只代表该文件不存在）
  const reachable = results.some((item) => item.status > 0)
  return { id, host, reachable, results }
}

/** 依次探测所有可用下载源，返回第一个链路上可达的源 */
export const pickSource = async (modelId, { deep = false } = {}) => {
  const candidates = MODEL_SOURCES.filter((item) => hostOf(item.id))
  const probes = await Promise.all(
    candidates.map((item) => probeSource({ sourceId: item.id, modelId, deep }))
  )
  log.info('下载源探测', probes.map((item) => ({ id: item.id, reachable: item.reachable, results: item.results })))
  const hit = probes.find((item) => item.reachable)
  return { source: hit?.id || null, probes }
}

/**
 * 计算下载源尝试顺序。
 * source='auto' 时先探测，选中可达的源并把它排在最前；指定源时则把它排最前，失败后自动换下一个。
 */
export const resolveSourceOrder = async (sourceId, modelId) => {
  const allIds = MODEL_SOURCES
    .filter((item) => hostOf(item.id) || item.id === sourceId)
    .map((item) => item.id)
  if (sourceId && sourceId !== 'auto') {
    return { order: [sourceId, ...allIds.filter((id) => id !== sourceId)], probes: [] }
  }
  const { source, probes } = await pickSource(modelId)
  if (!source) throw new Error('所有下载源均不可达：hf-mirror 没有 CORS 头，浏览器无法直接下载；请使用官方源（需能访问）或填写支持 CORS 的自定义代理地址')
  return { order: [source, ...allIds.filter((id) => id !== source)], probes }
}

/** 清理 transformers.js 的模型缓存，修复“缓存了半截文件导致一直失败”的情况 */
export const clearModelCache = async () => {
  if (typeof caches === 'undefined') return 0
  const names = await caches.keys()
  let removed = 0
  for (const name of names) {
    if (/transformers|huggingface|onnx|model/i.test(name)) {
      await caches.delete(name)
      removed++
    }
  }
  log.info('清理模型缓存', { removed })
  return removed
}

let libPromise = null

/** 动态加载 Transformers.js（其内部使用 ONNX Runtime Web 执行推理） */
export const loadRuntime = () => {
  if (!libPromise) {
    libPromise = (async () => {
      let lastError = null
      // 两轮：第二轮带时间戳参数，绕过可能被缓存的失败结果
      for (let pass = 0; pass < 2; pass++) {
        for (const base of CDN_ENTRIES) {
          const url = pass === 0 ? base : `${base}?retry=${Date.now()}`
          try {
            log.info('加载 Transformers.js 运行时', { url })
            const lib = await import(/* @vite-ignore */ url)
            log.info('Transformers.js 运行时加载完成', { url })
            try {
              lib.env.allowLocalModels = false
              lib.env.useBrowserCache = true
              lib.env.fetch = createRetryFetch()
            } catch (error) {
              log.debug('运行时环境配置失败（可忽略）', error)
            }
            return lib
          } catch (error) {
            lastError = error
            log.warn('运行时入口加载失败，尝试下一个入口', { url, error: String(error) })
          }
        }
      }
      libPromise = null
      throw new Error(`运行时下载失败，请检查网络或代理：${lastError?.message || lastError}`)
    })()
  }
  return libPromise
}

/** WebGPU 是否真正可用（有设备不代表有可适配的 GPU） */
export const detectWebGPU = async () => {
  if (typeof navigator === 'undefined' || !navigator.gpu?.requestAdapter) return false
  try {
    const adapter = await navigator.gpu.requestAdapter()
    return !!adapter
  } catch (error) {
    log.debug('WebGPU 适配器检测失败', error)
    return false
  }
}

/** 4bit/8bit 精度映射：WebGPU 下 4bit 用 q4f16，WASM 下用 q4 */
export const resolveDtype = (precision, device) => {
  if (precision === 'q8') return 'q8'
  if (precision === 'fp16') return 'fp16'
  if (precision === 'fp32') return 'fp32'
  return device === 'webgpu' ? 'q4f16' : 'q4'
}

const shortName = (file) => String(file || '').split('/').pop()

// 网络类错误降级重试没有意义（换后端不会让权重下载成功），直接给出明确提示
const isNetworkError = (error) => /failed to fetch|networkerror|fetch failed|load failed|network/i.test(String(error?.message || error))

// 403/404 多半是当前镜像没有这份权重，换源有机会成功
const isSourceError = (error) => isNetworkError(error) || /\b(403|404|410)\b/.test(String(error?.message || error))

/** 把逐文件下载进度汇总成整体百分比 */
const createProgressHandler = (onProgress) => {
  const files = new Map()
  const snapshot = () => {
    let loaded = 0
    let total = 0
    files.forEach((item) => {
      loaded += item.loaded
      total += item.total
    })
    return total ? Math.min(99, Math.round((loaded / total) * 100)) : 0
  }
  return (event = {}) => {
    const { status, file, loaded = 0, total = 0 } = event
    if (file && total) files.set(file, { loaded, total })
    if (status === 'progress') {
      onProgress?.({ status, percent: snapshot(), file: shortName(file), loaded, total })
    } else if (status === 'done' && file) {
      onProgress?.({ status, percent: snapshot(), file: shortName(file) })
    } else if (status === 'ready') {
      onProgress?.({ status, percent: 100, file: '' })
    } else {
      onProgress?.({ status, percent: snapshot(), file: shortName(file) })
    }
  }
}

/**
 * 创建文本生成引擎。
 * 加载失败时会自动降级：WebGPU → WASM、4bit → 8bit，保证 Alpha 功能尽量可用。
 */
export const createChatEngine = async ({ modelId, precision, device, source, onProgress }) => {
  const lib = await loadRuntime()
  onProgress?.({ status: 'start', percent: 0, file: '' })
  const { order } = await resolveSourceOrder(source, modelId)

  const attempt = async (nextDevice, nextDtype) => {
    log.info('加载对话模型', { modelId, device: nextDevice, dtype: nextDtype })
    const generator = await lib.pipeline('text-generation', modelId, {
      dtype: nextDtype,
      device: nextDevice,
      progress_callback: createProgressHandler(onProgress)
    })
    const tokenizer = await lib.AutoTokenizer.from_pretrained(modelId)
    return { generator, tokenizer }
  }

  // 同一份权重在某个后端失败时降级：WebGPU → WASM、4bit → 8bit
  const loadWithFallback = async () => {
    let actualDevice = device
    let dtype = resolveDtype(precision, device)
    try {
      return { ...(await attempt(actualDevice, dtype)), actualDevice, dtype }
    } catch (error) {
      if (isNetworkError(error)) throw error
      log.warn('首次加载失败，准备降级重试', { device: actualDevice, dtype, error: String(error) })
      if (actualDevice === 'webgpu') {
        actualDevice = 'wasm'
        dtype = resolveDtype(precision, 'wasm')
      } else if (dtype === 'q4') {
        dtype = 'q8'
      } else {
        throw error
      }
      onProgress?.({ status: 'retry', percent: 0, file: '' })
      return { ...(await attempt(actualDevice, dtype)), actualDevice, dtype }
    }
  }

  let loaded = null
  for (let i = 0; i < order.length; i++) {
    applySource(lib, order[i])
    try {
      loaded = await loadWithFallback()
      break
    } catch (error) {
      const hasNext = i < order.length - 1
      if (!hasNext || !isSourceError(error)) {
        throw isNetworkError(error) ? new Error(`模型权重下载失败：${error?.message || error}`) : error
      }
      log.warn('当前下载源失败，切换下一个源', { source: order[i], error: String(error) })
      onProgress?.({ status: 'source', percent: 0, file: '', source: order[i + 1] })
    }
  }

  const { generator, tokenizer, actualDevice, dtype } = loaded
  let current = null

  const generate = async ({ messages, maxNewTokens = 256, temperature = 0.7, topP = 0.9, onToken }) => {
    const stopping = lib.InterruptableStoppingCriteria
      ? new lib.InterruptableStoppingCriteria()
      : null
    let text = ''
    const streamer = new lib.TextStreamer(tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (piece) => {
        text += piece
        onToken?.(piece)
      }
    })

    current = { stopping }
    const startedAt = performance.now()
    try {
      await generator(messages, {
        max_new_tokens: maxNewTokens,
        do_sample: true,
        temperature,
        top_p: topP,
        repetition_penalty: 1.1,
        streamer,
        ...(stopping ? { stopping_criteria: stopping } : {})
      })
    } finally {
      current = null
    }
    const elapsed = performance.now() - startedAt
    log.info('生成完成', { chars: text.length, ms: Math.round(elapsed) })
    return { text, elapsed }
  }

  const stop = () => {
    try {
      current?.stopping?.interrupt()
      log.info('已请求中断生成')
    } catch (error) {
      log.debug('中断生成失败', error)
    }
  }

  const unload = async () => {
    try {
      await generator.dispose?.()
      log.info('对话模型已卸载')
    } catch (error) {
      log.debug('卸载模型失败', error)
    }
  }

  return { generate, stop, unload, device: actualDevice, dtype }
}

/** 创建向量引擎（ONNX Runtime Web 上的轻量 8bit 模型） */
export const createEmbedEngine = async ({ device = 'wasm', precision = 'q8', source, onProgress } = {}) => {
  const lib = await loadRuntime()
  onProgress?.({ status: 'start', percent: 0, file: '' })
  const { order } = await resolveSourceOrder(source, EMBED_MODEL)
  const dtype = resolveDtype(precision, device)
  log.info('加载向量模型', { model: EMBED_MODEL, device, dtype })

  let extractor = null
  for (let i = 0; i < order.length; i++) {
    applySource(lib, order[i])
    try {
      extractor = await lib.pipeline('feature-extraction', EMBED_MODEL, {
        dtype,
        device,
        progress_callback: createProgressHandler(onProgress)
      })
      break
    } catch (error) {
      const hasNext = i < order.length - 1
      if (!hasNext || !isSourceError(error)) throw error
      log.warn('向量模型下载源失败，切换下一个源', { source: order[i], error: String(error) })
      onProgress?.({ status: 'source', percent: 0, file: '', source: order[i + 1] })
    }
  }

  const embed = async (texts) => {
    const output = await extractor(texts, { pooling: 'mean', normalize: true })
    return output.tolist()
  }

  const unload = async () => {
    try {
      await extractor.dispose?.()
      log.info('向量模型已卸载')
    } catch (error) {
      log.debug('卸载模型失败', error)
    }
  }

  return { embed, unload, dtype }
}
