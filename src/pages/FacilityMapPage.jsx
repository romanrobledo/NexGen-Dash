import { useEffect, useMemo, useState } from 'react'
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
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import { useClassrooms, findRoomByNumber } from '../hooks/useClassrooms'
import { useChildren } from '../hooks/useChildren'
import FacilityFloorPlan from '../components/FacilityFloorPlan'
import RoomDetailDrawer from '../components/RoomDetailDrawer'

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

export default function FacilityMapPage() {
  const { mobileMode } = useViewMode()
  const { rooms, loading: roomsLoading, error: roomsError } = useClassrooms()
  const { children: allChildren, childrenByRoom } = useChildren()

  // Attendance overlay on top of the enrolled roster. Keys are child IDs;
  // values are 'absent' (marked by staff) OR undefined (implicit present).
  // Default-present rather than default-absent because a normal day has 90%+
  // showing up — staff only need to mark the exceptions.
  const [attendance, setAttendance] = useState(
    /** @type {Record<string, 'absent'>} */ ({})
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
  const [entriesByRoom, setEntriesByRoom] = useState(
    /** @type {Record<number, { teachers: any[], kids: any[], incidents: any[] }>} */ ({})
  )

  // Backfill blank entries whenever the room list changes (first fetch,
  // n8n adds a new room, etc.). Never clobbers existing entries.
  useEffect(() => {
    setEntriesByRoom((prev) => {
      const next = { ...prev }
      let mutated = false
      for (const r of rooms) {
        if (!next[r.roomNumber]) {
          next[r.roomNumber] = { teachers: [], kids: [], incidents: [] }
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

  const [familyIncidents, setFamilyIncidents] = useState([])
  const [familyForm, setFamilyForm] = useState({
    childName: '',
    parentName: '',
    severity: 'info',
    description: '',
  })

  const [submitState, setSubmitState] = useState('idle') // idle | previewing | sending | sent
  const [toast, setToast] = useState(null)

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
    let teachers = 0
    let extraKids = 0
    let roomIncidents = 0
    for (const key of Object.keys(entriesByRoom)) {
      teachers += entriesByRoom[key].teachers.length
      extraKids += entriesByRoom[key].kids.length
      roomIncidents += entriesByRoom[key].incidents.length
    }
    const enrolledTotal = allChildren.length
    const enrolledAbsent = allChildren.filter(
      (c) => attendance[c.id] === 'absent'
    ).length
    const enrolledPresent = enrolledTotal - enrolledAbsent
    return {
      teachers,
      kidsPresent: enrolledPresent + extraKids,
      enrolledTotal,
      enrolledAbsent,
      extraKids,
      roomIncidents,
      familyIncidents: familyIncidents.length,
    }
  }, [entriesByRoom, familyIncidents, allChildren, attendance])

  // ── Submit: build payload + POST to n8n webhook ──────────────────────
  function buildPayload() {
    return {
      date: new Date().toISOString().slice(0, 10),
      submittedAt: new Date().toISOString(),
      rooms: rooms.map((r) => {
        const entry = entriesByRoom[r.roomNumber] || {
          teachers: [],
          kids: [],
          incidents: [],
        }
        const enrolledHere = childrenByRoom.get(r.roomNumber) || []
        const absentChildren = enrolledHere.filter(
          (c) => attendance[c.id] === 'absent'
        )
        const presentChildren = enrolledHere.filter(
          (c) => attendance[c.id] !== 'absent'
        )
        return {
          id: r.id,
          roomNumber: r.roomNumber,
          name: r.name,
          teacherName: r.teacherName,
          ageRange: r.ageRange,
          targetRatio: r.targetRatio,
          maxCapacity: r.maxCapacity,
          enrolled: r.enrolled,
          presentCount: presentChildren.length,
          absentCount: absentChildren.length,
          absentChildren: absentChildren.map((c) => c.fullName),
          teachers: entry.teachers,
          extraKids: entry.kids, // manually added walk-ins
          incidents: entry.incidents,
        }
      }),
      familyIncidents,
      totals,
    }
  }

  async function handleSubmit() {
    setSubmitState('sending')
    const payload = buildPayload()

    // If the webhook env var isn't set, log the payload + toast so the user
    // can inspect the shape in DevTools. Same behavior as before wiring, so
    // the app is usable even without n8n configured yet.
    if (!DAILY_REPORT_WEBHOOK) {
      // eslint-disable-next-line no-console
      console.log('[FacilityMap] daily report payload (webhook not set):', payload)
      await new Promise((r) => setTimeout(r, 300))
      setSubmitState('sent')
      setToast({
        tone: 'success',
        message:
          'Payload logged to console. Set VITE_FACILITY_DAILY_REPORT_WEBHOOK to actually send.',
      })
      setTimeout(() => {
        setToast(null)
        setSubmitState('idle')
      }, 3500)
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
      setSubmitState('sent')
      setToast({
        tone: 'success',
        message: 'Daily report submitted to Google Sheets.',
      })
    } catch (err) {
      console.error('[FacilityMap] submit failed:', err)
      setSubmitState('idle')
      setToast({
        tone: 'error',
        message:
          err.message?.includes('Failed to fetch')
            ? "Couldn't reach the webhook — check n8n workflow is active and the env var URL is correct."
            : `Submit failed: ${err.message || 'unknown error'}`,
      })
    } finally {
      setTimeout(() => {
        setToast(null)
        if (submitState === 'sent') setSubmitState('idle')
      }, 3500)
    }
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
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
          <Map className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className={`font-bold text-gray-900 ${mobileMode ? 'text-xl' : 'text-2xl'}`}>
            Facility
          </h1>
          <p className="text-sm text-gray-500">
            What's happening in every room today — tap a room to add teachers,
            children, and incidents.
          </p>
        </div>
      </div>

      {/* Totals strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <TotalStat
          icon={UsersRound}
          label="Teachers on floor"
          value={totals.teachers}
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

      {/* Family / parent incidents */}
      <FamilyIncidentsSection
        items={familyIncidents}
        form={familyForm}
        onFormChange={setFamilyForm}
        onAdd={addFamilyIncident}
        onRemove={removeFamilyIncident}
      />

      {/* Submit */}
      <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            Submit Daily Report
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Will send the full payload to Google Sheets once the webhook is
            wired in Phase 2. For now this logs the payload so you can review
            the shape.
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitState !== 'idle'}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          {submitState === 'sending' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Preparing…
            </>
          ) : submitState === 'sent' ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Preview logged
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Report
            </>
          )}
        </button>
      </div>

      {/* Room detail drawer */}
      <RoomDetailDrawer
        room={openRoom}
        entry={openRoom ? entriesByRoom[openRoom.roomNumber] : null}
        enrolledChildren={
          openRoom ? childrenByRoom.get(openRoom.roomNumber) || [] : []
        }
        attendance={attendance}
        onToggleAttendance={toggleAttendance}
        onClose={() => setOpenRoomNumber(null)}
        onUpdate={(next) => openRoom && updateRoomEntry(openRoom.roomNumber, next)}
      />
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

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
