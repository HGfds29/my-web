import { createRouter, createWebHashHistory } from 'vue-router'
import { ref, nextTick } from 'vue'
import Home from '../views/Home.vue'
import BlogList from '../views/BlogList.vue'
import BlogDetail from '../views/BlogDetail.vue'
import About from '../views/About.vue'
import Photos from '../views/Photos.vue'

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

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

let isNavigating = false

router.beforeEach((to, from, next) => {
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

export default router
