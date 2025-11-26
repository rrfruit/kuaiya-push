import axios, { AxiosError } from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { useUserStore } from '@/stores/useUserStore'
import { ApiResponse } from '@/types'

const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  timeout: 600_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

instance.interceptors.request.use(
  async config => {
    try {
      config.headers.authorization = 'Bearer ' + useUserStore.getState().token || ''
      return config
    } catch (error) {
      return Promise.reject(error)
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

const publicUrls = ['/auth/profile']

instance.interceptors.response.use(
  async response => {
    try {
      if (response.data?.code !== 0) {
        if (response.data.code === 4100) {
          if (!publicUrls.includes(response.config.url!)) {
            // gotoLogin()
          }
          return response
        } else {
          toast.error(response.data.message)
        }
      }
      return response
    } catch (error) {
      return Promise.reject(error)
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

const request = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  return new Promise((resolve, reject) => {
    instance(url, config)
      .then(res => resolve(res.data as ApiResponse<T>))
      .catch(reject)
  })
}

export const http = instance

export default request
