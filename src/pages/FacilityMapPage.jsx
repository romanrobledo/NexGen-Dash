import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Map,
  AlertTriangle,
  Send,
  UsersRound,
  Baby,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  X,
  LogIn,
  LogOut,
  ChevronRight,
  Gauge,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import { useClassrooms, findRoomByNumber } from '../hooks/useClassrooms'
import { useChildren } from '../hooks/useChildren'
import FacilityFloorPlan from '../components/FacilityFloorPlan'
import RoomDetailDrawer from '../components/RoomDetailDrawer'
import CohortDrawer from '../components/CohortDrawer'

/**
 * Facility Map page — `/facility-map`.
 *
 * The daily "what's happening in the building" view. Three surfaces
 * stacked vertically:
 *   1. Facility floor plan — one region per room in src/lib/rooms.js.
 *      Click a room to open a drawer for adding kids, teachers with their
 *      position, and per-room incident reports.
 *   2. Family / parent incidents — a flat list below the map for issues
 *      that aren't room-scoped (dropoff conflicts, custody concerns,
 *      allergy updates, etc.).
 *   3. Submit Daily Report — collects the whole page's data into one
 *      payload for the eventual Google Sheets webhook.
 *
 * Phase 1 (this file):
 *   - All state is React-local; refreshing the page clears it. That's
 *     intentional — this is a UI prototype, not a system of record. We
 *     don't want partial data leaking into a half-wired backend.
 *   - "Submit Daily Report" builds the payload, shows a confirmation
 *     summary modal, and is a no-op on confirm (toast: "Google Sheets
 *     webhook wiring is Phase 2").
 *
 * Phase 2 (to build after UI is honed):
 *   - Persist the payload to Supabase (`facility_daily_reports` table +
 *     row-per-room / row-per-incident child tables).
 *   - Fire a Google Sheets webhook (probably via n8n, matching the
 *     existing AI Chat + Data Integrity webhook pattern).
 *   - Load today's report on mount so someone can start entering at
 *     dropoff and someone else can finish at pickup.
 */

const FAMILY_SEVERITIES = [
  { key: 'info',      label: 'Info',      chipClass: 'bg-blue-50 text-blue-700 border-blue-200',       dotClass: 'bg-blue-500'    },
  { key: 'moderate',  label: 'Moderate',  chipClass: 'bg-amber-50 text-amber-700 border-amber-200',    dotClass: 'bg-amber-500'   },
  { key: 'major',     label: 'Major',     chipClass: 'bg-orange-50 text-orange-700 border-orange-200', dotClass: 'bg-orange-500'  },
  { key: 'critical',  label: 'Critical',  chipClass: 'bg-red-50 text-red-700 border-red-200',          dotClass: 'bg-red-500'     },
]

// n8n webhook URL that receives the daily report payload and appends a row
// to the "Daily Reports" tab of the NexGen Facility Google Sheet. Set in
// Vercel env vars + local .env.local as VITE_FACILITY_DAILY_REPORT_WEBHOOK.
// If unset, Submit falls back to logging the payload to the console.
const DAILY_REPORT_WEBHOOK =
  import.meta.env.VITE_FACILITY_DAILY_REPORT_WEBHOOK || ''

// Who can submit the end-of-day report. Hardcoded on purpose — a full
// `staff` table is future work; the "Someone else…" branch on the modal
// covers subs and one-off submitters (their typed name lands in the Sheet).
const PRESET_SUBMITTERS = ['Robyn', 'Rachel', 'Abby']

// Per-day localStorage keys — attendance marks and the "submitted" banner
// need to survive a page refresh but reset at midnight. Namespacing by
// today's date does that without a scheduled rollover job; yesterday's
// keys just orphan and get cleaned up eventually by browser storage limits.
const todayKey = () => new Date().toISOString().slice(0, 10)
const attendanceStorageKey = () => `facility.attendance.${todayKey()}`
const submittedStorageKey = () => `facility.submittedInfo.${todayKey()}`
const entriesStorageKey = () => `facility.entriesByRoom.${todayKey()}`
const familyIncidentsStorageKey = () => `facility.familyIncidents.${todayKey()}`
const teacherStatusStorageKey = () => `facility.teacherStatus.${todayKey()}`

// Time-of-day → report period. Bounds picked with childcare rhythm in mind:
// morning report by ~11:30 (before lunch/nap), afternoon by ~4 (before pickup
// wave), closing after that. The user can override in the modal.
function detectPeriod() {
  const now = new Date()
  const decimal = now.getHours() + now.getMinutes() / 60
  if (decimal < 11.5) return 'morning'
  if (decimal < 16) return 'afternoon'
  return 'closing'
}

const PERIOD_LABELS = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  closing: 'Closing',
}

// Only 'present' has no reason-required UI; the other three reveal a
// text field. Order here drives the drawer button row + payload enum.
const TEACHER_STATUSES = [
  { key: 'present',  label: 'Present',  tone: 'emerald' },
  { key: 'absent',   label: 'Absent',   tone: 'amber' },
  { key: 'vacation', label: 'Vacation', tone: 'purple' },
  { key: 'sick',     label: 'Sick',     tone: 'red' },
]

export default function FacilityMapPage() {
  const { mobileMode } = useViewMode()
  const navigate = useNavigate()
  const { rooms, loading: roomsLoading, error: roomsError } = useClassrooms()
  const {
    children: allChildren,
    childrenByRoom,
    childrenByStatus,
  } = useChildren()

  // Which cohort tile is expanded, if any. `null` means the drawer is closed.
  const [openCohort, setOpenCohort] = useState(
    /** @type {'active' | 'incoming' | 'departing' | null} */ (null)
  )

  // Attendance overlay on top of the enrolled roster. Keys are child IDs;
  // values are 'absent' (marked by staff) OR undefined (implicit present).
  // Default-present rather than default-absent because a normal day has 90%+
  // showing up — staff only need to mark the exceptions.
  //
  // Lazy-init from localStorage so a page refresh in the middle of the day
  // doesn't wipe absent marks. Key rolls over at midnight.
  const [attendance, setAttendance] = useState(
    /** @type {Record<string, 'absent'>} */ (() => {
      try {
        const raw = localStorage.getItem(attendanceStorageKey())
        return raw ? JSON.parse(raw) : {}
      } catch {
        return {}
      }
    })
  )

  function toggleAttendance(childId) {
    setAttendance((prev) => {
      const next = { ...prev }
      if (next[childId] === 'absent') delete next[childId]
      else next[childId] = 'absent'
      return next
    })
  }

  // Per-room daily state, keyed by roomNumber (integer). The map is seeded
  // lazily as rooms arrive from the hook — we can't seed at mount because
  // Supabase hasn't responded yet on first render.
  //
  // Note: `aides` here is Teacher AIDES (floaters/substitutes). The room's
  // designated teacher comes from Supabase (room.teacherName) and lives in
  // `teacherStatusByRoom` below.
  const [entriesByRoom, setEntriesByRoom] = useState(
    /** @type {Record<number, { aides: any[], kids: any[], incidents: any[] }>} */ (() => {
      try {
        const raw = localStorage.getItem(entriesStorageKey())
        return raw ? JSON.parse(raw) : {}
      } catch {
        return {}
      }
    })
  )

  // Backfill blank entries whenever the room list changes (first fetch,
  // n8n adds a new room, etc.). Never clobbers existing entries.
  useEffect(() => {
    setEntriesByRoom((prev) => {
      const next = { ...prev }
      let mutated = false
      for (const r of rooms) {
        if (!next[r.roomNumber]) {
          next[r.roomNumber] = { aides: [], kids: [], incidents: [], writeUps: [] }
          mutated = true
        }
      }
      return mutated ? next : prev
    })
  }, [rooms])

  const [openRoomNumber, setOpenRoomNumber] = useState(/** @type {number | null} */ (null))
  const openRoom = useMemo(
    () => findRoomByNumber(rooms, openRoomNumber),
    [rooms, openRoomNumber]
  )

  const [familyIncidents, setFamilyIncidents] = useState(
    /** @type {any[]} */ (() => {
      try {
        const raw = localStorage.getItem(familyIncidentsStorageKey())
        return raw ? JSON.parse(raw) : []
      } catch {
        return []
      }
    })
  )
  const [familyForm, setFamilyForm] = useState({
    childName: '',
    parentName: '',
    severity: 'info',
    description: '',
  })

  // Per-room designated-teacher status. Key: roomNumber. Value:
  // { status: 'present'|'absent'|'vacation'|'sick', reason: string }.
  // Absence of a key = present (default). Cleared on Closing submit.
  const [teacherStatusByRoom, setTeacherStatusByRoom] = useState(
    /** @type {Record<number, { status: string, reason: string }>} */ (() => {
      try {
        const raw = localStorage.getItem(teacherStatusStorageKey())
        return raw ? JSON.parse(raw) : {}
      } catch {
        return {}
      }
    })
  )

  const [submitState, setSubmitState] = useState('idle') // idle | sending
  const [toast, setToast] = useState(null)

  // End-of-day submission modal state.
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [submitterChoice, setSubmitterChoice] = useState('') // preset name OR '__other__'
  const [otherName, setOtherName] = useState('')
  const [endOfDayConfirmed, setEndOfDayConfirmed] = useState(false)

  // After a successful send this holds { submittedAt, submittedBy } and the
  // page swaps its Submit card for a green success panel. Persists across
  // refresh (until midnight) so someone reopening the tab still sees that
  // today's report went out. "Submit again" clears it for corrections.
  const [submittedInfo, setSubmittedInfo] = useState(
    /** @type {{ submittedAt: string, submittedBy: string } | null} */ (() => {
      try {
        const raw = localStorage.getItem(submittedStorageKey())
        return raw ? JSON.parse(raw) : null
      } catch {
        return null
      }
    })
  )

  // Persist attendance + submittedInfo on every change. Initial value is
  // already loaded via lazy-init on the useState calls above, so there's no
  // "save empty over loaded" race on mount.
  useEffect(() => {
    try {
      localStorage.setItem(attendanceStorageKey(), JSON.stringify(attendance))
    } catch {}
  }, [attendance])

  useEffect(() => {
    try {
      if (submittedInfo) {
        localStorage.setItem(submittedStorageKey(), JSON.stringify(submittedInfo))
      } else {
        localStorage.removeItem(submittedStorageKey())
      }
    } catch {}
  }, [submittedInfo])

  useEffect(() => {
    try {
      localStorage.setItem(entriesStorageKey(), JSON.stringify(entriesByRoom))
    } catch {}
  }, [entriesByRoom])

  useEffect(() => {
    try {
      localStorage.setItem(
        familyIncidentsStorageKey(),
        JSON.stringify(familyIncidents)
      )
    } catch {}
  }, [familyIncidents])

  useEffect(() => {
    try {
      localStorage.setItem(
        teacherStatusStorageKey(),
        JSON.stringify(teacherStatusByRoom)
      )
    } catch {}
  }, [teacherStatusByRoom])

  // Period selector — auto-detected on modal open, user can override.
  const [submitPeriod, setSubmitPeriod] = useState(() => detectPeriod())

  // ── Room mutations flow through here so <RoomDetailDrawer> stays purely
  // presentational and the whole page's payload is always in one place.
  function updateRoomEntry(roomNumber, next) {
    setEntriesByRoom((prev) => ({ ...prev, [roomNumber]: next }))
  }

  // ── Family incidents ─────────────────────────────────────────────────
  function addFamilyIncident() {
    const { childName, parentName, severity, description } = familyForm
    if (!description.trim()) return
    setFamilyIncidents((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
        childName: childName.trim(),
        parentName: parentName.trim(),
        severity,
        description: description.trim(),
        at: new Date().toISOString(),
      },
    ])
    setFamilyForm({ childName: '', parentName: '', severity: 'info', description: '' })
  }

  function removeFamilyIncident(id) {
    setFamilyIncidents((prev) => prev.filter((i) => i.id !== id))
  }

  // ── Aggregate totals for the summary strip + submit preview ──────────
  // "kidsPresent" = enrolled kids not marked absent + any manually-added
  // walk-ins from the drawer's Children section. "enrolledTotal" is the
  // baseline from Supabase (Sheet-synced).
  const totals = useMemo(() => {
    let aides = 0
    let extraKids = 0
    let roomIncidents = 0
    for (const key of Object.keys(entriesByRoom)) {
      aides += (entriesByRoom[key].aides || []).length
      extraKids += entriesByRoom[key].kids.length
      roomIncidents += entriesByRoom[key].incidents.length
    }
    // Designated teacher rollups — one per room. A room with no explicit
    // status in the map defaults to 'present' (that's the default state
    // the drawer starts in). Anything other than 'present' counts as absent
    // for staffing purposes regardless of the specific reason.
    let designatedTeachersPresent = 0
    let designatedTeachersAbsent = 0
    for (const r of rooms) {
      const status = teacherStatusByRoom[r.roomNumber]?.status ?? 'present'
      if (status === 'present') designatedTeachersPresent++
      else designatedTeachersAbsent++
    }
    // Enrollment counts pull only from `active` kids — incoming/departing/
    // alumni aren't on the floor today. Cohort tile counts live in their
    // own memo below.
    const activeKids = childrenByStatus.get('active') || []
    const enrolledTotal = activeKids.length
    const enrolledAbsent = activeKids.filter(
      (c) => attendance[c.id] === 'absent'
    ).length
    const enrolledPresent = enrolledTotal - enrolledAbsent
    return {
      aides,
      designatedTeachersPresent,
      designatedTeachersAbsent,
      kidsPresent: enrolledPresent + extraKids,
      enrolledTotal,
      enrolledAbsent,
      extraKids,
      roomIncidents,
      familyIncidents: familyIncidents.length,
    }
  }, [entriesByRoom, familyIncidents, childrenByStatus, attendance, rooms, teacherStatusByRoom])

  // Cohort counts for the tile row. Memoized so the tiles don't re-render
  // on every unrelated state change.
  const cohortCounts = useMemo(
    () => ({
      active: (childrenByStatus.get('active') || []).length,
      incoming: (childrenByStatus.get('incoming') || []).length,
      departing: (childrenByStatus.get('departing') || []).length,
    }),
    [childrenByStatus]
  )

  // ── Submit: build payload + POST to n8n webhook ──────────────────────
  function buildPayload() {
    return {
      date: new Date().toISOString().slice(0, 10),
      submittedAt: new Date().toISOString(),
      rooms: rooms.map((r) => {
        const entry = entriesByRoom[r.roomNumber] || {
          aides: [],
          kids: [],
          incidents: [],
          writeUps: [],
        }
        const enrolledHere = childrenByRoom.get(r.roomNumber) || []
        const absentChildren = enrolledHere.filter(
          (c) => attendance[c.id] === 'absent'
        )
        const presentChildren = enrolledHere.filter(
          (c) => attendance[c.id] !== 'absent'
        )
        const teacherStatus = teacherStatusByRoom[r.roomNumber] || {
          status: 'present',
          reason: '',
        }
        return {
          id: r.id,
          roomNumber: r.roomNumber,
          name: r.name,
          designatedTeacher: {
            title: r.teacherTitle,
            name: r.teacherName,
            status: teacherStatus.status,
            reason: teacherStatus.reason,
          },
          ageRange: r.ageRange,
          targetRatio: r.targetRatio,
          maxCapacity: r.maxCapacity,
          enrolled: r.enrolled,
          presentCount: presentChildren.length,
          absentCount: absentChildren.length,
          absentChildren: absentChildren.map((c) => c.fullName),
          aides: entry.aides || [],
          extraKids: entry.kids, // manually added walk-ins
          incidents: entry.incidents,
          writeUps: entry.writeUps || [],
        }
      }),
      familyIncidents,
      totals,
    }
  }

  async function handleSubmit(submitterName, period) {
    setSubmitState('sending')
    const submittedAt = new Date().toISOString()
    const payload = {
      ...buildPayload(),
      submittedAt,
      submittedBy: submitterName,
      period,
      periodLabel: PERIOD_LABELS[period] || period,
    }

    // If the webhook env var isn't set, log the payload but still run the
    // full success flow (banner + form clear) so the UI can be exercised
    // locally without n8n. The toast makes the "not real yet" state obvious.
    if (!DAILY_REPORT_WEBHOOK) {
      // eslint-disable-next-line no-console
      console.log('[FacilityMap] facility report payload (webhook not set):', payload)
      await new Promise((r) => setTimeout(r, 300))
      setSubmittedInfo({ submittedAt, submittedBy: submitterName, period })
      clearFormAfterSubmit()
      closeConfirmModal()
      setSubmitState('idle')
      setToast({
        tone: 'success',
        message:
          'Preview only — set VITE_FACILITY_DAILY_REPORT_WEBHOOK in Vercel to actually send.',
      })
      setTimeout(() => setToast(null), 4000)
      return
    }

    try {
      const res = await fetch(DAILY_REPORT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Webhook returned ${res.status}: ${text.slice(0, 200)}`)
      }
      setSubmittedInfo({ submittedAt, submittedBy: submitterName, period })
      clearFormAfterSubmit()
      closeConfirmModal()
      setSubmitState('idle')
    } catch (err) {
      console.error('[FacilityMap] submit failed:', err)
      setSubmitState('idle')
      // Modal stays open on error so the user can retry without re-picking name.
      setToast({
        tone: 'error',
        message:
          err.message?.includes('Failed to fetch')
            ? "Couldn't reach the webhook — check n8n workflow is active and the env var URL is correct."
            : `Submit failed: ${err.message || 'unknown error'}`,
      })
      setTimeout(() => setToast(null), 4000)
    }
  }

  // Wraps the modal opener so period auto-detects fresh on every open
  // (matters if the tab was left open across a period boundary).
  function openConfirmModal() {
    setSubmitPeriod(detectPeriod())
    setShowConfirmModal(true)
  }

  // Wipes ALL page state after every submit — attendance, room entries,
  // family incidents, designated teacher statuses. Each report is its own
  // snapshot with fresh metrics; carryover would mean absent marks from
  // the morning double-count in the afternoon report. Period is ignored.
  //
  // (Earlier iteration: only wiped on Closing, preserved attendance for
  // "correction re-submits". That created stale marks bleeding into the
  // next period and was reverted.)
  function clearFormAfterSubmit() {
    const empty = {}
    for (const r of rooms) empty[r.roomNumber] = { aides: [], kids: [], incidents: [], writeUps: [] }
    setEntriesByRoom(empty)
    setFamilyIncidents([])
    setTeacherStatusByRoom({})
    setAttendance({})
  }

  function closeConfirmModal() {
    setShowConfirmModal(false)
    setSubmitterChoice('')
    setOtherName('')
    setEndOfDayConfirmed(false)
  }

  return (
    <div className={mobileMode ? '' : 'max-w-6xl mx-auto'}>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[60] text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg flex items-start gap-2 max-w-sm ${
            toast.tone === 'error' ? 'bg-red-600' : 'bg-gray-900'
          }`}
        >
          {toast.tone === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-amber-300 mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <Map className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className={`font-bold text-gray-900 ${mobileMode ? 'text-xl' : 'text-2xl'}`}>
            Facility
          </h1>
          <p className="text-sm text-gray-500">
            What's happening in every room today — tap a room to add teachers,
            children, and incidents.
          </p>
        </div>
        {/* TRS Ratio button — opens the per-room capacity + child-to-teacher
            ratio view that used to live under the Community menu. Kept as a
            side button here so the ratios reference stays one click away
            without a separate top-level menu entry. */}
        <button
          onClick={() => navigate('/facility')}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 transition-colors flex-shrink-0"
          title="Open the child-to-teacher ratio view"
        >
          <Gauge className="w-4 h-4" />
          <span className="hidden sm:inline">TRS Ratio</span>
        </button>
      </div>

      {/* Totals strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <TotalStat
          icon={UsersRound}
          label="Teacher Aides"
          value={totals.aides}
        />
        <TotalStat
          icon={Baby}
          label="Children present"
          value={totals.kidsPresent}
          subValue={
            totals.enrolledTotal > 0
              ? `of ${totals.enrolledTotal} enrolled${totals.enrolledAbsent > 0 ? ` · ${totals.enrolledAbsent} absent` : ''}`
              : undefined
          }
        />
        <TotalStat
          icon={AlertTriangle}
          label="Room incidents"
          value={totals.roomIncidents}
          tone={totals.roomIncidents > 0 ? 'orange' : 'default'}
        />
        <TotalStat
          icon={AlertTriangle}
          label="Family incidents"
          value={totals.familyIncidents}
          tone={totals.familyIncidents > 0 ? 'red' : 'default'}
        />
      </div>

      {/* Floor plan — shows a loading state while Supabase resolves, an
          error card if the fetch dies, and an empty state if the classroom
          table hasn't been seeded yet. Otherwise renders the tile grid. */}
      {roomsLoading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 flex items-center justify-center gap-3 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          <span className="text-sm">Loading classrooms…</span>
        </div>
      ) : roomsError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-red-700">Couldn't load classrooms</p>
            <p className="text-xs text-red-500 mt-0.5">{roomsError}</p>
          </div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <p className="text-sm font-semibold text-gray-700">No classrooms yet</p>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            The <code>classrooms</code> table is empty. Seed it in Supabase or
            wait for the next n8n sync from your Google Sheet.
          </p>
        </div>
      ) : (
        <FacilityFloorPlan
          rooms={rooms}
          entriesByRoom={entriesByRoom}
          onRoomClick={(roomNumber) => setOpenRoomNumber(roomNumber)}
        />
      )}

      {/* Roster cohorts — kids grouped by enrollment status. Active is the
          full-roster shortcut; Incoming and Departing are the two planning
          cohorts. Alumni are tracked in a separate sheet on the office
          side, not surfaced here. */}
      <div className="mt-5">
        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">
          Roster Cohorts
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <CohortTile
            label="Active"
            sublabel="Currently enrolled"
            count={cohortCounts.active}
            icon={UsersRound}
            accent="indigo"
            onClick={() => setOpenCohort('active')}
          />
          <CohortTile
            label="Incoming"
            sublabel="Coming soon"
            count={cohortCounts.incoming}
            icon={LogIn}
            accent="emerald"
            onClick={() => setOpenCohort('incoming')}
          />
          <CohortTile
            label="Departing"
            sublabel="Leaving this period"
            count={cohortCounts.departing}
            icon={LogOut}
            accent="amber"
            onClick={() => setOpenCohort('departing')}
          />
        </div>
      </div>

      {/* Family / parent incidents */}
      <FamilyIncidentsSection
        items={familyIncidents}
        form={familyForm}
        onFormChange={setFamilyForm}
        onAdd={addFamilyIncident}
        onRemove={removeFamilyIncident}
      />

      {/* Submit — swaps between CTA card and post-submit success panel */}
      {submittedInfo ? (
        <SubmittedPanel
          info={submittedInfo}
          onReset={() => setSubmittedInfo(null)}
          onSubmitNext={openConfirmModal}
        />
      ) : (
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              Submit Facility Report
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Three times a day: Morning, Afternoon, Closing. The modal
              auto-detects the current period — you can override before
              sending.
            </p>
          </div>
          <button
            onClick={openConfirmModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
            Submit Report
          </button>
        </div>
      )}

      {/* Room detail drawer */}
      <RoomDetailDrawer
        room={openRoom}
        entry={openRoom ? entriesByRoom[openRoom.roomNumber] : null}
        enrolledChildren={
          openRoom ? childrenByRoom.get(openRoom.roomNumber) || [] : []
        }
        attendance={attendance}
        onToggleAttendance={toggleAttendance}
        teacherStatus={
          openRoom
            ? teacherStatusByRoom[openRoom.roomNumber] || {
                status: 'present',
                reason: '',
              }
            : { status: 'present', reason: '' }
        }
        teacherStatusOptions={TEACHER_STATUSES}
        onTeacherStatusChange={(next) => {
          if (!openRoom) return
          setTeacherStatusByRoom((prev) => {
            // "Present with empty reason" is the default → drop the key
            // instead of storing it, keeps localStorage tidy.
            if (next.status === 'present' && !next.reason) {
              const { [openRoom.roomNumber]: _, ...rest } = prev
              return rest
            }
            return { ...prev, [openRoom.roomNumber]: next }
          })
        }}
        onClose={() => setOpenRoomNumber(null)}
        onUpdate={(next) => openRoom && updateRoomEntry(openRoom.roomNumber, next)}
      />

      {/* Cohort drawer — Incoming / Departing / Alumni roster list */}
      <CohortDrawer
        cohort={openCohort}
        kids={
          openCohort ? childrenByStatus.get(openCohort) || [] : []
        }
        rooms={rooms}
        onClose={() => setOpenCohort(null)}
      />

      {/* Facility report confirmation modal */}
      {showConfirmModal && (
        <SubmitConfirmModal
          submitters={PRESET_SUBMITTERS}
          submitterChoice={submitterChoice}
          setSubmitterChoice={setSubmitterChoice}
          otherName={otherName}
          setOtherName={setOtherName}
          endOfDayConfirmed={endOfDayConfirmed}
          setEndOfDayConfirmed={setEndOfDayConfirmed}
          submitPeriod={submitPeriod}
          setSubmitPeriod={setSubmitPeriod}
          submitState={submitState}
          onCancel={closeConfirmModal}
          onSubmit={() => {
            const name =
              submitterChoice === '__other__'
                ? otherName.trim()
                : submitterChoice
            if (!name || !endOfDayConfirmed || !submitPeriod) return
            handleSubmit(name, submitPeriod)
          }}
        />
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

// Cohort tile — clickable summary card for the Incoming / Departing /
// Alumni cohorts. Larger and more interactive than a TotalStat because
// it's a navigation target, not just a readout.
const COHORT_ACCENTS = {
  indigo: {
    ring: 'border-indigo-200 hover:border-indigo-400',
    icon: 'bg-indigo-100 text-indigo-700',
    count: 'text-indigo-700',
  },
  emerald: {
    ring: 'border-emerald-200 hover:border-emerald-400',
    icon: 'bg-emerald-100 text-emerald-700',
    count: 'text-emerald-700',
  },
  amber: {
    ring: 'border-amber-200 hover:border-amber-400',
    icon: 'bg-amber-100 text-amber-700',
    count: 'text-amber-700',
  },
}

function CohortTile({ label, sublabel, count, icon: Icon, accent, onClick }) {
  const c = COHORT_ACCENTS[accent] || COHORT_ACCENTS.gray
  return (
    <button
      onClick={onClick}
      className={`text-left bg-white border-2 ${c.ring} rounded-2xl p-4 flex items-center gap-3 transition-colors group`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 leading-tight">{label}</p>
        <p className="text-[11px] text-gray-500">{sublabel}</p>
      </div>
      <p className={`text-2xl font-bold tabular-nums ${c.count}`}>{count}</p>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
    </button>
  )
}

function TotalStat({ icon: Icon, label, value, tone = 'default', subValue }) {
  const tones = {
    default: 'text-gray-900',
    orange:  'text-orange-600',
    red:     'text-red-600',
  }
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3">
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        <Icon className="w-3.5 h-3.5" />
        <p className="text-[10px] uppercase tracking-wider font-semibold">
          {label}
        </p>
      </div>
      <p className={`text-xl font-bold tabular-nums ${tones[tone]}`}>{value}</p>
      {subValue && (
        <p className="text-[10px] text-gray-400 mt-0.5 tabular-nums truncate">
          {subValue}
        </p>
      )}
    </div>
  )
}

function FamilyIncidentsSection({ items, form, onFormChange, onAdd, onRemove }) {
  return (
    <section className="mt-6 bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <h2 className="text-sm font-bold text-gray-900">
          Family & Parent Incidents
        </h2>
        <span className="text-[11px] font-semibold text-gray-400 tabular-nums">
          ({items.length})
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        For issues not tied to a specific room — dropoff / pickup conflicts,
        custody notes, allergy updates, communication requests.
      </p>

      {/* List */}
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 italic mb-4">
          No family incidents reported today.
        </p>
      ) : (
        <ul className="space-y-2 mb-4">
          {items.map((i) => {
            const sev =
              FAMILY_SEVERITIES.find((s) => s.key === i.severity) ||
              FAMILY_SEVERITIES[0]
            return (
              <li
                key={i.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3"
              >
                <div className="flex items-start gap-2 mb-1 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${sev.chipClass}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${sev.dotClass}`}
                    />
                    {sev.label}
                  </span>
                  {i.childName && (
                    <span className="text-[11px] text-gray-500">
                      Child: <span className="font-semibold text-gray-800">{i.childName}</span>
                    </span>
                  )}
                  {i.parentName && (
                    <span className="text-[11px] text-gray-500">
                      Parent: <span className="font-semibold text-gray-800">{i.parentName}</span>
                    </span>
                  )}
                  <span className="text-[11px] text-gray-400 ml-auto">
                    {new Date(i.at).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </span>
                  <button
                    onClick={() => onRemove(i.id)}
                    className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50"
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

      {/* Add form */}
      <div className="border-t border-gray-100 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
          <input
            type="text"
            value={form.childName}
            onChange={(e) => onFormChange({ ...form, childName: e.target.value })}
            placeholder="Child name (optional)"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
          />
          <input
            type="text"
            value={form.parentName}
            onChange={(e) => onFormChange({ ...form, parentName: e.target.value })}
            placeholder="Parent name (optional)"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
          />
        </div>
        <select
          value={form.severity}
          onChange={(e) => onFormChange({ ...form, severity: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none mb-2"
        >
          {FAMILY_SEVERITIES.map((s) => (
            <option key={s.key} value={s.key}>{s.label} severity</option>
          ))}
        </select>
        <textarea
          value={form.description}
          onChange={(e) => onFormChange({ ...form, description: e.target.value })}
          rows={3}
          placeholder="Describe the incident, conversation, or note..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none resize-none mb-2"
        />
        <button
          onClick={onAdd}
          disabled={!form.description.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Family Incident
        </button>
      </div>
    </section>
  )
}

// ─── SubmittedPanel — replaces the Submit CTA once a report is sent ──────────
//
// Green panel with a one-time glow animation (no persistent pulse — a looping
// pulse on a status card gets noisy). The "Submit again" button clears
// submittedInfo, which flips the parent back to the Submit CTA for corrections.

function SubmittedPanel({ info, onReset, onSubmitNext }) {
  const timeLabel = new Date(info.submittedAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  const periodLabel = PERIOD_LABELS[info.period] || 'Facility'
  return (
    <div className="mt-6">
      <style>{`
        @keyframes facility-success-glow {
          0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.55); }
          40%  { box-shadow: 0 0 32px 10px rgba(16,185,129,0.35); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
        .facility-success-glow { animation: facility-success-glow 2.4s ease-out 1; }
      `}</style>
      <div className="facility-success-glow bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 flex items-start gap-3 flex-wrap sm:flex-nowrap">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-emerald-900">
            {periodLabel} report submitted
          </p>
          <p className="text-xs text-emerald-800 mt-0.5">
            {timeLabel} · by{' '}
            <span className="font-semibold">{info.submittedBy}</span>
          </p>
          <p className="text-[11px] text-emerald-700 mt-2 max-w-lg leading-relaxed">
            The page is fresh — attendance, room entries, and family
            incidents were cleared so the next report is its own snapshot.
            Need to correct this one? Hit Submit next report and re-enter
            the corrections; both rows land in the Sheet with timestamps.
          </p>
        </div>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <button
            onClick={onSubmitNext}
            className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-1.5 whitespace-nowrap"
          >
            Submit next report
          </button>
          <button
            onClick={onReset}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 border border-emerald-300 hover:border-emerald-400 bg-white rounded-lg px-3 py-1.5 whitespace-nowrap"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SubmitConfirmModal — end-of-day gate ────────────────────────────────────
//
// Two required inputs before Submit unlocks: (1) who's submitting, from a
// hardcoded preset list plus a free-text "Someone else…" branch, and (2) an
// explicit confirmation checkbox. Cancel and backdrop-click both call
// onCancel, but only when not mid-send — clicking outside during a send
// would strand the request without clearing UI state.

function SubmitConfirmModal({
  submitters,
  submitterChoice,
  setSubmitterChoice,
  otherName,
  setOtherName,
  endOfDayConfirmed,
  setEndOfDayConfirmed,
  submitPeriod,
  setSubmitPeriod,
  submitState,
  onCancel,
  onSubmit,
}) {
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const chosenName =
    submitterChoice === '__other__' ? otherName.trim() : submitterChoice
  const canSubmit =
    !!chosenName &&
    endOfDayConfirmed &&
    !!submitPeriod &&
    submitState !== 'sending'
  const isSending = submitState === 'sending'
  const periodLabel = PERIOD_LABELS[submitPeriod] || 'Facility'

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={isSending ? undefined : onCancel}
      />
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Send className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900">
              Submit {periodLabel} Report
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{dateLabel}</p>
          </div>
          <button
            onClick={onCancel}
            disabled={isSending}
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Period picker — auto-detected but overridable */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Which period?
          </p>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(PERIOD_LABELS).map(([key, label]) => {
              const selected = submitPeriod === key
              return (
                <button
                  key={key}
                  onClick={() => setSubmitPeriod(key)}
                  disabled={isSending}
                  className={`px-2 py-2 rounded-xl text-sm font-semibold border-2 transition-colors disabled:cursor-not-allowed ${
                    selected
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 italic">
            Auto-detected from clock — tap another button to override.
          </p>
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Who's submitting?
          </p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {submitters.map((name) => {
              const selected = submitterChoice === name
              return (
                <button
                  key={name}
                  onClick={() => {
                    setSubmitterChoice(name)
                    setOtherName('')
                  }}
                  disabled={isSending}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors disabled:cursor-not-allowed ${
                    selected
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  {name}
                </button>
              )
            })}
            <button
              onClick={() => setSubmitterChoice('__other__')}
              disabled={isSending}
              className={`col-span-2 px-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors disabled:cursor-not-allowed ${
                submitterChoice === '__other__'
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              Someone else…
            </button>
          </div>
          {submitterChoice === '__other__' && (
            <input
              type="text"
              value={otherName}
              onChange={(e) => setOtherName(e.target.value)}
              placeholder="Type their name"
              autoFocus
              disabled={isSending}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none disabled:bg-gray-50"
            />
          )}
        </div>

        <label className="flex items-start gap-2.5 mb-5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={endOfDayConfirmed}
            onChange={(e) => setEndOfDayConfirmed(e.target.checked)}
            disabled={isSending}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
          />
          <span className="text-xs text-gray-700 leading-relaxed">
            I confirm this is the{' '}
            <span className="font-semibold">
              {periodLabel.toLowerCase()} report
            </span>{' '}
            for {dateLabel}. Submitting sends the current metrics to the
            Sheet and clears the page — attendance, room entries, and
            incidents — so the next report starts fresh.
          </span>
        </label>

        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <button
            onClick={onCancel}
            disabled={isSending}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit {periodLabel} Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
