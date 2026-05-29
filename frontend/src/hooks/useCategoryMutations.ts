import { useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryApi } from '@/api/categoryApi'
import type { CreateCategoryInput, UpdateCategoryInput } from '@/types/category.types'

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoryApi.createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      categoryApi.updateCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      // 카테고리 삭제 시 소속 할일이 기본 카테고리로 이관되므로 todos 캐시도 무효화
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
