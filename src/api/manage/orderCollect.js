import request from '@/utils/request'

// 查询对帐统计列表
export function listOrderCollect(query) {
  return request({
    url: '/manage/orderCollect/list',
    method: 'get',
    params: query
  })
}

// 查询对帐统计详细
export function getOrderCollect(id) {
  return request({
    url: '/manage/orderCollect/' + id,
    method: 'get'
  })
}

// 统计在条件下的账单详情
export function getOrderCollectDto(query) {
  return request({
    url: '/manage/orderCollect/data',
    method: 'get',
    params: query
  })
}