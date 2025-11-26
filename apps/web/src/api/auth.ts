import request from '@/utils/request'

export async function loginByPassword(data: { mobile: string; password: string }) {
  return request('/auth/login/password', {
    method: 'POST',
    data,
  })
}

export async function profile() {
  return request('/auth/profile', {
    method: 'GET',
  })
}
