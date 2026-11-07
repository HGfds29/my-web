<template>
  <nav class="navbar" v-bind="$attrs">
    <div class="nav-container">
      <router-link to="/home" class="nav-logo">{{ t('nav.title') }}</router-link>
      <div class="nav-right">
        <div class="nav-links">
          <router-link to="/home" class="nav-link" active-class="active"><AppIcon name="全部_all-application" :size="15" />{{ t('nav.home') }}</router-link>
          <router-link to="/blog" class="nav-link" active-class="active"><AppIcon name="标签_tag" :size="15" />{{ t('nav.blog') }}</router-link>
          <router-link to="/photos" class="nav-link" active-class="active"><AppIcon name="预览-打开_preview-open" :size="15" />{{ t('nav.photos') }}</router-link>
          <router-link to="/games" class="nav-link" active-class="active"><AppIcon name="游戏手柄_game-handle" :size="15" />{{ t('nav.games') }}</router-link>
          <router-link to="/about" class="nav-link" active-class="active"><AppIcon name="更多2_more-two" :size="15" />{{ t('nav.about') }}</router-link>
          <div
            class="more-menu"
            :class="{ open: moreOpen }"
            @mouseenter="moreOpen = true"
            @mouseleave="moreOpen = false"
          >
            <button
              class="more-btn"
              :title="t('nav.moreTip')"
              aria-haspopup="true"
              :aria-expanded="moreOpen"
              @click="moreOpen = !moreOpen"
            >
              <AppIcon name="更多2_more-two" :size="15" />
              <span class="more-text">{{ t('nav.more') }}</span>
              <svg class="more-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 15 12 9 18 15" />
              </svg>
            </button>
            <div class="more-dropdown">
              <router-link to="/home" class="more-item mobile-nav-item" active-class="active" @click="moreOpen = false">
                <AppIcon name="全部_all-application" :size="16" />
                <span>{{ t('nav.home') }}</span>
              </router-link>
              <router-link to="/blog" class="more-item mobile-nav-item" active-class="active" @click="moreOpen = false">
                <AppIcon name="标签_tag" :size="16" />
                <span>{{ t('nav.blog') }}</span>
              </router-link>
              <router-link to="/photos" class="more-item mobile-nav-item" active-class="active" @click="moreOpen = false">
                <AppIcon name="预览-打开_preview-open" :size="16" />
                <span>{{ t('nav.photos') }}</span>
              </router-link>
              <router-link to="/games" class="more-item mobile-nav-item" active-class="active" @click="moreOpen = false">
                <AppIcon name="游戏手柄_game-handle" :size="16" />
                <span>{{ t('nav.games') }}</span>
              </router-link>
              <router-link to="/about" class="more-item mobile-nav-item" active-class="active" @click="moreOpen = false">
                <AppIcon name="更多2_more-two" :size="16" />
                <span>{{ t('nav.about') }}</span>
              </router-link>
              <router-link to="/demo" class="more-item" active-class="active" @click="moreOpen = false">
                <AppIcon name="系统_system" :size="16" />
                <span>{{ t('nav.menuDemo') }}</span>
              </router-link>
              <router-link to="/chat" class="more-item" active-class="active" @click="moreOpen = false">
                <AppIcon name="沟通_communication" :size="16" />
                <span>{{ t('nav.menuChat') }}</span>
              </router-link>
              <router-link to="/discussion" class="more-item" active-class="active" @click="moreOpen = false">
                <AppIcon name="评论_comments" :size="16" />
                <span>{{ t('nav.menuDiscussion') }}</span>
              </router-link>
              <router-link to="/ai" class="more-item" active-class="active" @click="moreOpen = false">
                <AppIcon name="工具_tool" :size="16" />
                <span>{{ t('nav.menuAI') }}</span>
              </router-link>
              <button class="more-item" @click="openChangelog">
                <AppIcon name="日志_log" :size="16" />
                <span>{{ t('nav.changelog') }}</span>
              </button>
            </div>
          </div>
        </div>
        <button class="lang-toggle" @click="toggleLanguage" :class="{ switching: isSwitching }" :title="t('nav.switchLangTip')">
          <span class="lang-icon">
            <AppIcon :name="locale === 'zh' ? '英文_english' : '中文_chinese'" :size="16" />
          </span>
          <span class="lang-text">{{ t('nav.switchLang') }}</span>
        </button>
        <div ref="userMenuRef" class="user-menu" :class="{ open: userOpen }">
          <button
            v-if="currentProfile"
            class="user-btn"
            aria-haspopup="true"
            :aria-expanded="userOpen"
            @click.stop="userOpen = !userOpen"
          >
            <span class="user-avatar">{{ (currentProfile.username || '?').slice(0, 1).toUpperCase() }}</span>
            <span class="user-name">{{ currentProfile.username }}</span>
            <svg class="more-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 15 12 9 18 15" />
            </svg>
          </button>
          <router-link v-else to="/login" class="user-btn user-login">
            <AppIcon name="用户_user" :size="16" />
            <span>{{ t('nav.login') }}</span>
          </router-link>

          <div v-if="currentProfile" class="user-card">
            <div class="user-card-head">
              <span class="user-card-avatar">{{ (currentProfile.username || '?').slice(0, 1).toUpperCase() }}</span>
              <div class="user-card-info">
                <p class="user-card-name">
                  {{ currentProfile.username }}
                  <span v-if="isAdmin" class="role-badge">{{ t('nav.adminBadge') }}</span>
                </p>
                <p class="user-card-email">{{ currentUser?.email || '' }}</p>
              </div>
            </div>
            <div class="user-card-divider"></div>
            <router-link to="/chat" class="user-card-item" @click="userOpen = false">
              <AppIcon name="沟通_communication" :size="16" />
              <span>{{ t('nav.menuChat') }}</span>
            </router-link>
            <router-link to="/discussion" class="user-card-item" @click="userOpen = false">
              <AppIcon name="评论_comments" :size="16" />
              <span>{{ t('nav.menuDiscussion') }}</span>
            </router-link>
            <button class="user-card-item" @click="changePassword">
              <AppIcon name="设置_setting" :size="16" />
              <span>{{ t('nav.changePassword') }}</span>
            </button>
            <button class="user-card-item" @click="copyUserId">
              <AppIcon name="复制_copy" :size="16" />
              <span>{{ t('nav.copyId') }}</span>
            </button>
            <div class="user-card-divider"></div>
            <button class="user-card-item danger" @click="doLogout">
              <AppIcon name="退出_exit" :size="16" />
              <span>{{ t('nav.logout') }}</span>
            </button>
          </div>
        </div>
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? t('nav.themeLight') : t('nav.themeDark')">
          <svg v-if="isDark" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
        <button
          class="settings-toggle"
          :class="{ active: settingsOpen }"
          :title="t('nav.settings')"
          :aria-label="t('nav.settings')"
          @click="openSettings"
        >
          <AppIcon name="设置配置_setting-config" :size="18" />
        </button>
      </div>
    </div>
  </nav>

  <Teleport to="body">
    <div class="settings-layer" :class="{ open: settingsOpen }" :aria-hidden="!settingsOpen">
      <div class="settings-overlay" @click="closeSettings"></div>
      <aside
        class="settings-drawer"
        role="dialog"
        aria-modal="true"
        :aria-label="t('nav.settings')"
      >
        <div class="settings-head">
          <span class="settings-title">{{ t('nav.settings') }}</span>
          <button class="settings-close" :aria-label="t('nav.close')" @click="closeSettings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>
        <div class="settings-body">
          <div class="setting-item">
            <div class="setting-text">
              <span class="setting-label">{{ t('nav.uploadLogs') }}</span>
              <span class="setting-desc">{{ t('nav.uploadLogsDesc') }}</span>
            </div>
            <button
              class="setting-switch"
              :class="{ on: uploadEnabled }"
              role="switch"
              :aria-checked="uploadEnabled"
              :aria-label="t('nav.uploadLogs')"
              @click="toggleUpload"
            >
              <span class="switch-knob"></span>
            </button>
          </div>
          <p class="settings-note">{{ t('nav.uploadLogsNote') }}</p>

          <div class="settings-divider"></div>
          <div class="settings-section">
            <p class="section-label">{{ t('nav.appearance') }}</p>

            <div class="appearance-row">
              <span class="appearance-label">{{ t('nav.accentColor') }}</span>
              <div class="swatch-list">
                <button
                  v-for="color in accentPresets"
                  :key="color"
                  class="swatch"
                  :class="{ active: appearance.accent === color }"
                  :style="{ background: color }"
                  :aria-label="color"
                  @click="setAccent(color)"
                ></button>
                <label class="color-pick" :title="t('nav.customColor')">
                  <input type="color" :value="appearance.accent" @input="onAccentInput" />
                </label>
              </div>
            </div>

            <div class="appearance-row">
              <span class="appearance-label">{{ t('nav.bgLight') }}</span>
              <input
                class="color-input"
                type="color"
                :value="appearance.lightBg"
                @input="onLightBgInput"
              />
            </div>

            <div class="appearance-row">
              <span class="appearance-label">{{ t('nav.bgDark') }}</span>
              <input
                class="color-input"
                type="color"
                :value="appearance.darkBg"
                @input="onDarkBgInput"
              />
            </div>

            <div class="setting-item">
              <div class="setting-text">
                <span class="setting-label">{{ t('nav.glassNav') }}</span>
                <span class="setting-desc">{{ t('nav.glassNavDesc') }}</span>
              </div>
              <button
                class="setting-switch"
                :class="{ on: appearance.glass }"
                role="switch"
                :aria-checked="appearance.glass"
                :aria-label="t('nav.glassNav')"
                @click="toggleGlass"
              >
                <span class="switch-knob"></span>
              </button>
            </div>

            <div v-if="appearance.glass" class="glass-params">
              <div class="param-row">
                <span class="param-label">{{ t('nav.glassBlur') }}</span>
                <input
                  class="param-range"
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  :value="appearance.glassBlur"
                  @input="onGlassParam('glassBlur', $event)"
                />
                <span class="param-value">{{ appearance.glassBlur.toFixed(1) }}</span>
              </div>
              <div class="param-row">
                <span class="param-label">{{ t('nav.glassThickness') }}</span>
                <input
                  class="param-range"
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  :value="appearance.glassThickness"
                  @input="onGlassParam('glassThickness', $event)"
                />
                <span class="param-value">{{ Math.round(appearance.glassThickness) }}</span>
              </div>
              <div class="param-row">
                <span class="param-label">{{ t('nav.glassIor') }}</span>
                <input
                  class="param-range"
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.01"
                  :value="appearance.glassIor"
                  @input="onGlassParam('glassIor', $event)"
                />
                <span class="param-value">{{ appearance.glassIor.toFixed(2) }}</span>
              </div>
              <div class="param-row">
                <span class="param-label">{{ t('nav.glassNormalStrength') }}</span>
                <input
                  class="param-range"
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  :value="appearance.glassNormalStrength"
                  @input="onGlassParam('glassNormalStrength', $event)"
                />
                <span class="param-value">{{ appearance.glassNormalStrength.toFixed(1) }}</span>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-text">
                <span class="setting-label">{{ t('nav.reduceMotion') }}</span>
                <span class="setting-desc">{{ t('nav.reduceMotionDesc') }}</span>
              </div>
              <button
                class="setting-switch"
                :class="{ on: appearance.reduceMotion }"
                role="switch"
                :aria-checked="appearance.reduceMotion"
                :aria-label="t('nav.reduceMotion')"
                @click="toggleMotion"
              >
                <span class="switch-knob"></span>
              </button>
            </div>

            <button class="appearance-reset" @click="onResetAppearance">
              {{ t('nav.resetAppearance') }}
            </button>
          </div>

          <div class="settings-divider"></div>
          <button class="skin-entry" @click="openSkin">
            <div class="setting-text">
              <span class="setting-label">{{ t('nav.skinMenu') }}</span>
              <span class="setting-desc">{{ skinSummary }}</span>
            </div>
            <svg class="skin-entry-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>

          <div class="settings-divider"></div>
          <div class="settings-section">
            <a
              class="status-link"
              href="https://hgfds29.github.io/my-status/"
              target="_blank"
              rel="noopener noreferrer"
              :title="t('nav.openInNewTab')"
            >
              <span class="status-text">
                <span class="setting-label">{{ t('nav.statusPage') }}</span>
                <span class="setting-desc">{{ t('nav.statusPageDesc') }}</span>
              </span>
              <svg class="status-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </a>
          </div>
        </div>
      </aside>

      <aside class="skin-drawer" :class="{ open: skinOpen }" :aria-hidden="!skinOpen" role="dialog" :aria-label="t('nav.skinMenu')">
        <div class="settings-head">
          <button class="skin-back" :aria-label="t('nav.back')" @click="skinOpen = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 6 9 12 15 18" />
            </svg>
          </button>
          <span class="settings-title">{{ t('nav.skinMenu') }}</span>
          <button class="settings-close" :aria-label="t('nav.close')" @click="skinOpen = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>
        <div class="settings-body">
          <div class="settings-section">
            <p class="section-label">{{ t('nav.holidaySkin') }}</p>
            <p class="settings-note">{{ t('nav.holidaySkinDesc') }}</p>
            <div class="skin-list">
              <button
                v-for="option in skinOptions"
                :key="option.value"
                class="skin-chip"
                :class="{ active: holidaySkin === option.value }"
                :aria-pressed="holidaySkin === option.value"
                @click="setHolidaySkin(option.value)"
              >
                {{ t(option.label) }}
              </button>
            </div>
          </div>

          <div class="settings-divider"></div>

          <div class="settings-section">
            <p class="section-label">{{ t('nav.toastSkin') }}</p>
            <p class="settings-note">{{ t('nav.toastSkinDesc') }}</p>
            <div class="skin-list">
              <button
                v-for="option in toastSkinOptions"
                :key="option.value"
                class="skin-chip"
                :class="{ active: appearance.toastSkin === option.value }"
                :aria-pressed="appearance.toastSkin === option.value"
                @click="setToastSkin(option.value)"
              >
                {{ t(option.label) }}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <div class="log-layer" :class="{ open: changelogOpen }" :aria-hidden="!changelogOpen">
      <div class="log-overlay" @click="changelogOpen = false"></div>
      <aside class="changelog-drawer" :class="{ open: changelogOpen, wide: maximizedLogKey }" role="dialog" aria-modal="true" :aria-label="t('nav.changelog')">
        <div class="settings-head">
          <button v-if="maximizedLogKey" class="skin-back" :aria-label="t('nav.back')" @click="backToLogList">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 6 9 12 15 18" />
            </svg>
          </button>
          <span class="settings-title">{{ t('nav.changelog') }}</span>
          <button class="settings-close" :aria-label="t('nav.close')" @click="changelogOpen = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>
        <div class="settings-body">
          <div v-if="maximizedEntry" class="log-full" :style="logStyle(maximizedEntry)">
            <div class="log-full-head">
              <span class="log-version">{{ maximizedEntry.version }}</span>
              <span
                v-for="(type, index) in logTypesOf(maximizedEntry)"
                :key="type + index"
                class="log-badge"
                :style="{ '--log-color': logTypeColor(type) }"
              >{{ t(changelogTypes[type]) }}</span>
            </div>
            <span class="log-time">{{ maximizedEntry.time }}</span>
            <div v-if="maximizedEntry.image" class="log-full-shot">
              <img :src="maximizedEntry.image" :alt="maximizedEntry.imageAlt || maximizedEntry.version" loading="lazy" />
            </div>
            <ul v-if="maximizedEntry.items && maximizedEntry.items.length" class="log-full-items">
              <li v-for="(line, index) in typedLines" :key="index">{{ line }}<span v-if="index === typedLines.length - 1 && !typingDone" class="log-cursor"></span></li>
            </ul>
          </div>

          <template v-else>
            <article
              v-for="entry in changelogEntries"
              :key="entry.version + entry.time"
              class="log-card"
              :class="{ expanded: isLogExpanded(entry) }"
              :style="logStyle(entry)"
            >
              <button
                class="log-head"
                :class="{ 'has-shot': entry.image }"
                :aria-expanded="isLogExpanded(entry)"
                @click="toggleLogEntry(entry)"
              >
                <div class="log-head-main">
                  <h3 class="log-head-title">
                    <span class="log-version">{{ entry.version }}</span>
                    <span class="log-sep">—</span>
                    <span class="log-summary">{{ entry.title || (entry.items && entry.items[0]) || '' }}</span>
                  </h3>
                  <div class="log-head-meta">
                    <span class="log-time">{{ entry.time }}</span>
                    <div class="log-badge-row">
                      <span
                        v-for="(type, index) in logTypesOf(entry)"
                        :key="type + index"
                        class="log-badge"
                        :style="{ '--log-color': logTypeColor(type) }"
                      >{{ t(changelogTypes[type]) }}</span>
                    </div>
                  </div>
                </div>
                <img
                  v-if="entry.image"
                  class="log-head-shot"
                  :src="entry.image"
                  :alt="entry.imageAlt || entry.version"
                  loading="lazy"
                />
                <svg class="log-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 15 12 9 18 15" />
                </svg>
              </button>
              <div class="log-detail">
                <div class="log-detail-inner">
                  <ul v-if="isTypingTarget(entry)" class="log-items">
                    <li v-for="(line, index) in typedLines" :key="index">{{ line }}<span v-if="index === typedLines.length - 1 && !typingDone" class="log-cursor"></span></li>
                  </ul>
                  <ul v-else-if="entry.items && entry.items.length" class="log-items">
                    <li v-for="(line, index) in entry.items" :key="index">{{ line }}</li>
                  </ul>
                  <button class="log-more" @click.stop="openLogDetail(entry)">
                    {{ t('nav.viewFullDetail') }}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          </template>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { t, toggleLocale, locale } from '../utils/i18n'
import AppIcon from './AppIcon.vue'
import { currentUser, currentProfile, loadSession, watchAuth, signOut } from '../utils/auth'
import { supabase } from '../utils/supabase'
import { showPrompt, showError, showSuccess } from '../utils/modal'
import { isLogUploadEnabled, enableLogUpload, disableLogUpload } from '../utils/logUploader'
import { appearance, updateAppearance, resetAppearance, ACCENT_PRESETS } from '../utils/appearance'
import { holidaySkin, setHolidaySkin, HOLIDAY_SKINS } from '../utils/holiday'
import { showToast } from '../utils/toast'
import { changelogEntries, changelogTypes, changelogTypeColors } from '../data/changelog'
import { createLogger } from '../utils/logger'

defineOptions({ inheritAttrs: false })

const log = createLogger('NavBar')

// 节日皮肤选项：自动跟随日期、各节日、关闭
const skinOptions = [
  { value: 'auto', label: 'nav.skinAuto' },
  ...HOLIDAY_SKINS.map((skin) => ({ value: skin.id, label: skin.labelKey })),
  { value: 'none', label: 'nav.skinNone' }
]

// Toast 皮肤选项
const toastSkinOptions = [
  { value: 'default', label: 'nav.toastSkinDefault' },
  { value: 'light', label: 'nav.toastSkinLight' },
  { value: 'tarkov', label: 'nav.toastSkinTarkov' }
]

const setToastSkin = (value) => {
  updateAppearance({ toastSkin: value })
  // 用选中的皮肤立即弹一条，方便直接对比效果
  showToast({ type: 'success', message: t('nav.toastSkinPreview'), skin: value, duration: 2000 })
}

// 设置主菜单上的皮肤摘要，避免要打开子菜单才知道当前用了什么
const skinSummary = computed(() => {
  const holidayLabel = skinOptions.find((option) => option.value === holidaySkin.value)?.label
  const toastLabel = toastSkinOptions.find((option) => option.value === appearance.value.toastSkin)?.label
  return [holidayLabel, toastLabel].filter(Boolean).map((key) => t(key)).join(' · ')
})

log.info('顶部导航栏已初始化（导航菜单 / 用户卡片 / 主题 / 语言）')

const router = useRouter()
const isDark = ref(false)
const isSwitching = ref(false)
const moreOpen = ref(false)
const userOpen = ref(false)
const userMenuRef = ref(null)

const isAdmin = computed(() => currentProfile.value?.is_admin === true)

const closeUserMenu = (event) => {
  if (userOpen.value && userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    userOpen.value = false
  }
}

const onKeydown = (event) => {
  if (event.key !== 'Escape') return
  userOpen.value = false
  // 先收子抽屉，再收设置抽屉
  if (changelogOpen.value) {
    changelogOpen.value = false
    return
  }
  if (skinOpen.value) {
    skinOpen.value = false
    return
  }
  closeSettings()
}

/* 设置抽屉：仅承载「提交日志到数据库」开关 */
const settingsOpen = ref(false)
const uploadEnabled = ref(false)
// 皮肤子抽屉：从设置抽屉左侧滑出，不遮挡设置主菜单
const skinOpen = ref(false)
// 更新日志抽屉：独立图层
const changelogOpen = ref(false)
// 内联展开的日志条目（同一时间只展开一条）
const expandedLogKey = ref('')
// 完整详情状态：抽屉拉宽，只展示该条
const maximizedLogKey = ref('')

const logKeyOf = (entry) => entry.version + entry.time
// type 可以是字符串或数组；数组时色条做成渐变拼色
const logTypesOf = (entry) => (Array.isArray(entry.type) ? entry.type : [entry.type])
const logTypeColor = (type) => changelogTypeColors[type] || '#9aa4b2'
const logStyle = (entry) => {
  const types = logTypesOf(entry)
  const colors = types.map(logTypeColor)
  return {
    '--log-color': colors[0],
    '--log-gradient': `linear-gradient(90deg, ${colors.join(', ')})`
  }
}
const isLogExpanded = (entry) => expandedLogKey.value === logKeyOf(entry)
const maximizedEntry = computed(
  () => changelogEntries.find((entry) => logKeyOf(entry) === maximizedLogKey.value) || null
)

// 点卡片：内联展开 / 收起
const toggleLogEntry = (entry) => {
  const key = logKeyOf(entry)
  expandedLogKey.value = expandedLogKey.value === key ? '' : key
}

// 展开后点「查看完整详情」：抽屉拉宽
const openLogDetail = (entry) => {
  maximizedLogKey.value = logKeyOf(entry)
}

// 返回列表，保留该条的展开状态
const backToLogList = () => {
  maximizedLogKey.value = ''
}

// 当前正在展示详情的条目：完整详情优先，其次是内联展开的那条
const activeLogEntry = computed(() => {
  if (maximizedEntry.value) return maximizedEntry.value
  return changelogEntries.find((entry) => logKeyOf(entry) === expandedLogKey.value) || null
})
const isTypingTarget = (entry) => !!activeLogEntry.value && logKeyOf(entry) === logKeyOf(activeLogEntry.value)

// 打字机效果：逐字显示当前条目的更新点
const typedCount = ref(0)
const typingDone = ref(true)
let typingTimer = null

const activeLogText = computed(() => (activeLogEntry.value?.items || []).join('\n'))
const typedLines = computed(() => activeLogText.value.slice(0, typedCount.value).split('\n'))

const stopTyping = () => {
  if (typingTimer) {
    clearInterval(typingTimer)
    typingTimer = null
  }
}

const startTyping = () => {
  stopTyping()
  const total = activeLogText.value.length
  typedCount.value = 0
  typingDone.value = false
  if (!total) {
    typingDone.value = true
    return
  }
  // 尊重系统的「减少动态效果」设置，直接显示全文
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    typedCount.value = total
    typingDone.value = true
    return
  }
  typingTimer = setInterval(() => {
    typedCount.value = Math.min(total, typedCount.value + 2)
    if (typedCount.value >= total) {
      typingDone.value = true
      stopTyping()
    }
  }, 24)
}

// 同一条目在「内联展开」与「完整详情」之间切换时不重新打字
let lastTypedKey = null
watch([expandedLogKey, maximizedLogKey], () => {
  const key = activeLogEntry.value ? logKeyOf(activeLogEntry.value) : null
  if (!key) {
    lastTypedKey = null
    stopTyping()
    return
  }
  if (key === lastTypedKey) return
  lastTypedKey = key
  startTyping()
})

const openChangelog = () => {
  skinOpen.value = false
  settingsOpen.value = false
  moreOpen.value = false
  expandedLogKey.value = ''
  maximizedLogKey.value = ''
  changelogOpen.value = true
  log.info('打开更新日志抽屉', { entries: changelogEntries.length })
}

const openSkin = () => {
  changelogOpen.value = false
  skinOpen.value = true
}

const openSettings = () => {
  settingsOpen.value = true
  skinOpen.value = false
  changelogOpen.value = false
  uploadEnabled.value = isLogUploadEnabled()
  log.info('打开设置抽屉', { uploadEnabled: uploadEnabled.value })
}

const closeSettings = () => {
  if (!settingsOpen.value) return
  settingsOpen.value = false
  skinOpen.value = false
  changelogOpen.value = false
  log.debug('关闭设置抽屉')
}

const toggleUpload = () => {
  if (uploadEnabled.value) {
    disableLogUpload()
    showSuccess(t('nav.uploadLogsOff'))
  } else {
    enableLogUpload()
    showSuccess(t('nav.uploadLogsOn'))
  }
  uploadEnabled.value = isLogUploadEnabled()
  log.info('日志上传开关切换', { enabled: uploadEnabled.value })
}

/* 外观自定义 */
const accentPresets = ACCENT_PRESETS

const setAccent = (color) => {
  updateAppearance({ accent: color })
  log.debug('强调色已修改', color)
}

const onAccentInput = (event) => updateAppearance({ accent: event.target.value })
const onLightBgInput = (event) => updateAppearance({ lightBg: event.target.value })
const onDarkBgInput = (event) => updateAppearance({ darkBg: event.target.value })
const toggleGlass = () => updateAppearance({ glass: !appearance.value.glass })
const toggleMotion = () => updateAppearance({ reduceMotion: !appearance.value.reduceMotion })

const onGlassParam = (key, event) => {
  updateAppearance({ [key]: Number(event.target.value) })
}

const onResetAppearance = () => {
  resetAppearance()
  showSuccess(t('nav.appearanceReset'))
}

const doLogout = async () => {
  userOpen.value = false
  log.info('用户触发退出登录')
  await signOut()
  router.push('/home')
}

/* 修改密码：与注册使用同一套复杂度规则 */
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/

const changePassword = () => {
  userOpen.value = false
  log.info('打开修改密码弹窗')
  showPrompt({
    title: t('nav.changePassword'),
    message: t('nav.passwordRule'),
    placeholder: t('nav.newPasswordPh'),
    inputType: 'password',
    pattern: PASSWORD_RE,
    patternError: t('nav.passwordRule'),
    confirmText: t('nav.save'),
    cancelText: t('nav.cancel'),
    onConfirm: async (value) => {
      log.debug('提交新密码', { length: value ? String(value).length : 0 })
      const { error } = await supabase.auth.updateUser({ password: value })
      if (error) {
        log.error('修改密码失败', error.message)
        return showError(error.message)
      }
      log.info('修改密码成功')
      showSuccess(t('nav.passwordChanged'))
    }
  })
}

const copyUserId = async () => {
  userOpen.value = false
  const id = currentUser.value?.id
  if (!id) {
    log.warn('复制用户 ID 跳过：当前未登录')
    return
  }
  try {
    await navigator.clipboard.writeText(id)
    log.info('复制用户 ID 成功')
    showSuccess(t('nav.idCopied'))
  } catch (e) {
    log.error('复制用户 ID 失败', e)
    showError(t('nav.copyFailed'))
  }
}

const toggleLanguage = () => {
  log.debug('点击语言切换', {
    from: locale.value,
    to: locale.value === 'zh' ? 'en' : 'zh'
  })
  isSwitching.value = true
  toggleLocale()
  setTimeout(() => {
    isSwitching.value = false
  }, 400)
}

const openDeskPet = () => {
  window.open(import.meta.env.BASE_URL + 'desk-pet/加载.html', '_blank')
}

const applyTheme = (dark) => {
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  log.info(`主题切换为${isDark.value ? '深色' : '浅色'}模式`)
}

watch(userOpen, (val) => {
  log.debug(val ? '用户卡片展开' : '用户卡片收起')
})

/* 抽屉打开时锁定页面滚动 */
watch([settingsOpen, changelogOpen], ([settings, changelog]) => {
  document.body.style.overflow = settings || changelog ? 'hidden' : ''
})

onMounted(() => {
  loadSession()
  watchAuth()
  document.addEventListener('click', closeUserMenu)
  document.addEventListener('keydown', onKeydown)
  const saved = localStorage.getItem('theme')
  if (saved) {
    isDark.value = saved === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme(isDark.value)
})

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenu)
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
  log.debug('导航栏已卸载')
})

watch(isDark, (val) => {
  applyTheme(val)
  localStorage.setItem('theme', val ? 'dark' : 'light')
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-bottom: 1px solid #eee;
  z-index: 1000;
  will-change: transform;
  transition: background 0.3s, border-color 0.3s,
    transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 登录页：顶栏向上滑出隐藏 */
.navbar.nav-hidden {
  transform: translateY(-100%);
}

.dark .navbar {
  background: #12121f;
  border-bottom: 1px solid #252540;
}

.nav-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.3s;
}

.dark .nav-logo {
  color: #e0e0e0;
}

.nav-logo:hover {
  color: var(--accent, #42b983);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lang-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid #ddd;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 20px;
  color: #666;
  font-size: 13px;
  white-space: nowrap;
  transition: all 0.3s ease;
  overflow: hidden;
}

.lang-toggle:hover {
  background: #f0f9f4;
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(var(--accent-rgb, 66, 185, 131), 0.2);
}

.lang-toggle:active {
  transform: translateY(0);
  box-shadow: none;
}

.lang-toggle.switching {
  animation: langPulse 0.4s ease;
}

.lang-toggle.switching .lang-icon {
  animation: globeSpin 0.4s ease;
}

.lang-toggle.switching .lang-text {
  animation: textFade 0.4s ease;
}

@keyframes langPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes globeSpin {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}

@keyframes textFade {
  0% { opacity: 1; }
  25% { opacity: 0; transform: translateX(-5px); }
  50% { opacity: 0; transform: translateX(5px); }
  75% { opacity: 1; }
  100% { opacity: 1; transform: translateX(0); }
}

.lang-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.lang-icon {
  transition: transform 0.3s;
}

.lang-toggle:hover .lang-icon {
  transform: rotate(180deg);
}

.lang-text {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.dark .lang-toggle {
  border-color: #2d2d44;
  color: #aaa;
}

.dark .lang-toggle:hover {
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.15);
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
  box-shadow: 0 2px 8px rgba(var(--accent-rgb, 66, 185, 131), 0.3);
}

.desk-pet-btn {
  background: none;
  border: 1px solid #ddd;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.desk-pet-btn:hover {
  background: #f0f9f4;
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
  transform: translateY(-2px) rotate(-10deg);
  box-shadow: 0 4px 12px rgba(var(--accent-rgb, 66, 185, 131), 0.25);
}

.desk-pet-btn:active {
  transform: translateY(0) rotate(0deg);
  box-shadow: none;
}

.dark .desk-pet-btn {
  border-color: #2d2d44;
  color: #aaa;
}

.dark .desk-pet-btn:hover {
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.15);
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
  box-shadow: 0 4px 12px rgba(var(--accent-rgb, 66, 185, 131), 0.3);
}

.desk-pet-btn .icon {
  width: 18px;
  height: 18px;
}

.nav-links {
  display: flex;
  gap: 18px;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #666;
  text-decoration: none;
  font-size: 14px;
  white-space: nowrap;
  transition: color 0.3s;
}

.dark .nav-link {
  color: #aaa;
}

.nav-link:hover {
  color: var(--accent, #42b983);
}

.nav-link.active {
  color: var(--accent, #42b983);
  font-weight: 500;
}

.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s, color 0.3s;
}

.dark .theme-toggle {
  color: #aaa;
}

.theme-toggle:hover {
  background: #f0f0f0;
  color: var(--accent, #42b983);
}

.dark .theme-toggle:hover {
  background: #2d2d44;
  color: var(--accent, #42b983);
}

.more-menu {
  position: relative;
}

.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid #ddd;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 20px;
  color: #666;
  font-size: 13px;
  white-space: nowrap;
  text-decoration: none;
  transition: all 0.3s ease;
}

.user-login:hover {
  background: #f0f9f4;
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(var(--accent-rgb, 66, 185, 131), 0.2);
}

.user-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent, #42b983);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
}

.user-name {
  font-weight: 500;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu:hover .user-btn,
.user-menu.open .user-btn {
  background: #f0f9f4;
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
}

.dark .user-btn {
  border-color: #2d2d44;
  color: #aaa;
}

.dark .user-menu:hover .user-btn,
.dark .user-menu.open .user-btn {
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.15);
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
}

.user-menu .more-arrow {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.user-menu.open .more-arrow {
  transform: rotate(180deg);
}

/* ---------- 用户 Hover Card ---------- */
.user-card {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 268px;
  padding: 8px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 14px;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.14);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px) scale(0.97);
  transform-origin: top right;
  pointer-events: none;
  transition: opacity 0.22s ease, transform 0.26s cubic-bezier(0.34, 1.56, 0.64, 1),
    visibility 0.22s;
  z-index: 1002;
}

.user-menu.open .user-card {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.user-card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 10px 14px;
}

.user-card-avatar {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent, #42b983), #2fa572);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 17px;
  box-shadow: 0 4px 12px rgba(var(--accent-rgb, 66, 185, 131), 0.28);
}

.user-card-info {
  min-width: 0;
}

.user-card-name {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
}

.role-badge {
  padding: 1px 6px;
  border-radius: 10px;
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.15);
  color: var(--accent, #42b983);
  font-size: 10px;
  font-weight: 600;
}

.user-card-email {
  margin: 3px 0 0;
  font-size: 12px;
  color: #999;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-card-divider {
  height: 1px;
  margin: 4px 8px;
  background: #f0f0f0;
}

.user-card-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 9px 10px;
  border: none;
  border-radius: 8px;
  background: none;
  color: #555;
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
}

.user-card-item:hover {
  background: #f0f9f4;
  color: var(--accent, #42b983);
}

.user-card-item.danger {
  color: #e05a5a;
}

.user-card-item.danger:hover {
  background: rgba(224, 90, 90, 0.1);
  color: #d24b4b;
}

.dark .user-card {
  background: #1a1a2e;
  border-color: #252540;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.5);
}

.dark .user-card-name {
  color: #e8e8e8;
}

.dark .user-card-divider {
  background: #252540;
}

.dark .user-card-item {
  color: #bbb;
}

.dark .user-card-item:hover {
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.15);
  color: var(--accent, #42b983);
}

.dark .user-card-item.danger {
  color: #e05a5a;
}

.dark .user-card-item.danger:hover {
  background: rgba(224, 90, 90, 0.16);
  color: #ff7b7b;
}

@media (max-width: 480px) {
  .user-card {
    width: 240px;
  }
}

.more-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid #ddd;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 20px;
  color: #666;
  font-size: 13px;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.more-text {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.more-arrow {
  width: 14px;
  height: 14px;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.more-menu:hover .more-btn,
.more-menu:focus-within .more-btn,
.more-menu.open .more-btn {
  background: #f0f9f4;
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(var(--accent-rgb, 66, 185, 131), 0.2);
}

.more-menu:hover .more-arrow,
.more-menu:focus-within .more-arrow,
.more-menu.open .more-arrow {
  transform: rotate(180deg);
}

.dark .more-btn {
  border-color: #2d2d44;
  color: #aaa;
}

.dark .more-menu:hover .more-btn,
.dark .more-menu:focus-within .more-btn,
.dark .more-menu.open .more-btn {
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.15);
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
  box-shadow: 0 2px 8px rgba(var(--accent-rgb, 66, 185, 131), 0.3);
}

.more-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 160px;
  padding: 6px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px) scale(0.96);
  transform-origin: top right;
  pointer-events: none;
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
    visibility 0.25s;
}

/* 悬停桥：补上按钮与面板之间的空隙，防止鼠标移动时收起 */
.more-dropdown::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -12px;
  height: 12px;
}

.more-menu:hover .more-dropdown,
.more-menu:focus-within .more-dropdown,
.more-menu.open .more-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.dark .more-dropdown {
  background: #1a1a2e;
  border-color: #252540;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}

.more-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: none;
  color: #555;
  font-family: inherit;
  text-decoration: none;
  text-align: left;
  font-size: 13px;
  line-height: 1.4;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

/* 桌面端主链接直接显示，移动端收进「更多」 */
.mobile-nav-item {
  display: none;
}

.dark .more-item {
  color: #bbb;
}

.more-item:hover {
  background: #f0f9f4;
  color: var(--accent, #42b983);
}

.dark .more-item:hover {
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.15);
  color: var(--accent, #42b983);
}

.more-item.active {
  color: var(--accent, #42b983);
  font-weight: 500;
}

.icon {
  width: 20px;
  height: 20px;
}

/* 顶栏最右侧：设置按钮 */
.settings-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s, color 0.3s, transform 0.3s;
}

.dark .settings-toggle {
  color: #aaa;
}

.settings-toggle:hover,
.settings-toggle.active {
  background: #f0f0f0;
  color: var(--accent, #42b983);
}

.dark .settings-toggle:hover,
.dark .settings-toggle.active {
  background: #2d2d44;
  color: var(--accent, #42b983);
}

/* 宽屏：贴到顶栏最右侧边缘，与居中的导航内容分离 */
@media (min-width: 980px) {
  .settings-toggle {
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
  }
}

/* 设置抽屉 */
.settings-layer {
  --settings-w: min(320px, 86vw);
  position: fixed;
  inset: 0;
  z-index: 1400;
  pointer-events: none;
}

.settings-layer.open {
  pointer-events: auto;
}

.settings-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.38);
  opacity: 0;
  transition: opacity 0.32s ease;
}

.settings-layer.open .settings-overlay {
  opacity: 1;
}

.settings-drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: var(--settings-w);
  max-width: 86vw;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-left: 1px solid #eee;
  box-shadow: -12px 0 36px rgba(0, 0, 0, 0.12);
  transform: translateX(100%);
  transition: transform 0.42s cubic-bezier(0.16, 1, 0.3, 1),
    background 0.3s, border-color 0.3s;
}

.settings-layer.open .settings-drawer {
  transform: translateX(0);
}

.dark .settings-drawer {
  background: #12121f;
  border-left-color: #252540;
  box-shadow: -12px 0 36px rgba(0, 0, 0, 0.55);
}

/* 皮肤入口：设置抽屉里的一行，点开后从左侧滑出子抽屉 */
.skin-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
  padding: 14px;
  background: #f7f9fa;
  border: 1px solid #eee;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s, border-color 0.2s;
}

.skin-entry:hover {
  background: #f0f5f3;
  border-color: #d9e7e0;
}

.dark .skin-entry {
  background: #1a1a2e;
  border-color: #252540;
}

.dark .skin-entry:hover {
  background: #20203a;
  border-color: #33335a;
}

.skin-entry-arrow {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #999;
}

/* 皮肤子抽屉：紧贴设置抽屉左侧，不覆盖主菜单 */
.skin-drawer {
  position: absolute;
  top: 12px;
  bottom: 12px;
  right: calc(var(--settings-w) + 12px);
  width: 300px;
  max-width: calc(100vw - var(--settings-w) - 24px);
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.12);
  opacity: 0;
  visibility: hidden;
  transform: translateX(18px);
  pointer-events: none;
  transition: opacity 0.28s ease, transform 0.34s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.28s;
}

.skin-drawer.open {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
  pointer-events: auto;
}

.dark .skin-drawer {
  background: #12121f;
  border-color: #252540;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.55);
}

/* 更新日志：独立图层，从右侧滑入的抽屉 */
.log-layer {
  position: fixed;
  inset: 0;
  z-index: 1500;
  pointer-events: none;
}

.log-layer.open {
  pointer-events: auto;
}

.log-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.38);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.log-layer.open .log-overlay {
  opacity: 1;
}

.changelog-drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 340px;
  max-width: 92vw;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-left: 1px solid #eee;
  box-shadow: -12px 0 40px rgba(0, 0, 0, 0.14);
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), width 0.42s cubic-bezier(0.16, 1, 0.3, 1),
    background 0.3s ease;
}

.changelog-drawer.open {
  transform: translateX(0);
}

/* 二次点击日志后，整个侧边栏拉宽展示完整详情 */
.changelog-drawer.wide {
  width: min(720px, 100vw);
}

.dark .changelog-drawer {
  background: #12121f;
  border-left-color: #252540;
  box-shadow: -12px 0 40px rgba(0, 0, 0, 0.55);
}

.skin-back {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border: none;
  border-radius: 6px;
  background: none;
  color: #999;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.skin-back svg {
  width: 16px;
  height: 16px;
}

.skin-back:hover {
  background: #f0f0f0;
  color: var(--accent, #42b983);
}

.dark .skin-back:hover {
  background: #2d2d44;
  color: var(--accent, #42b983);
}

.settings-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid #eee;
}

.dark .settings-head {
  border-bottom-color: #252540;
}

.settings-title {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 0.5px;
}

.dark .settings-title {
  color: #e8e8e8;
}

.settings-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 6px;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}

.settings-close svg {
  width: 16px;
  height: 16px;
}

.settings-close:hover {
  background: #f0f0f0;
  color: var(--accent, #42b983);
}

.dark .settings-close:hover {
  background: #2d2d44;
  color: var(--accent, #42b983);
}

.settings-body {
  flex: 1;
  overflow-y: auto;
  padding: 18px;
  /* 隐藏滚动条但保留滚动能力 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.settings-body::-webkit-scrollbar {
  display: none;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fafafa;
}

.dark .setting-item {
  background: #1a1a2e;
  border-color: #252540;
}

.setting-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.setting-label {
  font-size: 13.5px;
  font-weight: 500;
  color: #2c3e50;
}

.dark .setting-label {
  color: #e0e0e0;
}

.setting-desc {
  font-size: 11.5px;
  line-height: 1.5;
  color: #999;
}

.dark .setting-desc {
  color: #888;
}

.setting-switch {
  flex: 0 0 auto;
  position: relative;
  width: 40px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 11px;
  background: #d8d8d8;
  cursor: pointer;
  transition: background 0.28s ease;
}

.setting-switch.on {
  background: var(--accent, #42b983);
}

.dark .setting-switch {
  background: #3a3a52;
}

.glass-params {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fafafa;
}

/* 节日皮肤切换按钮组 */
.skin-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.skin-chip {
  flex: 1 1 0;
  min-width: 72px;
  padding: 7px 10px;
  border: 1px solid #e4e4e4;
  border-radius: 10px;
  background: #fafafa;
  color: #666;
  font-size: 12.5px;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.skin-chip:hover {
  border-color: var(--accent, #42b983);
  color: #333;
}

.skin-chip.active {
  border-color: var(--accent, #42b983);
  background: color-mix(in srgb, var(--accent, #42b983) 12%, transparent);
  color: var(--accent, #42b983);
  font-weight: 600;
}

.dark .skin-chip {
  background: #1a1a2e;
  border-color: #2a2a44;
  color: #aaa;
}

.dark .skin-chip:hover {
  color: #eee;
  border-color: var(--accent, #42b983);
}

.dark .skin-chip.active {
  background: color-mix(in srgb, var(--accent, #42b983) 22%, transparent);
  color: #fff;
}

.dark .glass-params {
  background: #1a1a2e;
  border-color: #252540;
}

.param-row {
  display: grid;
  grid-template-columns: 76px 1fr 34px;
  align-items: center;
  gap: 10px;
}

.param-label {
  font-size: 12px;
  color: #666;
}

.dark .param-label {
  color: #aaa;
}

.param-value {
  font-size: 11.5px;
  color: #999;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.param-range {
  width: 100%;
  height: 18px;
  accent-color: var(--accent, #42b983);
  cursor: pointer;
}

.dark .setting-switch.on {
  background: var(--accent, #42b983);
}

.switch-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.setting-switch.on .switch-knob {
  transform: translateX(18px);
}

.settings-note {
  margin: 12px 2px 0;
  font-size: 11.5px;
  line-height: 1.6;
  color: #aaa;
}

.dark .settings-note {
  color: #777;
}

/* 外观自定义 */
.settings-divider {
  height: 1px;
  background: #eee;
  margin: 18px -18px 16px;
}

.dark .settings-divider {
  background: #252540;
}

.section-label {
  margin-bottom: 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #aaa;
}

.dark .section-label {
  color: #777;
}

.appearance-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.appearance-label {
  font-size: 13px;
  color: #2c3e50;
  white-space: nowrap;
}

.dark .appearance-label {
  color: #e0e0e0;
}

.swatch-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.swatch {
  width: 18px;
  height: 18px;
  padding: 0;
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s;
}

.dark .swatch {
  border-color: #12121f;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.swatch:hover {
  transform: scale(1.15);
}

.swatch.active {
  border-color: #fff;
  box-shadow: 0 0 0 2px var(--accent, #42b983);
}

.dark .swatch.active {
  border-color: #12121f;
}

.color-pick {
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  background: conic-gradient(#f87171, #fbbf24, #34d399, #60a5fa, #a78bfa, #f87171);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dark .color-pick {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.16);
}

.color-pick:hover {
  transform: scale(1.15);
}

.color-pick input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  opacity: 0;
  border: none;
  cursor: pointer;
}

.color-input {
  width: 40px;
  height: 24px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
}

.dark .color-input {
  border-color: #3a3a52;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 2px;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

.setting-item + .setting-item {
  margin-top: 10px;
}

.appearance-reset {
  width: 100%;
  margin-top: 14px;
  padding: 9px;
  border: 1px solid #eee;
  border-radius: 10px;
  background: transparent;
  color: #777;
  font-size: 12.5px;
  cursor: pointer;
  transition: color 0.25s, border-color 0.25s, background 0.25s;
}

.dark .appearance-reset {
  border-color: #252540;
  color: #999;
}

.appearance-reset:hover {
  color: var(--accent, #42b983);
  border-color: var(--accent, #42b983);
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.08);
}

/* 状态页外链入口 */
.status-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 14px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fafafa;
  color: inherit;
  text-decoration: none;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.status-link:hover {
  border-color: var(--accent, #42b983);
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.06);
  transform: translateY(-1px);
}

.dark .status-link {
  background: #1a1a2e;
  border-color: #252540;
}

.dark .status-link:hover {
  background: rgba(var(--accent-rgb, 66, 185, 131), 0.12);
}

.status-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.status-arrow {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  color: #bbb;
  transition: color 0.2s ease, transform 0.2s ease;
}

.status-link:hover .status-arrow {
  color: var(--accent, #42b983);
  transform: translate(1px, -1px);
}

/* 带截图的条目：右侧缩略图，左侧渐隐融入卡片 */
.log-head.has-shot .log-head-main {
  max-width: 52%;
}

.log-head-shot {
  position: absolute;
  top: 4px;
  right: 4px;
  bottom: 4px;
  width: 50%;
  border-radius: 9px;
  object-fit: cover;
  object-position: 50% 30%;
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 26%);
  mask-image: linear-gradient(90deg, transparent 0, #000 26%);
}

/* 更新条目：紧凑卡片，点击展开详情，抽屉保持打开 */
.log-head {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 34px 12px 12px;
  border: none;
  background: none;
  color: inherit;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.log-head-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.log-head-title {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
  margin: 0;
}

.log-sep {
  flex-shrink: 0;
  color: #c4c4c8;
}

.log-summary {
  overflow: hidden;
  font-size: 12.5px;
  font-weight: 600;
  color: #2c3e50;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-head-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.log-badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

/* 完整详情里的功能截图，同样带轻微倾斜 */
.log-full-shot {
  margin: 14px 0 4px;
}

.log-full-shot img {
  display: block;
  width: 100%;
  border-radius: 12px;
  transform: rotateX(4deg) rotateY(-6deg) rotateZ(-1deg);
  box-shadow: 0 24px 44px -22px rgba(0, 0, 0, 0.85);
}

/* 更新日志卡片：横幅式，顶部色条区分类型；点击展开详情，抽屉保持打开 */
.log-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #ececec;
  border-radius: 12px;
  background: #fff;
  transition: background 0.2s ease, border-color 0.2s ease;
}

/* 顶部色条：单类型为纯色，多类型为渐变拼色 */
.log-card::before,
.log-full::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--log-gradient, var(--log-color, #9aa4b2));
}

.log-card + .log-card {
  margin-top: 12px;
}

.log-card:hover {
  background: #f7f8f9;
}

.log-version {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: #2c3e50;
}

.log-badge {
  flex-shrink: 0;
  padding: 3px 7px;
  border: 1px solid color-mix(in srgb, var(--log-color, #9aa4b2) 52%, transparent);
  border-radius: 4px;
  background: color-mix(in srgb, var(--log-color, #9aa4b2) 12%, transparent);
  color: var(--log-color, #9aa4b2);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.log-time {
  display: block;
  font-size: 10.5px;
  color: #999;
  font-variant-numeric: tabular-nums;
}

.log-chevron {
  position: absolute;
  top: 11px;
  right: 11px;
  z-index: 3;
  width: 18px;
  height: 18px;
  padding: 3px;
  border-radius: 50%;
  background: rgba(10, 10, 16, 0.5);
  color: #d8d8de;
  transition: background 0.2s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.log-card:hover .log-chevron {
  background: rgba(10, 10, 16, 0.75);
}

.log-card.expanded .log-chevron {
  transform: rotate(180deg);
}

/* 展开区域用 grid 行高过渡，顺滑拉长且不重开抽屉 */
.log-detail {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}

.log-card.expanded .log-detail {
  grid-template-rows: 1fr;
}

.log-detail-inner {
  overflow: hidden;
}

.log-items {
  margin: 0;
  padding: 0 14px 0 30px;
  font-size: 12.5px;
  line-height: 1.7;
  color: #666;
}

.log-items li::marker {
  color: var(--log-color, #9aa4b2);
}

/* 打字机光标 */
.log-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 1px;
  vertical-align: -0.1em;
  background: var(--log-color, #9aa4b2);
  animation: logCursorBlink 0.9s steps(1) infinite;
}

@keyframes logCursorBlink {
  0%,
  50% {
    opacity: 1;
  }
  50.01%,
  100% {
    opacity: 0;
  }
}

/* 展开后可见的「查看完整详情」入口，避免隐藏的二次点击规则 */
.log-more {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 10px 0 13px 30px;
  padding: 5px 10px;
  border: 1px solid #e5e5e5;
  border-radius: 7px;
  background: #fff;
  color: #666;
  font-family: inherit;
  font-size: 11.5px;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.log-more svg {
  width: 12px;
  height: 12px;
  transition: transform 0.2s ease;
}

.log-more:hover {
  border-color: var(--log-color, #9aa4b2);
  color: var(--log-color, #9aa4b2);
  background: color-mix(in srgb, var(--log-color, #9aa4b2) 8%, #fff);
}

.log-more:hover svg {
  transform: translateX(2px);
}

.dark .log-items {
  color: #aaa;
}

.dark .log-more {
  border-color: #2c2c44;
  background: #15152a;
  color: #aaa;
}

.dark .log-more:hover {
  color: var(--log-color, #9aa4b2);
  border-color: var(--log-color, #9aa4b2);
  background: #1c1c34;
}

/* 完整详情视图：抽屉拉宽后单条展示 */
.log-full {
  position: relative;
  overflow: hidden;
  padding: 18px 0 0;
}

.log-full-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.log-full-head .log-version {
  font-size: 17px;
}

.log-full-items {
  margin: 16px 0 0;
  padding-left: 20px;
  font-size: 13.5px;
  line-height: 1.9;
  color: #555;
}

.log-full-items li::marker {
  color: var(--log-color, #9aa4b2);
}

.dark .log-full-items {
  color: #bbb;
}

/* 类型颜色由 changelogTypeColors 通过内联 CSS 变量提供，见 logStyle() */

.dark .log-card {
  background: #14141f;
  border-color: #23233a;
}

.dark .log-card:hover {
  background: #191927;
}

.dark .log-summary {
  color: #ececf0;
}

.dark .log-sep {
  color: #5a5a70;
}

.dark .log-chevron {
  color: #d0d0da;
  background: rgba(10, 10, 16, 0.55);
}

.dark .log-card:hover .log-chevron {
  background: rgba(10, 10, 16, 0.8);
}

.dark .log-version {
  color: #e8e8e8;
}

.dark .log-time {
  color: #777;
}

.dark .log-items {
  color: #aaa;
}

@media (max-width: 480px) {
  .settings-layer {
    --settings-w: 100%;
  }

  .settings-drawer {
    width: 100%;
    max-width: 100%;
  }

  /* 窄屏收窄缩略图，给文字留空间 */
  .log-head.has-shot .log-head-main {
    max-width: 58%;
  }

  .log-head-shot {
    width: 44%;
  }
}

/* 窄屏没有第二块面板的空间，子菜单改为整屏覆盖 */
@media (max-width: 720px) {
  .skin-drawer {
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: auto;
    max-width: none;
    border: none;
    border-radius: 0;
    transform: translateY(14px);
  }

  .skin-drawer.open {
    transform: translateY(0);
  }

  .changelog-drawer {
    width: 100%;
    max-width: none;
  }
}

/* 中等宽度：主链接收进「更多」，避免中文被挤成多行 */
@media (max-width: 980px) {
  .nav-links {
    gap: 0;
  }

  .nav-links > .nav-link {
    display: none;
  }

  .mobile-nav-item {
    display: flex;
  }
}

@media (max-width: 680px) {
  .nav-container {
    padding: 0 16px;
  }

  .nav-right {
    gap: 8px;
  }
}

/* 窄屏只保留图标，避免顶栏溢出 */
@media (max-width: 480px) {
  .nav-container {
    padding: 0 12px;
  }

  .nav-right {
    gap: 6px;
  }

  .nav-logo {
    font-size: 16px;
  }

  .lang-text,
  .more-text,
  .user-name,
  .user-login > span:not(.app-icon) {
    display: none;
  }

  .more-btn,
  .lang-toggle,
  .user-btn {
    padding: 6px;
  }

  .more-btn .more-arrow,
  .user-menu .more-arrow {
    display: none;
  }
}

@media (max-width: 360px) {
  .nav-container {
    padding: 0 10px;
  }

  .nav-right {
    gap: 4px;
  }

  .nav-logo {
    font-size: 15px;
  }
}
</style>
