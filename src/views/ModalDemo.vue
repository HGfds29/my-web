<template>
  <div class="demo-page" :class="{ leaving: isLeaving }">
    <div class="page-header stagger-item" :style="{ '--delay': '0.05s' }">
      <button class="back-btn" @click="goBack">{{ L('← 返回首页', '← Back to Home') }}</button>
      <h1>{{ L('弹窗 / 通知测试页', 'Modal & Toast Playground') }}</h1>
      <p class="subtitle">
        {{ L('逐个触发站点内置的弹窗、输入框、加载动画与 Toast，用来快速检查样式和图标',
             'Trigger every built-in dialog, prompt, loader and toast to check styling and icons quickly') }}
      </p>
    </div>

    <section class="panel stagger-item" :style="{ '--delay': '0.1s' }">
      <h2><AppIcon name="报错_caution" :size="20" />{{ L('通用弹窗', 'Dialogs') }}</h2>
      <div class="grid">
        <button class="demo-btn" @click="onInfo"><AppIcon name="系统_system" :size="16" />{{ L('信息', 'Info') }}</button>
        <button class="demo-btn" @click="onSuccess"><AppIcon name="邮件发送成功_email-successfully" :size="16" />{{ L('成功', 'Success') }}</button>
        <button class="demo-btn" @click="onWarning"><AppIcon name="警报_alarm" :size="16" />{{ L('警告', 'Warning') }}</button>
        <button class="demo-btn" @click="onError"><AppIcon name="报错_caution" :size="16" />{{ L('错误', 'Error') }}</button>
        <button class="demo-btn" @click="onConfirm"><AppIcon name="安全_shield" :size="16" />{{ L('确认框', 'Confirm') }}</button>
      </div>
      <p class="note">
        {{ L('点「确定 / 取消 / ×」都会播放退场动画（卡片加速内缩上移，遮罩多留 40ms）。',
             'Confirm / Cancel / × all play the exit animation (the card accelerates inward and up; the overlay lingers 40ms longer).') }}
      </p>
    </section>

    <section class="panel stagger-item" :style="{ '--delay': '0.15s' }">
      <h2><AppIcon name="配置_config" :size="20" />{{ L('输入弹窗', 'Prompts') }}</h2>
      <div class="grid">
        <button class="demo-btn" @click="onPromptText"><AppIcon name="配置_config" :size="16" />{{ L('单行输入（带校验）', 'Text input (validated)') }}</button>
        <button class="demo-btn" @click="onPromptArea"><AppIcon name="文件柜_file-cabinet" :size="16" />{{ L('多行输入', 'Textarea') }}</button>
      </div>
    </section>

    <section class="panel stagger-item" :style="{ '--delay': '0.2s' }">
      <h2><AppIcon name="加载4_loading-four" :size="20" />{{ L('加载弹窗', 'Loading') }}</h2>
      <div class="grid">
        <button class="demo-btn" @click="onLoadingPlain"><AppIcon name="加载4_loading-four" :size="16" />{{ L('普通加载', 'Plain') }}</button>
        <button class="demo-btn" @click="onLoadingProgress"><AppIcon name="加载_loading" :size="16" />{{ L('带进度条', 'With progress') }}</button>
        <button class="demo-btn" @click="onLoadingCancel"><AppIcon name="开关_power" :size="16" />{{ L('可取消', 'Cancelable') }}</button>
      </div>
    </section>

    <section class="panel stagger-item" :style="{ '--delay': '0.25s' }">
      <h2><AppIcon name="举报_report" :size="20" />{{ L('Toast 通知', 'Toasts') }}</h2>
      <div class="grid">
        <button class="demo-btn" @click="onToastInfo"><AppIcon name="系统_system" :size="16" />{{ L('信息', 'Info') }}</button>
        <button class="demo-btn" @click="onToastSuccess"><AppIcon name="邮件发送成功_email-successfully" :size="16" />{{ L('成功', 'Success') }}</button>
        <button class="demo-btn" @click="onToastWarning"><AppIcon name="警报_alarm" :size="16" />{{ L('警告', 'Warning') }}</button>
        <button class="demo-btn" @click="onToastError"><AppIcon name="报错_caution" :size="16" />{{ L('错误', 'Error') }}</button>
        <button class="demo-btn" @click="onToastLoading"><AppIcon name="加载_loading" :size="16" />{{ L('加载后转成功', 'Loading → success') }}</button>
        <button class="demo-btn" @click="onToastPosition"><AppIcon name="更多2_more-two" :size="16" />{{ L('切换弹出位置', 'Cycle position') }}</button>
        <button class="demo-btn danger" @click="clearAll"><AppIcon name="删除_delete-two" :size="16" />{{ L('清空全部', 'Clear all') }}</button>
      </div>
      <p class="note">
        {{ L('提示：把鼠标停在 Toast 上可以验证计时暂停。', 'Tip: hover a toast to verify the timer pauses.') }}
      </p>
    </section>
  </div>
</template>

<script setup>
import { onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { isLeaving } from '../router'
import { locale } from '../utils/i18n'
import AppIcon from '../components/AppIcon.vue'
import {
  showInfo,
  showSuccess,
  showWarning,
  showError,
  showConfirm,
  showPrompt,
  showLoading,
  updateLoading,
  hideLoading
} from '../utils/modal'
import {
  toastInfo,
  toastSuccess,
  toastWarning,
  toastError,
  toastLoading,
  dismiss,
  clearAll,
  setPosition
} from '../utils/toast'

const router = useRouter()

/** 这一页是开发用的测试页，文案就近处理，不进 i18n 词条表 */
const L = (zh, en) => (locale.value === 'zh' ? zh : en)

const goBack = () => {
  router.push('/')
}

const onInfo = () => showInfo(L('这是一条信息提示，用来检查图标与配色。', 'An informational message to check icons and colors.'))
const onSuccess = () => showSuccess(L('操作已经成功完成。', 'The operation completed successfully.'))
const onWarning = () => showWarning(L('注意：这一步可能无法撤销。', 'Careful — this step may not be reversible.'))
const onError = () => showError(L('出错了，请稍后重试。', 'Something went wrong, please try again later.'))

const onConfirm = () => showConfirm(L('确定要执行这个操作吗？', 'Run this action?'), {
  onConfirm: () => toastSuccess(L('已确认', 'Confirmed')),
  onCancel: () => toastInfo(L('已取消', 'Cancelled'))
})

const onPromptText = () => showPrompt({
  title: L('请输入昵称', 'Enter a nickname'),
  message: L('3–12 个字符，且不能包含空格', '3–12 characters, no spaces'),
  minLength: 3,
  maxLength: 12,
  pattern: /^\S+$/,
  patternError: L('不能包含空格', 'Spaces are not allowed'),
  onConfirm: (value) => toastSuccess(L(`收到：${value}`, `Got: ${value}`))
})

const onPromptArea = () => showPrompt({
  title: L('写点什么', 'Say something'),
  message: L('多行输入，最多 120 字', 'Multi-line input, up to 120 characters'),
  inputType: 'textarea',
  textareaRows: 5,
  maxLength: 120,
  onConfirm: (value) => toastSuccess(L(`收到 ${value.length} 个字符`, `Got ${value.length} characters`))
})

let progressTimer = null
let closeTimer = null

const clearTimers = () => {
  clearInterval(progressTimer)
  clearTimeout(closeTimer)
  progressTimer = null
  closeTimer = null
}

const onLoadingPlain = () => {
  clearTimers()
  showLoading({
    title: L('加载中', 'Loading'),
    message: L('普通加载弹窗，1.8 秒后自动关闭', 'Plain loader, closes after 1.8s')
  })
  closeTimer = setTimeout(hideLoading, 1800)
}

const onLoadingProgress = () => {
  clearTimers()
  let percent = 0
  showLoading({ percent: 0, message: L('正在处理', 'Processing') })
  progressTimer = setInterval(() => {
    percent += 10
    if (percent >= 100) {
      clearInterval(progressTimer)
      progressTimer = null
      updateLoading({ percent: 100, message: L('已完成', 'Done') })
      closeTimer = setTimeout(hideLoading, 500)
      return
    }
    updateLoading({ percent })
  }, 200)
}

const onLoadingCancel = () => {
  clearTimers()
  showLoading({
    title: L('可取消的加载', 'Cancelable loading'),
    message: L('点下面的取消按钮试试', 'Try the cancel button below'),
    cancelable: true,
    onCancel: () => {
      hideLoading()
      toastWarning(L('已取消加载', 'Loading cancelled'))
    }
  })
}

const onToastInfo = () => toastInfo(L('这是一条信息 Toast', 'An info toast'))
const onToastSuccess = () => toastSuccess(L('保存成功', 'Saved successfully'))
const onToastWarning = () => toastWarning(L('磁盘空间不足', 'Low disk space'))
const onToastError = () => toastError(L('网络请求失败', 'Request failed'))

const onToastLoading = () => {
  const id = toastLoading(L('正在保存…', 'Saving…'))
  setTimeout(() => {
    dismiss(id)
    toastSuccess(L('已保存', 'Saved'))
  }, 2000)
}

const POSITIONS = ['top-right', 'top-left', 'top-center', 'bottom-right', 'bottom-left', 'bottom-center', 'center']
let positionIndex = 0

const onToastPosition = () => {
  positionIndex = (positionIndex + 1) % POSITIONS.length
  const pos = POSITIONS[positionIndex]
  setPosition(pos)
  toastInfo(L(`弹出位置：${pos}`, `Position: ${pos}`))
}

onUnmounted(() => {
  clearTimers()
  hideLoading()
})
</script>

<style scoped>
.demo-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
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
  padding: 40px 0 20px;
}

.back-btn {
  position: absolute;
  left: 20px;
  top: 20px;
  background: none;
  border: none;
  color: #42b983;
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
  font-size: 15px;
  margin: 0;
  line-height: 1.6;
}

.panel {
  margin-top: 24px;
  padding: 20px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.panel h2 {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #42b983;
}

.panel h2 .app-icon {
  color: #42b983;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.demo-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #f7fbf9;
  border: 1px solid #d9ece3;
  border-radius: 8px;
  color: #2c7a52;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-btn:hover {
  border-color: #42b983;
  color: #42b983;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(66, 185, 131, 0.18);
}

.demo-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.demo-btn.danger {
  background: #fdf5f5;
  border-color: #f0d9d9;
  color: #c0453f;
}

.demo-btn.danger:hover {
  border-color: #e0524b;
  color: #e0524b;
  box-shadow: 0 3px 10px rgba(224, 82, 75, 0.18);
}

.note {
  margin: 14px 0 0;
  font-size: 13px;
  color: #999;
}
</style>
