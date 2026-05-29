import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, Pencil, Trash2, Calendar, Folder } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import type { Todo } from '@/types/todo.types'
import type { Category } from '@/types/category.types'

export interface TodoCardProps {
  todo: Todo
  category?: Category
  onToggleDone: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoCard({ todo, category, onToggleDone, onDelete }: TodoCardProps) {
  const { t } = useTranslation()

  return (
    <div className={`todo-card${todo.is_done ? ' done' : ''}`}>
      <div className="todo-card-left">
        <button
          className={`checkbox${todo.is_done ? ' checked' : ''}`}
          onClick={() => { if (!todo.is_done) onToggleDone(todo.id) }}
          aria-label={t('todo.complete')}
          type="button"
        >
          {todo.is_done && <Check size={10} strokeWidth={3} />}
        </button>
      </div>
      <div className="todo-card-right">
        <div className="todo-card-header">
          <Link to={`/todos/${todo.id}`} className="todo-title">
            {todo.title}
          </Link>
          <StatusBadge status={todo.status} />
        </div>
        {todo.description && (
          <p className="todo-desc">{todo.description}</p>
        )}
        <div className="todo-card-footer">
          <div className="todo-meta">
            {category && (
              <span className="todo-meta-item">
                <Folder size={14} strokeWidth={1.5} />
                {category.name}
              </span>
            )}
            {(todo.start_date ?? todo.end_date) && (
              <span className="todo-meta-item">
                <Calendar size={14} strokeWidth={1.5} />
                {todo.start_date ?? '?'} ~ {todo.end_date ?? '?'}
              </span>
            )}
          </div>
          <div className="todo-card-actions">
            <Link
              to={`/todos/${todo.id}/edit`}
              className="btn btn-ghost"
              aria-label={t('common.edit')}
            >
              <Pencil size={16} strokeWidth={1.5} />
            </Link>
            <button
              className="btn btn-ghost"
              style={{ color: '#F4212E' }}
              onClick={() => onDelete(todo.id)}
              aria-label={t('common.delete')}
              type="button"
            >
              <Trash2 size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
