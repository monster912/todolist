import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs, { Dayjs } from 'dayjs'
import { ChevronLeft, ChevronRight, Calendar, Rows, BarChart3 } from 'lucide-react'
import { useTodos } from '@/hooks/useTodos'
import { useUiStore } from '@/stores/uiStore'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { MonthlyView } from './MonthlyView'
import { WeeklyView } from './WeeklyView'
import { TimelineView } from './TimelineView'

type CalendarTab = 'monthly' | 'weekly' | 'timeline'

export function CalendarView() {
  const { t } = useTranslation()
  const selectedCategoryId = useUiStore((s) => s.selectedCategoryId)
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs())
  const [activeTab, setActiveTab] = useState<CalendarTab>('monthly')

  const { data: todosResult, isLoading } = useTodos(
    selectedCategoryId ? { categoryId: selectedCategoryId } : undefined
  )
  const todos = todosResult?.data ?? []

  const handlePrevious = () => {
    setCurrentDate((prev) =>
      activeTab === 'weekly'
        ? prev.subtract(1, 'week')
        : prev.subtract(1, 'month')
    )
  }

  const handleNext = () => {
    setCurrentDate((prev) =>
      activeTab === 'weekly'
        ? prev.add(1, 'week')
        : prev.add(1, 'month')
    )
  }

  const handleToday = () => {
    setCurrentDate(dayjs())
  }

  if (isLoading) return <LoadingSpinner fullPage />

  return (
    <div className="calendar-view">
      {/* 달력 탭 */}
      <div className="calendar-view-tabs">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`calendar-tab ${activeTab === 'monthly' ? 'active' : ''}`}
          title={t('calendar.monthly')}
        >
          <Calendar size={18} strokeWidth={1.5} />
          <span>{t('calendar.monthly')}</span>
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`calendar-tab ${activeTab === 'weekly' ? 'active' : ''}`}
          title={t('calendar.weekly')}
        >
          <Rows size={18} strokeWidth={1.5} />
          <span>{t('calendar.weekly')}</span>
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`calendar-tab ${activeTab === 'timeline' ? 'active' : ''}`}
          title={t('calendar.timeline')}
        >
          <BarChart3 size={18} strokeWidth={1.5} />
          <span>{t('calendar.timeline')}</span>
        </button>
      </div>

      {/* 네비게이션 */}
      <div className="calendar-nav">
        <button onClick={handlePrevious} className="btn btn-ghost" title={t('common.previous')}>
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>
        <h2 className="calendar-month-title">
          {currentDate.format('YYYY MMMM')}
        </h2>
        <button onClick={handleNext} className="btn btn-ghost" title={t('common.next')}>
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>
        <button onClick={handleToday} className="btn btn-secondary btn-sm">
          {t('calendar.today')}
        </button>
      </div>

      {/* 달력 콘텐츠 */}
      <div className="calendar-content">
        {activeTab === 'monthly' && <MonthlyView currentDate={currentDate} todos={todos} />}
        {activeTab === 'weekly' && <WeeklyView currentDate={currentDate} todos={todos} />}
        {activeTab === 'timeline' && <TimelineView currentDate={currentDate} todos={todos} />}
      </div>
    </div>
  )
}
