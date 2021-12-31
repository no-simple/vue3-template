import { General } from './request'

const { post } = General

// 通过租户标识查租户Id
export const getTenantId = (data: any) => post('/organization/tenant/v1/getTenantId', data)
