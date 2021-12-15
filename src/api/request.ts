import Axios from 'axios'
import baseUrl from '@/config/env.config'
import { USER_TOKEN } from '@/utils/constant'

Axios.defaults.baseURL = baseUrl

// 该axios实例用于权限接口
let Authority = Axios.create({
  timeout: 5000,
})
// 请求发前拦截，header中添加token
Authority.interceptors.request.use((res) => {
  res.headers!.Authorization = localStorage.getItem(USER_TOKEN) || ''
  return res
})

// 下载流文件
export const postBolb = (url: string, params: object | null) =>
  Authority({
    url,
    data: params,
    method: 'post',
    responseType: 'blob',
  })

// 下载流文件
export const getBolb = (url: string, params: object | null) =>
  Authority({
    url,
    data: params,
    method: 'get',
    responseType: 'blob',
  })

export { Authority }

// 该实例用于 不需要token的请求
export const General = Axios.create({
  timeout: 5000,
})
