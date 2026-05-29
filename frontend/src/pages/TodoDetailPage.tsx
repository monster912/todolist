import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Calendar, Folder, Pencil, Trash2, Check } from 'lucide-react'
import { StatusBadge } from '@/components/todo/StatusBadge'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useTodo } from '@/hooks/useTodo'
import { useCategories } from '@/hooks/useCategories'
import { useToggleTodoDone, useDeleteTodo } from '@/hooks/useTodoMutations'
import { formatDateRange } from '@/utils/dateFormat'
import type { ApiError } from '@/types/api.types'

export function TodoDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()

  const [showDelete, setShowDelete] = useState(false)

  const { data: todoResult, isLoading, error } = useTodo(id)
  const { data: categoriesResult } = useCategories()
  const { mutate: toggleDone, isPending: toggling } = useToggleTodoDone()
  const { mutate: deleteTodo, isPending: deleting } = useDeleteTodo()

  // 403 Forbidden → 홈으로 리다이렉트
  useEffect(() => {
    if (error) {
      const apiErr = error as ApiError
      if (apiErr.code === 'FORBIDDEN' || apiErr.code === 'NOT_FOUND') {
        navigate('/', { replace: true })
      }
    }
  }, [error, navigate])

  if (isLoading) return <LoadingSpinner fullPage />

  const todo = todoResult?.data
  const categories = categoriesResult?.data ?? []

  if (!todo) return null

  const category = categories.find((c) => c.id === todo.category_id)

  const handleDeleteConfirm = () => {
    deleteTodo(todo.id, {
      onSuccess: () => navigate('/', { replace: true }),
    })
  }

  return (
    <div>
      <div className="page-title-bar">
        <button className="btn btn-ghost" type="button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <h1 className="page-title">{t('todo.title')}</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--spacing-2)' }}>
          <Link to={`/todos/${id}/edit`} className="btn btn-ghost" aria-label={t('common.edit')}>
            <Pencil size={18} strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ color: '#F4212E' }}
            onClick={() => setShowDelete(true)}
            aria-label={t('common.delete')}
          >
            <Trash2 size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* 제목 + 상태 배지 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: todo.is_done ? 'var(--color-text-secondary)' : 'var(--color-text-primary)', textDecoration: todo.is_done ? 'line-through' : 'none', flex: 1 }}>
            {todo.title}
          </h2>
          <StatusBadge status={todo.status} />
        </div>

        {/* 메타 정보 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-5)' }}>
          {category && (
            <div className="todo-meta-item">
              <Folder size={14} strokeWidth={1.5} />
              {category.name}
            </div>
          )}
          {(todo.start_date ?? todo.end_date) && (
            <div className="todo-meta-item">
              <Calendar size={14} strokeWidth={1.5} />
              {formatDateRange(todo.start_date, todo.end_date, 'long')}
            </div>
          )}
        </div>

        {/* 설명 */}
        {todo.description && (
          <div style={{ marginBottom: 'var(--spacing-6)', padding: 'var(--spacing-4)', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
            {todo.description}
          </div>
        )}

        {/* 완료/원복 버튼 */}
        {!todo.is_done && (
          <Button
            variant="primary"
            onClick={() => toggleDone(todo.id)}
            loading={toggling}
            style={{ display: 'inline-flex', gap: 'var(--spacing-2)' }}
          >
            <Check size={16} strokeWidth={2} />
            {t('todo.complete')}
          </Button>
        )}
        {todo.is_done && (
          <Button
            variant="secondary"
            onClick={() => toggleDone(todo.id)}
            loading={toggling}
            style={{ display: 'inline-flex', gap: 'var(--spacing-2)' }}
          >
            {t('todo.restore')}
          </Button>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title={t('todo.confirmDelete')}
      >
        <p className="modal-desc">{t('todo.deleteDescription')}</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setShowDelete(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} loading={deleting}>
            {t('common.delete')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
