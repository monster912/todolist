import client from './client'
import type { ApiResponse, ApiListResponse } from '@/types/api.types'
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types/category.types'

export const categoryApi = {
  getCategories: (): Promise<ApiListResponse<Category>> =>
    client.get<ApiListResponse<Category>>('/categories').then((r) => r.data),

  createCategory: (input: CreateCategoryInput): Promise<ApiResponse<Category>> =>
    client.post<ApiResponse<Category>>('/categories', input).then((r) => r.data),

  updateCategory: (id: string, input: UpdateCategoryInput): Promise<ApiResponse<Category>> =>
    client.put<ApiResponse<Category>>(`/categories/${id}`, input).then((r) => r.data),

  deleteCategory: (id: string): Promise<void> =>
    client.delete(`/categories/${id}`).then(() => undefined),
}
