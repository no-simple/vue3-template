import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

// 权限表自动挂载路由: 挂载  frameworkRouter 的children下。
export const asyncFrameRoutes: RouteRecordRaw[] = []
const modulesFrameArr = import.meta.globEager('./module-frame/*.ts')
for (const path in modulesFrameArr) {
  asyncFrameRoutes.push(...modulesFrameArr[path].default)
}
// 权限表自动挂载路由:    挂载在app下，全屏显示
export const asyncAppRoutes: RouteRecordRaw[] = []
const modulesAppArr = import.meta.globEager('./module-frame/*.ts')
for (const path in modulesAppArr) {
  asyncAppRoutes.push(...modulesAppArr[path].default)
}

// 白名单路由，即不再权限控制范围内的路由
const appWhiteListRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import(/* webpackChunkName: "login" */ '@/views/login.vue'),
  },
]

// 最终挂载到frameworkRouter => children的白名单路由 即在 @/views/layout 框架下渲染
export const frameWhiteListRoutes = [
  {
    path: '/guide-home',
    name: 'guide-home',
    meta: { name: '首页' },
    component: () => import(/* webpackChunkName: "guide-home" */ '@/views/guide-home/index.vue'),
  },
  {
    path: '/403',
    component: () => import(/* webpackChunkName: "error" */ '@/components/error/403.vue'),
  },
]
// 路由白名单，权限之外
export const WHITE_LIST = [
  ...appWhiteListRoutes.map((x) => x.path),
  ...frameWhiteListRoutes.map((x) => x.path),
]

// 管理后台布局路由总渲染口，所有权限路由都挂载在其中
export const frameworkRouter: RouteRecordRaw = {
  // 示例
  path: '/',
  meta: { name: '管理系统' },
  component: () => import(/* webpackChunkName: "layout" */ '@/views/layout/index.vue'),
  children: [],
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: appWhiteListRoutes,
})
export default router
