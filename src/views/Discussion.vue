<template>
  <div class="discussion-page" :class="{ leaving: isLeaving }">
    <div class="page-header stagger-item" :style="{ '--delay': '0.05s' }">
      <button class="back-btn" @click="goBack">{{ t('discussion.back') }}</button>
      <h1>{{ t('discussion.title') }}</h1>
      <p class="subtitle">{{ t('discussion.subtitle') }}</p>
    </div>

    <!-- ---------- 文章详情 ---------- -->
    <div v-if="activePost" class="detail stagger-item" :style="{ '--delay': '0.15s' }">
      <button class="link-btn" @click="closePost">{{ t('discussion.backToList') }}</button>

      <article class="article">
        <img v-if="activePost.cover_url" class="cover" :src="activePost.cover_url" alt="" />
        <div class="title-row">
          <span v-if="activePost.pinned" class="pin-badge">{{ t('discussion.pinned') }}</span>
          <h2>{{ activePost.title }}</h2>
        </div>
        <p class="meta">
          <span>{{ authorOf(activePost) }}</span>
          <span class="dot">·</span>
          <span>{{ fmtDate(activePost.created_at) }}</span>
          <span v-for="tag in tagsOf(activePost)" :key="tag" class="tag">#{{ tag }}</span>
          <span v-if="isAdmin" class="admin-actions">
            <button class="text-btn" @click="startEdit(activePost)">{{ t('discussion.edit') }}</button>
            <button class="text-btn" @click="togglePin(activePost)">
              {{ activePost.pinned ? t('discussion.unpin') : t('discussion.pin') }}
            </button>
            <span class="trash-wrap" :class="{ open: deleteConfirmId === activePost.id }">
              <button
                class="trash-btn"
                :title="t('discussion.deletePost')"
                :aria-label="t('discussion.deletePost')"
                :aria-expanded="deleteConfirmId === activePost.id"
                @click.stop="toggleDeleteConfirm(activePost)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <g class="trash-lid">
                    <path d="M4 7h16" />
                    <path d="M9 7V5h6v2" />
                  </g>
                  <path d="M6 7l1 12.5a1.5 1.5 0 0 0 1.5 1.4h7a1.5 1.5 0 0 0 1.5-1.4L18 7" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </button>
              <span class="trash-confirm">
                <button
                  class="trash-action confirm"
                  :aria-label="t('discussion.delete')"
                  :title="t('discussion.delete')"
                  @click.stop="doRemovePost(activePost)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
                <button
                  class="trash-action cancel"
                  :aria-label="t('discussion.cancel')"
                  :title="t('discussion.cancel')"
                  @click.stop="closeDeleteConfirm"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </span>
            </span>
          </span>
        </p>
        <div class="content rich" v-html="renderContent(activePost.content)"></div>
        <div v-if="activePost.details" class="details-block">
          <p class="details-title">{{ t('discussion.details') }}</p>
          <p class="details">{{ activePost.details }}</p>
        </div>
      </article>

      <section class="comments">
        <h3>{{ t('discussion.comments') }} <span class="count">{{ comments.length }}</span></h3>

        <form v-if="isLoggedIn" class="comment-form" @submit.prevent="submitComment">
          <p v-if="replyTo" class="reply-banner">
            <span>{{ t('discussion.replyTo', { name: replyTo.name }) }}</span>
            <button type="button" class="text-btn" @click="cancelReply">{{ t('discussion.cancelReply') }}</button>
          </p>
          <textarea
            v-model="commentText"
            rows="3"
            maxlength="2000"
            :placeholder="replyTo ? t('discussion.replyTo', { name: replyTo.name }) : t('discussion.commentPh')"
          ></textarea>
          <div v-if="commentImageUrl" class="image-preview">
            <img :src="commentImageUrl" alt="" />
            <button type="button" class="text-btn danger" @click="commentImageUrl = ''">
              {{ t('discussion.removeImage') }}
            </button>
          </div>
          <div class="comment-actions">
            <button
              type="button"
              class="text-btn"
              :disabled="uploading === 'comment'"
              @click="commentImageInput?.click()"
            >
              {{ uploading === 'comment' ? t('discussion.uploading') : t('discussion.image') }}
            </button>
            <button type="submit" class="primary-btn" :disabled="sending">
              {{ sending ? t('discussion.sending') : t('discussion.send') }}
            </button>
          </div>
        </form>

        <div v-else class="login-hint">
          <p>{{ t('discussion.loginToComment') }}</p>
          <button class="primary-btn" @click="goLogin">{{ t('discussion.goLogin') }}</button>
        </div>

        <p v-if="commentsLoading" class="hint">{{ t('discussion.loading') }}</p>
        <p v-else-if="!comments.length" class="hint">{{ t('discussion.noComments') }}</p>

        <div
          v-for="c in flatComments"
          :key="c.id"
          class="comment-item"
          :class="{ 'reply-item': c._reply }"
        >
          <div class="comment-head">
            <span class="avatar">{{ initial(authorOf(c)) }}</span>
            <span class="name">{{ authorOf(c) }}</span>
            <span class="time">{{ fmtDate(c.created_at) }}</span>
            <button
              class="text-btn"
              @click="startReply(c)"
            >{{ t('discussion.reply') }}</button>
            <button
              v-if="canDeleteComment(c)"
              class="text-btn danger"
              @click="removeComment(c)"
            >{{ t('discussion.delete') }}</button>
          </div>
          <div class="comment-text rich" v-html="renderContent(c.content)"></div>
          <img v-if="c.image_url" class="comment-image" :src="c.image_url" alt="" loading="lazy" />
          <button class="like-btn" :class="{ liked: myLikes[c.id] }" @click="toggleLike(c)">
            <span class="heart">♥</span>
            <span v-if="likes[c.id]">{{ likes[c.id] }}</span>
          </button>
        </div>
      </section>
    </div>

    <!-- ---------- 文章列表 ---------- -->
    <template v-else>
      <div v-if="isAdmin" class="editor stagger-item" :style="{ '--delay': '0.12s' }">
        <button v-if="!editorOpen" class="primary-btn" @click="openEditor">
          {{ t('discussion.newPost') }}
        </button>

        <form v-else class="editor-form" @submit.prevent="savePost">
          <p v-if="editingId" class="editing-tip">{{ t('discussion.editTitle') }}</p>
          <input v-model="draft.title" maxlength="80" :placeholder="t('discussion.titlePh')" />
          <textarea
            v-model="draft.content"
            rows="6"
            maxlength="20000"
            :placeholder="t('discussion.contentPh')"
          ></textarea>
          <div class="upload-row">
            <button type="button" class="text-btn" :disabled="uploading === 'content'" @click="contentImageInput?.click()">
              {{ uploading === 'content' ? t('discussion.uploading') : t('discussion.insertImage') }}
            </button>
            <span class="upload-tip">{{ t('discussion.insertImageTip') }}</span>
          </div>
          <textarea
            v-model="draft.details"
            rows="3"
            maxlength="5000"
            :placeholder="t('discussion.detailsPh')"
          ></textarea>
          <input v-model="draft.tags" maxlength="100" :placeholder="t('discussion.tagsPh')" />
          <div class="cover-row">
            <button type="button" class="text-btn" :disabled="uploading === 'cover'" @click="coverInput?.click()">
              {{ uploading === 'cover' ? t('discussion.uploading') : t('discussion.pickCover') }}
            </button>
            <template v-if="draft.cover_url">
              <img class="cover-thumb" :src="draft.cover_url" alt="" />
              <button type="button" class="text-btn danger" @click="draft.cover_url = ''">
                {{ t('discussion.removeCover') }}
              </button>
            </template>
          </div>
          <div class="editor-actions">
            <button type="button" class="text-btn" @click="cancelEditor">{{ t('discussion.cancel') }}</button>
            <button type="submit" class="primary-btn" :disabled="publishing">
              {{ publishing ? t('discussion.publishing') : (editingId ? t('discussion.save') : t('discussion.publish')) }}
            </button>
          </div>
        </form>
      </div>

      <div class="search-bar stagger-item" :style="{ '--delay': '0.16s' }">
        <input v-model="searchInput" :placeholder="t('discussion.searchPh')" />
        <button v-if="searchInput" class="text-btn" @click="clearSearch">{{ t('discussion.clear') }}</button>
      </div>

      <div class="post-list stagger-item" :style="{ '--delay': '0.2s' }">
        <p v-if="loading" class="hint">{{ t('discussion.loading') }}</p>
        <p v-else-if="!posts.length" class="hint">
          {{ search ? t('discussion.noResult') : t('discussion.noPosts') }}
        </p>

        <article
          v-for="post in posts"
          :key="post.id"
          class="post-card"
          @click="openPost(post)"
        >
          <h3>
            <span v-if="post.pinned" class="pin-badge">{{ t('discussion.pinned') }}</span>
            {{ post.title }}
          </h3>
          <p class="excerpt">{{ excerpt(post.content) }}</p>
          <p class="meta">
            <span>{{ authorOf(post) }}</span>
            <span class="dot">·</span>
            <span>{{ fmtDate(post.created_at) }}</span>
            <span class="dot">·</span>
            <span>{{ t('discussion.commentCount', { n: commentCounts[post.id] || 0 }) }}</span>
            <span v-for="tag in tagsOf(post)" :key="tag" class="tag">#{{ tag }}</span>
          </p>
        </article>
      </div>

      <div v-if="pageCount > 1" class="pagination stagger-item" :style="{ '--delay': '0.24s' }">
        <button class="page-btn" :disabled="page === 1" @click="setPage(page - 1)">
          {{ t('discussion.prev') }}
        </button>
        <div class="page-numbers">
          <button
            v-for="p in pageCount"
            :key="p"
            class="page-btn page-num"
            :class="{ active: p === page }"
            @click="setPage(p)"
          >{{ p }}</button>
        </div>
        <button class="page-btn" :disabled="page === pageCount" @click="setPage(page + 1)">
          {{ t('discussion.next') }}
        </button>
      </div>
    </template>

    <footer class="footer stagger-item" :style="{ '--delay': '0.3s' }">
      <p>{{ t('discussion.footer') }}</p>
    </footer>

    <input ref="coverInput" type="file" accept="image/*" hidden @change="onCoverPick" />
    <input ref="contentImageInput" type="file" accept="image/*" hidden @change="onContentImagePick" />
    <input ref="commentImageInput" type="file" accept="image/*" hidden @change="onCommentImagePick" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { isLeaving } from '../router'
import { t, locale } from '../utils/i18n'
import { supabase } from '../utils/supabase'
import { loadSession, currentUser, currentProfile } from '../utils/auth'
import { showError, showSuccess, showConfirm } from '../utils/modal'

const router = useRouter()
const PAGE_SIZE = 6

const posts = ref([])
const total = ref(0)
const page = ref(1)
const searchInput = ref('')
const search = ref('')
const commentCounts = ref({})
const loading = ref(true)
const activePost = ref(null)
const deleteConfirmId = ref(null)
const comments = ref([])
const commentsLoading = ref(false)
const likes = ref({})
const myLikes = ref({})
const sending = ref(false)
const commentText = ref('')
const commentImageUrl = ref('')
const replyTo = ref(null)
const publishing = ref(false)
const editorOpen = ref(false)
const editingId = ref(null)
const uploading = ref('')
const draft = reactive({ title: '', content: '', details: '', tags: '', cover_url: '' })

const coverInput = ref(null)
const contentImageInput = ref(null)
const commentImageInput = ref(null)

const isLoggedIn = computed(() => !!currentUser.value)
const isAdmin = computed(() => currentProfile.value?.is_admin === true)
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

const authorOf = (row) =>
  row?.profiles?.username ||
  authorNames.value[row?.author_id || row?.user_id] ||
  t('discussion.anonymous')
const initial = (name) => (name || '?').slice(0, 1).toUpperCase()
const tagsOf = (post) => (Array.isArray(post?.tags) ? post.tags : [])
const excerpt = (text) => {
  const flat = (text || '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\s+/g, ' ').trim()
  return flat.length > 120 ? `${flat.slice(0, 120)}…` : flat
}
const fmtDate = (value) =>
  new Date(value).toLocaleString(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })

/* ---------- 富文本（先转义，再支持少量语法） ---------- */
const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]))
const safeUrl = (url) => (/^(https?:\/\/|\/)/i.test(url) ? url : '')

const renderContent = (text) => {
  let html = escapeHtml(text || '')
  html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) => {
    const safe = safeUrl(url)
    return safe ? `<img src="${safe}" alt="${alt}" loading="lazy" />` : m
  })
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
    const safe = safeUrl(url)
    return safe ? `<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>` : m
  })
  return html.replace(/\n/g, '<br>')
}

/* ---------- 文章列表 ---------- */
const POST_FIELDS_FULL = 'id,title,content,details,tags,pinned,cover_url,created_at,author_id'
const POST_FIELDS_BASE = 'id,title,content,created_at,author_id'

const isMissingColumn = (error) =>
  error?.code === '42703' ||
  error?.code === 'PGRST204' ||
  /column .* does not exist|schema cache/i.test(error?.message || '')

const buildPostsQuery = (fields, orderPinned) => {
  let query = supabase.from('posts').select(fields, { count: 'exact' })
  const keyword = search.value.replace(/[,()]/g, ' ').trim()
  if (keyword) {
    const expr = fields === POST_FIELDS_FULL
      ? `title.ilike.%${keyword}%,content.ilike.%${keyword}%,details.ilike.%${keyword}%`
      : `title.ilike.%${keyword}%,content.ilike.%${keyword}%`
    query = query.or(expr)
  }
  if (orderPinned) query = query.order('pinned', { ascending: false })
  return query.order('created_at', { ascending: false })
}

/* 作者名单独查询，避免依赖 PostgREST 的外键嵌套展开 */
const authorNames = ref({})
const loadNames = async (ids) => {
  const missing = [...new Set(ids.filter(Boolean))].filter((id) => !(id in authorNames.value))
  if (!missing.length) return
  const { data } = await supabase.from('profiles').select('id,username').in('id', missing)
  const next = { ...authorNames.value }
  for (const p of data || []) next[p.id] = p.username
  authorNames.value = next
}

const fetchPosts = async () => {
  loading.value = true
  const from = (page.value - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let { data, error, count } = await buildPostsQuery(POST_FIELDS_FULL, true).range(from, to)

  // 兼容尚未执行迁移的数据库：去掉新列后用基础字段再查一次
  if (error && isMissingColumn(error)) {
    ;({ data, error, count } = await buildPostsQuery(POST_FIELDS_BASE, false).range(from, to))
  }

  if (error) {
    loading.value = false
    console.error('[discussion] 加载文章失败：', error)
    showError(`${t('discussion.loadError')}\n${error.message || ''}`.trim())
    return
  }

  posts.value = data || []
  total.value = count || 0

  const ids = posts.value.map((p) => p.id)
  if (ids.length) {
    await loadNames(posts.value.map((p) => p.author_id))
    const { data: rows } = await supabase.from('post_comments').select('post_id').in('post_id', ids)
    const map = {}
    for (const row of rows || []) map[row.post_id] = (map[row.post_id] || 0) + 1
    commentCounts.value = map
  } else {
    commentCounts.value = {}
  }
  loading.value = false
}

let searchTimer = null
watch(searchInput, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    search.value = value.trim()
    page.value = 1
    fetchPosts()
  }, 300)
})

const clearSearch = () => {
  searchInput.value = ''
  search.value = ''
  page.value = 1
  fetchPosts()
}

const setPage = (next) => {
  if (next < 1 || next > pageCount.value || next === page.value) return
  page.value = next
  fetchPosts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/* ---------- 文章详情与评论 ---------- */
const loadComments = async () => {
  if (!activePost.value) return
  commentsLoading.value = true
  let { data, error } = await supabase
    .from('post_comments')
    .select('id,content,created_at,user_id,parent_id,image_url')
    .eq('post_id', activePost.value.id)
    .order('created_at', { ascending: true })

  if (error && isMissingColumn(error)) {
    ;({ data, error } = await supabase
      .from('post_comments')
      .select('id,content,created_at,user_id')
      .eq('post_id', activePost.value.id)
      .order('created_at', { ascending: true }))
  }

  if (error) {
    commentsLoading.value = false
    console.error('[discussion] 加载评论失败：', error)
    showError(`${t('discussion.loadError')}\n${error.message || ''}`.trim())
    return
  }

  comments.value = data || []
  likes.value = {}
  myLikes.value = {}

  if (comments.value.length) {
    await loadNames(comments.value.map((c) => c.user_id))
    const ids = comments.value.map((c) => c.id)
    const { data: rows } = await supabase
      .from('post_comment_likes')
      .select('comment_id,user_id')
      .in('comment_id', ids)
    const counts = {}
    const mine = {}
    for (const row of rows || []) {
      counts[row.comment_id] = (counts[row.comment_id] || 0) + 1
      if (currentUser.value && row.user_id === currentUser.value.id) mine[row.comment_id] = true
    }
    likes.value = counts
    myLikes.value = mine
  }
  commentsLoading.value = false
}

const flatComments = computed(() => {
  const tops = comments.value.filter((c) => !c.parent_id)
  const children = {}
  for (const c of comments.value) {
    if (!c.parent_id) continue
    if (!children[c.parent_id]) children[c.parent_id] = []
    children[c.parent_id].push({ ...c, _reply: true })
  }
  return tops.flatMap((c) => [c, ...(children[c.id] || [])])
})

const openPost = async (post) => {
  activePost.value = post
  comments.value = []
  commentText.value = ''
  commentImageUrl.value = ''
  replyTo.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
  await loadComments()
}

const closePost = () => {
  activePost.value = null
  comments.value = []
  replyTo.value = null
  deleteConfirmId.value = null
}

const startReply = (comment) => {
  if (!isLoggedIn.value) return goLogin()
  const target = comment.parent_id
    ? comments.value.find((c) => c.id === comment.parent_id) || comment
    : comment
  replyTo.value = { id: target.id, name: authorOf(target) }
  commentText.value = ''
}

const cancelReply = () => {
  replyTo.value = null
}

const submitComment = async () => {
  const text = commentText.value.trim()
  if (!text && !commentImageUrl.value) return
  if (!currentUser.value) return showError(t('discussion.loginToComment'))
  sending.value = true
  try {
    const { error } = await supabase.from('post_comments').insert({
      post_id: activePost.value.id,
      user_id: currentUser.value.id,
      parent_id: replyTo.value?.id || null,
      content: text,
      image_url: commentImageUrl.value || null
    })
    if (error) return showError(error.message)
    commentText.value = ''
    commentImageUrl.value = ''
    replyTo.value = null
    await loadComments()
  } finally {
    sending.value = false
  }
}

const toggleLike = async (comment) => {
  if (!currentUser.value) return showError(t('discussion.loginToComment'))
  const uid = currentUser.value.id
  if (myLikes.value[comment.id]) {
    const { error } = await supabase
      .from('post_comment_likes')
      .delete()
      .eq('comment_id', comment.id)
      .eq('user_id', uid)
    if (error) return showError(error.message)
    myLikes.value[comment.id] = false
    likes.value[comment.id] = Math.max(0, (likes.value[comment.id] || 1) - 1)
  } else {
    const { error } = await supabase
      .from('post_comment_likes')
      .insert({ comment_id: comment.id, user_id: uid })
    if (error) return showError(error.message)
    myLikes.value[comment.id] = true
    likes.value[comment.id] = (likes.value[comment.id] || 0) + 1
  }
}

/* ---------- 图片上传 ---------- */
const uploadImage = async (file) => {
  if (!file.type.startsWith('image/')) {
    showError(t('discussion.imageTypeError'))
    return null
  }
  if (file.size > 5 * 1024 * 1024) {
    showError(t('discussion.imageSizeError'))
    return null
  }
  try {
    const ext = (file.name.split('.').pop() || 'png').toLowerCase()
    const path = `posts/${currentUser.value.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error } = await supabase.storage.from('chat-images').upload(path, file, { cacheControl: '31536000' })
    if (error) throw error
    const { data } = supabase.storage.from('chat-images').getPublicUrl(path)
    return data.publicUrl
  } catch {
    showError(t('discussion.uploadError'))
    return null
  }
}

const onCoverPick = async (e) => {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  uploading.value = 'cover'
  const url = await uploadImage(file)
  uploading.value = ''
  if (url) draft.cover_url = url
}

const onContentImagePick = async (e) => {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  uploading.value = 'content'
  const url = await uploadImage(file)
  uploading.value = ''
  if (!url) return
  draft.content = `${draft.content}${!draft.content || draft.content.endsWith('\n') ? '' : '\n'}![图片](${url})\n`
}

const onCommentImagePick = async (e) => {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  uploading.value = 'comment'
  const url = await uploadImage(file)
  uploading.value = ''
  if (url) commentImageUrl.value = url
}

/* ---------- 文章发布 / 编辑 / 置顶 / 删除 ---------- */
const openEditor = () => {
  editingId.value = null
  draft.title = ''
  draft.content = ''
  draft.details = ''
  draft.tags = ''
  draft.cover_url = ''
  editorOpen.value = true
}

const startEdit = (post) => {
  editingId.value = post.id
  draft.title = post.title
  draft.content = post.content
  draft.details = post.details || ''
  draft.tags = tagsOf(post).join(', ')
  draft.cover_url = post.cover_url || ''
  activePost.value = null
  editorOpen.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEditor = () => {
  editingId.value = null
  editorOpen.value = false
}

const savePost = async () => {
  if (!isAdmin.value) return showError(t('discussion.adminOnly'))
  if (!draft.title.trim() || !draft.content.trim()) return showError(t('discussion.emptyError'))
  if (uploading.value) return showError(t('discussion.uploading'))

  publishing.value = true
  try {
    const payload = {
      title: draft.title.trim(),
      content: draft.content.trim(),
      details: draft.details.trim(),
      tags: draft.tags.split(/[,，\s]+/).map((s) => s.trim()).filter(Boolean).slice(0, 5),
      cover_url: draft.cover_url || null,
      updated_at: new Date().toISOString()
    }
    let error
    if (editingId.value) {
      ;({ error } = await supabase.from('posts').update(payload).eq('id', editingId.value))
    } else {
      ;({ error } = await supabase.from('posts').insert({ ...payload, author_id: currentUser.value.id }))
    }
    if (error) return showError(error.message)

    showSuccess(editingId.value ? t('discussion.saved') : t('discussion.published'))
    editingId.value = null
    draft.title = ''
    draft.content = ''
    draft.details = ''
    draft.tags = ''
    draft.cover_url = ''
    editorOpen.value = false
    await fetchPosts()
  } finally {
    publishing.value = false
  }
}

const togglePin = async (post) => {
  const { error } = await supabase
    .from('posts')
    .update({ pinned: !post.pinned })
    .eq('id', post.id)
  if (error) return showError(error.message)
  post.pinned = !post.pinned
  await fetchPosts()
}

const canDeleteComment = (comment) =>
  isAdmin.value || (currentUser.value && comment.user_id === currentUser.value.id)

const removeComment = (comment) => {
  showConfirm(t('discussion.confirmDeleteComment'), {
    title: t('discussion.title'),
    confirmText: t('discussion.delete'),
    cancelText: t('discussion.cancel'),
    onConfirm: async () => {
      const { data, error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', comment.id)
        .select('id')
      if (error || !data?.length) return showError(t('discussion.deleteDenied'))
      await loadComments()
    }
  })
}

const toggleDeleteConfirm = (post) => {
  deleteConfirmId.value = deleteConfirmId.value === post.id ? null : post.id
}
const closeDeleteConfirm = () => {
  deleteConfirmId.value = null
}

const doRemovePost = async (post) => {
  const { data, error } = await supabase.from('posts').delete().eq('id', post.id).select('id')
  closeDeleteConfirm()
  if (error || !data?.length) return showError(t('discussion.deleteDenied'))
  activePost.value = null
  await fetchPosts()
}

const goLogin = () => {
  router.push({ path: '/login', query: { redirect: '/discussion' } })
}

const goBack = () => {
  router.push('/')
}

onMounted(async () => {
  await loadSession()
  await fetchPosts()
})
</script>

<style scoped>
.discussion-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
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
  padding: 40px 0 30px;
}

.back-btn {
  position: absolute;
  left: 20px;
  top: 30px;
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
  margin: 0;
  color: #666;
  font-size: 16px;
}

.editor {
  margin: 8px 0 18px;
}

.editor-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border: 1px solid #e4e4e4;
  border-radius: 12px;
  background: #fff;
}

.editing-tip {
  margin: 0;
  font-size: 13px;
  color: #42b983;
}

.editor-form input,
.editor-form textarea,
.comment-form textarea,
.search-bar input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  resize: vertical;
  background: #fff;
  color: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.editor-form input:focus,
.editor-form textarea:focus,
.comment-form textarea:focus,
.search-bar input:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.15);
}

.upload-row,
.cover-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.upload-tip {
  font-size: 12px;
  color: #aaa;
}

.cover-thumb {
  width: 72px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  align-items: center;
}

.primary-btn {
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 9px 18px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.primary-btn:hover:not(:disabled) {
  background: #3aa876;
  transform: translateY(-1px);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.text-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}

.text-btn:hover {
  text-decoration: underline;
}

.text-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.text-btn.danger {
  color: #e05a5a;
}

.link-btn {
  background: none;
  border: none;
  color: #42b983;
  font-size: 14px;
  padding: 0;
  margin-bottom: 18px;
  cursor: pointer;
}

.link-btn:hover {
  text-decoration: underline;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0 18px;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 240px;
}

.post-card {
  padding: 18px 20px;
  border: 1px solid #e4e4e4;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  border-color: #42b983;
  box-shadow: 0 4px 16px rgba(66, 185, 131, 0.12);
}

.post-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pin-badge {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 4px;
  background: rgba(66, 185, 131, 0.14);
  color: #42b983;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.excerpt {
  margin: 0 0 10px;
  color: #666;
  font-size: 14px;
  line-height: 1.65;
}

.meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  color: #999;
  font-size: 12.5px;
}

.meta .dot {
  opacity: 0.5;
}

.meta .tag,
.tag {
  color: #42b983;
  font-size: 12px;
}

.admin-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

/* ---------- 垃圾桶删除按钮 ---------- */
.trash-wrap {
  position: relative;
  display: inline-flex;
  height: 24px;
}

.trash-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: #9aa0a6;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}

.trash-btn svg {
  width: 17px;
  height: 17px;
}

.trash-btn:hover,
.trash-wrap.open .trash-btn {
  color: #e5484d;
  background: rgba(229, 72, 77, 0.1);
}

/* 开盖：绕左侧铰链抬起 */
.trash-lid {
  transform-box: fill-box;
  transform-origin: 8% 100%;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.trash-wrap.open .trash-lid {
  transform: rotate(-40deg) translateY(-1px);
}

.trash-confirm {
  position: absolute;
  left: calc(100% + 6px);
  top: 0;
  height: 100%;
  display: flex;
  align-items: stretch;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  opacity: 0;
  visibility: hidden;
  transform: translateX(-14px);
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.18s ease,
    visibility 0.24s;
  z-index: 5;
}

.trash-wrap.open .trash-confirm {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.trash-action {
  width: 26px;
  padding: 0;
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
}

.trash-action svg {
  width: 13px;
  height: 13px;
}

.trash-action.confirm {
  color: #2ea043;
}

.trash-action.confirm:hover {
  background: rgba(46, 160, 67, 0.14);
}

.trash-action.cancel {
  color: #9096a0;
  border-left: 1px solid #eee;
}

.trash-action.cancel:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #4a4a55;
}

/* 窄屏：按钮处于右边缘，菜单改为向左展开避免溢出 */
@media (max-width: 720px) {
  .trash-confirm {
    left: auto;
    right: calc(100% + 6px);
    transform: translateX(14px);
  }
}

.article {
  border-bottom: 1px solid #eee;
  padding-bottom: 24px;
}

.cover {
  width: 100%;
  border-radius: 12px;
  margin-bottom: 18px;
  display: block;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.article h2 {
  margin: 0;
  font-size: 26px;
  line-height: 1.35;
}

.article .content {
  margin: 18px 0 0;
  font-size: 15.5px;
  line-height: 1.85;
  word-break: break-word;
}

.rich :deep(img) {
  display: block;
  max-width: 100%;
  margin: 12px 0;
  border-radius: 8px;
}

.rich :deep(a) {
  color: #42b983;
  text-decoration: underline;
}

.rich :deep(code) {
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(66, 185, 131, 0.12);
  font-size: 0.92em;
}

.details-block {
  margin-top: 22px;
  padding: 14px 16px;
  border-left: 3px solid #42b983;
  border-radius: 0 8px 8px 0;
  background: #f6fbf8;
}

.details-title {
  margin: 0 0 6px;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #42b983;
}

.details {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: #555;
  white-space: pre-wrap;
  word-break: break-word;
}

.comments {
  margin-top: 26px;
}

.comments h3 {
  margin: 0 0 16px;
  font-size: 19px;
}

.comments .count {
  color: #42b983;
  font-weight: 400;
  font-size: 15px;
}

.reply-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(66, 185, 131, 0.1);
  color: #42b983;
  font-size: 13px;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.image-preview {
  display: flex;
  align-items: center;
  gap: 10px;
}

.image-preview img {
  max-height: 90px;
  border-radius: 6px;
}

.comment-item {
  padding: 14px 0;
  border-bottom: 1px dashed #ececec;
}

.comment-item.reply-item {
  margin-left: 32px;
  padding-left: 14px;
  border-left: 2px solid #eef6f2;
  border-bottom-style: solid;
}

.comment-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #999;
  flex-wrap: wrap;
}

.comment-head .name {
  color: #2c3e50;
  font-weight: 600;
}

.comment-head .time {
  margin-right: auto;
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #42b983;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.comment-text {
  margin: 8px 0 0 32px;
  font-size: 14.5px;
  line-height: 1.7;
  word-break: break-word;
}

.comment-text :deep(img) {
  max-width: 100%;
  max-height: 240px;
  object-fit: contain;
  display: block;
  margin: 8px 0;
  border-radius: 8px;
}

.comment-image {
  display: block;
  max-width: 100%;
  max-height: 240px;
  margin: 8px 0 0 32px;
  border-radius: 8px;
}

.like-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 8px 0 0 32px;
  padding: 0;
  border: none;
  background: none;
  color: #b9b9b9;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s, transform 0.15s;
}

.like-btn:hover {
  transform: scale(1.08);
}

.like-btn.liked {
  color: #e05a5a;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0 0 18px;
  align-items: flex-end;
}

.comment-form textarea {
  width: 100%;
}

.login-hint {
  margin: 18px 0;
  text-align: center;
  padding: 20px;
  border: 1px dashed #e0e0e0;
  border-radius: 10px;
}

.login-hint p {
  margin: 0 0 12px;
  color: #888;
  font-size: 14px;
}

.hint {
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 20px 0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 24px;
}

.page-numbers {
  display: flex;
  gap: 6px;
}

.page-btn {
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #666;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #42b983;
  color: #42b983;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn.active {
  background: #42b983;
  border-color: #42b983;
  color: #fff;
}

.footer {
  margin-top: 40px;
  padding-top: 16px;
  border-top: 1px solid #eee;
  text-align: center;
  color: #999;
  font-size: 13px;
}

@media (max-width: 640px) {
  .discussion-page {
    padding: 14px;
  }

  .page-header {
    padding: 30px 0 22px;
  }

  .back-btn {
    left: 14px;
    top: 18px;
  }

  .page-header h1 {
    font-size: 26px;
  }

  .article h2 {
    font-size: 22px;
  }

  .post-card {
    padding: 16px;
  }

  .comment-item.reply-item {
    margin-left: 16px;
  }
}
</style>
