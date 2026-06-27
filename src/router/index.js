import { createRouter, createWebHashHistory } from 'vue-router'
import { ref, nextTick } from 'vue'
import Home from '../views/Home.vue'
import BlogList from '../views/BlogList.vue'
import BlogDetail from '../views/BlogDetail.vue'
import About from '../views/About.vue'
import Photos from '../views/Photos.vue'
import MyGamesIntro from '../views/MyGamesIntro.vue'
import GameDetail from '../views/GameDetail.vue'

console.log('[router/index.js] 路由模块加载开始')
console.log('[router/index.js] 路由模式: hash')

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
  {
    path: '/blog/:id',
    name: 'BlogDetail',
    component: BlogDetail,
    meta: { index: 3 }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
]

console.log('[router/index.js] 路由配置:', routes.map(r => r.path))

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

console.log('[router/index.js] 路由实例已创建')

let isNavigating = false

router.beforeEach((to, from, next) => {
  console.log('[router/beforeEach] 路由变化:', from.path, '→', to.path)
  console.log('[router/beforeEach] from.name:', from.name, '| to.name:', to.name)
  console.log('[router/beforeEach] isNavigating:', isNavigating)

  if (isNavigating) {
    console.log('[router/beforeEach] 导航中，直接放行')
    isNavigating = false
    next()
    return
  }

  if (!from.name) {
    console.log('[router/beforeEach] 首次加载，直接放行')
    next()
    return
  }

  const toIndex = to.meta.index ?? 0
  const fromIndex = from.meta.index ?? 0

  leaveDirection.value = toIndex > fromIndex ? 'right' : 'left'
  console.log('[router/beforeEach] 动画方向:', leaveDirection.value)

  isLeaving.value = true
  console.log('[router/beforeEach] 触发离开动画，延迟放行')

  next(false)

  setTimeout(() => {
    console.log('[router/beforeEach] 动画结束，执行导航')
    isNavigating = true
    isLeaving.value = false
    router.push(to.fullPath)
  }, LEAVE_DURATION)
})

router.afterEach((to, from) => {
  console.log('[router/afterEach] 路由完成:', from.path, '→', to.path)
})

console.log('[router/index.js] 路由守卫已注册')
console.log('[router/index.js] 路由模块加载完成')

export default router
