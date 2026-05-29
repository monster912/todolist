import client from './client'
import type { ApiResponse, ApiListResponse } from '@/types/api.types'
import type { Todo, CreateTodoInput, UpdateTodoInput, TodoFilters } from '@/types/todo.types'

export const todoApi = {
  getTodos: (filters?: TodoFilters): Promise<ApiListResponse<Todo>> =>
    client
      .get<ApiListResponse<Todo>>('/todos', { params: filters })
      .then((r) => r.data),

  getTodo: (id: string): Promise<ApiResponse<Todo>> =>
    client.get<ApiResponse<Todo>>(`/todos/${id}`).then((r) => r.data),

  createTodo: (input: CreateTodoInput): Promise<ApiResponse<Todo>> =>
    client.post<ApiResponse<Todo>>('/todos', input).then((r) => r.data),

  updateTodo: (id: string, input: UpdateTodoInput): Promise<ApiResponse<Todo>> =>
    client.put<ApiResponse<Todo>>(`/todos/${id}`, input).then((r) => r.data),

  deleteTodo: (id: string): Promise<void> =>
    client.delete(`/todos/${id}`).then(() => undefined),

  toggleDone: (id: string): Promise<ApiResponse<Todo>> =>
    client.patch<ApiResponse<Todo>>(`/todos/${id}/done`).then((r) => r.data),
}
