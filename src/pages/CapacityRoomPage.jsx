import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Gauge,
  Users,
  ClipboardList,
  Baby,
  Smile,
  BookOpen,
  GraduationCap,
  Sun,
  Dumbbell,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import { getRoomById, COLOR_THEMES } from '../lib/rooms'

/**
 * Per-room community detail page — `/facility/:roomId`.
 *
 * Rename history: Capacity → Facility → Community. The URL stayed at
 * `/facility/:roomId` across the second rename to avoid churning deep
 * links. Filename stayed CapacityRoomPage.jsx for git-history continuity.
 *
 * Placeholder for Phase 1 of the build. The page header and the
 * room's static metadata (name, age range, target ratio, licensed cap)
 * render correctly. The "Today's Roster" section is intentionally a stub
 * — when daily-roster input ships, this is where it lands:
 *
 *   - Date selector (default = today, can scroll back)
 *   - Assigned teacher(s) selector
 *   - Add Child form (name, parent, child-issue notes, parent-issue notes)
 *   - Live ratio chip that updates as children are added
 *
 * Schema sketch (waiting on confirmation before I create the tables):
 *   - `room_daily_assignments` — one row per (room_id, date)
 *   - `room_daily_assignment_teachers` — teachers staffing the room that day
 *   - `room_daily_assignment_children` — one row per child entry, with
 *     issues_child + issues_parent text columns
 */
const ICONS = {
  Baby,
  Smile,
  BookOpen,
  GraduationCap,
  Sun,
  Dumbbell,
}

export default function CapacityRoomPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { mobileMode } = useViewMode()

  const room = getRoomById(roomId)

  // Unknown room id → friendly "not found" state with a way back. Keeps
  // typo'd or stale links from crashing the app.
  if (!room) {
    return (
      <div className={mobileMode ? '' : 'max-w-4xl mx-auto'}>
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate('/facility')}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0"
            title="Back to Community"
            aria-label="Back to Community"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <h1 className={`font-bold text-gray-900 ${mobileMode ? 'text-xl' : 'text-2xl'}`}>
            Room not found
          </h1>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <Gauge className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">
            We couldn't find a room with the id "{roomId}"
          </p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Either the link is stale or the room was renamed. Head back to
            the Community dashboard to pick a room from the tile grid.
          </p>
          <button
            onClick={() => navigate('/facility')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Community
          </button>
        </div>
      </div>
    )
  }

  const Icon = ICONS[room.iconName] || Users
  const theme = COLOR_THEMES[room.accent] || COLOR_THEMES.indigo
  const ratioLabel =
    room.targetRatio != null ? `1 teacher : ${room.targetRatio} children` : '—'
  const capacityLabel =
    room.maxCapacity != null ? `${room.maxCapacity} children max` : 'No licensed cap'

  return (
    <div className={mobileMode ? '' : 'max-w-4xl mx-auto'}>
      {/* Back + Header */}
      <div className="flex items-start gap-3 mb-5">
        <button
          onClick={() => navigate('/facility')}
          className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0 mt-1"
          title="Back to Community"
          aria-label="Back to Community"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 ${theme.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h1
            className={`font-bold text-gray-900 ${
              mobileMode ? 'text-xl' : 'text-2xl'
            }`}
          >
            {room.name}
          </h1>
          <p className="text-sm text-gray-500">
            {room.ageRange} · {ratioLabel}
          </p>
          {room.note && (
            <p className="text-[11px] text-gray-400 italic mt-1">{room.note}</p>
          )}
        </div>
      </div>

      {/* Metadata strip */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Stat label="Age Range" value={room.ageRange} />
          <Stat
            label="Target Ratio"
            value={room.targetRatio != null ? `1 : ${room.targetRatio}` : '—'}
          />
          <Stat label="Licensed Capacity" value={capacityLabel} />
        </div>
      </div>

      {/* Roster placeholder */}
      <div className="bg-white border border-gray-200 rounded-2xl p-7 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3">
          <ClipboardList className="w-6 h-6 text-indigo-600" />
        </div>
        <p className="text-base font-semibold text-gray-900">
          Daily Roster
        </p>
        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
          Coming next: enter each child in the room today, the teacher
          assigned, and any issues with the child or their parent. Live
          headcount and ratio status will update right here on this page
          and on the tile in the Community grid.
        </p>
        <p className="text-[11px] text-gray-400 mt-3">
          Schema design comes after the room list is locked in.
        </p>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
        {label}
      </p>
      <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">{value}</p>
    </div>
  )
}
