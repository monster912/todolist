import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Pencil, Trash2, House, Tag, Settings } from 'lucide-react'
import { CategoryForm } from '@/components/category/CategoryForm'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useCategories } from '@/hooks/useCategories'
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useCategoryMutations'
import type { ApiError } from '@/types/api.types'

export function CategoryPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [createError, setCreateError] = useState('')

  const { data: categoriesResult, isLoading } = useCategories()
  const { mutateAsync: createCategory } = useCreateCategory()
  const { mutateAsync: updateCategory } = useUpdateCategory()
  const { mutate: deleteCategory, isPending: deleting } = useDeleteCategory()

  const categories = categoriesResult?.data ?? []

  const handleCreate = async (name: string) => {
    setCreateError('')
    try {
      await createCategory({ name })
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr.code === 'DUPLICATE_CATEGORY') {
        setCreateError(t('category.errors.duplicate'))
      } else {
        setCreateError(t(`errors.${apiErr.code}`, t('errors.unknown')))
      }
      throw err
    }
  }

  const handleUpdate = async (id: string, name: string) => {
    await updateCategory({ id, input: { name } })
    setEditingId(null)
  }

  const handleDeleteConfirm = () => {
    if (!deleteId) return
    deleteCategory(deleteId, { onSuccess: () => setDeleteId(null) })
  }

  if (isLoading) return <LoadingSpinner fullPage />

  return (
    <div style={{ paddingBottom: 'var(--bottom-nav-height)' }}>
      {/* 페이지 헤더 */}
      <div className="page-title-bar">
        <button className="btn btn-ghost" type="button" onClick={() => navigate('/')}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <h1 className="page-title">{t('nav.categories')}</h1>
      </div>

      <div className="page-content" style={{ maxWidth: 560 }}>
        {/* 새 카테고리 추가 */}
        <section style={{ marginBottom: 'var(--spacing-6)' }}>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)' }}>
            {t('category.create')}
          </p>
          <CategoryForm onSubmit={handleCreate} />
          {createError && (
            <p style={{ fontSize: 'var(--text-sm)', color: '#F4212E', marginTop: 'var(--spacing-2)' }}>
              {createError}
            </p>
          )}
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', marginBottom: 'var(--spacing-5)' }} />

        {/* 카테고리 목록 */}
        <section>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            {categories.map((category) => (
              <div
                key={category.id}
                style={{
                  padding: 'var(--spacing-4)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                {editingId === category.id ? (
                  <CategoryForm
                    category={category}
                    onSubmit={(name) => handleUpdate(category.id, name)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                      <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>
                        {category.name}
                      </span>
                      {category.is_default && (
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                          {t('category.default')}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-1)', flexShrink: 0 }}>
                      <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={() => setEditingId(category.id)}
                        disabled={category.is_default}
                        aria-label={t('common.edit')}
                      >
                        <Pencil size={16} strokeWidth={1.5} />
                      </button>
                      <button
                        className="btn btn-ghost"
                        type="button"
                        style={category.is_default ? undefined : { color: '#F4212E' }}
                        onClick={() => setDeleteId(category.id)}
                        disabled={category.is_default}
                        aria-label={t('common.delete')}
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 모바일 하단 네비 */}
      <nav className="bottom-nav">
        <Link to="/" className="bottom-nav-item">
          <House size={22} strokeWidth={1.5} />
          <span>{t('nav.dashboard')}</span>
        </Link>
        <Link to="/categories" className="bottom-nav-item active">
          <Tag size={22} strokeWidth={1.5} />
          <span>{t('nav.categories')}</span>
        </Link>
        <Link to="/settings" className="bottom-nav-item">
          <Settings size={22} strokeWidth={1.5} />
          <span>{t('nav.settings')}</span>
        </Link>
      </nav>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title={t('category.confirmDelete')}
      >
        <p className="modal-desc">{t('category.deleteDescription')}</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
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
