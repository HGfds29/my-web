<template>
  <NavBar v-if="!hideNav" :class="{ 'nav-hidden': isLogin && navReady }" />
  <div class="page-wrapper" :class="{ 'no-nav': hideNav || isLogin }">
    <router-view />
  </div>
  <FlagEasterEgg />
  <ErrorModal
    v-model:visible="modalVisible"
    :type="modalConfig.type"
    :title="modalConfig.title"
    :message="modalConfig.message"
    :confirmText="modalConfig.confirmText"
    :cancelText="modalConfig.cancelText"
    :showCancel="modalConfig.showCancel"
    :showClose="modalConfig.showClose"
    :closeOnOverlay="modalConfig.closeOnOverlay"
    :size="modalConfig.size"
    @confirm="onModalConfirm"
    @cancel="onModalCancel"
    @close="onModalClose"
  />
  <PromptModal
    v-model:visible="promptVisible"
    :title="promptConfig.title"
    :message="promptConfig.message"
    :placeholder="promptConfig.placeholder"
    :defaultValue="promptConfig.defaultValue"
    :confirmText="promptConfig.confirmText"
    :cancelText="promptConfig.cancelText"
    :showClose="promptConfig.showClose"
    :closeOnOverlay="promptConfig.closeOnOverlay"
    :size="promptConfig.size"
    :inputType="promptConfig.inputType"
    :textareaRows="promptConfig.textareaRows"
    :showCounter="promptConfig.showCounter"
    :required="promptConfig.required"
    :minLength="promptConfig.minLength"
    :maxLength="promptConfig.maxLength"
    :pattern="promptConfig.pattern"
    :patternError="promptConfig.patternError"
    @confirm="onPromptConfirm"
    @cancel="onPromptCancel"
    @close="onPromptClose"
  />
  <LoadingModal
    v-model:visible="loadingVisible"
    :title="loadingConfig.title"
    :message="loadingConfig.message"
    :cancelable="loadingConfig.cancelable"
    :cancelText="loadingConfig.cancelText"
    :transparent="loadingConfig.transparent"
    :size="loadingConfig.size"
    :percent="loadingConfig.percent"
    @cancel="onLoadingCancel"
  />
  <ToastContainer />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import FlagEasterEgg from './components/FlagEasterEgg.vue'
import ErrorModal from './components/ErrorModal.vue'
import PromptModal from './components/PromptModal.vue'
import LoadingModal from './components/LoadingModal.vue'
import ToastContainer from './components/ToastContainer.vue'
import {
  visible as modalVisible,
  config as modalConfig,
  handleConfirm as onModalConfirm,
  handleCancel as onModalCancel,
  handleClose as onModalClose,
  promptVisible,
  promptConfig,
  handlePromptConfirm as onPromptConfirm,
  handlePromptCancel as onPromptCancel,
  handlePromptClose as onPromptClose,
  loadingVisible,
  loadingConfig,
  handleLoadingCancel as onLoadingCancel
} from './utils/modal'

const route = useRoute()
const hideNav = computed(() => !!route.meta.hideNav)
const isLogin = computed(() => route.name === 'Login')

// 首屏直接进入登录页时，让顶栏先完成一帧绘制再向上滑出，保证动画可见
const navReady = ref(false)
onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { navReady.value = true })
  })
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.page-wrapper {
  padding-top: 60px;
}

.page-wrapper.no-nav {
  padding-top: 0;
}
</style>
