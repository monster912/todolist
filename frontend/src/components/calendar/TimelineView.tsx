import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { Clock, Play, CheckCircle2, AlertCircle } from 'lucide-react'
import { formatDateRange } from '@/utils/dateFormat'
import type { Todo } from '@/types/todo.types'

interface TimelineViewProps {
  currentDate: Dayjs
  todos: Todo[]
}

const STATUS_COLORS = {
  NOT_STARTED: { bg: '#EFF3F4', text: '#536471', icon: Clock },
  IN_PROGRESS: { bg: '#E8F5FF', text: '#1A8CD8', icon: Play },
  DONE: { bg: '#E8FFF5', text: '#00BA7C', icon: CheckCircle2 },
  OVERDUE: { bg: '#FFE8E9', text: '#F4212E', icon: AlertCircle },
}

export function TimelineView({ currentDate, todos }: TimelineViewProps) {
  const navigate = useNavigate()
  const monthStart = currentDate.startOf('month')
  const monthEnd = currentDate.endOf('month')

  // 날짜가 있는 할일만 필터링
  const todosWithDates = useMemo(() => {
    return todos
      .filter((t) => t.start_date || t.end_date)
      .sort((a, b) => {
        const aDate = a.start_date || a.end_date || ''
        const bDate = b.start_date || b.end_date || ''
        return aDate.localeCompare(bDate)
      })
  }, [todos])

  // 월의 날짜 배열
  const monthDays = useMemo(() => {
    const days: Dayjs[] = []
    let current = monthStart
    while (current.isBefore(monthEnd) || current.isSame(monthEnd, 'day')) {
      days.push(current)
      current = current.add(1, 'day')
    }
    return days
  }, [monthStart, monthEnd])

  // 할일의 타임라인 위치 계산
  const getTimelineStyle = (todo: Todo) => {
    const start = todo.start_date
      ? dayjs(todo.start_date)
      : dayjs(todo.end_date)
    const end = todo.end_date ? dayjs(todo.end_date) : dayjs(todo.start_date)

    const startIdx = monthDays.findIndex((d) =>
      d.isSame(start, 'day')
    )
    const endIdx = monthDays.findIndex((d) =>
      d.isSame(end, 'day')
    )

    if (startIdx === -1 || endIdx === -1) return { display: 'none' }

    const left = `${(startIdx / monthDays.length) * 100}%`
    const width = `${((endIdx - startIdx + 1) / monthDays.length) * 100}%`

    return { left, width }
  }

  return (
    <div className="timeline-view">
      {/* 날짜 축 */}
      <div className="timeline-header">
        <div className="timeline-label" />
        <div className="timeline-dates">
          {monthDays.map((day, idx) => {
            const dateStr = day.format('YYYY-MM-DD')
            return (
              <div
                key={idx}
                className="timeline-date-marker"
                title={dateStr}
                onClick={() => navigate(`/todos/new`, { state: { startDate: dateStr } })}
                style={{ cursor: 'pointer' }}
              >
                {day.date()}
              </div>
            )
          })}
        </div>
      </div>

      {/* 할일 막대 */}
      <div className="timeline-container">
        {todosWithDates.map((todo) => {
          const Icon =
            STATUS_COLORS[todo.status as keyof typeof STATUS_COLORS]?.icon
          const color =
            STATUS_COLORS[todo.status as keyof typeof STATUS_COLORS]
          const style = getTimelineStyle(todo)

          return (
            <div key={todo.id} className="timeline-row">
              <div className="timeline-label">
                <div className="timeline-todo-title-label" title={todo.title}>
                  {todo.title}
                </div>
              </div>

              <div className="timeline-track">
                {style.display !== 'none' && (
                  <div
                    className="timeline-bar"
                    style={{
                      left: style.left,
                      width: style.width,
                      backgroundColor: color?.bg || '#EFF3F4',
                      borderLeftColor: color?.text || '#536471',
                    }}
                    onClick={() => navigate(`/todos/${todo.id}`)}
                    title={formatDateRange(todo.start_date, todo.end_date, 'short')}
                  >
                    {Icon && (
                      <Icon
                        size={12}
                        strokeWidth={2}
                        style={{ color: color?.text }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {todosWithDates.length === 0 && (
          <div className="timeline-empty">할일이 없습니다.</div>
        )}
      </div>
    </div>
  )
}
