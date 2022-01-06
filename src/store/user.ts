import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'

export const userStore = defineStore({
  id: 'user',
  state: () => ({
    name: '张',
    menuList: [], // 动态生成的菜单列表
    // nodeList: [], // 从后端取到的原始DSL描述
    addRouter: <RouteRecordRaw[]>[], // 动态挂在的路由
  }),
  getters: {
    // 已经拥有的map权限
    hasRouterMap(state) {
      return (state.addRouter || []).map((x) => x.meta?.match || x.path)
    },
  },
  actions: {
    increment() {
      this.name = 'xxxxxxxxxxxx'
    },
    setState({ name, value }: { name: string; value: any }) {
      this[name] = value
    },
    // 登出
    logout() {},
  },
})
