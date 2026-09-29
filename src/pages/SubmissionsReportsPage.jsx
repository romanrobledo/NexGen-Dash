import { useMemo } from 'react'
import {
  BarChart3,
  LogIn,
  LogOut,
  AlertTriangle,
  Lightbulb,
  Loader2,
} from 'lucide-react'
import { useCheckEvents } from '../hooks/useCheckEvents'
import { useIssues, useIdeas } from '../hooks/useIssuesAndIdeas'

/**
 * Roll-up of everything staff submits: shifts, issues, ideas. This
 * page is admin-facing — for a rank-and-file staffer it just shows
 * their own rows (RLS enforces this), which is still useful.
 */
export default function SubmissionsReportsPage() {
  const events   = useCheckEvents({ all: true, days: 14 })
  const issues   = useIssues({})
  const ideas    = useIdeas({})

  const loading = events.loading || issues.loading || ideas.loading

  // Shift stats — open shifts + total hours in window.
  const shiftStats = useMemo(() => {
    const closedMs = events.shifts
      .filter(s => s.checkOut && s.checkIn)
      .reduce((sum, s) => sum + (s.durationMs || 0), 0)
    const openCount = events.shifts.filter(s => s.checkIn && !s.checkOut).length
    return {
      totalHours: closedMs / 3600000,
      openCount,
      shiftCount: events.shifts.length,
    }
  }, [events.shifts])

  const issueStats = useMemo(() => bucket(issues.rows, r => r.status), [issues.rows])
  const ideaStats  = useMemo(() => bucket(ideas.rows,  r => r.status), [ideas.rows])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          Submissions Reports
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Roll-up of shifts, issues, and ideas across the team. Non-admins see only their own rows.
        </p>
      </div>

      {loading && (
        <div className="p-8 text-center text-gray-500 inline-flex items-center justify-center gap-2 w-full">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading rollup…
        </div>
      )}

      {/* Shifts row */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <SectionHeader
          icon={LogIn}
          label="Shifts — last 14 days"
          right={<span className="text-xs text-gray-500">{shiftStats.shiftCount} shifts</span>}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5">
          <Stat label="Total hours" value={shiftStats.totalHours.toFixed(1)} />
          <Stat label="Open shifts" value={shiftStats.openCount} tone={shiftStats.openCount > 0 ? 'amber' : 'gray'} />
          <Stat label="Total events" value={events.rows.length} />
          <Stat label="Distinct staff" value={new Set(events.rows.map(r => r.staffId)).size} />
        </div>

        {events.shifts.length > 0 && (
          <div className="border-t border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-2 font-semibold">Staff</th>
                  <th className="px-5 py-2 font-semibold">Check-in</th>
                  <th className="px-5 py-2 font-semibold">Check-out</th>
                  <th className="px-5 py-2 font-semibold text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.shifts.slice(0, 15).map((s, i) => (
                  <tr key={i}>
                    <td className="px-5 py-2 font-medium text-gray-900">{s.staffName || '—'}</td>
                    <td className="px-5 py-2 text-gray-700">
                      {s.checkIn ? new Date(s.checkIn.eventAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-5 py-2 text-gray-700">
                      {s.checkOut ? new Date(s.checkOut.eventAt).toLocaleString() : <span className="text-amber-700 font-medium">still on-site</span>}
                    </td>
                    <td className="px-5 py-2 text-right text-gray-700 font-mono">
                      {s.durationMs ? formatDuration(s.durationMs) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <SectionHeader
            icon={AlertTriangle}
            label="Issues"
            right={<span className="text-xs text-gray-500">{issues.rows.length} total</span>}
          />
          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Open"        value={issueStats.open || 0}        tone={(issueStats.open || 0) > 0 ? 'rose' : 'gray'} />
            <Stat label="In progress" value={issueStats.in_progress || 0} tone="blue" />
            <Stat label="Resolved"    value={issueStats.resolved || 0}    tone="emerald" />
            <Stat label="Dismissed"   value={issueStats.dismissed || 0}   tone="gray" />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <SectionHeader
            icon={Lightbulb}
            label="Ideas"
            right={<span className="text-xs text-gray-500">{ideas.rows.length} total</span>}
          />
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Stat label="Submitted"    value={ideaStats.submitted || 0}    tone="gray" />
            <Stat label="Reviewing"    value={ideaStats.reviewing || 0}    tone="blue" />
            <Stat label="Planned"      value={ideaStats.planned || 0}      tone="indigo" />
            <Stat label="Implementing" value={ideaStats.implementing || 0} tone="amber" />
            <Stat label="Implemented"  value={ideaStats.implemented || 0}  tone="emerald" />
            <Stat label="Declined"     value={ideaStats.declined || 0}     tone="rose" />
          </div>
        </section>
      </div>
    </div>
  )
}

function SectionHeader({ icon: Icon, label, right }) {
  return (
    <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
      <Icon className="w-4 h-4 text-gray-500" />
      <h2 className="text-sm font-semibold text-gray-900">{label}</h2>
      <div className="ml-auto">{right}</div>
    </div>
  )
}

const TONE = {
  gray:    'bg-gray-50 text-gray-800 border-gray-100',
  blue:    'bg-blue-50 text-blue-800 border-blue-100',
  amber:   'bg-amber-50 text-amber-800 border-amber-100',
  rose:    'bg-rose-50 text-rose-800 border-rose-100',
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-100',
  indigo:  'bg-indigo-50 text-indigo-800 border-indigo-100',
}

function Stat({ label, value, tone = 'gray' }) {
  return (
    <div className={`rounded-xl border px-3 py-2.5 ${TONE[tone] || TONE.gray}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-xl font-bold mt-0.5">{value}</div>
    </div>
  )
}

function bucket(rows, keyOf) {
  const out = {}
  for (const r of rows) {
    const k = keyOf(r)
    out[k] = (out[k] || 0) + 1
  }
  return out
}

function formatDuration(ms) {
  const totalMin = Math.round(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `${h}h ${String(m).padStart(2, '0')}m`
}
