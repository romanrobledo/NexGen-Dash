import { useState, useEffect } from 'react'
import {
  X,
  UserPlus,
  UserRound,
  Baby,
  Users,
  AlertTriangle,
  Trash2,
  Plus,
  Sparkles,
  BookMarked,
  CheckCircle2,
  CircleSlash,
} from 'lucide-react'
import { COLOR_THEMES } from '../lib/rooms'
import { formatAge } from '../hooks/useChildren'

/**
 * Right-side slide-in panel opened by clicking a room tile on the facility
 * floor plan. Lets you add teachers (with position), children, and per-room
 * incident reports for the day.
 *
 * All state is lifted to the parent page (FacilityMapPage) — this drawer
 * only owns the local form inputs. Every list mutation goes through the
 * `onUpdate(next)` callback so the parent can update its store and re-flow
 * the floor plan badges + eventually build the Google Sheets payload.
 *
 * Standard childcare position labels; edit here if the center uses a
 * different vocabulary.
 */
export const TEACHER_POSITIONS = [
  'Lead Teacher',
  'Assistant Teacher',
  'Aide',
  'Floater',
  'Substitute',
]

const INCIDENT_SEVERITIES = [
  { key: 'minor',    label: 'Minor',    chipClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotClass: 'bg-emerald-500' },
  { key: 'moderate', label: 'Moderate', chipClass: 'bg-amber-50 text-amber-700 border-amber-200',       dotClass: 'bg-amber-500'  },
  { key: 'major',    label: 'Major',    chipClass: 'bg-orange-50 text-orange-700 border-orange-200',    dotClass: 'bg-orange-500' },
  { key: 'critical', label: 'Critical', chipClass: 'bg-red-50 text-red-700 border-red-200',             dotClass: 'bg-red-500'    },
]

/**
 * @param {{
 *   room: import('../hooks/useClassrooms').Room | null,
 *   entry: { teachers: any[], kids: any[], incidents: any[] } | null,
 *   enrolledChildren?: import('../hooks/useChildren').Child[],
 *   attendance?: Record<string, 'absent'>,
 *   onToggleAttendance?: (childId: string) => void,
 *   onClose: () => void,
 *   onUpdate: (next: { teachers: any[], kids: any[], incidents: any[] }) => void,
 * }} props
 */
export default function RoomDetailDrawer({
  room,
  entry,
  enrolledChildren = [],
  attendance = {},
  onToggleAttendance,
  onClose,
  onUpdate,
}) {
  // Local form state — cleared each time the drawer opens for a new room.
  const [teacherName, setTeacherName] = useState('')
  const [teacherPos, setTeacherPos] = useState(TEACHER_POSITIONS[0])
  const [kidName, setKidName] = useState('')
  const [incidentSev, setIncidentSev] = useState('minor')
  const [incidentDesc, setIncidentDesc] = useState('')

  useEffect(() => {
    if (room) {
      setTeacherName('')
      setTeacherPos(TEACHER_POSITIONS[0])
      setKidName('')
      setIncidentSev('minor')
      setIncidentDesc('')
    }
  }, [room])

  // Close drawer with ESC — expected keyboard affordance for slide-in panels.
  useEffect(() => {
    if (!room) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [room, onClose])

  if (!room || !entry) return null

  const theme = COLOR_THEMES[room.accent] || COLOR_THEMES.indigo

  function addTeacher() {
    const trimmed = teacherName.trim()
    if (!trimmed) return
    onUpdate({
      ...entry,
      teachers: [
        ...entry.teachers,
        { id: makeId(), name: trimmed, position: teacherPos },
      ],
    })
    setTeacherName('')
  }

  function removeTeacher(id) {
    onUpdate({ ...entry, teachers: entry.teachers.filter((t) => t.id !== id) })
  }

  function addKid() {
    const trimmed = kidName.trim()
    if (!trimmed) return
    onUpdate({
      ...entry,
      kids: [...entry.kids, { id: makeId(), name: trimmed }],
    })
    setKidName('')
  }

  function removeKid(id) {
    onUpdate({ ...entry, kids: entry.kids.filter((k) => k.id !== id) })
  }

  function addIncident() {
    const trimmed = incidentDesc.trim()
    if (!trimmed) return
    onUpdate({
      ...entry,
      incidents: [
        ...entry.incidents,
        {
          id: makeId(),
          severity: incidentSev,
          description: trimmed,
          at: new Date().toISOString(),
        },
      ],
    })
    setIncidentSev('minor')
    setIncidentDesc('')
  }

  function removeIncident(id) {
    onUpdate({
      ...entry,
      incidents: entry.incidents.filter((i) => i.id !== id),
    })
  }

  // Live ratio calculation — teacher-to-child math. If the room has a
  // target ratio and there's at least one teacher, we can flag over/under.
  const kidCount = entry.kids.length
  const teacherCount = entry.teachers.length
  const ratioNumber = teacherCount > 0 ? kidCount / teacherCount : null
  const overRatio =
    room.targetRatio != null &&
    ratioNumber != null &&
    ratioNumber > room.targetRatio

  return (
    <>
      {/* Backdrop — clicking closes. */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 h-full w-full sm:w-[520px] bg-white z-50 shadow-2xl flex flex-col"
        role="dialog"
        aria-label={`${room.name} details`}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-200">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${theme.icon}`}
          >
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
              Room #{room.roomNumber}
            </p>
            <h2 className="text-lg font-bold text-gray-900 truncate leading-tight">
              {room.teacherTitle} {room.teacherName}
            </h2>
            <p className="text-xs text-gray-500 truncate">
              {room.name} · {room.ageRange}
              {room.targetRatio != null && ` · target 1 : ${room.targetRatio}`}
              {room.maxCapacity != null && ` · cap ${room.maxCapacity}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex-shrink-0"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live ratio strip */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-4 text-xs">
          <span className="text-gray-500">
            <strong className="text-gray-900 tabular-nums">{teacherCount}</strong> teacher{teacherCount === 1 ? '' : 's'}
          </span>
          <span className="text-gray-500">
            <strong className="text-gray-900 tabular-nums">{kidCount}</strong> {kidCount === 1 ? 'child' : 'children'}
          </span>
          {ratioNumber != null && (
            <span
              className={`ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-semibold text-[11px] ${
                overRatio
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  overRatio ? 'bg-red-500' : 'bg-emerald-500'
                }`}
              />
              1 : {ratioNumber.toFixed(1)} {overRatio ? 'over ratio' : 'under ratio'}
            </span>
          )}
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Enrolled Roster — roster comes from Supabase (Sheet-synced,
              read-only), but attendance IS mutable in-app. Click a row to
              toggle a child between Present (default) and Absent. Absent
              kids are captured in the Submit Daily Report payload for
              Google Sheets. The roster itself doesn't change — that stays
              in the Sheet. */}
          {(() => {
            const absentCount = enrolledChildren.filter(
              (c) => attendance[c.id] === 'absent'
            ).length
            const presentCount = enrolledChildren.length - absentCount
            return (
              <Section
                title="Enrolled Roster"
                icon={BookMarked}
                count={enrolledChildren.length}
                subtitle={
                  enrolledChildren.length > 0
                    ? `Tap to mark absent · ${presentCount} present${absentCount > 0 ? ` · ${absentCount} absent` : ''}`
                    : 'From Google Sheet · read-only in app'
                }
              >
                {enrolledChildren.length === 0 ? (
                  <EmptyLine text="No children enrolled in this room yet." />
                ) : (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {enrolledChildren.map((c) => {
                      const age = formatAge(c.dateOfBirth)
                      const isAbsent = attendance[c.id] === 'absent'
                      return (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => onToggleAttendance && onToggleAttendance(c.id)}
                            className={`w-full text-left flex items-start gap-2 border rounded-lg px-3 py-2 text-sm transition-colors ${
                              isAbsent
                                ? 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                            aria-pressed={isAbsent}
                            title={isAbsent ? 'Marked absent — tap to mark present' : 'Present — tap to mark absent'}
                          >
                            {isAbsent ? (
                              <CircleSlash className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p
                                className={`truncate leading-tight ${
                                  isAbsent
                                    ? 'text-amber-800 line-through'
                                    : 'text-gray-900'
                                }`}
                              >
                                {c.fullName}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                {age && <span>{age}</span>}
                                {c.onCcms && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    CCMS
                                  </span>
                                )}
                                {isAbsent && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-semibold">
                                    Absent
                                  </span>
                                )}
                              </p>
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </Section>
            )
          })()}

          {/* Teachers */}
          <Section title="Teachers" icon={UserRound} count={teacherCount}>
            {entry.teachers.length === 0 ? (
              <EmptyLine text="No teachers added yet." />
            ) : (
              <ul className="space-y-1.5 mb-3">
                {entry.teachers.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <UserRound className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-900 truncate">
                      {t.name}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex-shrink-0">
                      {t.position}
                    </span>
                    <button
                      onClick={() => removeTeacher(t.id)}
                      className="ml-auto p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                      title="Remove"
                      aria-label="Remove teacher"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addTeacher()
                }}
                placeholder="Teacher name"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
              />
              <select
                value={teacherPos}
                onChange={(e) => setTeacherPos(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
              >
                {TEACHER_POSITIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <button
                onClick={addTeacher}
                disabled={!teacherName.trim()}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add
              </button>
            </div>
          </Section>

          {/* Kids */}
          <Section title="Children" icon={Baby} count={kidCount}>
            {entry.kids.length === 0 ? (
              <EmptyLine text="No children added yet." />
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
                {entry.kids.map((k) => (
                  <li
                    key={k.id}
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <Baby className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 truncate flex-1">{k.name}</span>
                    <button
                      onClick={() => removeKid(k.id)}
                      className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                      title="Remove"
                      aria-label="Remove child"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={kidName}
                onChange={(e) => setKidName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addKid()
                }}
                placeholder="Child name"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
              />
              <button
                onClick={addKid}
                disabled={!kidName.trim()}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </Section>

          {/* Incidents (room-specific) */}
          <Section title="Room Incidents" icon={AlertTriangle} count={entry.incidents.length}>
            {entry.incidents.length === 0 ? (
              <EmptyLine text="No incidents reported for this room today." />
            ) : (
              <ul className="space-y-2 mb-3">
                {entry.incidents.map((i) => {
                  const sev = INCIDENT_SEVERITIES.find((s) => s.key === i.severity) || INCIDENT_SEVERITIES[0]
                  return (
                    <li
                      key={i.id}
                      className="bg-white border border-gray-200 rounded-lg p-3 text-sm"
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${sev.chipClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sev.dotClass}`} />
                          {sev.label}
                        </span>
                        <span className="text-[11px] text-gray-400 ml-auto flex-shrink-0">
                          {formatTime(i.at)}
                        </span>
                        <button
                          onClick={() => removeIncident(i.id)}
                          className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                          title="Remove"
                          aria-label="Remove incident"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {i.description}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
            <div className="space-y-2">
              <select
                value={incidentSev}
                onChange={(e) => setIncidentSev(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
              >
                {INCIDENT_SEVERITIES.map((s) => (
                  <option key={s.key} value={s.key}>{s.label} severity</option>
                ))}
              </select>
              <textarea
                value={incidentDesc}
                onChange={(e) => setIncidentDesc(e.target.value)}
                placeholder="What happened? Who was involved? What action was taken?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none resize-none"
              />
              <button
                onClick={addIncident}
                disabled={!incidentDesc.trim()}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                Log Incident
              </button>
            </div>
          </Section>
        </div>
      </aside>
    </>
  )
}

// ─── Small helpers ───────────────────────────────────────────────────────────

function Section({ title, icon: Icon, count, subtitle, children }) {
  return (
    <section className="px-5 py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-gray-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {title}
        </h3>
        <span className="text-[11px] font-semibold text-gray-400 tabular-nums">
          ({count})
        </span>
      </div>
      {subtitle && (
        <p className="text-[10px] text-gray-400 italic mb-2 ml-6">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-2" />}
      {children}
    </section>
  )
}

function EmptyLine({ text }) {
  return (
    <p className="text-xs text-gray-400 italic mb-3">{text}</p>
  )
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return ''
  }
}

// Non-crypto id generator — random enough for local-only state, no need for
// uuid weight until this data starts syncing to Supabase.
function makeId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
