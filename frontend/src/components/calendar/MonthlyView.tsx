import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { Clock, Play, CheckCircle2, AlertCircle } from 'lucide-react'
import type { Todo } from '@/types/todo.types'

interface MonthlyViewProps {
  currentDate: Dayjs
  todos: Todo[]
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const STATUS_COLORS = {
  NOT_STARTED: { bg: '#EFF3F4', text: '#536471', icon: Clock },
  IN_PROGRESS: { bg: '#E8F5FF', text: '#1A8CD8', icon: Play },
  DONE: { bg: '#E8FFF5', text: '#00BA7C', icon: CheckCircle2 },
  OVERDUE: { bg: '#FFE8E9', text: '#F4212E', icon: AlertCircle },
}

export function MonthlyView({ currentDate, todos }: MonthlyViewProps) {
  const navigate = useNavigate()
  const month = currentDate.month()
  const year = currentDate.year()
  const today = dayjs()

  // 달력 그리드 생성
  const { weeks } = useMemo(() => {
    const first = dayjs(`${year}-${month + 1}-01`)
    const firstDayOfWeek = first.day()
    const daysInMonth = first.daysInMonth()

    const weeks: (number | null)[][] = []
    let week: (number | null)[] = Array(firstDayOfWeek).fill(null)

    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day)
      if (week.length === 7) {
        weeks.push(week)
        week = []
      }
    }

    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null)
      }
      weeks.push(week)
    }

    return { weeks, firstDay: firstDayOfWeek }
  }, [year, month])

  // 날짜별 할일 그룹핑
  const todosByDate = useMemo(() => {
    const map = new Map<string, Todo[]>()

    todos.forEach((todo) => {
      if (!todo.start_date && !todo.end_date) return

      const start = todo.start_date ? dayjs(todo.start_date) : null
      const end = todo.end_date ? dayjs(todo.end_date) : null

      if (!start && !end) return

      // 범위 내 모든 날짜 추가
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
    <div className="monthly-view">
      {/* 요일 헤더 */}
      <div className="calendar-weekdays">
        {WEEKDAYS.map((day) => (
          <div key={day} className="calendar-weekday-header">
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="calendar-grid">
        {weeks.map((week, weekIdx) =>
          week.map((day, dayIdx) => {
            const dateStr = day
              ? dayjs(`${year}-${month + 1}-${day}`).format('YYYY-MM-DD')
              : null
            const isToday =
              day && dayjs(`${year}-${month + 1}-${day}`).isSame(today, 'day')
            const todaysItems = dateStr ? todosByDate.get(dateStr) || [] : []

            return (
              <div
                key={`${weekIdx}-${dayIdx}`}
                className={`calendar-day ${isToday ? 'today' : ''}`}
                onClick={() => {
                  if (day && dateStr) {
                    navigate(`/todos/new`, { state: { startDate: dateStr } })
                  }
                }}
                style={{ cursor: day ? 'pointer' : 'default' }}
              >
                {day && (
                  <>
                    <div className="calendar-day-number">{day}</div>
                    <div className="calendar-todos" onClick={(e) => e.stopPropagation()}>
                      {todaysItems.slice(0, 3).map((todo) => {
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
                            className="calendar-todo-chip"
                            style={{
                              backgroundColor: color?.bg || '#EFF3F4',
                              color: color?.text || '#536471',
                            }}
                            title={todo.title}
                          >
                            {Icon && <Icon size={12} strokeWidth={2} />}
                            <span className="calendar-todo-title">
                              {todo.title}
                            </span>
                          </div>
                        )
                      })}
                      {todaysItems.length > 3 && (
                        <div className="calendar-todo-more">
                          +{todaysItems.length - 3}개
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
