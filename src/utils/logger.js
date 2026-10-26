/**
 * 全局日志模块
 *
 * 统一前缀 [模块名]，四级输出：
 *   debug  细节追踪（快照、耗时、中间状态），生产环境默认关闭
 *   info   正常流程与关键动作（页面加载、请求成功、用户操作）
 *   warn   可恢复的异常（降级、跳过、权限不足）
 *   error  真正的失败（接口报错、未捕获异常）
 *
 * 生产环境打开 debug：控制台执行 siteLog.enableDebug() 后刷新。
 */

const DEBUG_KEY = 'siteLogDebug'

const debugEnabled = () => {
  try {
    if (import.meta.env.DEV) return true
    return localStorage.getItem(DEBUG_KEY) === '1'
  } catch {
    return true
  }
}

// 日志落库钩子：由 logUploader 注册，避免 logger 反向依赖 supabase 造成循环导入
let logSink = null
let pendingLogs = []
const MAX_PENDING = 200

/**
 * 注册日志落地函数（上传到 Supabase），注册前产生的日志会补发
 * @param {(level: string, scope: string, args: unknown[]) => void} fn
 */
export const setLogSink = (fn) => {
  logSink = fn
  const pending = pendingLogs
  pendingLogs = []
  if (!fn) return
  pending.forEach((item) => {
    try {
      fn(item.level, item.scope, item.args)
    } catch {
      // 落库失败不能影响页面
    }
  })
}

const emit = (level, scope, args) => {
  if (logSink) {
    try {
      logSink(level, scope, args)
    } catch {
      // 落库失败不能影响页面
    }
    return
  }
  if (pendingLogs.length >= MAX_PENDING) pendingLogs.shift()
  pendingLogs.push({ level, scope, args })
}

/**
 * 创建带模块前缀的 logger
 * @param {string} scope 模块名，例如 'router'、'Chat'
 */
export const createLogger = (scope) => {
  const tag = `[${scope}]`
  return {
    debug: (...args) => {
      if (!debugEnabled()) return
      console.debug(tag, ...args)
      emit('debug', scope, args)
    },
    info: (...args) => {
      console.log(tag, ...args)
      emit('info', scope, args)
    },
    warn: (...args) => {
      console.warn(tag, ...args)
      emit('warn', scope, args)
    },
    error: (...args) => {
      console.error(tag, ...args)
      emit('error', scope, args)
    },
    /** 同一 key 只输出一次，避免同类错误刷屏 */
    once: (key, level, ...args) => {
      if (onceKeys.has(`${scope}:${key}`)) return
      onceKeys.add(`${scope}:${key}`)
      const fn = level === 'warn' ? console.warn : level === 'error' ? console.error : console.log
      fn(tag, ...args)
      emit(level === 'warn' || level === 'error' ? level : 'info', scope, args)
    }
  }
}

const onceKeys = new Set()

export const setDebugEnabled = (enabled) => {
  try {
    localStorage.setItem(DEBUG_KEY, enabled ? '1' : '0')
    console.log(`[logger] debug 日志已${enabled ? '开启' : '关闭'}，刷新页面后生效`)
  } catch (e) {
    console.warn('[logger] 无法写入 localStorage', e)
  }
}

/**
 * 安装全局日志：未捕获异常、资源加载失败、未处理的 Promise、
 * Vue 组件异常与警告、路由错误
 */
export const installGlobalLogging = (app, router) => {
  const log = createLogger('global')

  if (typeof window !== 'undefined') {
    // 捕获阶段才能拿到资源（img/script/link）加载失败
    window.addEventListener('error', (event) => {
      if (event instanceof ErrorEvent) {
        log.error(`未捕获异常：${event.message}`, {
          source: event.filename,
          line: event.lineno,
          column: event.colno,
          error: event.error
        })
        return
      }
      const el = event.target
      const url = el?.currentSrc || el?.src || el?.href || ''
      log.warn(`资源加载失败：<${(el?.tagName || 'unknown').toLowerCase()}> ${url}`)
    }, true)

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason
      log.error('未处理的 Promise 拒绝', reason?.stack || reason)
    })

    // 方便在控制台开关 debug 日志（保留 logUploader 挂上的上传开关）
    window.siteLog = {
      ...(window.siteLog || {}),
      enableDebug: () => setDebugEnabled(true),
      disableDebug: () => setDebugEnabled(false),
      isDebug: debugEnabled
    }
  }

  app.config.errorHandler = (err, instance, info) => {
    const name = instance?.$options?.name || instance?.$?.type?.__name || 'unknown'
    log.error(`组件异常：${info}（${name}）`, err)
  }

  app.config.warnHandler = (msg, instance, trace) => {
    log.warn(`Vue 警告：${msg}`, trace)
  }

  if (router) {
    router.onError((err) => {
      log.error('路由加载失败', err)
    })
  }

  log.info('全局日志已安装', {
    mode: import.meta.env.MODE,
    debug: debugEnabled() ? '开启' : '关闭（siteLog.enableDebug() 可开启）'
  })
}
