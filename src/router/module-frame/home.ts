import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/home',
    component: () => import(/* webpackChunkName: "home" */ '@/views/home.vue'),
  },
]

export default routes
