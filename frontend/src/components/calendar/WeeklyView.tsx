import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { Clock, Play, CheckCircle2, AlertCircle } from 'lucide-react'
import type { Todo } from '@/types/todo.types'

interface WeeklyViewProps {
  currentDate: Dayjs
  todos: Todo[]
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const STATUS_COLORS = {
  NOT_STARTED: { bg: '#EFF3F4', text: '#536471', icon: Clock },
  IN_PROGRESS: { bg: '#E8F5FF', text: '#1A8CD8', icon: Play },
  DONE: { bg: '#E8FFF5', text: '#00BA7C', icon: CheckCircle2 },
  OVERDUE: { bg: '#FFE8E9', text: '#F4212E', icon: AlertCircle },
}

export function WeeklyView({ currentDate, todos }: WeeklyViewProps) {
  const navigate = useNavigate()
  const today = dayjs()

  // 현재 주의 시작일(일요일)
  const weekStart = currentDate.startOf('week')
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'))
  }, [weekStart])

  // 날짜별 할일 그룹핑
  const todosByDate = useMemo(() => {
    const map = new Map<string, Todo[]>()

    todos.forEach((todo) => {
      if (!todo.start_date && !todo.end_date) return

      const start = todo.start_date ? dayjs(todo.start_date) : null
      const end = todo.end_date ? dayjs(todo.end_date) : null

      if (!start && !end) return

      let currentDay = start || end!
      const endDay = end || start!

      while (currentDay.isBefore(endDay) || currentDay.isSame(endDay, 'day')) {
        const key = currentDay.format('YYYY-MM-DD')
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(todo)
        currentDay = currentDay.add(1, 'day')
      }
    })

    return map
  }, [todos])

  return (
    <div className="weekly-view">
      <div className="weekly-grid">
        {weekDays.map((day) => {
          const dateStr = day.format('YYYY-MM-DD')
          const isToday = day.isSame(today, 'day')
          const todaysItems = todosByDate.get(dateStr) || []

          return (
            <div
              key={dateStr}
              className={`weekly-column ${isToday ? 'today' : ''}`}
              onClick={() => navigate(`/todos/new`, { state: { startDate: dateStr } })}
              style={{ cursor: 'pointer' }}
            >
              <div className="weekly-header">
                <div className="weekly-weekday">
                  {WEEKDAY_LABELS[day.day()]}
                </div>
                <div className="weekly-date">{day.date()}</div>
              </div>

              <div className="weekly-todos" onClick={(e) => e.stopPropagation()}>
                {todaysItems.map((todo) => {
                  const Icon =
                    STATUS_COLORS[
                      todo.status as keyof typeof STATUS_COLORS
                    ]?.icon
                  const color =
                    STATUS_COLORS[
                      todo.status as keyof typeof STATUS_COLORS
                    ]

                  return (
                    <div
                      key={todo.id}
                      onClick={() => navigate(`/todos/${todo.id}`)}
                      className="weekly-todo-card"
                      style={{
                        backgroundColor: color?.bg || '#EFF3F4',
                        borderLeftColor: color?.text || '#536471',
                      }}
                      title={todo.title}
                    >
                      <div className="weekly-todo-header">
                        {Icon && (
                          <Icon
                            size={14}
                            strokeWidth={2}
                            style={{ color: color?.text || '#536471' }}
                          />
                        )}
                        <span className="weekly-todo-title">{todo.title}</span>
                      </div>
                      {todo.description && (
                        <div className="weekly-todo-description">
                          {todo.description}
                        </div>
                      )}
                    </div>
                  )
                })}
                {todaysItems.length === 0 && (
                  <div className="weekly-empty">할일 없음</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
