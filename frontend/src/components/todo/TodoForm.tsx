import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/common/Button'
import { Input, Textarea } from '@/components/common/Input'
import type { Category } from '@/types/category.types'
import type { CreateTodoInput, UpdateTodoInput } from '@/types/todo.types'

export interface TodoFormInitialValues {
  title?: string
  description?: string
  category_id?: string
  start_date?: string
  end_date?: string
}

export interface TodoFormProps {
  categories: Category[]
  initialValues?: TodoFormInitialValues
  onSubmit: (values: CreateTodoInput | UpdateTodoInput) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
  loading?: boolean
}

export function TodoForm({ categories, initialValues, onSubmit, onCancel, isEdit, loading }: TodoFormProps) {
  const { t } = useTranslation()

  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [categoryId, setCategoryId] = useState(initialValues?.category_id ?? '')
  const [startDate, setStartDate] = useState(initialValues?.start_date ?? '')
  const [endDate, setEndDate] = useState(initialValues?.end_date ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!title.trim()) next.title = t('todo.errors.titleRequired')
    else if (title.length > 200) next.title = t('todo.errors.titleTooLong')
    if (startDate && endDate && endDate < startDate) {
      next.endDate = t('todo.errors.endDateBeforeStart')
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        category_id: categoryId || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
      <Input
        id="todo-title"
        label={t('todo.title')}
        placeholder={t('todo.titlePlaceholder')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        required
      />
      <Textarea
        id="todo-description"
        label={t('todo.description')}
        placeholder={t('todo.descriptionPlaceholder')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="form-group">
        <label htmlFor="todo-category" className="form-label">
          {t('todo.category')}
        </label>
        <select
          id="todo-category"
          className="select"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">
            {categories.find((c) => c.is_default)?.name ?? t('category.default')}
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row-2">
        <Input
          id="todo-start-date"
          type="date"
          label={t('todo.startDate')}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          id="todo-end-date"
          type="date"
          label={t('todo.endDate')}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          error={errors.endDate}
        />
      </div>
      <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end' }}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="primary" loading={submitting || loading}>
          {isEdit ? t('common.save') : t('todo.create')}
        </Button>
      </div>
    </form>
  )
}
