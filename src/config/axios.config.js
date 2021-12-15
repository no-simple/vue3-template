import { Authority, General } from '@/api/request'
// import { ElNotification } from 'element-plus'
// import Store from '@/store'
import Router from '@/router'
const ElNotification = () => {}
let handleRequset = (config) => {
  // 在发送请求之前做些什么
  return config
}

// token过期
const tokenExpired = (msg) => {
  ElNotification({
    type: 'error',
    title: '错误',
    message: msg,
  })
  // Store.commit('_logOut')
}

// 未授权
const unAuthorized = (msg) => {
  ElNotification({
    type: 'error',
    title: '错误',
    message: msg,
  })
}

// 账号被停用
const accountLocked = (msg) => {
  ElNotification({
    type: 'error',
    title: '账号已被停用，有疑问可联系管理员',
    message: msg,
  })
}

const servicesCash = () => {
  ElNotification({
    type: 'error',
    title: '错误',
    message: '服务器出错啦',
  })
  Router.push('/50X')
}

// 抛出所有未知错误
const throwGeneralError = unAuthorized

// 需要处理的code码  黑名单
const ACTIONS = {
  401: unAuthorized,
  2: tokenExpired,
  1009: throwGeneralError,
  1008: throwGeneralError,
  1024: accountLocked,
}

const SERVICES_MAP = [500, 502]
// 拦截resosne处理
let handleResponse = (response) => {
  const CODE = response.data.code
  // 若存在对应的操作则进行处理
  ACTIONS[CODE] && ACTIONS[CODE](response.data.message)
  // 对响应数据做点什么
  // return response.config.responseType === 'blob' ? response : response.data
  return response.data
}

// 拦截的错误处理
let handleError = (error) => {
  // 对响应错误做点什么
  // 服务器异常捕获
  SERVICES_MAP.includes(error.response.data.code) && servicesCash()
  return Promise.reject(error)
}

// 添加请求拦截器
Authority.interceptors.request.use(handleRequset, handleError)
// 添加响应拦截器
Authority.interceptors.response.use(handleResponse, handleError)
General.interceptors.response.use(handleResponse, handleError)
