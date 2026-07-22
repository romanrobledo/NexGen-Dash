import { useNavigate } from 'react-router-dom'
import {
  Gauge,
  ChevronRight,
  Baby,
  Smile,
  BookOpen,
  GraduationCap,
  Sun,
  Dumbbell,
  Users,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import { COLOR_THEMES } from '../lib/rooms'
import { useClassrooms } from '../hooks/useClassrooms'

/**
 * Community dashboard — `/facility`.
 *
 * Rename history: Capacity → Facility → Community. Filename stayed
 * CapacityPage.jsx and URL stayed `/facility` across the second rename to
 * avoid churning deep links every time the menu label evolves. Only the
 * user-visible strings (page title, back button, empty-state copy) reflect
 * the current label.
 *
 * Renders one clickable tile per room in src/lib/rooms.js. Each tile shows
 * the room's name, age range, target teacher-to-child ratio, and licensed
 * cap. Once daily-roster input ships, each tile will also display today's
 * live snapshot (children present, teachers assigned, status pill: under /
 * at / over ratio). Until then, the per-tile snapshot reads "No roster
 * submitted yet today" so admins know what's missing rather than thinking
 * the data is missing because of a bug.
 *
 * Clicking a tile navigates to /facility/:roomId where the per-day child
 * detail entries will live.
 */

// Icon name → lucide component. Adding a new icon here lets you reference
// it by string in src/lib/rooms.js without touching this page.
const ICONS = {
  Baby,
  Smile,
  BookOpen,
  GraduationCap,
  Sun,
  Dumbbell,
}

export default function CapacityPage() {
  const navigate = useNavigate()
  const { mobileMode } = useViewMode()
  const { rooms, loading, error } = useClassrooms()

  return (
    <div className={mobileMode ? '' : 'max-w-6xl mx-auto'}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-sm">
          <Gauge className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0">
          <h1
            className={`font-bold text-gray-900 ${
              mobileMode ? 'text-xl' : 'text-2xl'
            }`}
          >
            Community
          </h1>
          <p className="text-sm text-gray-500">
            Every room at a glance — headcount, ratios, and who's on the floor.
          </p>
        </div>
      </div>

      {/* Helper strip: explains that data isn't flowing yet so tiles don't
          look broken. Will be removed (or repurposed for "Total today"
          aggregate stats) once daily-roster input is live. */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Users className="w-4 h-4 text-amber-700" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-900">
            Daily roster input is coming next
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            Once we wire that up, each tile will show today's live headcount,
            assigned teachers, ratio status, and any flagged issues. For now
            tiles show the room's target ratio + licensed capacity.
          </p>
        </div>
      </div>

      {/* Tile grid — loading / error / empty states first, then the grid */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 flex items-center justify-center gap-3 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          <span className="text-sm">Loading classrooms…</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-red-700">Couldn't load classrooms</p>
            <p className="text-xs text-red-500 mt-0.5">{error}</p>
          </div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <p className="text-sm font-semibold text-gray-700">No classrooms yet</p>
          <p className="text-xs text-gray-500 mt-1">
            The <code>classrooms</code> table is empty. Seed it in Supabase or
            wait for the next n8n sync.
          </p>
        </div>
      ) : (
      <div
        className={`grid gap-3 ${
          mobileMode
            ? 'grid-cols-1'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {rooms.map((room) => {
          const Icon = ICONS[room.iconName] || Users
          const theme = COLOR_THEMES[room.accent] || COLOR_THEMES.indigo
          const ratioLabel =
            room.targetRatio != null ? `1 : ${room.targetRatio}` : '—'
          const capacityLabel =
            room.maxCapacity != null ? `${room.maxCapacity} max` : 'No cap'

          return (
            <button
              key={room.id}
              onClick={() => navigate(`/facility/${room.roomNumber}`)}
              className={`text-left bg-white border border-gray-200 border-l-4 ${theme.border} rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all group min-w-0`}
            >
              {/* Top row — icon + name + chevron */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${theme.icon}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-gray-900 leading-snug truncate">
                      {room.name}
                    </h4>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {room.ageRange}
                  </p>
                </div>
              </div>

              {/* Ratio + capacity strip */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    Target Ratio
                  </p>
                  <p className="text-sm font-bold text-gray-900 tabular-nums">
                    {ratioLabel}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    Capacity
                  </p>
                  <p className="text-sm font-bold text-gray-900 tabular-nums">
                    {capacityLabel}
                  </p>
                </div>
              </div>

              {/* Today snapshot (empty state for now) */}
              <div className="pt-3 border-t border-dashed border-gray-200">
                <p className="text-[11px] text-gray-400">
                  No roster submitted yet today
                </p>
              </div>

              {/* Optional note (e.g., Gym / After School subtitles) */}
              {room.note && (
                <p className="text-[10px] text-gray-400 italic mt-2 line-clamp-2">
                  {room.note}
                </p>
              )}
            </button>
          )
        })}
      </div>
      )}
    </div>
  )
}
