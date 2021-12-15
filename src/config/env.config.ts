// 接口url
let constUrl = ''

switch (import.meta.env.VUE_APP_ENV) {
  // 线上
  case 'prd':
    constUrl = ''
    break
  // 测试
  case 'sit':
    constUrl = ''
    break
  // 默认开发
  default:
    constUrl = 'https://tc.lookdoor.cn:1999'
}

export default constUrl
