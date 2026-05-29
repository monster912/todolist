import { useTranslation } from 'react-i18next'
import type { TodoStatus } from '@/types/todo.types'

export interface StatusBadgeProps {
  status: TodoStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation()
  return (
    <span className={`status-badge ${status}`}>
      {t(`todo.status.${status}`)}
    </span>
  )
}
