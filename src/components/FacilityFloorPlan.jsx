import {
  Baby,
  Smile,
  BookOpen,
  GraduationCap,
  Sun,
  Dumbbell,
  Users,
  AlertTriangle,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import { COLOR_THEMES } from '../lib/rooms'
import { summarizeEnrollment } from '../hooks/useClassrooms'

/**
 * Floor-plan grid of clickable classroom tiles. Each tile shows:
 *   - Room # + teacher (large: "Room #1 · Mrs. Ruth")
 *   - Room type + age range (small: "Infant Room · 0–11 mo")
 *   - Enrollment (X / Y with "full" / "% capacity" / "capacity unknown")
 *   - Colored progress bar accented to the age group
 *   - Live daily chips: teachers on floor / kids present / incidents count
 *
 * `rooms` comes from the parent's useClassrooms() call so this component
 * stays purely presentational — no data-fetching in here. Clicking a tile
 * fires onRoomClick(roomNumber); the parent uses that to open the drawer
 * and to key its per-room state map.
 *
 * @param {{
 *   rooms: import('../hooks/useClassrooms').Room[],
 *   entriesByRoom: Record<number, { teachers: any[], kids: any[], incidents: any[] }>,
 *   onRoomClick: (roomNumber: number) => void,
 * }} props
 */
const ICONS = { Baby, Smile, BookOpen, GraduationCap, Sun, Dumbbell, Users }

export default function FacilityFloorPlan({ rooms, entriesByRoom, onRoomClick }) {
  const { mobileMode } = useViewMode()
  const summary = summarizeEnrollment(rooms)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
      {/* Summary strip — matches the reference format:
          "65 enrolled · 98 seats across 7 rooms (1 unknown)" */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
          Classrooms · tap any room to open details
        </p>
        <p className="text-[11px] font-semibold text-gray-500 tabular-nums">
          <span className="text-gray-900">{summary.enrolled}</span> enrolled
          <span className="text-gray-300 mx-1.5">·</span>
          <span className="text-gray-900">{summary.capacity}</span> seats across{' '}
          <span className="text-gray-900">{summary.roomsWithKnownCap}</span> rooms
          {summary.roomsWithUnknownCap > 0 && (
            <span className="text-gray-400">
              {' '}({summary.roomsWithUnknownCap} unknown)
            </span>
          )}
        </p>
      </div>

      {/* Rooms grid — one tile per room from Supabase. Responsive layout:
          single column on mobile, 2-col on tablet, 4-col on desktop. */}
      <div
        className={`grid gap-2.5 ${
          mobileMode
            ? 'grid-cols-1'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {rooms.map((room) => (
          <RoomRegion
            key={room.id}
            room={room}
            entry={entriesByRoom[room.roomNumber]}
            onClick={() => onRoomClick(room.roomNumber)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Single-room region ──────────────────────────────────────────────────────

function RoomRegion({ room, entry, onClick }) {
  const Icon = ICONS[room.iconName] || Users
  const theme = COLOR_THEMES[room.accent] || COLOR_THEMES.indigo

  // Live daily counts from the drawer state
  const teacherCount = entry?.teachers?.length || 0
  const kidCount = entry?.kids?.length || 0
  const incidentCount = entry?.incidents?.length || 0

  // Baseline enrollment stats
  const enrolled = room.enrolled ?? 0
  const cap = room.maxCapacity
  const knownCap = cap != null
  const pct = knownCap && cap > 0 ? Math.min(100, Math.round((enrolled / cap) * 100)) : 0
  const isFull = knownCap && enrolled >= cap
  const openSeats = knownCap ? Math.max(0, cap - enrolled) : null

  // Live-daily over-ratio warning (kids per teacher > target)
  const overRatio =
    room.targetRatio != null &&
    teacherCount > 0 &&
    kidCount / teacherCount > room.targetRatio

  return (
    <button
      onClick={onClick}
      className={`text-left bg-gray-50 border border-gray-200 rounded-xl p-3.5 hover:border-indigo-300 hover:shadow-sm transition-all group min-w-0 ${
        incidentCount > 0 ? 'ring-1 ring-orange-200' : ''
      }`}
    >
      {/* Top row — icon + room #/teacher */}
      <div className="flex items-start gap-2 mb-2">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${theme.icon}`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
            Room #{room.roomNumber}
          </p>
          <p className="text-sm font-bold text-gray-900 leading-tight truncate">
            {room.teacherTitle} {room.teacherName}
          </p>
        </div>
      </div>

      {/* Room type + age range */}
      <p className="text-[11px] text-gray-500 mb-2 truncate">
        {room.name} · {room.ageRange}
      </p>

      {/* Enrollment display — X / Y with status line */}
      <div className="mb-2">
        <div className="flex items-baseline gap-1 mb-0.5">
          <span className={`text-xl font-bold tabular-nums ${
            isFull ? 'text-amber-600' : 'text-gray-900'
          }`}>
            {enrolled}
          </span>
          <span className="text-xs text-gray-400 tabular-nums">
            / {knownCap ? cap : '—'}
          </span>
        </div>
        <p className="text-[11px] text-gray-500 tabular-nums">
          {!knownCap ? (
            <span className="text-gray-400 italic">capacity unknown</span>
          ) : isFull ? (
            <span className="text-amber-700 font-semibold">full</span>
          ) : (
            <>
              {openSeats} open <span className="text-gray-300 mx-0.5">·</span> {pct}%
            </>
          )}
        </p>
      </div>

      {/* Progress bar — hidden when capacity is unknown */}
      {knownCap && (
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mb-2.5">
          <div
            className={`h-full transition-all duration-500 ${theme.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* Live daily chips — only render when data has been entered so a
          fresh tile stays visually clean. Incident chip always appears if
          count > 0 so it can't be missed. */}
      {(teacherCount > 0 || kidCount > 0 || incidentCount > 0) && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-200">
          {teacherCount > 0 && (
            <StatChip icon={Users} value={teacherCount} label="teachers today" />
          )}
          {kidCount > 0 && (
            <StatChip
              icon={Baby}
              value={kidCount}
              label="kids today"
              tone={overRatio ? 'red' : 'default'}
            />
          )}
          {incidentCount > 0 && (
            <StatChip
              icon={AlertTriangle}
              value={incidentCount}
              label="incidents"
              tone="orange"
            />
          )}
        </div>
      )}
    </button>
  )
}

function StatChip({ icon: Icon, value, label, tone = 'default' }) {
  const tones = {
    default: 'bg-white border-gray-200 text-gray-700',
    red:     'bg-red-50 border-red-200 text-red-700',
    orange:  'bg-orange-50 border-orange-200 text-orange-700',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${tones[tone]}`}
      title={`${value} ${label}`}
    >
      <Icon className="w-3 h-3" />
      <span className="tabular-nums">{value}</span>
    </span>
  )
}
