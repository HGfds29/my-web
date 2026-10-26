import { supabase, chatClientId } from './supabase'
import { createLogger, setLogSink } from './logger'

/**
 * 日志落库（可选功能，默认关闭）
 *
 * 开启后：把控制台日志批量写入 Supabase 表 site_logs，只保留 2 天。
 * 开启方式：控制台执行 siteLog.enableUpload()（会记住选择），
 *          或 siteLog.disableUpload() 关闭。
 *
 * 使用前需在 Supabase SQL Editor 执行项目根目录的 setup-logs.sql。
 */

const UPLOAD_KEY = 'siteLogUpload'
const CLEANUP_KEY = 'siteLogCleanupAt'
const RETENTION_DAYS = 2
const BATCH_SIZE = 100
const UPLOAD_THRESHOLD = 100
const MAX_QUEUE = 500
const MIN_UPLOAD_INTERVAL = 10 * 60 * 1000
const EXIT_UPLOAD_INTERVAL = 3 * 60 * 1000
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000
const MAX_MESSAGE = 2000
const MAX_DETAIL = 4000
const MAX_FAILURES = 3

const log = createLogger('logUpload')

const queue = []
let flushTimer = null
let flushing = false
let failures = 0
let installed = false
let authBound = false
let userId = null
let lastAttemptAt = 0

// 同一次页面会话共用一个 id，便于把一次访问的日志串起来
const genUuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
const sessionId =
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : genUuid()

/** 是否已开启日志上传（持久化在 localStorage） */
export const isLogUploadEnabled = () => {
  try {
    return localStorage.getItem(UPLOAD_KEY) === '1'
  } catch {
    return false
  }
}

const setFlag = (enabled) => {
  try {
    localStorage.setItem(UPLOAD_KEY, enabled ? '1' : '0')
  } catch {
    // 隐私模式下写不进去，仅本次会话生效
  }
}

const truncate = (value, max) => {
  const text = String(value ?? '')
  return text.length > max ? `${text.slice(0, max)}…` : text
}

const toDetail = (values) => {
  if (!values.length) return null
  const raw = values.length === 1 ? values[0] : values
  try {
    const text = JSON.stringify(raw)
    if (!text) return null
    // 过大的对象只保留截断后的文本，避免 jsonb 字段过大
    if (text.length > MAX_DETAIL) return { truncated: text.slice(0, MAX_DETAIL) }
    return JSON.parse(text)
  } catch {
    return { text: truncate(raw instanceof Error ? raw.stack : raw, MAX_DETAIL) }
  }
}

// 把日志参数拆成「可读消息」+「结构化详情」
const buildEntry = (level, scope, args) => {
  const parts = []
  const details = []

  args.forEach((arg) => {
    if (arg instanceof Error) {
      details.push({ name: arg.name, message: arg.message, stack: truncate(arg.stack || '', 1500) })
    } else if (arg === null || typeof arg !== 'object') {
      parts.push(String(arg))
    } else {
      details.push(arg)
    }
  })

  return {
    ts: new Date().toISOString(),
    level,
    scope: truncate(scope, 64),
    message: truncate(parts.join(' ') || '(无消息)', MAX_MESSAGE),
    detail: toDetail(details)
  }
}

const clearFlushTimer = () => {
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
}

const schedule = (delay = 0) => {
  if (!installed || flushTimer || flushing) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    flush()
  }, delay)
}

const flush = async () => {
  if (!installed || flushing || !queue.length) return
  clearFlushTimer()
  flushing = true
  lastAttemptAt = Date.now()
  const batch = queue.splice(0, BATCH_SIZE)

  try {
    // 一批日志写成一行，logs 字段是 JSON 数组，避免数据库里一条日志一行
    const { error } = await supabase.from('site_logs').insert({
      session_id: sessionId,
      user_id: userId,
      client_id: chatClientId,
      page: truncate(`${window.location.pathname}${window.location.hash}`, 300),
      user_agent: truncate(navigator.userAgent || '', 300),
      log_count: batch.length,
      levels: [...new Set(batch.map((item) => item.level))],
      logs: batch
    })
    if (error) throw error
    failures = 0
  } catch (e) {
    failures++
    // 上传失败的日志退回队列，受 MAX_QUEUE 限制避免无限增长
    queue.unshift(...batch)
    if (queue.length > MAX_QUEUE) queue.splice(MAX_QUEUE)
    if (failures === 1) {
      log.warn('日志上传失败（请确认已在 Supabase 重新执行 setup-logs.sql）', {
        message: e?.message || String(e),
        code: e?.code,
        details: e?.details,
        hint: e?.hint,
        batchSize: batch.length
      })
    }
    if (failures >= MAX_FAILURES) {
      installed = false
      log.warn(`日志上传连续失败 ${failures} 次，本次会话停止上传，刷新页面可重试`)
    }
  } finally {
    flushing = false
  }
}

// 清理过期日志：每天最多执行一次，避免频繁占用写额度
const cleanupExpired = async () => {
  let lastCleanup = 0
  try {
    lastCleanup = Number(localStorage.getItem(CLEANUP_KEY) || 0)
  } catch {
    lastCleanup = 0
  }
  if (Date.now() - lastCleanup < CLEANUP_INTERVAL) return

  const before = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const { error } = await supabase.from('site_logs').delete().lt('created_at', before)
  if (error) {
    log.warn('清理过期日志失败（检查 setup-logs.sql 中的删除策略）', error.message)
    return
  }
  try {
    localStorage.setItem(CLEANUP_KEY, String(Date.now()))
  } catch {
    // 写不进 localStorage 时下次再清
  }
  log.debug('已清理 2 天前的日志', before)
}

const onLog = (level, scope, args) => {
  if (!installed) return
  // 上传模块自身与 logger 的日志不落库，避免自举循环
  if (scope === 'logUpload' || scope === 'logger') return

  queue.push(buildEntry(level, scope, args))
  if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - MAX_QUEUE)

  // 只有攒够阈值、且距上次上传超过最小间隔时才主动上报，其余等离开页面时一次性写入
  if (queue.length >= UPLOAD_THRESHOLD && Date.now() - lastAttemptAt >= MIN_UPLOAD_INTERVAL) {
    schedule(2000)
  }
}

const onPageExit = () => {
  if (!installed || flushing || !queue.length) return
  // 刚上传过就不再发，避免频繁切换标签页时反复写库
  if (Date.now() - lastAttemptAt < EXIT_UPLOAD_INTERVAL) return
  flush()
}

const onVisibilityChange = () => {
  if (document.visibilityState === 'hidden') onPageExit()
}
const onPageHide = () => onPageExit()

/**
 * 按当前开关状态安装上传能力；关闭时不做任何网络请求
 */
export const installLogUploader = () => {
  if (typeof window === 'undefined') return

  if (!isLogUploadEnabled()) {
    log.info('日志上传未开启（控制台执行 siteLog.enableUpload() 可开启，仅保留 2 天）')
    return
  }

  if (installed) return

  if (!import.meta.env.VITE_SUPABASE_URL) {
    log.warn('未配置 Supabase，无法上传日志')
    return
  }

  installed = true
  failures = 0
  setLogSink(onLog)

  if (!authBound) {
    authBound = true
    // 记录当前登录用户，便于按用户查日志（不阻塞、失败无所谓）
    supabase.auth
      .getSession()
      .then(({ data }) => {
        userId = data.session?.user?.id || null
      })
      .catch(() => {})
    supabase.auth.onAuthStateChange((_event, session) => {
      userId = session?.user?.id || null
    })
  }

  // 页面隐藏/关闭前尽量把队列发出去
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('pagehide', onPageHide)

  cleanupExpired()

  log.info(`日志上传已开启：保留 ${RETENTION_DAYS} 天，攒满 ${UPLOAD_THRESHOLD} 条或离开页面时合并为 1 行写入`)
  // 不做启动即上传：日志先在本地攒着，攒满阈值或离开页面时一次性写库，节省数据库读写额度
}

/** 开启日志上传并立即生效（持久化，下次访问仍开启） */
export const enableLogUpload = () => {
  setFlag(true)
  if (installed) {
    log.info('日志上传已是开启状态')
    return
  }
  installLogUploader()
}

/** 关闭日志上传：停止上报、清空队列，日志只留在控制台 */
export const disableLogUpload = () => {
  setFlag(false)
  if (!installed) {
    log.info('日志上传本就是关闭状态')
    return
  }
  installed = false
  clearFlushTimer()
  queue.length = 0
  setLogSink(null)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('pagehide', onPageHide)
  log.info('日志上传已关闭，后续日志不会再发送到数据库')
}

// 暴露到控制台：siteLog.enableUpload() / siteLog.disableUpload()
if (typeof window !== 'undefined') {
  window.siteLog = {
    ...(window.siteLog || {}),
    enableUpload: enableLogUpload,
    disableUpload: disableLogUpload,
    isUploadEnabled: isLogUploadEnabled
  }
}
