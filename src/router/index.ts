import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

// 权限表自动挂载路由: 挂载  frameworkRouter 的children下。
export const asyncRouterFrameMap: RouteRecordRaw[] = []
const modulesFrameArr = import.meta.globEager('./module-frame/*.ts')
for (const path in modulesFrameArr) {
  asyncRouterFrameMap.push(...modulesFrameArr[path].default)
}
// 权限表自动挂载路由:    挂载在app下，全屏显示
export const asyncRouterAppMap: RouteRecordRaw[] = []
const modulesAppArr = import.meta.globEager('./module-frame/*.ts')
for (const path in modulesAppArr) {
  asyncRouterAppMap.push(...modulesAppArr[path].default)
}

// 白名单路由，即不再权限控制范围内的路由
const whiteListRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import(/* webpackChunkName: "login" */ '@/views/login.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: whiteListRoutes,
})
export default router
