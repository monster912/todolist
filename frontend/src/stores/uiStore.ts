import { create } from 'zustand'
import type { TodoStatus } from '@/types/todo.types'

interface UiState {
  selectedCategoryId: string | null
  statusFilter: TodoStatus | null
  viewMode: 'list' | 'calendar'
  setSelectedCategory: (id: string | null) => void
  setStatusFilter: (status: TodoStatus | null) => void
  setViewMode: (mode: 'list' | 'calendar') => void
}

export const useUiStore = create<UiState>()((set) => ({
  selectedCategoryId: null,
  statusFilter: null,
  viewMode: 'list',
  setSelectedCategory: (id) => set({ selectedCategoryId: id }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setViewMode: (mode) => set({ viewMode: mode }),
}))
