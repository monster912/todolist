import { useQuery } from '@tanstack/react-query'
import { todoApi } from '@/api/todoApi'

export function useTodo(id: string) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => todoApi.getTodo(id),
    enabled: !!id,
  })
}
