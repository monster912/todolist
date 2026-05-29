import client from './client'
import type { ApiResponse } from '@/types/api.types'
import type {
  User,
  LoginResponse,
  RegisterInput,
  LoginInput,
  UpdateMeInput,
  DeleteMeInput,
} from '@/types/user.types'

export const authApi = {
  register: (input: RegisterInput): Promise<ApiResponse<User>> =>
    client.post<ApiResponse<User>>('/auth/register', input).then((r) => r.data),

  login: (input: LoginInput): Promise<ApiResponse<LoginResponse>> =>
    client.post<ApiResponse<LoginResponse>>('/auth/login', input).then((r) => r.data),

  getMe: (): Promise<ApiResponse<User>> =>
    client.get<ApiResponse<User>>('/auth/me').then((r) => r.data),

  updateMe: (input: UpdateMeInput): Promise<ApiResponse<User>> =>
    client.put<ApiResponse<User>>('/auth/me', input).then((r) => r.data),

  deleteMe: (input: DeleteMeInput): Promise<void> =>
    client.delete('/auth/me', { data: input }).then(() => undefined),
}
