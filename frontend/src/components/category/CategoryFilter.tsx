import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/uiStore'
import type { Category } from '@/types/category.types'

export interface CategoryFilterProps {
  categories: Category[]
  variant?: 'sidebar' | 'tabs'
}

export function CategoryFilter({ categories, variant = 'sidebar' }: CategoryFilterProps) {
  const { t } = useTranslation()
  const { selectedCategoryId, setSelectedCategory } = useUiStore()

  if (variant === 'tabs') {
    return (
      <div className="tab-list scrollbar-hidden">
        <button
          className={`tab-item${!selectedCategoryId ? ' active' : ''}`}
          onClick={() => setSelectedCategory(null)}
          type="button"
        >
          {t('category.all')}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`tab-item${selectedCategoryId === c.id ? ' active' : ''}`}
            onClick={() => setSelectedCategory(c.id)}
            type="button"
          >
            {c.name}
          </button>
        ))}
      </div>
    )
  }

  return (
    <nav>
      <button
        className={`nav-item${!selectedCategoryId ? ' active' : ''}`}
        onClick={() => setSelectedCategory(null)}
        type="button"
      >
        {t('category.all')}
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          className={`nav-item${selectedCategoryId === c.id ? ' active' : ''}`}
          onClick={() => setSelectedCategory(c.id)}
          type="button"
        >
          {c.name}
        </button>
      ))}
    </nav>
  )
}
