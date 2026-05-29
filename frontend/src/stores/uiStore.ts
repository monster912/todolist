import { create } from 'zustand'
import type { TodoStatus } from '@/types/todo.types'

interface UiState {
  selectedCategoryId: string | null
  statusFilter: TodoStatus | null
  setSelectedCategory: (id: string | null) => void
  setStatusFilter: (status: TodoStatus | null) => void
}

export const useUiStore = create<UiState>()((set) => ({
  selectedCategoryId: null,
  statusFilter: null,
  setSelectedCategory: (id) => set({ selectedCategoryId: id }),
  setStatusFilter: (status) => set({ statusFilter: status }),
}))
