import axios from 'axios'
import type { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/authStore'
import type { ApiError, ApiErrorResponse } from '@/types/api.types'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
    }

    const apiError: ApiError = error.response?.data?.error ?? {
      code: 'INTERNAL_ERROR',
      message: error.message,
    }

    return Promise.reject(apiError)
  }
)

export default client
