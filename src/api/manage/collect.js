import request from '@/utils/request'

// 查询工单按日统计列表
export function listCollect(query) {
  return request({
    url: '/manage/collect/list',
    method: 'get',
    params: query
  })
}

// 查询工单按日统计详细
export function getCollect(id) {
  return request({
    url: '/manage/collect/' + id,
    method: 'get'
  })
}

// 新增工单按日统计
export function addCollect(data) {
  return request({
    url: '/manage/collect',
    method: 'post',
    data: data
  })
}