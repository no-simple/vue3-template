import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import '@/config'

const pinia = createPinia()

const app = createApp(App)
app.use(router)
app.use(pinia)
// element-plus全局配置 已按需引入
app.use(ElementPlus, {
  size: 'small',
  zIndex: 3000,
  locale: zhCn,
})
app.mount('#app')
