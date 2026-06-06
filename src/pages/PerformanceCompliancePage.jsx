import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  GraduationCap,
  ClipboardList,
  ChevronRight,
} from 'lucide-react'
import {
  COMPLIANCE_AREAS,
  CERT_TYPES,
  TRAINING_HOUR_TARGET,
  eventToStatusKind,
  healthColor,
  findCertEvent,
  findTrainingEvent,
  extractNumber,
  resolveStaffForEvent,
  shortDate,
} from '../lib/certification'

// ─── Compliance Health Score (hero) ───────────────────────────────────────────
function HealthScore({ compliant, total }) {
  const pct = total === 0 ? 0 : Math.round((compliant / total) * 100)
  const color = healthColor(pct)

  return (
    <div
      className={`${color.bg} rounded-2xl border ${color.border} p-8 flex flex-col sm:flex-row items-center justify-between gap-6`}
    >
      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">Compliance Health Score</p>
        <div className="flex items-baseline gap-3">
          <p className={`text-6xl font-bold ${color.text}`}>{pct}%</p>
          <span className={`text-sm font-semibold ${color.text}`}>{color.label}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {compliant} of {total} items compliant
        </p>
      </div>
      <div
        className={`relative w-32 h-32 rounded-full bg-white ring-4 ${color.ring} flex items-center justify-center shrink-0`}
      >
        <ShieldCheck className={`w-14 h-14 ${color.text}`} />
      </div>
    </div>
  )
}

// ─── Area Breakdown Card ──────────────────────────────────────────────────────
function AreaCard({ label, compliant, total }) {
  const pct = total === 0 ? 0 : Math.round((compliant / total) * 100)
  const color = healthColor(pct)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
      <div className="flex items-baseline gap-2 mb-3">
        <p className="text-2xl font-bold text-gray-900">{compliant}</p>
        <p className="text-sm text-gray-400">/ {total}</p>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full ${pct >= 90 ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-red-500'} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-xs font-semibold ${color.text}`}>
        {total === 0 ? 'No items tracked' : `${pct}% compliant`}
      </p>
    </div>
  )
}

// ─── Action Item Row ──────────────────────────────────────────────────────────
function ActionItemRow({ event, onClick }) {
  const statusConfig = {
    expired: { icon: <XCircle className="w-4 h-4 text-red-500" />, color: 'text-red-600', bg: 'bg-red-50' },
    expiring_soon: { icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    missing: { icon: <XCircle className="w-4 h-4 text-red-500" />, color: 'text-red-600', bg: 'bg-red-50' },
  }
  const config = statusConfig[event.status] || statusConfig.missing

  const areaLabel =
    COMPLIANCE_AREAS.find((a) => a.key === event.compliance_area)?.label ||
    event.compliance_area?.replace(/-/g, ' ').replace(/_/g, ' ')

  const clickable = !!onClick

  return (
    <div
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (clickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
      className={`flex items-center justify-between py-3 border-b border-gray-100 last:border-0 ${
        clickable ? 'cursor-pointer hover:bg-gray-50 -mx-5 px-5 transition-colors' : ''
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {config.icon}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{event.item_name}</p>
          <p className="text-xs text-gray-400">{areaLabel}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0 ml-3">
        {event.due_date && (
          <p className="text-xs text-gray-400">
            Due:{' '}
            {new Date(event.due_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}
        {clickable && <ChevronRight className="w-4 h-4 text-gray-300" />}
      </div>
    </div>
  )
}

// ─── Certification Grid Pill ──────────────────────────────────────────────────
function CertPill({ event }) {
  if (!event) {
    return (
      <div className="h-9 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center">
        <span className="text-xs text-gray-300">—</span>
      </div>
    )
  }
  const status = eventToStatusKind(event)
  const styles = {
    current: 'bg-green-50 border-green-200 text-green-700',
    expiring: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    expired: 'bg-red-50 border-red-200 text-red-700',
    missing: 'bg-gray-50 border-gray-100 text-gray-400',
  }
  const dueShort = event.due_date
    ? new Date(event.due_date).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })
    : null

  return (
    <div
      className={`h-9 rounded-md border ${styles[status.kind]} flex flex-col items-center justify-center leading-tight px-1`}
      title={`${event.item_name || ''}${event.due_date ? ` • Expires ${new Date(event.due_date).toLocaleDateString()}` : ''}`}
    >
      <span className="text-[11px] font-semibold">{status.label}</span>
      {dueShort && <span className="text-[9px] opacity-70">{dueShort}</span>}
    </div>
  )
}

// ─── Total Training Hours Progress Cell ───────────────────────────────────────
function HoursProgress({ total }) {
  if (total == null) {
    return <span className="text-xs text-gray-300">—</span>
  }
  const pct = Math.min(100, Math.round((total / TRAINING_HOUR_TARGET) * 100))
  const barColor = pct >= 100 ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-red-500'
  const textColor = pct >= 100 ? 'text-green-700' : pct >= 70 ? 'text-yellow-700' : 'text-red-700'

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-xs font-semibold ${textColor}`}>
        {total}<span className="text-gray-400 font-normal">/{TRAINING_HOUR_TARGET}</span>
      </span>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─── Main Compliance Page ─────────────────────────────────────────────────────
export default function PerformanceCompliancePage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAll() {
      if (!supabase) {
        setError('Supabase not configured')
        setLoading(false)
        return
      }

      const withTimeout = (p) =>
        Promise.race([
          p,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Fetch timed out')), 8000)
          ),
        ])

      try {
        const safe = async (query) => {
          const res = await withTimeout(query)
          if (res.error) {
            console.warn('Query skipped:', res.error.message)
            return { data: [] }
          }
          return res
        }

        // Fetch ALL compliance events (no area-key filter), plus all staff
        const [eventsRes, staffRes] = await Promise.all([
          safe(
            supabase
              .from('compliance_events')
              .select('*')
              .order('due_date', { ascending: true })
          ),
          safe(
            supabase
              .from('staff')
              .select('id, full_name, first_name, last_name')
              .order('full_name', { ascending: true })
          ),
        ])

        setEvents(eventsRes.data || [])
        setStaff(staffRes.data || [])
      } catch (err) {
        console.error('Error fetching compliance data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-gray-500">Loading compliance data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">Failed to load compliance data</p>
        <p className="text-red-400 text-sm mt-1">{error}</p>
      </div>
    )
  }

  // ── Aggregations ──
  const compliantCount = events.filter((e) => e.status === 'compliant').length
  const totalCount = events.length

  const actionItems = events
    .filter((e) => ['expired', 'expiring_soon', 'missing'].includes(e.status))
    .sort((a, b) => {
      const rank = { expired: 0, expiring_soon: 1, missing: 2 }
      const r = (rank[a.status] ?? 3) - (rank[b.status] ?? 3)
      if (r !== 0) return r
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date) - new Date(b.due_date)
    })

  // One card per canonical area
  const areaCounts = new Map(
    COMPLIANCE_AREAS.map((a) => [a.key, { compliant: 0, total: 0 }])
  )
  for (const e of events) {
    const bucket = areaCounts.get(e.compliance_area)
    if (!bucket) continue
    bucket.total += 1
    if (e.status === 'compliant') bucket.compliant += 1
  }
  const areas = COMPLIANCE_AREAS.map((a) => ({
    key: a.key,
    label: a.label,
    compliant: areaCounts.get(a.key).compliant,
    total: areaCounts.get(a.key).total,
  }))

  // First 9 staff shown in the grid
  const gridStaff = staff.slice(0, 9)

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Compliance</h2>
        <p className="text-gray-500 mt-1">
          Texas childcare compliance — TRS, HHSC licensing, staff certifications, policies, and insurance
        </p>
      </div>

      {/* ── Health Score ── */}
      <section className="mb-8">
        <HealthScore compliant={compliantCount} total={totalCount} />
      </section>

      {/* ── Area Breakdown ── */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Compliance by Area</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {areas.map((a) => (
            <AreaCard
              key={a.key}
              label={a.label}
              compliant={a.compliant}
              total={a.total}
            />
          ))}
        </div>
      </section>

      {/* ── Action Items ── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Action Items</h3>
          </div>
          {actionItems.length > 0 && (
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
              {actionItems.length} to resolve
            </span>
          )}
        </div>
        {actionItems.length === 0 ? (
          <div className="bg-green-50 rounded-xl border border-green-200 p-6 text-center">
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-green-700 text-sm font-medium">All clear — no action items.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            {actionItems.map((e) => {
              const person = resolveStaffForEvent(e, staff)
              const onClick = person ? () => navigate(`/staff/${person.id}`) : null
              return <ActionItemRow key={e.id} event={e} onClick={onClick} />
            })}
          </div>
        )}
      </section>

      {/* ── Staff Certification Grid (whiteboard-inspired) ── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Staff Certification Grid</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-200 border border-green-300" /> Current
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-yellow-200 border border-yellow-300" /> ≤ 30 days
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-200 border border-red-300" /> Expired
            </span>
          </div>
        </div>

        {gridStaff.length === 0 ? (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-gray-400 text-sm">No staff records found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-5 overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0.375rem 0.375rem' }}>
              <thead>
                <tr>
                  <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider pb-2 pr-3 min-w-[160px]">
                    Name
                  </th>

                  {/* Training Hours group */}
                  <th className="text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider pb-2 px-1 min-w-[70px]">
                    Online
                  </th>
                  <th className="text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider pb-2 px-1 min-w-[70px]">
                    Face-to-Face
                  </th>
                  <th className="text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider pb-2 px-1 min-w-[90px]">
                    Total
                  </th>

                  {/* Cert types */}
                  {CERT_TYPES.map((c) => (
                    <th
                      key={c.key}
                      className="text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider pb-2 px-1 min-w-[110px]"
                      title={`${c.label} • renews ${c.renewal}`}
                    >
                      <div className="truncate">{c.label}</div>
                      <div className="text-[9px] text-gray-400 font-normal normal-case">{c.renewal}</div>
                    </th>
                  ))}

                  {/* Anniversary */}
                  <th className="text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider pb-2 px-1 min-w-[90px]">
                    Anniversary
                  </th>
                </tr>
              </thead>
              <tbody>
                {gridStaff.map((person) => {
                  const onlineEvent = findTrainingEvent(events, person.full_name, ['online'])
                  const f2fEvent = findTrainingEvent(events, person.full_name, ['face-to-face', 'face to face', 'f2f', 'in-person', 'in person'])
                  const anniversaryEvent = findTrainingEvent(events, person.full_name, ['anniversary', 'vacation'])

                  const online = extractNumber(onlineEvent)
                  const f2f = extractNumber(f2fEvent)
                  const total = (online ?? 0) + (f2f ?? 0)
                  const hasAnyHours = online != null || f2f != null

                  return (
                    <tr
                      key={person.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/staff/${person.id}`)}
                    >
                      <td className="text-sm font-medium text-gray-800 pr-3 truncate max-w-[180px]">
                        {person.full_name}
                      </td>

                      {/* Online Hours */}
                      <td className="text-center text-sm font-semibold text-gray-700 px-1">
                        {online != null ? online : <span className="text-gray-300">—</span>}
                      </td>

                      {/* F2F Hours */}
                      <td className="text-center text-sm font-semibold text-gray-700 px-1">
                        {f2f != null ? f2f : <span className="text-gray-300">—</span>}
                      </td>

                      {/* Total Hours */}
                      <td className="px-1">
                        <HoursProgress total={hasAnyHours ? total : null} />
                      </td>

                      {/* Cert pills */}
                      {CERT_TYPES.map((c) => {
                        const event = findCertEvent(events, person.full_name, c)
                        return (
                          <td key={c.key} className="px-1">
                            <CertPill event={event} />
                          </td>
                        )
                      })}

                      {/* Anniversary */}
                      <td className="text-center text-xs font-medium text-gray-600 px-1">
                        {anniversaryEvent?.due_date ? shortDate(anniversaryEvent.due_date) : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-3">
          Tip: Click any row to open the staff member's profile. Training-hour target is {TRAINING_HOUR_TARGET} hrs/year.
        </p>
      </section>
    </div>
  )
}
