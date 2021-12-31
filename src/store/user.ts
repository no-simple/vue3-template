import { defineStore } from 'pinia'

export const userStore = defineStore({
  id: 'user',
  state: () => ({
    name: '张',
  }),
  actions: {
    increment() {
      this.name = 'xxxxxxxxxxxx'
    },
    // 登出
    logout() {},
  },
})
