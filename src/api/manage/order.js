import request from '@/utils/request'

// 查询订单管理列表
export function listOrder(query) {
  return request({
    url: '/manage/order/list',
    method: 'get',
    params: query
  })
}

// 查询订单管理详细
export function getOrder(id) {
  return request({
    url: '/manage/order/' + id,
    method: 'get'
  })
}

// 新增订单管理
export function addOrder(data) {
  return request({
    url: '/manage/order',
    method: 'post',
    data: data
  })
}

// 修改订单管理
export function updateOrder(data) {
  return request({
    url: '/manage/order',
    method: 'put',
    data: data
  })
}

// 删除订单管理
export function delOrder(id) {
  return request({
    url: '/manage/order/' + id,
    method: 'delete'
  })
}

// 取消订单
export function cancelOrder(id) {
  return request({
    url: '/manage/order/cancel/' + id,
    method: 'post'
  })
}

// 申请退款
export function applyRefund(id) {
  return request({
    url: '/manage/order/refund/' + id,
    method: 'post'
  })
}

// 撤销退款
export function cancelRefund(id) {
  return request({
    url: '/manage/order/cancel-refund/' + id,
    method: 'post'
  })
}