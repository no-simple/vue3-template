import { General } from '../request'

const { post } = General

// 通过租户标识查租户Id
export const getTenantId = (data: any) => post('/organization/tenant/v1/getTenantId', data)

// 用户免密登录
export const freeLogin = (data: any) => post('/organization/user/v1/freeLogin', data)

// 查询当前登录用户可见菜单模板完整样式
export const getViewMenuByUser = () => post('/organization/template/v1/getViewMenuByUser')
