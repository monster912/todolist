import { useTranslation } from 'react-i18next'
import { TodoCard } from './TodoCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import type { Todo } from '@/types/todo.types'
import type { Category } from '@/types/category.types'

export interface TodoListProps {
  todos: Todo[]
  categories: Category[]
  isLoading?: boolean
  onToggleDone: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoList({ todos, categories, isLoading, onToggleDone, onDelete }: TodoListProps) {
  const { t } = useTranslation()
  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  if (isLoading) return <LoadingSpinner fullPage />

  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state-title">{t('todo.empty')}</p>
        <p className="empty-state-desc">{t('todo.emptyFiltered')}</p>
      </div>
    )
  }

  return (
    <div>
      {todos.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          category={categoryMap.get(todo.category_id)}
          onToggleDone={onToggleDone}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
