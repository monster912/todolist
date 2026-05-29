import dayjs from 'dayjs'

export function datetimeLocalToISO(datetimeLocalValue: string): string {
  if (!datetimeLocalValue) return ''
  // datetime-local 형식: "2026-05-28T15:00"
  // ISO 8601 형식으로 변환: "2026-05-28T15:00:00.000Z"
  const date = new Date(datetimeLocalValue)
  return date.toISOString()
}

export function dateTimeToISO(dateValue: string, hour: number, minute: number): string {
  if (!dateValue) return ''
  // date 형식: "2026-05-28"
  // hour: 0-23, minute: 0, 10, 20, 30, 40, 50
  // ISO 8601 형식으로 변환: "2026-05-28T15:30:00.000Z"
  const date = new Date(`${dateValue}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`)
  return date.toISOString()
}

export function formatDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  format: 'short' | 'long' = 'short'
): string {
  if (!startDate && !endDate) return ''

  const start = startDate ? dayjs(startDate) : null
  const end = endDate ? dayjs(endDate) : null

  if (!start && !end) return ''
  if (!start) return end!.format(format === 'short' ? 'MM/DD HH:mm' : 'YYYY년 MM월 DD일 HH:mm')
  if (!end) return start.format(format === 'short' ? 'MM/DD HH:mm' : 'YYYY년 MM월 DD일 HH:mm')

  const isSameDay = start.isSame(end, 'day')
  const isSameTime = start.isSame(end, 'minute')

  if (isSameDay) {
    if (format === 'short') {
      return `${start.format('MM/DD')} ${start.format('HH:mm')} ~ ${end.format('HH:mm')}`
    }
    return `${start.format('YYYY년 MM월 DD일')} ${start.format('HH:mm')} ~ ${end.format('HH:mm')}`
  }

  if (format === 'short') {
    return `${start.format('MM/DD HH:mm')} ~ ${end.format('MM/DD HH:mm')}`
  }
  return `${start.format('YYYY년 MM월 DD일 HH:mm')} ~ ${end.format('YYYY년 MM월 DD일 HH:mm')}`
}

export function formatSingleDate(
  date: string | null | undefined,
  format: 'short' | 'long' = 'short'
): string {
  if (!date) return ''
  const d = dayjs(date)
  return d.format(format === 'short' ? 'MM/DD HH:mm' : 'YYYY년 MM월 DD일 HH:mm')
}
