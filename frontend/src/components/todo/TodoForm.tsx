import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/common/Button'
import { Input, Textarea } from '@/components/common/Input'
import { dateTimeToISO } from '@/utils/dateFormat'
import dayjs from 'dayjs'
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

// ISO 문자열에서 date, hour, minute 추출 (분은 10분 단위로 내림차순)
function extractDateTime(isoString: string | undefined): { date: string; hour: number; minute: number } {
  if (!isoString) {
    const now = dayjs()
    return { date: now.format('YYYY-MM-DD'), hour: now.hour(), minute: Math.floor(now.minute() / 10) * 10 }
  }
  const d = dayjs(isoString)
  const minute = Math.floor(d.minute() / 10) * 10
  return {
    date: d.format('YYYY-MM-DD'),
    hour: d.hour(),
    minute,
  }
}

export function TodoForm({ categories, initialValues, onSubmit, onCancel, isEdit, loading }: TodoFormProps) {
  const { t } = useTranslation()

  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [categoryId, setCategoryId] = useState(initialValues?.category_id ?? '')

  // start_date를 date, hour, minute으로 분리
  const initStartDt = extractDateTime(initialValues?.start_date)
  const [startDate, setStartDate] = useState(initStartDt.date)
  const [startHour, setStartHour] = useState(initStartDt.hour)
  const [startMinute, setStartMinute] = useState(initStartDt.minute)

  // end_date를 date, hour, minute으로 분리
  const initEndDt = extractDateTime(initialValues?.end_date)
  const [endDate, setEndDate] = useState(initEndDt.date)
  const [endHour, setEndHour] = useState(initEndDt.hour)
  const [endMinute, setEndMinute] = useState(initEndDt.minute)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!title.trim()) next.title = t('todo.errors.titleRequired')
    else if (title.length > 200) next.title = t('todo.errors.titleTooLong')

    if (startDate && endDate) {
      const startDt = dayjs(`${startDate}T${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00`)
      const endDt = dayjs(`${endDate}T${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`)
      if (endDt.isBefore(startDt)) {
        next.endDate = t('todo.errors.endDateBeforeStart')
      }
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
        start_date: startDate ? dateTimeToISO(startDate, startHour, startMinute) : undefined,
        end_date: endDate ? dateTimeToISO(endDate, endHour, endMinute) : undefined,
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
      {/* 시작 날짜/시간 */}
      <div className="form-group">
        <label className="form-label">{t('todo.startDate')}</label>
        <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center' }}>
          <input
            id="todo-start-date"
            type="date"
            className="input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ flex: 1, minWidth: 0 }}
          />
          <select
            className="select"
            value={startHour}
            onChange={(e) => setStartHour(Number(e.target.value))}
            style={{ width: '70px' }}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {String(i).padStart(2, '0')}
              </option>
            ))}
          </select>
          <span style={{ fontWeight: 'bold' }}>:</span>
          <select
            className="select"
            value={startMinute}
            onChange={(e) => setStartMinute(Number(e.target.value))}
            style={{ width: '70px' }}
          >
            {[0, 10, 20, 30, 40, 50].map((m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 종료 날짜/시간 */}
      <div className="form-group">
        <label className="form-label">{t('todo.endDate')}</label>
        <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center' }}>
          <input
            id="todo-end-date"
            type="date"
            className="input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ flex: 1, minWidth: 0 }}
          />
          <select
            className="select"
            value={endHour}
            onChange={(e) => setEndHour(Number(e.target.value))}
            style={{ width: '70px' }}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {String(i).padStart(2, '0')}
              </option>
            ))}
          </select>
          <span style={{ fontWeight: 'bold' }}>:</span>
          <select
            className="select"
            value={endMinute}
            onChange={(e) => setEndMinute(Number(e.target.value))}
            style={{ width: '70px' }}
          >
            {[0, 10, 20, 30, 40, 50].map((m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
        {errors.endDate && <span className="input-error-msg">{errors.endDate}</span>}
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
