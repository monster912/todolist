import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { TodoForm } from '@/components/todo/TodoForm'
import { useCreateTodo } from '@/hooks/useTodoMutations'
import { useCategories } from '@/hooks/useCategories'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import type { CreateTodoInput } from '@/types/todo.types'

interface LocationState {
  startDate?: string
}

export function TodoCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState) || {}

  const { data: categoriesResult, isLoading: catLoading } = useCategories()
  const { mutateAsync: createTodo } = useCreateTodo()

  const categories = categoriesResult?.data ?? []

  const handleSubmit = async (values: CreateTodoInput) => {
    await createTodo(values)
    navigate('/', { replace: true })
  }

  if (catLoading) return <LoadingSpinner fullPage />

  return (
    <div>
      <div className="page-title-bar">
        <button className="btn btn-ghost" type="button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <h1 className="page-title">{t('todo.create')}</h1>
      </div>
      <div className="page-content">
        <TodoForm
          categories={categories}
          initialValues={{
            start_date: state.startDate,
          }}
          onSubmit={(v) => handleSubmit(v as CreateTodoInput)}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  )
}
