import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import ProgramBadge from './ProgramBadge'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarGrid({
  year,
  month,
  missions,
  programs,
  onPrevMonth,
  onNextMonth,
  onDayClick,
}) {
  const today = new Date()
  const todayStr =
    today.getFullYear() +
    '-' +
    String(today.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(today.getDate()).padStart(2, '0')

  // Calendar math
  const firstDay = new Date(year, month - 1, 1)
  const startWeekday = firstDay.getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  // Build mission lookup by date
  const missionsByDate = {}
  missions.forEach((m) => {
    const dateKey = m.date
    if (!missionsByDate[dateKey]) missionsByDate[dateKey] = []
    missionsByDate[dateKey].push(m)
  })

  // Build grid cells
  const cells = []
  // Empty cells before first day
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ type: 'empty', key: `empty-${i}` })
  }
  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr =
      year +
      '-' +
      String(month).padStart(2, '0') +
      '-' +
      String(day).padStart(2, '0')
    cells.push({
      type: 'day',
      key: dateStr,
      day,
      dateStr,
      missions: missionsByDate[dateStr] || [],
      isToday: dateStr === todayStr,
    })
  }

  const monthLabel = new Date(year, month - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onPrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">{monthLabel}</h3>
        <button
          onClick={onNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="text-center text-xs font-medium text-gray-400 py-2"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          if (cell.type === 'empty') {
            return <div key={cell.key} className="min-h-[110px]" />
          }

          return (
            <div
              key={cell.key}
              className={`min-h-[110px] border rounded-lg p-2 transition-colors ${
                cell.isToday
                  ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                  : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  cell.isToday ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                {cell.day}
              </span>

              <div className="mt-1 space-y-1">
                {cell.missions.map((mission) => (
                  <button
                    key={mission.id}
                    onClick={() => onDayClick(cell.dateStr, mission)}
                    className="w-full text-left"
                  >
                    <ProgramBadge
                      name={mission.content_programs?.name || 'Unknown'}
                      color={mission.content_programs?.color || '#999'}
                      bucket={mission.bucket}
                      status={mission.status}
                    />
                  </button>
                ))}
              </div>

              {/* Add mission button */}
              <button
                onClick={() => onDayClick(cell.dateStr, null)}
                className="mt-1 w-full flex items-center justify-center py-1 text-gray-300 hover:text-blue-500 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
