import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import Axios from 'axios'
import { Authority, General } from '@/api/request'
import { ElNotification } from 'element-plus'
import { userStore as _userStore } from '@/store/user'
import md5 from 'md5'
// import Router from '@/router'
import { getValue, blobToJSON, throttle } from '@/utils'
import handleStream from '@/utils/handle-stream'

const userStore = _userStore()

interface Pending {
  [propName: string]: any
}
// 网络请求记录map结构
let pending: Pending = {}
let CancelToken = Axios.CancelToken

let handleRequest = (config: AxiosRequestConfig) => {
  // 判断是否需要防重复拦截，默认全部拦截
  if (config?.headers?.allowedRepeat) return config
  // 在发送请求之前做些什么
  // 通过请求url、method、data、params字段生成md5值
  let key = md5(
    `${config.url}&${config.method}&${JSON.stringify(config.data)}&${JSON.stringify(config.params)}`
  )
  config.cancelToken = new CancelToken(() => {
    // if (pending[key]) {
    //   if (Date.now() - pending[key] > 1) {
    //     // 超过5s，删除对应的请求记录，重新发起请求
    //     delete pending[key]
    //   } else {
    //     console.log('重复接口', config.url)
    //     // 5s以内的已发起请求，取消重复请求
    //     c('请勿重复提交')
    //   }
    // }
    // 不存在记录当前的请求，并设置时间戳
    pending[key] = Date.now()
  })
  return config
}

// token过期 加入节流处理
const tokenExpired = throttle(() => userStore.logout(), 2000, true)

interface Action {
  [propName: number]: Function
}
// 需要处理的code码  黑名单
// eslint-disable-next-line no-unused-vars
const ACTIONS: Action = {
  2: tokenExpired,
}

// 错误提示
const toastMessage = (msg: string) =>
  ElNotification({
    type: 'error',
    message: msg,
    title: '错误提示',
  })

// 请求成功后清除重复提交限制
const removeRestrictions = (response: AxiosResponse) => {
  // 响应后处理请求记录
  let key = md5(
    `${response.config.url}&${response.config.method}&${response.config.data}&${JSON.stringify(
      response.config.params
    )}`
  )
  if (pending[key]) {
    // 请求结束，删除对应的请求记录
    delete pending[key]
  }
}

// 加入节流函数toast
const throttleToast = throttle(toastMessage, 2000, true)

// 拦截的错误处理
let handleError = (error: AxiosError) => {
  let errorMessage
  if (error.code === 'ECONNABORTED' && error.message.includes('timeout'))
    errorMessage = '访问超时，请刷新或退出重试'
  else if (SERVICES_MAP.includes(error.response?.data?.code))
    errorMessage = error.response?.data?.code + '服务器错误，请稍后刷新'
  else if (error?.message) errorMessage = error?.message
  else errorMessage = '系统错误，请刷新或退出重试'
  // 对响应错误做点什么
  // 服务器异常捕获
  throttleToast(errorMessage)
  return Promise.reject(error)
}
// 添加请求拦截器
Authority.interceptors.request.use(handleRequest, handleError)
General.interceptors.request.use(handleRequest, handleError)
// 添加响应拦截器
Authority.interceptors.response.use(handleResponse, handleError)
General.interceptors.response.use(handleResponse, handleError)

const SERVICES_MAP = [500, 502, 503]

// 拦截resosne处理
function handleResponse(response: AxiosResponse) {
  // true 不进行提示  false  null 则进行提示  默认进行提示
  const HIDE_NOTIFY = response.config.headers?.hideNotify
  const CODE = response.data.code
  // 判断当前接口是否为下载流文件
  if (response.config.responseType === 'blob') {
    // 先将二进制流文件 转为json判断code
    blobToJSON(response.data).then((res: any) => {
      // 获取流文件成功
      if (res.code === 200) {
        // 获取后端返回的文件名
        const filename = getValue(response.headers['content-disposition'], 'filename')
        // 全局拦截处理excel并下载
        handleStream({ filename: decodeURIComponent(filename), data: response.data })
        // 去掉重复提交限制
        removeRestrictions(response)
        return { data: null }
      } else if (res.code) {
        // 获取流文件失败
        // 默认都进行错误提示，需要关闭配置 hideNotify
        !HIDE_NOTIFY &&
          ElNotification({
            type: 'error',
            message: res.message,
            title: '错误提示',
          })
        // 存在全局特殊处理就进行处理
        ACTIONS[res.code] && ACTIONS[res.code]()
        // 去掉重复提交限制
        removeRestrictions(response)
        // 在reject处理所有非200异常
        return Promise.reject(response.data)
      }
    })
  } else if (CODE === 200) {
    // 去掉重复提交限制
    removeRestrictions(response)
    return response.data
  } else {
    const CODE = response.data.code
    // 默认都进行错误提示，需要关闭配置 hideNotify
    !HIDE_NOTIFY && CODE !== 2 && toastMessage(response.data.message)
    // 存在全局特殊处理就进行处理
    ACTIONS[CODE] && ACTIONS[CODE]()
    // 去掉重复提交限制
    removeRestrictions(response)
    // 在reject处理所有非200异常
    return Promise.reject(response.data)
  }
}
