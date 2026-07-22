import {
  Baby,
  Smile,
  BookOpen,
  GraduationCap,
  Sun,
  Dumbbell,
  Users,
  AlertTriangle,
  Coffee,
  Sparkles,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import { COLOR_THEMES } from '../lib/rooms'
import { summarizeEnrollment } from '../hooks/useClassrooms'

/**
 * Interactive floor-plan map that mimics the physical layout of the
 * building — the 14 physical rooms are placed in a CSS grid whose cells
 * roughly correspond to where each room actually is (Room 1 bottom-left,
 * Room 14 top-right, etc.). Tapping a classroom tile opens the drawer;
 * support spaces (Teacher Workroom, Student Decompression) are static
 * labeled cells.
 *
 * ── Data source of truth ──
 * Classrooms come from Supabase via useClassrooms() and are keyed by their
 * DB `roomNumber` (1–8 today). To place them on the physical map, we
 * translate that to a `physical_room_number` (1–14) via PHYSICAL_ROOM_MAP.
 * That keeps the Sheet's Room # column and the children.room_number FK
 * untouched — only the map view needs the translation.
 *
 * When a teacher is officially reassigned to a different physical room, the
 * clean fix is to update the classrooms table's `room_number` to match
 * their physical position and re-map every kid's Room # in the Sheet. Until
 * then, this hardcoded map lets the app match the building without
 * churning data.
 *
 * @param {{
 *   rooms: import('../hooks/useClassrooms').Room[],
 *   entriesByRoom: Record<number, { aides?: any[], kids?: any[], incidents?: any[] }>,
 *   onRoomClick: (roomNumber: number) => void,
 * }} props
 */

// ─── Static physical-map data ───────────────────────────────────────────────

// DB roomNumber → physical position on the floor plan. Entries only for
// rooms whose DB number DIFFERS from their physical position (identity
// mappings are the default). Update when classrooms shift.
const PHYSICAL_ROOM_MAP = {
  4: 11, // Joanna (Pre-K 3, 3 yr) → physical Room 11 (3 Year Olds)
  5: 7,  // Sylvia (Pre-K 3, 3 yr) → physical Room 7 (2 Year Olds) — best-fit
  6: 12, // Alexa (Pre-K 4, 3-4 yr) → physical Room 12 (3-4 Year Olds)
  7: 14, // Margo → physical Room 14 (Afterschool 6-12, biggest)
  8: 13, // Abby (After School 5-12 yr) → physical Room 13 (Afterschool 6-12)
}

// Static shape of the physical building — the 12 classroom positions and
// the 2 support-space positions. Each position has:
//   - `area`: CSS grid-area name
//   - `type`: 'classroom' or 'support'
//   - `label` / `sublabel`: static text for support cells; classrooms
//     pull their labels from Supabase data instead.
const PHYSICAL_ROOMS = [
  { position: 4,  area: 'rm4',  type: 'support',   label: 'Student Decompression', icon: Coffee },
  { position: 5,  area: 'rm5',  type: 'support',   label: 'Teacher Workroom',      icon: Coffee },
  // Office cells that live between the classroom clusters. In the
  // physical building these are two small angled rooms; the map shows
  // them as separate cells so their locations read accurately:
  //   - Main Office sits in the toddler↔pre-K office band (row 3 col 5-6)
  //   - Admin Office is a smaller half-width cell tucked into the
  //     walkway between Room 1 and Room 8 (row 4 col 4)
  { position: null, area: 'main',  type: 'support', label: 'Main Office',  icon: Sparkles },
  // Admin Office is intentionally rendered as a compact quarter-size box
  // top-left inside its cell — matches the physical building where Admin
  // is a small angled cutout adjacent to the walkway, not a full-size room.
  { position: null, area: 'admin', type: 'support', label: 'Admin Office', icon: Sparkles, compact: true },
  { position: 1,  area: 'rm1',  type: 'classroom', fallback: { name: 'Infant Room',           ageRange: '0–11 mo' } },
  { position: 2,  area: 'rm2',  type: 'classroom', fallback: { name: 'Older Infant Room',     ageRange: '12–17 mo' } },
  { position: 3,  area: 'rm3',  type: 'classroom', fallback: { name: 'Young Toddler Room',    ageRange: '18 mo–2 yr' } },
  { position: 6,  area: 'rm6',  type: 'classroom', fallback: { name: 'Toddler Room',          ageRange: '2–3 yr' } },
  { position: 7,  area: 'rm7',  type: 'classroom', fallback: { name: 'Toddler Room',          ageRange: '2 yr' } },
  { position: 8,  area: 'rm8',  type: 'classroom', fallback: { name: 'After School',          ageRange: '4–6 yr' } },
  { position: 9,  area: 'rm9',  type: 'classroom', fallback: { name: 'After School',          ageRange: '4–6 yr' } },
  { position: 10, area: 'rm10', type: 'classroom', fallback: { name: 'After School',          ageRange: '6–12 yr' } },
  { position: 11, area: 'rm11', type: 'classroom', fallback: { name: 'Pre-K 3 Room',          ageRange: '3 yr' } },
  { position: 12, area: 'rm12', type: 'classroom', fallback: { name: 'Pre-K 3-4 Room',        ageRange: '3–4 yr' } },
  { position: 13, area: 'rm13', type: 'classroom', fallback: { name: 'After School Room',     ageRange: '6–12 yr' } },
  { position: 14, area: 'rm14', type: 'classroom', fallback: { name: 'After School Room',     ageRange: '6–12 yr' } },
]

// Grid template mirroring the floor plan sketch — 4 rows × 10 cols.
// Every room is 2 cols wide (or wider) so we can align Room 8's left
// edge with the office band and give Rooms 8/9/10 equal width — which
// matches reality: they're all 285 sqft.
//
// Physical-building notes baked into the layout:
//   - Room 14 (960 sqft, biggest afterschool) is the 2×2 top-right anchor.
//   - Room 13 (638 sqft) spans 1×2 in the right side; row 3's height
//     multiplier (see gridTemplateRows below) makes it visually taller
//     than the row-4 afterschool rooms without stealing rows away.
//   - Rooms 8, 9, 10 (all 285 sqft) are each 1×2, equal width, flush
//     with the right wall (cols 5-10).
//   - Room 8's left edge (col 5) lines up exactly with the office band's
//     left edge (col 5) — i.e. Room 8 sits perpendicular to the offices
//     directly above it.
//   - Row 4 cols 3-4 are empty on purpose: the walkway / entrance area
//     between Room 1 (0-11 mo, isolated corner) and the afterschool row.
const GRID_TEMPLATE_AREAS = `
  "rm4 rm4 rm5 rm5 .     .     .    .    rm14 rm14"
  "rm3 rm3 rm6 rm6 .     .     rm12 rm12 rm14 rm14"
  "rm2 rm2 rm7 rm7 main  main  rm11 rm11 rm13 rm13"
  "rm1 rm1 admin .   rm8 rm8   rm9  rm9  rm10 rm10"
`

const ICONS = { Baby, Smile, BookOpen, GraduationCap, Sun, Dumbbell, Users }

export default function FacilityFloorPlan({ rooms, entriesByRoom, onRoomClick }) {
  const { mobileMode } = useViewMode()
  const summary = summarizeEnrollment(rooms)

  // Index rooms by their physical position for O(1) cell lookup.
  const roomByPhysical = new Map()
  for (const room of rooms) {
    const physical = PHYSICAL_ROOM_MAP[room.roomNumber] ?? room.roomNumber
    roomByPhysical.set(physical, room)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
      {/* Summary strip */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
          Facility Map · tap any room to open details
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

      {/* Map — horizontal scroll on narrow screens so the spatial layout is
          preserved rather than collapsing to a vertical list. On mobile it's
          expected to swipe sideways to see the whole building. */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div
          className="grid gap-2 min-w-[900px]"
          style={{
            gridTemplateColumns: 'repeat(10, minmax(78px, 1fr))',
            // Row 3 is 1.4× taller so Room 13 (Mrs. Abby) reads as the
            // larger afterschool room it actually is (638 sqft vs 285
            // sqft for the row-4 afterschool trio). rm2/rm7/offices/rm11
            // share the same row so they get taller too, which happens
            // to match their physical footprints being mid-size rooms.
            gridTemplateRows: '1fr 1fr 1.4fr 1fr',
            gridAutoRows: 'minmax(112px, 1fr)',
            gridTemplateAreas: GRID_TEMPLATE_AREAS,
          }}
        >
          {PHYSICAL_ROOMS.map((cell) => {
            if (cell.type === 'support') {
              return <SupportCell key={cell.position} cell={cell} />
            }
            const room = roomByPhysical.get(cell.position)
            if (!room) {
              return (
                <PlaceholderCell
                  key={cell.position}
                  cell={cell}
                />
              )
            }
            return (
              <RoomRegion
                key={cell.position}
                area={cell.area}
                physicalPosition={cell.position}
                room={room}
                entry={entriesByRoom[room.roomNumber]}
                onClick={() => onRoomClick(room.roomNumber)}
              />
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-3 flex-wrap text-[10px] text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-white border border-gray-300" />
          Classroom
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-gray-100 border border-gray-300" />
          Support space
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded border border-dashed border-gray-300" />
          Unassigned (add a teacher in Supabase)
        </span>
      </div>
    </div>
  )
}

// ─── Cell variants ──────────────────────────────────────────────────────────

// Interactive classroom tile — the main content of the map.
function RoomRegion({ area, physicalPosition, room, entry, onClick }) {
  const Icon = ICONS[room.iconName] || Users
  const theme = COLOR_THEMES[room.accent] || COLOR_THEMES.indigo

  const aideCount = entry?.aides?.length || 0
  const kidCount = entry?.kids?.length || 0
  const incidentCount = entry?.incidents?.length || 0

  const enrolled = room.enrolled ?? 0
  const cap = room.maxCapacity
  const knownCap = cap != null
  const pct = knownCap && cap > 0 ? Math.min(100, Math.round((enrolled / cap) * 100)) : 0
  const isFull = knownCap && enrolled >= cap

  // Whether this classroom's Supabase roomNumber matches its physical
  // position (rooms 1-3) or is placed via PHYSICAL_ROOM_MAP (rooms 4-8).
  // Different label so admins know which is which.
  const isMappedFromElsewhere = physicalPosition !== room.roomNumber

  return (
    <button
      onClick={onClick}
      style={{ gridArea: area }}
      className={`text-left bg-white border-l-4 ${theme.border} border-y border-r border-gray-200 rounded-lg p-2.5 hover:border-indigo-300 hover:shadow-sm transition-all group min-w-0 flex flex-col ${
        incidentCount > 0 ? 'ring-1 ring-orange-200' : ''
      }`}
    >
      {/* Top row — physical room number + teacher */}
      <div className="flex items-start gap-1.5 mb-1">
        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${theme.icon}`}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400 leading-none">
            Room {physicalPosition}
          </p>
          <p className="text-xs font-bold text-gray-900 leading-tight truncate">
            {room.teacherTitle} {room.teacherName}
          </p>
        </div>
      </div>

      {/* Age range */}
      <p className="text-[10px] text-gray-500 truncate leading-tight mb-1">
        {room.ageRange}
      </p>

      {/* Enrollment — compact */}
      <div className="flex items-baseline gap-1 mb-1 mt-auto">
        <span className={`text-base font-bold tabular-nums leading-none ${
          isFull ? 'text-amber-600' : 'text-gray-900'
        }`}>
          {enrolled}
        </span>
        <span className="text-[10px] text-gray-400 tabular-nums leading-none">
          / {knownCap ? cap : '—'}
        </span>
        {isFull && (
          <span className="text-[9px] text-amber-700 font-bold ml-auto">FULL</span>
        )}
      </div>

      {/* Progress bar or chips row */}
      {knownCap && !isFull && (
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${theme.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {(aideCount > 0 || kidCount > 0 || incidentCount > 0) && (
        <div className="flex flex-wrap items-center gap-1 pt-1.5 mt-1 border-t border-gray-100">
          {aideCount > 0 && <TinyChip icon={Users} value={aideCount} />}
          {kidCount > 0 && <TinyChip icon={Baby} value={kidCount} />}
          {incidentCount > 0 && (
            <TinyChip icon={AlertTriangle} value={incidentCount} tone="orange" />
          )}
        </div>
      )}

      {/* Footnote when the Supabase room# differs from physical position —
          admins glance at the tile and know the app is showing them the
          teacher who "actually" works this physical room, not literally
          Room #{roomNumber from DB}. */}
      {isMappedFromElsewhere && (
        <p className="text-[8px] text-gray-300 italic mt-0.5">
          DB Room #{room.roomNumber}
        </p>
      )}
    </button>
  )
}

// A physical classroom the DB has no row for yet — greyed dashed border
// prompts an admin to seed it. Kept clickable-less for now; a future
// enhancement could open an "Assign teacher" quick action.
function PlaceholderCell({ cell }) {
  return (
    <div
      style={{ gridArea: cell.area }}
      className="border-2 border-dashed border-gray-200 rounded-lg p-2.5 flex flex-col items-start justify-between min-w-0"
    >
      <div>
        <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400 leading-none">
          Room {cell.position}
        </p>
        <p className="text-xs font-semibold text-gray-400 leading-tight mt-0.5">
          {cell.fallback?.name || 'Unassigned'}
        </p>
        <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
          {cell.fallback?.ageRange || ''}
        </p>
      </div>
      <p className="text-[9px] text-gray-300 italic">No teacher assigned</p>
    </div>
  )
}

// Non-classroom cells (Student Decompression, Teacher Workroom, offices)
// — visually distinct from classrooms so nobody mistakes them for empty
// tiles. Offices have no room number; the label alone identifies them.
//
// `compact` cells (Admin Office) render a smaller inner box in the
// top-left corner of the grid cell — the surrounding whitespace stays
// unfilled to make the box read as "smaller than the other tiles" at
// a glance.
function SupportCell({ cell }) {
  const Icon = cell.icon || Coffee
  if (cell.compact) {
    return (
      <div
        style={{ gridArea: cell.area }}
        className="flex items-start justify-start min-w-0"
      >
        <div className="bg-gray-100 border border-gray-200 rounded-md px-2 py-1.5 w-[62%] h-[62%] min-h-[68px] flex flex-col items-center justify-center text-center">
          <div className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center mb-0.5">
            <Icon className="w-3 h-3 text-gray-500" />
          </div>
          <p className="text-[9px] font-semibold text-gray-600 leading-tight">
            {cell.label}
          </p>
        </div>
      </div>
    )
  }
  return (
    <div
      style={{ gridArea: cell.area }}
      className="bg-gray-100 border border-gray-200 rounded-lg p-2.5 flex flex-col items-center justify-center text-center min-w-0"
    >
      <div className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center mb-1">
        <Icon className="w-3.5 h-3.5 text-gray-500" />
      </div>
      <p className="text-[10px] font-semibold text-gray-600 leading-tight">
        {cell.label}
      </p>
      {cell.position != null && (
        <p className="text-[9px] text-gray-400 leading-tight mt-0.5">
          Room {cell.position}
        </p>
      )}
    </div>
  )
}

function TinyChip({ icon: Icon, value, tone = 'default' }) {
  const tones = {
    default: 'bg-gray-50 border-gray-200 text-gray-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  }
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-0.5 rounded border ${tones[tone]}`}
    >
      <Icon className="w-2.5 h-2.5" />
      <span className="tabular-nums">{value}</span>
    </span>
  )
}
