import client from './client'
import type { ApiResponse } from '@/types/api.types'
import type { User, UpdateSettingsInput } from '@/types/user.types'

export const userApi = {
  updateSettings: (input: UpdateSettingsInput): Promise<ApiResponse<User>> =>
    client.patch<ApiResponse<User>>('/users/me/settings', input).then((r) => r.data),
}
