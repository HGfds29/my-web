import { createRouter, createWebHashHistory } from 'vue-router'
import { ref, nextTick } from 'vue'
import Home from '../views/Home.vue'
import BlogList from '../views/BlogList.vue'
import BlogDetail from '../views/BlogDetail.vue'
import About from '../views/About.vue'
import Photos from '../views/Photos.vue'
import MyGamesIntro from '../views/MyGamesIntro.vue'
import GameDetail from '../views/GameDetail.vue'
import Plugins from '../views/Plugins.vue'
import HeroMemorial from '../views/HeroMemorial.vue'
import NotFound from '../views/NotFound.vue'
import ModalDemo from '../views/ModalDemo.vue'
import Chat from '../views/Chat.vue'
import Login from '../views/Login.vue'
import { loadSession, currentUser } from '../utils/auth'

// RenktShell.vue 已被 .gitignore 排除，属于本地专属页面：
// 这里用 glob 动态解析，文件不存在时就不注册该路由，
// 保证别人 clone 后（没有这个文件）依然能正常构建。
// 不要改回静态 import —— 缺文件时构建会直接失败。
const renktShellModules = import.meta.glob('../views/Renkt*.vue')
const renktShellView =
  Object.entries(renktShellModules).find(([key]) => key.endsWith('/RenktShell.vue'))?.[1] || null

export const isLeaving = ref(false)
export const leaveDirection = ref('right')

const LEAVE_DURATION = 450

const routes = [
  {
    path: '/',
    name: 'Root',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { index: 0 }
  },
  {
    path: '/blog',
    name: 'BlogList',
    component: BlogList,
    meta: { index: 1 }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: { index: 2 }
  },
  {
    path: '/photos',
    name: 'Photos',
    component: Photos,
    meta: { index: 4 }
  },
  {
    path: '/games',
    name: 'MyGamesIntro',
    component: MyGamesIntro,
    meta: { index: 5 }
  },
  {
    path: '/games/:id',
    name: 'GameDetail',
    component: GameDetail,
    meta: { index: 6 }
  },
  ...(renktShellView
    ? [
        {
          path: '/renkt',
          name: 'RenktShell',
          component: renktShellView,
          meta: { index: 7 }
        }
      ]
    : []),
  {
    path: '/plugins',
    name: 'Plugins',
    component: Plugins,
    meta: { index: 9 }
  },
  {
    path: '/hero-memorial',
    name: 'HeroMemorial',
    component: HeroMemorial,
    meta: { index: 8, hideNav: true }
  },
  {
    path: '/blog/:id',
    name: 'BlogDetail',
    component: BlogDetail,
    meta: { index: 3 }
  },
  {
    path: '/demo',
    name: 'ModalDemo',
    component: ModalDemo,
    meta: { index: 10 }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    meta: { index: 11, requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { index: 12 }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { index: 0 }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

let isNavigating = false

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    await loadSession()
    if (!currentUser.value) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }

  if (isNavigating) {
    isNavigating = false
    next()
    return
  }

  if (!from.name) {
    next()
    return
  }

  const toIndex = to.meta.index ?? 0
  const fromIndex = from.meta.index ?? 0

  leaveDirection.value = toIndex > fromIndex ? 'right' : 'left'

  isLeaving.value = true

  next(false)

  setTimeout(() => {
    isNavigating = true
    isLeaving.value = false
    router.push(to.fullPath)
  }, LEAVE_DURATION)
})

router.afterEach((to, from) => {
})

export default router
