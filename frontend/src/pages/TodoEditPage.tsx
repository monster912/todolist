import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { TodoForm } from '@/components/todo/TodoForm'
import { useUpdateTodo } from '@/hooks/useTodoMutations'
import { useTodo } from '@/hooks/useTodo'
import { useCategories } from '@/hooks/useCategories'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import type { UpdateTodoInput } from '@/types/todo.types'
import type { ApiError } from '@/types/api.types'

export function TodoEditPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()

  const { data: todoResult, isLoading: todoLoading, error } = useTodo(id)
  const { data: categoriesResult, isLoading: catLoading } = useCategories()
  const { mutateAsync: updateTodo } = useUpdateTodo()

  // 403 Forbidden → 홈으로 리다이렉트
  useEffect(() => {
    if (error) {
      const apiErr = error as ApiError
      if (apiErr.code === 'FORBIDDEN' || apiErr.code === 'NOT_FOUND') {
        navigate('/', { replace: true })
      }
    }
  }, [error, navigate])

  if (todoLoading || catLoading) return <LoadingSpinner fullPage />

  const todo = todoResult?.data
  const categories = categoriesResult?.data ?? []

  if (!todo) return null

  const handleSubmit = async (values: UpdateTodoInput) => {
    await updateTodo({ id, input: values })
    navigate(`/todos/${id}`, { replace: true })
  }

  return (
    <div>
      <div className="page-title-bar">
        <button className="btn btn-ghost" type="button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <h1 className="page-title">{t('todo.edit')}</h1>
      </div>
      <div className="page-content">
        <TodoForm
          categories={categories}
          initialValues={{
            title: todo.title,
            description: todo.description ?? '',
            category_id: todo.category_id,
            start_date: todo.start_date ?? '',
            end_date: todo.end_date ?? '',
          }}
          onSubmit={(v) => handleSubmit(v as UpdateTodoInput)}
          onCancel={() => navigate(-1)}
          isEdit
        />
      </div>
    </div>
  )
}
