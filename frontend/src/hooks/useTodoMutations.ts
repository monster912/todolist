import { useMutation, useQueryClient } from '@tanstack/react-query'
import { todoApi } from '@/api/todoApi'
import type { CreateTodoInput, UpdateTodoInput } from '@/types/todo.types'

export function useCreateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTodoInput) => todoApi.createTodo(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useUpdateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTodoInput }) =>
      todoApi.updateTodo(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      queryClient.invalidateQueries({ queryKey: ['todos', id] })
    },
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => todoApi.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useToggleTodoDone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => todoApi.toggleDone(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      queryClient.invalidateQueries({ queryKey: ['todos', id] })
    },
  })
}
