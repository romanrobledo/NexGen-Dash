import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { GraduationCap, Loader2, Pencil, Check, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  CERT_TYPES,
  TRAINING_HOUR_TARGET,
  eventToStatusKind,
  findCertEvent,
  findTrainingEvent,
  extractNumber,
  shortDate,
} from '../lib/certification'

function CertPill({ event, label }) {
  const status = event ? eventToStatusKind(event) : { kind: 'missing', label: '—' }
  const styles = {
    current: 'bg-green-50 border-green-200 text-green-700',
    expiring: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    expired: 'bg-red-50 border-red-200 text-red-700',
    missing: 'bg-gray-50 border-gray-100 text-gray-400',
  }
  const dueShort = event?.due_date
    ? new Date(event.due_date).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })
    : null

  return (
    <div
      className={`rounded-lg border px-3 py-2.5 ${styles[status.kind]}`}
      title={event?.item_name || label}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70 mb-0.5">{label}</p>
      <p className="text-sm font-bold">{status.label}</p>
      {dueShort && <p className="text-[10px] opacity-70 mt-0.5">Exp {dueShort}</p>}
    </div>
  )
}

/**
 * Hours box that can flip into an inline editor. The value shown is always
 * "<earned> / <target>" so there's no ambiguity about what's needed.
 * Editing writes the new number into the compliance_events `notes` field
 * (that's where extractNumber reads from).
 */
function HoursBox({ label, event, target, canEdit, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)

  const earned = extractNumber(event)
  const display = earned != null ? earned : null

  const startEdit = () => {
    setValue(earned != null ? String(earned) : '')
    setEditing(true)
  }

  const save = async () => {
    if (!supabase || !event?.id) {
      // Nothing to update against — silently close so the UI doesn't feel broken.
      setEditing(false)
      return
    }
    const num = Number(value)
    if (Number.isNaN(num) || num < 0) return
    setSaving(true)
    try {
      const newStatus =
        target && num >= target ? 'compliant' : num > 0 ? 'expiring_soon' : 'missing'
      const { error } = await supabase
        .from('compliance_events')
        .update({ notes: `${num} hours`, status: newStatus })
        .eq('id', event.id)
      if (error) throw error
      onSaved?.()
      setEditing(false)
    } catch (err) {
      console.warn('Save hours failed:', err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </p>
        {canEdit && !editing && (
          <button
            onClick={startEdit}
            className="text-gray-400 hover:text-blue-600 transition-colors"
            title={`Edit ${label.toLowerCase()}`}
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>
      {editing ? (
        <div className="flex items-center gap-1">
          <input
            type="number"
            step="0.5"
            min="0"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-16 px-1.5 py-0.5 text-sm font-bold border border-blue-300 rounded"
            onKeyDown={(e) => {
              if (e.key === 'Enter') save()
              if (e.key === 'Escape') setEditing(false)
            }}
          />
          <span className="text-xs text-gray-400">/ {target}</span>
          <button
            onClick={save}
            disabled={saving}
            className="ml-auto p-0.5 rounded text-green-600 hover:bg-green-50"
            title="Save"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="p-0.5 rounded text-gray-400 hover:bg-gray-100"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <p className="text-xl font-bold text-gray-900">
          {display != null ? display : <span className="text-gray-300">0</span>}
          <span className="text-sm text-gray-400 font-normal ml-1">/ {target}</span>
        </p>
      )}
    </div>
  )
}

function TotalBox({ total, target }) {
  if (total == null) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-0.5">
          Total Earned
        </p>
        <p className="text-xl font-bold text-gray-300">
          0<span className="text-sm text-gray-400 font-normal ml-1">/ {target}</span>
        </p>
      </div>
    )
  }
  const pct = Math.min(100, Math.round((total / target) * 100))
  const barColor = pct >= 100 ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-red-500'
  const textColor = pct >= 100 ? 'text-green-700' : pct >= 70 ? 'text-yellow-700' : 'text-red-700'
  const remaining = Math.max(0, target - total)

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-0.5">
        Total Earned
      </p>
      <p className={`text-xl font-bold ${textColor}`}>
        {total}
        <span className="text-sm text-gray-400 font-normal ml-1">/ {target}</span>
      </p>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1.5">
        <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-gray-500 mt-1">
        {remaining > 0 ? `${remaining} hrs needed` : 'Target met'}
      </p>
    </div>
  )
}

/**
 * Compact certification panel for a single staff member.
 * Fetches that staff's compliance_events on mount and renders the same
 * cert data shown on the main Compliance dashboard grid.
 */
export default function StaffCertificationPanel({ staffName, staffId }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const { staff: currentUser, hasPermission } = useAuth()

  // Admins (admin_panel permission) OR the profile's owner can edit hours
  const canEdit =
    hasPermission?.('admin_panel') ||
    (currentUser?.id && staffId && currentUser.id === staffId)

  useEffect(() => {
    async function fetch() {
      if (!supabase || !staffName) {
        setLoading(false)
        return
      }
      try {
        const { data, error } = await supabase
          .from('compliance_events')
          .select('*')
          .in('compliance_area', ['staff-certifications', 'training-hours'])
          .ilike('item_name', `%${staffName}%`)
          .order('due_date', { ascending: true })
        if (error) throw error
        setEvents(data || [])
      } catch (err) {
        console.warn('Staff cert panel fetch failed:', err.message)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [staffName, reloadKey])

  const onlineEvent = findTrainingEvent(events, staffName, ['online'])
  const f2fEvent = findTrainingEvent(events, staffName, ['face-to-face', 'face to face', 'f2f', 'in-person', 'in person'])
  const anniversaryEvent = findTrainingEvent(events, staffName, ['anniversary', 'vacation'])

  const online = extractNumber(onlineEvent)
  const f2f = extractNumber(f2fEvent)
  const hasAnyHours = online != null || f2f != null
  const total = hasAnyHours ? (online ?? 0) + (f2f ?? 0) : null

  const ONLINE_TARGET = 15
  const F2F_TARGET = 15

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Certifications & Training</h3>
        </div>
        {anniversaryEvent?.due_date && (
          <div className="text-xs text-gray-500">
            <span className="font-medium">Anniversary:</span>{' '}
            <span className="text-gray-800 font-semibold">{shortDate(anniversaryEvent.due_date)}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="ml-2 text-gray-500 text-sm">Loading certifications...</span>
        </div>
      ) : (
        <>
          {/* ── Training Hours Row ── */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Training Hours
              </p>
              <p className="text-[11px] text-gray-400">
                Annual target: {TRAINING_HOUR_TARGET} hrs ({ONLINE_TARGET} online / {F2F_TARGET} face-to-face)
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <HoursBox
                label="Online"
                event={onlineEvent}
                target={ONLINE_TARGET}
                canEdit={canEdit}
                onSaved={() => setReloadKey((k) => k + 1)}
              />
              <HoursBox
                label="Face-to-Face"
                event={f2fEvent}
                target={F2F_TARGET}
                canEdit={canEdit}
                onSaved={() => setReloadKey((k) => k + 1)}
              />
              <TotalBox total={total} target={TRAINING_HOUR_TARGET} />
            </div>
          </div>

          {/* ── Certifications Row ── */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Certifications
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {CERT_TYPES.map((cert) => {
                const event = findCertEvent(events, staffName, cert)
                return <CertPill key={cert.key} event={event} label={cert.label} />
              })}
            </div>
          </div>

          {/* ── Legend ── */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-5 pt-4 border-t border-gray-100">
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
        </>
      )}
    </div>
  )
}
