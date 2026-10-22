<template>
  <div class="chat-page" :class="{ leaving: isLeaving }">
    <div class="chat-container stagger-item" :style="{ '--delay': '0.05s' }">
      <!-- 移动端遮罩 -->
      <div v-if="sidebarOpen" class="sidebar-mask" @click="sidebarOpen = false"></div>

      <!-- 侧边栏 -->
      <aside class="sidebar" :class="{ open: sidebarOpen }">
        <div class="profile-bar">
          <div class="avatar">{{ (currentProfile?.username || '?').slice(0, 1).toUpperCase() }}</div>
          <div class="user-info">
            <div class="uname">{{ currentProfile?.username }}</div>
            <button class="logout-btn" @click="doLogout">{{ t('chat.logout') }}</button>
          </div>
        </div>

        <div class="search-row">
          <input v-model="searchUser" :placeholder="t('chat.searchUser')" @keydown.enter.prevent="sendFriendRequest" />
          <button class="add-btn" @click="sendFriendRequest">{{ t('chat.addFriend') }}</button>
        </div>

        <div class="nav-section">
          <div class="nav-item" :class="{ active: view.type === 'public' }" @click="switchView({ type: 'public' })">
            <span class="dot public-dot"></span>{{ t('chat.publicRoom') }}
          </div>
        </div>

        <div class="nav-section">
          <div class="section-head">
            <span>{{ t('chat.friends') }}</span>
            <span v-if="incoming.length" class="badge">{{ incoming.length }}</span>
          </div>
          <div v-if="incoming.length" class="req-list">
            <div v-for="r in incoming" :key="r.id" class="req-item">
              <span class="req-name">{{ r.from_username }}</span>
              <div class="req-actions">
                <button class="mini-btn ok" @click="acceptRequest(r.id)">{{ t('chat.accept') }}</button>
                <button class="mini-btn no" @click="rejectRequest(r.id)">{{ t('chat.reject') }}</button>
              </div>
            </div>
          </div>
          <div v-for="f in friends" :key="f.id" class="nav-item friend-item"
               :class="{ active: view.type === 'dm' && view.target === f.id }"
               @click="switchView({ type: 'dm', target: f.id, name: f.username })">
            <span class="dot friend-dot"></span>{{ f.username }}
          </div>
          <p v-if="!friends.length" class="empty-mini">{{ t('chat.noFriends') }}</p>
        </div>

        <div class="nav-section">
          <div class="section-head">
            <span>{{ t('chat.groups') }}</span>
            <button class="mini-btn" @click="openGroupModal = true">+</button>
          </div>
          <div v-for="g in groups" :key="g.id" class="nav-item group-item"
               :class="{ active: view.type === 'group' && view.target === g.id }"
               @click="switchView({ type: 'group', target: g.id, name: g.name })">
            <span class="dot group-dot"></span>{{ g.name }}
          </div>
          <p v-if="!groups.length" class="empty-mini">{{ t('chat.noGroups') }}</p>
        </div>

        <div v-if="isAdmin" class="nav-section">
          <div class="section-head"><span>{{ t('chat.admin') }}</span></div>
          <div class="nav-item" @click="adminModal = true; loadAdminUsers()">
            <span class="dot admin-dot"></span>{{ t('chat.userManage') }}
          </div>
        </div>
      </aside>

      <!-- 主区 -->
      <main class="main">
        <div class="main-head">
          <button class="menu-btn" @click="sidebarOpen = true" aria-label="menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <h2>{{ viewTitle }}</h2>
          <div class="head-actions">
            <button v-if="view.type === 'group' && (myGroupRole === 'owner' || myGroupRole === 'admin' || isAdmin)" class="mini-btn" @click="openGroupManage">{{ t('chat.manageMembers') }}</button>
            <span v-if="view.type !== 'public'" class="conv-hint">{{ t('chat.offlineHint') }}</span>
          </div>
        </div>

        <div class="msg-list" ref="listEl">
          <p v-if="loading" class="empty">{{ t('chat.connecting') }}</p>
          <p v-else-if="!messages.length" class="empty">{{ t('chat.emptyConv') }}</p>
          <div v-for="msg in messages" :key="msg.id" class="msg-row" :class="{ mine: isMine(msg) }">
            <div class="bubble" :class="{ 'has-image': msg.image_url }">
              <p class="meta">
                <span class="name">{{ msgDisplayUser(msg) }}</span>
                <span class="time">{{ formatTime(msg.created_at) }}</span>
              </p>
              <img v-if="msg.image_url" class="msg-img" :src="msg.image_url" alt="image" @click="previewUrl = msg.image_url" />
              <p v-if="msg.content" class="content">{{ msg.content }}</p>
              <div class="bubble-actions">
                <button class="act-btn" :title="t('chat.copy')" @click="copyMsg(msg)">
                  <AppIcon name="复制_copy" :size="13" />
                </button>
                <button v-if="isMine(msg) && canRecall(msg)" class="act-btn" :title="t('chat.recall')" @click="recallMsg(msg)">
                  <AppIcon name="撤回_recall" :size="13" />
                </button>
                <button v-else-if="canManageMsg(msg)" class="act-btn" :title="t('chat.adminDelete')" @click="recallMsg(msg)">
                  <AppIcon name="撤回_recall" :size="13" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <transition name="fade">
          <div v-if="emojiOpen" class="emoji-panel" @click.stop>
            <button v-for="em in emojis" :key="em" class="emoji" @click="insertEmoji(em)">{{ em }}</button>
          </div>
        </transition>

        <div class="input-row">
          <button class="icon-btn" :title="t('chat.emoji')" :class="{ active: emojiOpen }" @click.stop="emojiOpen = !emojiOpen">
            <AppIcon name="表情信息_message-emoji" :size="18" />
          </button>
          <button class="icon-btn" :title="t('chat.image')" @click="pickImage">
            <AppIcon name="图片_image" :size="18" />
          </button>
          <input v-model="draft" class="msg-input" :placeholder="t('chat.placeholder')" maxlength="200" @keydown.enter.prevent="send" />
          <button class="send-btn" :disabled="!canSend" @click="send">{{ t('chat.send') }}</button>
        </div>
        <input ref="fileInput" type="file" accept="image/*" class="hidden-file" @change="onFilePick" />
      </main>
    </div>

    <!-- 建群弹窗 -->
    <transition name="fade">
      <div v-if="openGroupModal" class="modal-mask" @click.self="openGroupModal = false">
        <div class="modal-card">
          <h3>{{ t('chat.createGroup') }}</h3>
          <input v-model="groupName" :placeholder="t('chat.groupNamePh')" maxlength="20" />
          <p class="modal-label">{{ t('chat.selectMembers') }}</p>
          <div class="member-list">
            <label v-for="f in friends" :key="f.id" class="member-item">
              <input type="checkbox" :value="f.id" v-model="groupMembers" />
              <span>{{ f.username }}</span>
            </label>
            <p v-if="!friends.length" class="empty-mini">{{ t('chat.noFriends') }}</p>
          </div>
          <div class="modal-foot">
            <button class="mini-btn no" @click="openGroupModal = false">{{ t('chat.cancel') }}</button>
            <button class="mini-btn ok" @click="createGroup">{{ t('chat.confirm') }}</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="previewUrl" class="preview-mask" @click="previewUrl = ''">
        <img :src="previewUrl" class="preview-img" alt="preview" @click.stop />
      </div>
    </transition>

    <!-- 全局管理员：用户管理 -->
    <transition name="fade">
      <div v-if="adminModal" class="modal-mask" @click.self="adminModal = false">
        <div class="modal-card wide">
          <h3>{{ t('chat.userManage') }}</h3>
          <div class="search-row">
            <input v-model="adminSearch" :placeholder="t('chat.searchUser')" @keydown.enter="loadAdminUsers" />
            <button class="add-btn" @click="loadAdminUsers">{{ t('chat.search') }}</button>
          </div>
          <div class="member-list">
            <div v-for="u in adminUsers" :key="u.id" class="admin-row">
              <div class="admin-info">
                <span class="admin-name">{{ u.username }}</span>
                <span v-if="u.is_admin" class="role-tag admin">{{ t('chat.admin') }}</span>
                <span v-if="u.banned" class="role-tag banned">{{ t('chat.banned') }}</span>
              </div>
              <div class="admin-actions">
                <button v-if="!u.banned" class="mini-btn no" @click="banUser(u)">{{ t('chat.ban') }}</button>
                <button v-else class="mini-btn ok" @click="unbanUser(u)">{{ t('chat.unban') }}</button>
              </div>
            </div>
            <p v-if="!adminUsers.length" class="empty-mini">{{ t('chat.noUsers') }}</p>
          </div>
          <div class="modal-foot">
            <button class="mini-btn" @click="adminModal = false">{{ t('chat.close') }}</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 群成员管理 -->
    <transition name="fade">
      <div v-if="groupManageOpen" class="modal-mask" @click.self="groupManageOpen = false">
        <div class="modal-card">
          <h3>{{ t('chat.manageMembers') }}</h3>
          <div class="member-list">
            <div v-for="m in groupMemberList" :key="m.user_id" class="admin-row">
              <div class="admin-info">
                <span class="admin-name">{{ m.username }}</span>
                <span v-if="m.role === 'owner'" class="role-tag owner">{{ t('chat.owner') }}</span>
                <span v-else-if="m.role === 'admin'" class="role-tag admin">{{ t('chat.admin') }}</span>
              </div>
              <div class="admin-actions">
                <button v-if="myGroupRole === 'owner' && m.role !== 'owner'" class="mini-btn" @click="toggleAdmin(m.user_id, m.role)">
                  {{ m.role === 'admin' ? t('chat.revokeAdmin') : t('chat.makeAdmin') }}
                </button>
                <button v-if="(myGroupRole === 'owner' || myGroupRole === 'admin') && m.role !== 'owner' && m.user_id !== myId" class="mini-btn no" @click="kickMember(m.user_id)">{{ t('chat.kick') }}</button>
              </div>
            </div>
          </div>
          <div class="modal-foot">
            <button class="mini-btn" @click="groupManageOpen = false">{{ t('chat.close') }}</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { isLeaving } from '../router'
import { t } from '../utils/i18n'
import { supabase, chatClientId } from '../utils/supabase'
import { currentUser, currentProfile, signOut, loadProfile } from '../utils/auth'
import { showError, showSuccess } from '../utils/modal'
import AppIcon from '../components/AppIcon.vue'

const router = useRouter()

// 身份以登录用户为准（刷新后立即可用），不依赖资料是否加载完成
const myId = computed(() => currentUser.value?.id || currentProfile.value?.id)
const isAdmin = computed(() => !!currentProfile.value?.is_admin)

const view = ref({ type: 'public' })
const sidebarOpen = ref(false)
const messages = ref([])
const friends = ref([])
const groups = ref([])
const incoming = ref([])
const ownIds = new Set()
const seenIds = new Set()
const draft = ref('')
const sending = ref(false)
const loading = ref(true)
const listEl = ref(null)
const emojiOpen = ref(false)
const fileInput = ref(null)
const previewUrl = ref('')
const searchUser = ref('')
const openGroupModal = ref(false)
const groupName = ref('')
const groupMembers = ref([])

// 封禁 & 管理员
const isBanned = ref(false)
const banInfo = ref(null)
const adminModal = ref(false)
const adminUsers = ref([])
const adminSearch = ref('')
const groupManageOpen = ref(false)
const groupMemberList = ref([])

let channel = null

const RECALL_WINDOW = 2 * 60 * 1000
const emojis = ['😀','😁','😂','🤣','😊','😍','🤔','😎','😭','😡','👍','👏','🙏','🎉','🔥','❤️','👋','🤝','🌟','✨']

const canSend = computed(() => draft.value.trim().length > 0 && !sending.value)

const viewTitle = computed(() => {
  if (view.value.type === 'public') return t('chat.publicRoom')
  if (view.value.type === 'dm') return view.value.name || t('chat.friends')
  if (view.value.type === 'group') return view.value.name || t('chat.groups')
  return ''
})

const isMine = (msg) => {
  // 公共聊天室优先按账号判断；老消息没有 user_id 时回退到浏览器标识
  if (view.value.type === 'public') {
    if (msg.user_id) return msg.user_id === myId.value
    return msg.client_id === chatClientId || ownIds.has(msg.id)
  }
  if (view.value.type === 'dm') return msg.from_user === myId.value
  if (view.value.type === 'group') return msg.user_id === myId.value
  return false
}

const msgDisplayUser = (msg) => {
  if (view.value.type === 'public') return msg.username
  if (view.value.type === 'dm') return msg.from_username || (isMine(msg) ? (currentProfile.value?.username) : view.value.name)
  if (view.value.type === 'group') return msg.username || msg.user_username || '?'
}

const canRecall = (msg) => Date.now() - new Date(msg.created_at).getTime() < RECALL_WINDOW

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

const scrollToBottom = () => {
  nextTick(() => { if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight })
}

const addMessage = (row) => {
  if (!row || !row.id || seenIds.has(row.id)) return
  seenIds.add(row.id)
  messages.value.push(row)
  scrollToBottom()
}

const removeMessage = (id) => {
  const i = messages.value.findIndex((m) => m.id === id)
  if (i >= 0) messages.value.splice(i, 1)
  seenIds.delete(id)
  ownIds.delete(id)
}

const switchView = (v) => {
  sidebarOpen.value = false
  view.value = v
  messages.value = []
  seenIds.clear()
  loading.value = true
  loadConversation()
}

const loadConversation = async () => {
  loading.value = true
  messages.value = []
  seenIds.clear()
  if (view.value.type === 'public') {
    const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(50)
    if (error) { showError(error.message) }
    else { messages.value = data.reverse(); data.forEach((m) => seenIds.add(m.id)) }
  } else if (view.value.type === 'dm') {
    const { data, error } = await supabase
      .from('dm_messages')
      .select('*, from_username:profiles!dm_messages_from_user_fkey(username)')
      .or(`from_user.eq.${myId.value},to_user.eq.${myId.value}`)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) { showError(error.message) }
    else {
      const filtered = data.filter((m) => m.from_user === view.value.target || m.to_user === view.value.target)
      messages.value = filtered.reverse()
      filtered.forEach((m) => seenIds.add(m.id))
    }
  } else if (view.value.type === 'group') {
    myGroupRole.value = ''
    const { data: mem } = await supabase.from('group_members').select('role').eq('group_id', view.value.target).eq('user_id', myId.value).single()
    if (mem) myGroupRole.value = mem.role
    const { data, error } = await supabase
      .from('group_messages')
      .select('*, username:profiles!group_messages_user_id_fkey(username)')
      .eq('group_id', view.value.target)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) { showError(error.message) }
    else { messages.value = data.reverse(); data.forEach((m) => seenIds.add(m.id)) }
  }
  loading.value = false
  scrollToBottom()
}

const send = async () => {
  if (isBanned.value) return showError(banInfo.value ? `${t('chat.banned')}: ${banInfo.value.reason || '-'}` : t('chat.banned'))
  const content = draft.value.trim()
  if (!content || sending.value) return
  sending.value = true
  try {
    if (view.value.type === 'public') {
      const { data, error } = await supabase.from('messages')
        .insert({ username: currentProfile.value?.username, content, client_id: chatClientId, user_id: myId.value })
        .select().single()
      if (error) throw error
      ownIds.add(data.id); addMessage(data)
    } else if (view.value.type === 'dm') {
      const { data, error } = await supabase.from('dm_messages')
        .insert({ from_user: myId.value, to_user: view.value.target, content, client_id: chatClientId })
        .select().single()
      if (error) throw error
      ownIds.add(data.id); addMessage({ ...data, from_username: currentProfile.value?.username })
    } else if (view.value.type === 'group') {
      const { data, error } = await supabase.from('group_messages')
        .insert({ group_id: view.value.target, user_id: myId.value, content, client_id: chatClientId })
        .select().single()
      if (error) throw error
      ownIds.add(data.id); addMessage({ ...data, username: currentProfile.value?.username })
    }
    draft.value = ''
  } catch (e) {
    showError(`${t('chat.sendError')}: ${e.message}`)
  } finally {
    sending.value = false
  }
}

const pickImage = () => fileInput.value?.click()

const onFilePick = async (e) => {
  if (isBanned.value) return showError(banInfo.value ? `${t('chat.banned')}: ${banInfo.value.reason || '-'}` : t('chat.banned'))
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) return showError(t('chat.imageTypeError'))
  if (file.size > 5 * 1024 * 1024) return showError(t('chat.imageSizeError'))
  try {
    const ext = file.name.split('.').pop() || 'png'
    const path = `${chatClientId}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('chat-images').upload(path, file, { cacheControl: '31536000' })
    if (upErr) throw upErr
    const { data: urlData } = supabase.storage.from('chat-images').getPublicUrl(path)
    const image_url = urlData.publicUrl
    let row
    if (view.value.type === 'public') {
      const { data, error } = await supabase.from('messages')
        .insert({ username: currentProfile.value?.username, content: '', image_url, client_id: chatClientId, user_id: myId.value })
        .select().single()
      if (error) throw error; row = data
    } else if (view.value.type === 'dm') {
      const { data, error } = await supabase.from('dm_messages')
        .insert({ from_user: myId.value, to_user: view.value.target, content: '', image_url, client_id: chatClientId })
        .select().single()
      if (error) throw error; row = { ...data, from_username: currentProfile.value?.username }
    } else if (view.value.type === 'group') {
      const { data, error } = await supabase.from('group_messages')
        .insert({ group_id: view.value.target, user_id: myId.value, content: '', image_url, client_id: chatClientId })
        .select().single()
      if (error) throw error; row = { ...data, username: currentProfile.value?.username }
    }
    ownIds.add(row.id); addMessage(row)
  } catch (err) {
    showError(`${t('chat.imageUploadError')}: ${err.message}`)
  }
}

const insertEmoji = (em) => { draft.value += em; emojiOpen.value = false }

const copyMsg = async (msg) => {
  const text = msg.image_url ? msg.image_url : msg.content
  try { await navigator.clipboard.writeText(text); showSuccess(t('chat.copied')) }
  catch { showError(t('chat.copyFailed')) }
}

const recallMsg = async (msg) => {
  let q
  if (view.value.type === 'public') q = supabase.from('messages').delete().eq('id', msg.id)
  else if (view.value.type === 'dm') q = supabase.from('dm_messages').delete().eq('id', msg.id)
  else q = supabase.from('group_messages').delete().eq('id', msg.id)
  // 回查被删除的行，RLS 拒绝时不要假装成功
  const { data, error } = await q.select('id')
  if (error) { showError(`${t('chat.recallError')}: ${error.message}`); return }
  if (!data?.length) { showError(t('chat.recallDenied')); return }
  removeMessage(msg.id)
}

const loadFriends = async () => {
  const { data } = await supabase.from('friendships').select('*')
  const ids = (data || []).map((f) => f.user_a === myId.value ? f.user_b : f.user_a)
  if (!ids.length) { friends.value = []; return }
  const { data: profs } = await supabase.from('profiles').select('id, username').in('id', ids)
  friends.value = profs || []
}

const loadGroups = async () => {
  const { data: members } = await supabase.from('group_members').select('group_id').eq('user_id', myId.value)
  const gids = (members || []).map((m) => m.group_id)
  if (!gids.length) { groups.value = []; return }
  const { data } = await supabase.from('groups').select('*').in('id', gids)
  groups.value = data || []
}

const loadRequests = async () => {
  const { data } = await supabase.from('friend_requests')
    .select('*, from_username:profiles!friend_requests_from_user_fkey(username)')
    .eq('to_user', myId.value).eq('status', 'pending')
  incoming.value = data || []
}

const sendFriendRequest = async () => {
  const name = searchUser.value.trim()
  if (!name) return
  if (name === currentProfile.value?.username) return showError(t('chat.cantSelf'))
  const { data: target } = await supabase.from('profiles').select('id').eq('username', name).single()
  if (!target) return showError(t('chat.userNotFound'))
  const { error } = await supabase.from('friend_requests').insert({ from_user: myId.value, to_user: target.id })
  if (error) showError(error.message)
  else { showSuccess(t('chat.requestSent')); searchUser.value = '' }
}

const acceptRequest = async (id) => {
  const req = incoming.value.find((r) => r.id === id)
  if (!req) return
  const { error } = await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', id)
  if (error) return showError(error.message)
  const a = myId.value, b = req.from_user
  await supabase.from('friendships').insert({ user_a: a, user_b: b })
  incoming.value = incoming.value.filter((r) => r.id !== id)
  loadFriends()
}

const rejectRequest = async (id) => {
  const { error } = await supabase.from('friend_requests').update({ status: 'rejected' }).eq('id', id)
  if (error) return showError(error.message)
  incoming.value = incoming.value.filter((r) => r.id !== id)
}

const createGroup = async () => {
  const name = groupName.value.trim()
  if (!name || !groupMembers.value.length) return showError(t('chat.groupInvalid'))
  if (!myId.value) return showError(t('chat.loginRequired'))
  const { data: group, error } = await supabase.from('groups').insert({ name, owner: myId.value }).select().single()
  if (error) return showError(error.message)
  const members = [
    { group_id: group.id, user_id: myId.value, role: 'owner' },
    ...groupMembers.value.map((uid) => ({ group_id: group.id, user_id: uid, role: 'member' }))
  ]
  const { error: mErr } = await supabase.from('group_members').insert(members)
  if (mErr) return showError(mErr.message)
  groups.value.push(group)
  openGroupModal.value = false
  groupName.value = ''; groupMembers.value = []
  switchView({ type: 'group', target: group.id, name: group.name })
}

const myGroupRole = ref('')

const loadBanStatus = async () => {
  const { data } = await supabase.from('bans').select('*').eq('user_id', myId.value)
  const active = (data || []).filter((b) => b.is_permanent || new Date(b.expires_at) > new Date())
  if (active.length) { isBanned.value = true; banInfo.value = active[0] }
  else { isBanned.value = false; banInfo.value = null }
}

const loadAdminUsers = async () => {
  const q = supabase.from('profiles').select('id, username, is_admin')
  if (adminSearch.value.trim()) q.ilike('username', `%${adminSearch.value.trim()}%`)
  const { data, error } = await q.limit(50)
  if (error) return showError(error.message)
  // 附带封禁状态
  const { data: bans } = await supabase.from('bans').select('user_id').in('user_id', (data || []).map((u) => u.id))
  const bannedSet = new Set((bans || []).map((b) => b.user_id))
  adminUsers.value = (data || []).map((u) => ({ ...u, banned: bannedSet.has(u.id) }))
}

const banUser = async (user) => {
  const reason = prompt(t('chat.banReasonPh'))
  const { error } = await supabase.from('bans').insert({ user_id: user.id, banned_by: myId.value, reason: reason || null })
  if (error) return showError(error.message)
  showSuccess(t('chat.banDone'))
  loadAdminUsers()
}

const unbanUser = async (user) => {
  const { error } = await supabase.from('bans').delete().eq('user_id', user.id)
  if (error) return showError(error.message)
  showSuccess(t('chat.unbanDone'))
  loadAdminUsers()
}

const canManageMsg = (msg) => {
  if (isAdmin.value) return true
  if (view.value.type === 'group' && (myGroupRole.value === 'owner' || myGroupRole.value === 'admin')) return true
  return false
}

const openGroupManage = async () => {
  groupManageOpen.value = true
  const { data } = await supabase
    .from('group_members')
    .select('user_id, role, username:profiles(username)')
    .eq('group_id', view.value.target)
  groupMemberList.value = (data || []).map((m) => ({ ...m, username: m.username?.username }))
}

const kickMember = async (uid) => {
  const { error } = await supabase.from('group_members').delete().eq('group_id', view.value.target).eq('user_id', uid)
  if (error) return showError(error.message)
  showSuccess(t('chat.kickDone'))
  openGroupManage()
}

const toggleAdmin = async (uid, currentRole) => {
  if (myGroupRole.value !== 'owner') return showError(t('chat.onlyOwner'))
  const newRole = currentRole === 'admin' ? 'member' : 'admin'
  const { error } = await supabase.from('group_members').update({ role: newRole }).eq('group_id', view.value.target).eq('user_id', uid)
  if (error) return showError(error.message)
  showSuccess(t('chat.roleUpdated'))
  openGroupManage()
}

const doLogout = async () => {
  await signOut()
  router.push('/login')
}

const closeEmoji = (e) => {
  if (!emojiOpen.value) return
  if (!e.target.closest('.emoji-panel') && !e.target.closest('[title]')) emojiOpen.value = false
}

onMounted(async () => {
  await loadProfile()
  if (!myId.value) { router.push('/login?redirect=/chat'); return }
  loadBanStatus()
  loadFriends()
  loadGroups()
  loadRequests()
  loadConversation()

  channel = supabase.channel('chat-all')
  channel
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (p) => {
      if (view.value.type === 'public') addMessage(p.new)
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (p) => {
      if (view.value.type === 'public') removeMessage(p.old.id)
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dm_messages' }, (p) => {
      if (view.value.type === 'dm' && (p.new.from_user === view.value.target || p.new.to_user === view.value.target)) {
        addMessage(p.new)
      }
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'dm_messages' }, (p) => removeMessage(p.old.id))
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages' }, (p) => {
      if (view.value.type === 'group' && p.new.group_id === view.value.target) addMessage(p.new)
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'group_messages' }, (p) => removeMessage(p.old.id))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'friend_requests' }, () => loadRequests())
    .subscribe()

  document.addEventListener('click', closeEmoji)
})

onBeforeUnmount(() => {
  if (channel) supabase.removeChannel(channel)
  document.removeEventListener('click', closeEmoji)
})
</script>

<style scoped>
.chat-page { min-height: calc(100vh - 60px); min-height: calc(100dvh - 60px); padding: 16px; font-family: Avenir, Helvetica, Arial, sans-serif; color: #2c3e50; }

.chat-container {
  display: flex;
  height: calc(100vh - 92px);
  height: calc(100dvh - 92px);
  max-width: 1100px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 14px;
  overflow: hidden;
  opacity: 0;
  transform: translateX(30px);
  animation: slideIn 0.45s ease forwards;
}

@keyframes slideIn { to { opacity: 1; transform: translateX(0); } }

.leaving .chat-container { animation: slideOut 0.4s ease forwards; }
@keyframes slideOut { to { opacity: 0; transform: translateX(60px); } }

.sidebar {
  width: 250px;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.profile-bar { display: flex; align-items: center; gap: 10px; padding: 14px; border-bottom: 1px solid #eee; }
.avatar {
  width: 38px; height: 38px; border-radius: 50%; background: #42b983; color: #fff;
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px;
}
.user-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.uname { font-weight: 600; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.logout-btn { background: none; border: none; color: #888; font-size: 12px; cursor: pointer; text-align: left; padding: 0; }
.logout-btn:hover { color: #e05555; }

.search-row { display: flex; gap: 6px; padding: 10px; border-bottom: 1px solid #eee; }
.search-row input {
  flex: 1; border: 1px solid #ddd; border-radius: 6px; padding: 6px 8px; font-size: 13px; outline: none; background: #fff;
}
.search-row input:focus { border-color: #42b983; }
.add-btn { background: #42b983; color: #fff; border: none; border-radius: 6px; padding: 0 10px; font-size: 12px; cursor: pointer; }
.add-btn:hover { background: #3aa876; }

.nav-section { padding: 8px 0; overflow-y: auto; }
.section-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 14px; font-size: 12px; color: #999; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
}
.badge { background: #e05555; color: #fff; border-radius: 10px; padding: 1px 7px; font-size: 11px; }

.nav-item {
  display: flex; align-items: center; gap: 8px; padding: 8px 14px; cursor: pointer; font-size: 14px;
  transition: background 0.15s;
}
.nav-item:hover { background: #f0f0f0; }
.nav-item.active { background: #e8f7f0; color: #42b983; font-weight: 600; }

.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.public-dot { background: #42b983; }
.friend-dot { background: #5a9ed6; }
.group-dot { background: #c98ad6; }

.req-list { padding: 4px 14px 8px; display: flex; flex-direction: column; gap: 6px; }
.req-item { display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
.req-name { color: #555; }
.req-actions { display: flex; gap: 4px; }

.mini-btn {
  background: #f0f0f0; border: 1px solid #ddd; border-radius: 5px; padding: 2px 8px; font-size: 12px; cursor: pointer;
  color: #666;
}
.mini-btn.ok { background: #e8f7f0; border-color: #42b983; color: #42b983; }
.mini-btn.ok:hover { background: #42b983; color: #fff; }
.mini-btn.no:hover { background: #e05555; color: #fff; border-color: #e05555; }

.empty-mini { padding: 4px 14px; font-size: 12px; color: #bbb; margin: 0; }

.main { flex: 1; display: flex; flex-direction: column; min-width: 0; position: relative; }
.main-head {
  display: flex; align-items: baseline; justify-content: space-between;
  padding: 14px 18px; border-bottom: 1px solid #eee;
}
.main-head h2 { margin: 0; font-size: 18px; }
.conv-hint { font-size: 12px; color: #999; }

.msg-list { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.empty { margin: auto; color: #999; font-size: 14px; }

.msg-row { display: flex; }
.msg-row.mine { justify-content: flex-end; }
.bubble {
  max-width: 72%; background: #f4f6f5; border-radius: 10px; padding: 8px 12px; position: relative;
}
.msg-row.mine .bubble { background: #42b983; }
.bubble.has-image { padding: 6px; }
.bubble-actions {
  position: absolute; top: -30px; right: 0; display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s;
}
.msg-row:not(.mine) .bubble-actions { right: auto; left: 0; }
.bubble:hover .bubble-actions { opacity: 1; }
.act-btn {
  background: #fff; border: 1px solid #eee; border-radius: 6px; padding: 3px; color: #888; cursor: pointer;
  display: inline-flex; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08); transition: all 0.15s;
}
.act-btn:hover { color: #42b983; border-color: #42b983; }

.meta { margin: 0 0 2px; font-size: 12px; color: #999; display: flex; gap: 8px; }
.name { font-weight: 600; color: #42b983; }
.msg-row.mine .meta { color: rgba(255, 255, 255, 0.75); }
.msg-row.mine .name { color: rgba(255, 255, 255, 0.9); }
.content { margin: 0; font-size: 14px; line-height: 1.6; color: #2c3e50; word-break: break-word; white-space: pre-wrap; }
.msg-row.mine .content { color: #fff; }
.msg-img { max-width: 220px; max-height: 220px; border-radius: 8px; cursor: pointer; display: block; margin-bottom: 4px; }

.input-row { display: flex; gap: 8px; padding: 12px; border-top: 1px solid #eee; align-items: center; position: relative; }
.msg-input {
  flex: 1; border: 1px solid #ddd; border-radius: 8px; padding: 9px 12px; font-size: 14px; color: #2c3e50;
  background: #fafafa; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
}
.msg-input:focus { border-color: #42b983; box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.15); }
.send-btn {
  background: #42b983; color: #fff; border: none; border-radius: 8px; padding: 9px 20px; font-size: 14px; cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.send-btn:hover:not(:disabled) { background: #3aa876; transform: translateY(-1px); }
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.icon-btn {
  background: none; border: 1px solid #ddd; border-radius: 8px; padding: 5px; color: #888; cursor: pointer;
  display: inline-flex; transition: all 0.2s;
}
.icon-btn:hover, .icon-btn.active { border-color: #42b983; color: #42b983; background: #f0f9f4; }
.hidden-file { display: none; }
.menu-btn { display: none; }
.sidebar-mask { display: none; }

.emoji-panel {
  position: absolute; bottom: 64px; left: 12px; display: grid; grid-template-columns: repeat(10, 1fr); gap: 2px;
  padding: 8px; background: #fff; border: 1px solid #eee; border-radius: 10px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); z-index: 5;
}
.emoji { background: none; border: none; font-size: 20px; cursor: pointer; padding: 4px; border-radius: 6px; transition: background 0.15s; }
.emoji:hover { background: #f0f9f4; }

.modal-mask {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px;
}
.modal-card {
  background: #fff; border-radius: 12px; padding: 24px; width: 100%; max-width: 400px; max-height: 80vh; display: flex; flex-direction: column; gap: 12px;
}
.modal-card h3 { margin: 0; }
.modal-card input { border: 1px solid #ddd; border-radius: 8px; padding: 9px 12px; font-size: 14px; outline: none; }
.modal-card input:focus { border-color: #42b983; }
.modal-label { margin: 0; font-size: 13px; color: #888; }
.member-list { overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
.member-item { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }
.modal-foot { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
.modal-card.wide { max-width: 520px; }

.head-actions { display: flex; align-items: center; gap: 10px; }
.admin-dot { background: #e0a030; }

.admin-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 4px; border-bottom: 1px solid #f0f0f0; }
.admin-info { display: flex; align-items: center; gap: 8px; }
.admin-name { font-size: 14px; font-weight: 600; }
.admin-actions { display: flex; gap: 6px; }
.role-tag { font-size: 11px; padding: 1px 6px; border-radius: 4px; font-weight: 600; }
.role-tag.owner { background: #fff3e0; color: #e67e22; }
.role-tag.admin { background: #e8f0ff; color: #4a7fd6; }
.role-tag.banned { background: #fde8e8; color: #e05555; }

.preview-mask {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center;
  z-index: 3000; padding: 20px;
}
.preview-img { max-width: 90vw; max-height: 90vh; border-radius: 8px; object-fit: contain; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

html.dark .chat-page { color: #e0e0e0; }
html.dark .chat-container { background: #1a1a2e; border-color: #2d2d44; }
html.dark .sidebar { background: #14142a; border-color: #2d2d44; }
html.dark .profile-bar { border-color: #2d2d44; }
html.dark .search-row { border-color: #2d2d44; }
html.dark .search-row input { background: #1a1a2e; border-color: #2d2d44; color: #e0e0e0; }
html.dark .nav-item:hover { background: #1f1f38; }
html.dark .nav-item.active { background: rgba(66, 185, 131, 0.15); color: #42b983; }
html.dark .main-head { border-color: #2d2d44; }
html.dark .main-head h2 { color: #f0f0f0; }
html.dark .bubble { background: #252540; }
html.dark .meta { color: #777; }
html.dark .name { color: #42b983; }
html.dark .content { color: #ddd; }
html.dark .input-row { border-color: #2d2d44; }
html.dark .msg-input { background: #14142a; border-color: #2d2d44; color: #e0e0e0; }
html.dark .icon-btn { border-color: #2d2d44; color: #aaa; }
html.dark .icon-btn:hover, html.dark .icon-btn.active { border-color: #42b983; color: #42b983; background: rgba(66,185,131,0.15); }
html.dark .act-btn { background: #252540; border-color: #2d2d44; }
html.dark .emoji-panel { background: #1a1a2e; border-color: #2d2d44; }
html.dark .emoji:hover { background: #252540; }
html.dark .modal-card { background: #1a1a2e; }
html.dark .modal-card input { background: #14142a; border-color: #2d2d44; color: #e0e0e0; }
html.dark .member-item { color: #ddd; }
html.dark .mini-btn { background: #252540; border-color: #2d2d44; color: #aaa; }
html.dark .admin-row { border-color: #2d2d44; }
html.dark .admin-name { color: #ddd; }
html.dark .role-tag.owner { background: rgba(230,126,34,0.15); }
html.dark .role-tag.admin { background: rgba(74,127,214,0.15); }
html.dark .role-tag.banned { background: rgba(224,85,85,0.15); }

html.dark .menu-btn { border-color: #2d2d44; color: #ccc; }

/* ============ 移动端适配 ============ */
@media (max-width: 768px) {
  .chat-page { min-height: 0; height: calc(100vh - 60px); height: calc(100dvh - 60px); padding: 0; }
  .chat-container {
    height: 100%;
    max-width: none;
    border-radius: 0;
    border-left: none;
    border-right: none;
    position: relative;
  }

  .menu-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 34px; height: 34px; flex-shrink: 0;
    background: none; border: 1px solid #ddd; border-radius: 8px; color: #666; cursor: pointer;
  }

  .main-head { align-items: center; gap: 8px; padding: 10px 12px; }
  .main-head h2 { flex: 1; font-size: 16px; }
  .conv-hint { display: none; }
  .head-actions { gap: 6px; }

  .sidebar {
    position: absolute; top: 0; bottom: 0; left: 0;
    width: 82%; max-width: 320px; z-index: 30;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: 0 0 24px rgba(0, 0, 0, 0.18);
  }
  .sidebar.open { transform: translateX(0); }
  .sidebar-mask {
    display: block; position: absolute; inset: 0;
    background: rgba(0, 0, 0, 0.35); z-index: 25;
  }
  .nav-item { padding: 12px 14px; }
  .nav-section { overflow-y: visible; }

  .msg-list { padding: 12px; gap: 10px; }
  .bubble { max-width: 85%; }
  .msg-img { max-width: 60vw; max-height: 60vw; }
  .act-btn { padding: 6px; }

  .input-row {
    padding: 8px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom));
    gap: 6px;
  }
  .msg-input { font-size: 16px; padding: 8px 10px; min-width: 0; }
  .send-btn { padding: 8px 14px; }
  .icon-btn { padding: 6px; }

  .emoji-panel {
    left: 8px; right: 8px; bottom: 60px;
    grid-template-columns: repeat(8, 1fr);
    max-height: 45vh; max-height: 45dvh; overflow-y: auto;
  }
  .modal-mask { padding: 12px; }
  .modal-card { max-height: 85vh; max-height: 85dvh; padding: 18px; }
  .modal-card.wide { max-width: 100%; }
}
</style>
