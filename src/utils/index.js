// import { Notification } from 'element-ui'

// 节流函数 规定时间内只触发一次
export const throttle = (fn, delay = 5000, immediate = false) => {
  // 利用闭包保存定时器
  let prve = Date.now()
  return function () {
    let context = this
    let now = Date.now()
    if (immediate || now - prve >= delay) {
      fn.apply(context, arguments)
      immediate = false
      prve = Date.now()
    } else {
      // Notification({
      //   type: 'warning',
      //   title: '提示',
      //   message: `${delay / 1000}秒内只能触发一次，请勿连续提交`
      // })
    }
  }
}

// 防抖函数 连续多次触发只保证最后一次生效
export const debounce = (fn, delay = 5000, immediate = false) => {
  // 利用闭包保存定时器
  let timer = null
  return function () {
    let context = this
    clearTimeout(timer)
    if (immediate) {
      let callNow = !timer
      timer = setTimeout(() => {
        timer = null
      }, delay)
      callNow && fn.apply(context, arguments)
    } else {
      timer = setTimeout(function () {
        fn.apply(context, arguments)
      }, delay)
    }
  }
}

/**
 * 函数参数位想生成的位数，以及生成的字符串包含那种类型
 * @param {*} len 生成的长度
 * @param {*} include 1(大写) 2(小写) 3(大小写) 4(数字) 5(大写及数字) 6(小写及数字) 7(大小写及数字)
 */
export const randomString = (len, include) => {
  const UPPERCASE = 1 // 包含大写字母
  const LOWERCASE = 2 // 包含小写字母
  const NUMBER = 4 // 包含数字
  len = len || 8 // 默认生成8位长度
  include = include || 7 // 默认生成大小写数字混合

  let uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let lowercase = uppercase.toLowerCase()
  let number = '0123456789'

  let chars = ''
  if (include & UPPERCASE) {
    chars += uppercase
  }
  if (include & LOWERCASE) {
    chars += lowercase
  }
  if (include & NUMBER) {
    chars += number
  }

  let maxPos = chars.length

  let str = ''
  for (let i = 0; i < len; i++) {
    str += chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return str
}

// 获取获取[m，n]区间内的随机整数
export const getRamdom = (m, n) => {
  const aNumber = (n + 1 - m) * Math.random() + m
  const result = Math.floor(aNumber)
  return result
}

// 从字符串中查找根据key  查找value  str:  'filename=档案.xlsx;fileType=stream'
export const getValue = (str = '', key) => {
  const list = str.split(';')
  let item = list.find((x) => x.includes(key + '='))
  return item ? item.split('=')[1] : null
}

// 二进制流文件转换为json
export const blobToJSON = (data) => {
  return new Promise((resolve) => {
    let reader = new FileReader()
    reader.readAsText(data, 'utf-8')
    reader.onload = function () {
      try {
        resolve(JSON.parse(reader.result))
      } catch (error) {
        resolve({
          code: 200,
          message: '获取文件信息成功',
        })
      }
    }
  })
}

// 路由中存在 /unit-registration/:id?  等路由结构，需在分割以后取第一个数组值
// 默认所有一级路由 在带一个斜杠
export const getRootUrl = (path) => path.split('/:')[0]

/**
 * 千分位分隔符, 并格式化两位小数
 * @param {*} input
 */
export function milliFormat(input = '0', digit = 0) {
  return parseFloat(input)
    .toFixed(digit)
    .replace(/(^|\s)\d+/g, (m) => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
}
