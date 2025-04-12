import request from '@/utils/request'

/**
 * 查询订单统计详情
 * @param {Object} params {begin: 'YYYY-MM-DD', end: 'YYYY-MM-DD'}
 */
export function getOrdersStatistics(params) {
  return request({
    url: '/manage/report/ordersStatistics',
    method: 'get',
    params
  })
}

/**
 * 查询销售额分布统计
 * @param {Object} params {begin: 'YYYY-MM-DD', end: 'YYYY-MM-DD'}
 */
export function getRegionReportOrders(params) {
  return request({
    url: '/manage/report/regionReportOrders',
    method: 'get',
    params
  })
}

/**
 * 查询销量 Top 10 详情
 * @param {Object} params {begin: 'YYYY-MM-DD', end: 'YYYY-MM-DD'}
 */
export function getSalesTop10(params) {
  return request({
    url: '/manage/report/salesTop10',
    method: 'get',
    params
  })
}

/**
 * 查询合作商点位数 Top 5
 */
export function getPartnerTop5() {
  return request({
    url: '/manage/report/partnerTop5',
    method: 'get'
  })
}

/**
 * 异常设备监控【故障时间 updateTime 】
 */
export function getAbnormalDeviceMonitoring() {
  return request({
    url: '/manage/report/abnormalDeviceMonitoring',
    method: 'get'
  })
}
