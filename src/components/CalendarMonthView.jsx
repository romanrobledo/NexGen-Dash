import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Loader2, AlertTriangle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCalendarEvents } from '../hooks/useCalendarEvents'
import CalendarEventModal from './CalendarEventModal'

/**
 * Full-month calendar grid for a single calendar (`school` | `staff` |
 * `events`). Renders a 6×7 day grid (previous / current / next month cells
 * so weeks are always complete), with event pills stacked inside each day.
 *
 * Interactions:
 *   - Click empty area of a day → open Create modal, that day pre-filled
 *   - Click an event pill      → open View modal for that event
 *   - Prev / Next / Today      → month navigation
 *   - "New event" top button   → open Create modal, today pre-filled
 *
 * The modal handles save + delete. This component just renders the grid
 * and reflects the hook's state.
 */

const ACCENTS = {
  indigo:  { chipBg: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',    dot: 'bg-indigo-500',  ring: 'ring-indigo-300', btn: 'bg-indigo-600 hover:bg-indigo-700' },
  emerald: { chipBg: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200', dot: 'bg-emerald-500', ring: 'ring-emerald-300', btn: 'bg-emerald-600 hover:bg-emerald-700' },
  amber:   { chipBg: 'bg-amber-100 text-amber-800 hover:bg-amber-200',       dot: 'bg-amber-500',   ring: 'ring-amber-300',   btn: 'bg-amber-500 hover:bg-amber-600' },
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * @param {{
 *   calendar: 'school' | 'staff' | 'events',
 *   calendarLabel: string,
 *   accent: 'indigo' | 'emerald' | 'amber',
 * }} props
 */
export default function CalendarMonthView({ calendar, calendarLabel, accent = 'indigo' }) {
  const { staff } = useAuth()
  const { events, loading, error, addEvent, deleteEvent } = useCalendarEvents(calendar)
  const a = ACCENTS[accent] || ACCENTS.indigo

  // Current month view — kept as an anchor date at the 1st of the month so
  // "prev" and "next" are just calendar-safe -1 / +1 arithmetic.
  const [anchor, setAnchor] = useState(() => firstOfMonth(new Date()))

  // Modal state — controls both "create new" and "view existing" flows.
  // Kept as a single object so mutually-exclusive modes can't overlap.
  const [modal, setModal] = useState(
    /** @type {{ mode: 'create' | 'view', date?: Date, event?: any } | null} */ (null)
  )

  const grid = useMemo(() => buildMonthGrid(anchor, events), [anchor, events])
  const monthLabel = anchor.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  function shiftMonth(delta) {
    setAnchor((prev) => {
      const next = new Date(prev)
      next.setMonth(next.getMonth() + delta)
      return firstOfMonth(next)
    })
  }
  function goToToday() {
    setAnchor(firstOfMonth(new Date()))
  }

  async function handleSave(evt) {
    await addEvent({
      ...evt,
      createdBy: staff ? `${staff.first_name || ''} ${staff.last_name || ''}`.trim() : null,
    })
  }

  return (
    <div className="flex flex-col h-[720px]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftMonth(-1)}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => shiftMonth(1)}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={goToToday}
            className="ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Today
          </button>
          <h3 className="ml-3 text-base font-bold text-gray-900">{monthLabel}</h3>
          {loading && (
            <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin ml-2" />
          )}
        </div>
        <button
          onClick={() => setModal({ mode: 'create', date: new Date() })}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white ${a.btn}`}
        >
          <Plus className="w-3.5 h-3.5" />
          New event
        </button>
      </div>

      {/* Error banner — non-blocking, grid still renders under it */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-100 text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}

      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-gray-100 flex-shrink-0">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-[10px] uppercase tracking-wider font-bold text-gray-400 text-center"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid — 6 rows × 7 cols */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1 min-h-0">
        {grid.map((cell, i) => (
          <DayCell
            key={i}
            cell={cell}
            accent={a}
            onDayClick={() => setModal({ mode: 'create', date: cell.date })}
            onEventClick={(evt) => setModal({ mode: 'view', event: evt })}
          />
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <CalendarEventModal
          mode={modal.mode}
          accent={accent}
          calendarLabel={calendarLabel}
          event={modal.event}
          defaultDate={modal.date}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={deleteEvent}
        />
      )}
    </div>
  )
}

// ─── Cell ────────────────────────────────────────────────────────────────────

function DayCell({ cell, accent, onDayClick, onEventClick }) {
  const { date, isCurrentMonth, isToday, events } = cell
  const shown = events.slice(0, 3)
  const overflow = events.length - shown.length

  return (
    <div
      onClick={onDayClick}
      className={`border-r border-b border-gray-100 last:border-r-0 p-1.5 cursor-pointer transition-colors ${
        isCurrentMonth
          ? 'bg-white hover:bg-gray-50'
          : 'bg-gray-50/50 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`inline-flex items-center justify-center w-5 h-5 text-[11px] tabular-nums font-semibold rounded-full ${
            isToday
              ? `text-white ${accent.dot}`
              : isCurrentMonth
                ? 'text-gray-800'
                : 'text-gray-300'
          }`}
        >
          {date.getDate()}
        </span>
      </div>
      <div className="space-y-1">
        {shown.map((evt) => {
          // Multi-day events: show start time only on the start day. On
          // continuation days, prefix a › so it's obvious it's the same
          // event spilling forward.
          const evtStart = new Date(evt.startsAt)
          const isStartDay = isSameDay(evtStart, date)
          const isMultiDay =
            evt.endsAt && !isSameDay(evtStart, new Date(evt.endsAt))
          return (
            <button
              key={evt.id}
              onClick={(e) => {
                e.stopPropagation()
                onEventClick(evt)
              }}
              className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate ${accent.chipBg}`}
              title={evt.title}
            >
              {isStartDay && !evt.allDay && (
                <span className="mr-1 opacity-70">
                  {evtStart.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              )}
              {isMultiDay && !isStartDay && (
                <span className="mr-0.5 opacity-60">›</span>
              )}
              {evt.title}
            </button>
          )
        })}
        {overflow > 0 && (
          <p className="text-[10px] text-gray-400 px-1.5 font-semibold">
            +{overflow} more
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Date + grid math ────────────────────────────────────────────────────────

function firstOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * Build the 6×7 = 42 day-cell grid for the visible month. Each cell knows
 * its date, whether it's part of the current month, whether it's today,
 * and the events that fall on it — including multi-day events, which
 * appear on EVERY covered day (not just the start).
 */
function buildMonthGrid(anchor, events) {
  const firstDayOfWeek = new Date(anchor).getDay() // 0 (Sun) – 6 (Sat)
  const gridStart = new Date(anchor)
  gridStart.setDate(1 - firstDayOfWeek)

  const today = new Date()
  const cells = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + i)
    cells.push({
      date,
      isCurrentMonth: date.getMonth() === anchor.getMonth(),
      isToday: isSameDay(date, today),
      events: events.filter((e) => {
        const start = new Date(e.startsAt)
        const end = e.endsAt ? new Date(e.endsAt) : start
        return isDateInRange(date, start, end)
      }),
    })
  }
  return cells
}

// Inclusive day-level range check. Ignores times so an all-day event ending
// at 23:59:59 on Friday still counts Friday as in-range.
function isDateInRange(date, start, end) {
  const d = startOfDay(date).getTime()
  const s = startOfDay(start).getTime()
  const e = startOfDay(end).getTime()
  return d >= s && d <= e
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}
