import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { House, Tag, Settings, LogOut, Plus, List, Calendar } from 'lucide-react'
import { TodoList } from '@/components/todo/TodoList'
import { CategoryFilter } from '@/components/category/CategoryFilter'
import { CalendarView } from '@/components/calendar/CalendarView'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { useTodos } from '@/hooks/useTodos'
import { useCategories } from '@/hooks/useCategories'
import { useToggleTodoDone, useDeleteTodo } from '@/hooks/useTodoMutations'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import type { TodoStatus } from '@/types/todo.types'

const STATUS_FILTERS: Array<TodoStatus | 'all'> = ['all', 'NOT_STARTED', 'IN_PROGRESS', 'DONE', 'OVERDUE']

export function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()
  const { selectedCategoryId, statusFilter, setStatusFilter, viewMode, setViewMode } = useUiStore()

  const [todoToDelete, setTodoToDelete] = useState<string | null>(null)

  const { data: categoriesResult, isLoading: catLoading } = useCategories()
  const { data: todosResult, isLoading: todosLoading } = useTodos({
    categoryId: selectedCategoryId ?? undefined,
    status: statusFilter ?? undefined,
  })

  const { mutate: toggleDone } = useToggleTodoDone()
  const { mutate: deleteTodo, isPending: deleting } = useDeleteTodo()

  const categories = categoriesResult?.data ?? []
  const todos = todosResult?.data ?? []

  const handleLogout = () => {
    clearAuth()
    navigate('/login', { replace: true })
  }

  const handleDeleteConfirm = () => {
    if (!todoToDelete) return
    deleteTodo(todoToDelete, { onSuccess: () => setTodoToDelete(null) })
  }

  return (
    <>
      {/* 전체 레이아웃 */}
      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>

        {/* 헤더 */}
        <header className="page-header" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
          <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)' }}>Todo List</span>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
            <NavLink to="/categories" className="btn btn-ghost" style={{ fontSize: 'var(--text-sm)' }}>
              {t('nav.categories')}
            </NavLink>
            <NavLink to="/settings" className="btn btn-ghost" style={{ fontSize: 'var(--text-sm)' }}>
              {t('nav.settings')}
            </NavLink>
            <button className="btn btn-ghost" onClick={handleLogout} style={{ fontSize: 'var(--text-sm)' }}>
              <LogOut size={16} strokeWidth={1.5} />
              {t('nav.logout')}
            </button>
          </div>
        </header>

        <div className="app-layout" style={{ minHeight: 'calc(100vh - 53px)' }}>
          {/* 사이드바 (데스크탑) */}
          <aside className="sidebar">
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)', padding: '0 var(--spacing-4)' }}>
              {t('nav.categories')}
            </p>
            {!catLoading && <CategoryFilter categories={categories} variant="sidebar" />}
            <div style={{ marginTop: 'var(--spacing-6)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-4)' }}>
              <NavLink to="/categories" className="nav-item">
                <Tag size={20} strokeWidth={1.5} />
                {t('nav.categories')}
              </NavLink>
              <NavLink to="/settings" className="nav-item">
                <Settings size={20} strokeWidth={1.5} />
                {t('nav.settings')}
              </NavLink>
              {user && (
                <div style={{ marginTop: 'var(--spacing-4)', padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  {user.name}
                </div>
              )}
            </div>
          </aside>

          {/* 메인 */}
          <main className="main-content">
            {/* 모바일 카테고리 탭 */}
            <div style={{ display: 'none' }} className="mobile-cat-tabs">
              {!catLoading && <CategoryFilter categories={categories} variant="tabs" />}
            </div>

            {/* 목록/달력 토글 버튼 */}
            <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-3)', alignItems: 'center' }}>
              <button
                type="button"
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('list')}
                title={t('todo.list')}
              >
                <List size={18} strokeWidth={1.5} />
                {t('todo.list')}
              </button>
              <button
                type="button"
                className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('calendar')}
                title={t('calendar.view')}
              >
                <Calendar size={18} strokeWidth={1.5} />
                {t('calendar.view')}
              </button>
            </div>

            {/* 상태 필터 탭 (목록 뷰에서만 표시) */}
            {viewMode === 'list' && (
              <div className="tab-list scrollbar-hidden">
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`tab-item${(s === 'all' ? !statusFilter : statusFilter === s) ? ' active' : ''}`}
                    onClick={() => setStatusFilter(s === 'all' ? null : (s as TodoStatus))}
                  >
                    {s === 'all' ? t('todo.filter.all') : t(`todo.filter.${s}`)}
                  </button>
                ))}
              </div>
            )}

            {/* 목록 뷰 */}
            {viewMode === 'list' && (
              <TodoList
                todos={todos}
                categories={categories}
                isLoading={todosLoading || catLoading}
                onToggleDone={(id) => toggleDone(id)}
                onDelete={(id) => setTodoToDelete(id)}
              />
            )}

            {/* 달력 뷰 */}
            {viewMode === 'calendar' && (
              <CalendarView />
            )}
          </main>
        </div>
      </div>

      {/* FAB */}
      <button className="fab" type="button" onClick={() => navigate('/todos/new')}>
        <Plus size={20} strokeWidth={2} />
        {t('todo.create')}
      </button>

      {/* 하단 네비 (모바일) */}
      <nav className="bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
          <House size={22} strokeWidth={1.5} />
          <span>{t('nav.dashboard')}</span>
        </NavLink>
        <button type="button" className="bottom-nav-add" onClick={() => navigate('/todos/new')}>
          <Plus size={24} strokeWidth={2} />
        </button>
        <NavLink to="/categories" className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
          <Tag size={22} strokeWidth={1.5} />
          <span>{t('nav.categories')}</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
          <Settings size={22} strokeWidth={1.5} />
          <span>{t('nav.settings')}</span>
        </NavLink>
      </nav>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={!!todoToDelete}
        onClose={() => setTodoToDelete(null)}
        title={t('todo.confirmDelete')}
      >
        <p className="modal-desc">{t('todo.deleteDescription')}</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setTodoToDelete(null)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} loading={deleting}>
            {t('common.delete')}
          </Button>
        </div>
      </Modal>
    </>
  )
}
