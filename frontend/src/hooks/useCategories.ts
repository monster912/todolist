import { useQuery } from '@tanstack/react-query'
import { categoryApi } from '@/api/categoryApi'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
  })
}
