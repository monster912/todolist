import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import type { Category } from '@/types/category.types'

export interface CategoryFormProps {
  category?: Category
  onSubmit: (name: string) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

export function CategoryForm({ category, onSubmit, onCancel, loading }: CategoryFormProps) {
  const { t } = useTranslation()
  const isEdit = !!category
  const isDefault = category?.is_default === true

  const [name, setName] = useState(category?.name ?? '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError(t('category.errors.nameRequired')); return }
    if (name.length > 50) { setError(t('category.errors.nameTooLong')); return }
    setError('')
    setSubmitting(true)
    try {
      await onSubmit(name.trim())
      if (!isEdit) setName('')
    } catch {
      // error handling is delegated to parent's onSubmit
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'flex-start' }}
    >
      <div style={{ flex: 1 }}>
        <Input
          id={`category-name-${category?.id ?? 'new'}`}
          placeholder={isDefault ? t('category.errors.cannotEditDefault') : t('category.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          disabled={isDefault}
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        loading={submitting || loading}
        disabled={isDefault}
      >
        {isEdit ? t('common.save') : t('category.create')}
      </Button>
      {onCancel && (
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
      )}
    </form>
  )
}
