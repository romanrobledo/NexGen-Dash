import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Plus,
  Loader2,
  CheckCircle2,
  X,
  Send,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isBooksAdmin } from '../lib/roles'
import { useIssues } from '../hooks/useIssuesAndIdeas'

const CATEGORIES = [
  { key: 'facility',        label: 'Facility' },
  { key: 'safety',          label: 'Safety' },
  { key: 'child_behavior',  label: 'Child behavior' },
  { key: 'parent',          label: 'Parent' },
  { key: 'equipment',       label: 'Equipment' },
  { key: 'staffing',        label: 'Staffing' },
  { key: 'other',           label: 'Other' },
]

const SEVERITIES = [
  { key: 'low',    label: 'Low',    tone: 'bg-gray-100 text-gray-700' },
  { key: 'medium', label: 'Medium', tone: 'bg-amber-100 text-amber-800' },
  { key: 'high',   label: 'High',   tone: 'bg-orange-100 text-orange-800' },
  { key: 'urgent', label: 'Urgent', tone: 'bg-rose-100 text-rose-800' },
]

const STATUSES = [
  { key: 'open',        label: 'Open',        tone: 'bg-rose-100 text-rose-800' },
  { key: 'in_progress', label: 'In progress', tone: 'bg-blue-100 text-blue-800' },
  { key: 'resolved',    label: 'Resolved',    tone: 'bg-emerald-100 text-emerald-800' },
  { key: 'dismissed',   label: 'Dismissed',   tone: 'bg-gray-100 text-gray-700' },
]

const statusTone = (k) => STATUSES.find(s => s.key === k)?.tone || 'bg-gray-100 text-gray-700'
const severityTone = (k) => SEVERITIES.find(s => s.key === k)?.tone || 'bg-gray-100 text-gray-700'

export default function IssuesPage() {
  const { staff } = useAuth()
  const admin = isBooksAdmin(staff)
  const [statusFilter, setStatusFilter] = useState(null)
  const { rows, loading, error, submit, update } = useIssues({ status: statusFilter })
  const [drawer, setDrawer] = useState(null) // 'create' | { mode:'triage', row }

  const openCount = useMemo(
    () => rows.filter(r => r.status === 'open' || r.status === 'in_progress').length,
    [rows]
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            Issues
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {admin
              ? 'Everything staff has flagged. Triage and respond.'
              : "Report something that's broken, unsafe, or blocking your day."}
          </p>
        </div>
        <button
          onClick={() => setDrawer('create')}
          className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Report issue
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-xs">
        <FilterChip active={statusFilter === null}      onClick={() => setStatusFilter(null)}>All ({rows.length})</FilterChip>
        <FilterChip active={statusFilter === 'open'}       onClick={() => setStatusFilter('open')}>Open</FilterChip>
        <FilterChip active={statusFilter === 'in_progress'} onClick={() => setStatusFilter('in_progress')}>In progress</FilterChip>
        <FilterChip active={statusFilter === 'resolved'}   onClick={() => setStatusFilter('resolved')}>Resolved</FilterChip>
        <FilterChip active={statusFilter === 'dismissed'}  onClick={() => setStatusFilter('dismissed')}>Dismissed</FilterChip>
        {statusFilter === null && (
          <span className="ml-auto text-gray-500">{openCount} open/in-progress</span>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 inline-flex items-center justify-center gap-2 w-full">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading issues…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-3 py-2 text-sm">{error}</div>
      ) : rows.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-gray-200">
          <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <div className="text-sm text-gray-600">Nothing here yet.</div>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map(r => (
            <li key={r.id}
                onClick={() => admin && setDrawer({ mode: 'triage', row: r })}
                className={`bg-white rounded-xl border border-gray-200 p-4 ${admin ? 'hover:border-blue-300 cursor-pointer' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${statusTone(r.status)}`}>
                      {STATUSES.find(s => s.key === r.status)?.label || r.status}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${severityTone(r.severity)}`}>
                      {r.severity}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                      {CATEGORIES.find(c => c.key === r.category)?.label || r.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{r.description}</p>
                  <div className="text-xs text-gray-500 mt-1.5">
                    {r.submittedByName || '—'} · {new Date(r.submittedAt).toLocaleString()}
                  </div>
                  {r.resolverNotes && (
                    <div className="mt-2 text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded p-2 whitespace-pre-wrap">
                      <b>{r.resolverName ? `${r.resolverName}:` : 'Response:'}</b> {r.resolverNotes}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {drawer === 'create' && (
        <ReportDrawer
          onClose={() => setDrawer(null)}
          onSubmit={async (values) => {
            const { error: eErr } = await submit({ submittedBy: staff.id, ...values })
            return eErr
          }}
        />
      )}
      {drawer && drawer.mode === 'triage' && (
        <TriageDrawer
          row={drawer.row}
          onClose={() => setDrawer(null)}
          onUpdate={async (patch) => {
            const { error: eErr } = await update(drawer.row.id, {
              ...patch,
              resolverId: patch.resolverNotes || patch.status ? staff.id : undefined,
            })
            return eErr
          }}
        />
      )}
    </div>
  )
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`h-7 px-2.5 rounded-full border ${
        active
          ? 'bg-gray-900 text-white border-gray-900'
          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  )
}

function ReportDrawer({ onClose, onSubmit }) {
  const [category, setCategory] = useState('safety')
  const [severity, setSeverity] = useState('medium')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  async function save() {
    if (!description.trim()) { setErr('Describe the issue.'); return }
    setSaving(true); setErr(null)
    const eErr = await onSubmit({ category, severity, description })
    setSaving(false)
    if (eErr) { setErr(eErr); return }
    onClose()
  }

  return (
    <Drawer title="Report an issue" onClose={onClose}>
      <PickerRow label="Category">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(c => (
            <Chip key={c.key} active={category === c.key} onClick={() => setCategory(c.key)}>{c.label}</Chip>
          ))}
        </div>
      </PickerRow>
      <PickerRow label="Severity">
        <div className="flex flex-wrap gap-1.5">
          {SEVERITIES.map(s => (
            <Chip key={s.key} active={severity === s.key} onClick={() => setSeverity(s.key)}>{s.label}</Chip>
          ))}
        </div>
      </PickerRow>
      <PickerRow label="Description">
        <textarea
          rows={5}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What's wrong? Where? Since when?"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </PickerRow>
      {err && <div className="text-sm text-rose-700">{err}</div>}
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onClose} className="h-9 px-3 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Cancel</button>
        <button onClick={save} disabled={saving}
          className="h-9 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit
        </button>
      </div>
    </Drawer>
  )
}

function TriageDrawer({ row, onClose, onUpdate }) {
  const [status, setStatus] = useState(row.status)
  const [severity, setSeverity] = useState(row.severity)
  const [notes, setNotes] = useState(row.resolverNotes || '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  async function save() {
    setSaving(true); setErr(null)
    const eErr = await onUpdate({ status, severity, resolverNotes: notes })
    setSaving(false)
    if (eErr) { setErr(eErr); return }
    onClose()
  }

  return (
    <Drawer title="Triage issue" onClose={onClose}>
      <div className="text-xs text-gray-600 mb-2">
        Reported by <b>{row.submittedByName}</b> — {new Date(row.submittedAt).toLocaleString()}
      </div>
      <div className="text-sm text-gray-800 bg-gray-50 border border-gray-100 rounded-lg p-3 whitespace-pre-wrap">
        {row.description}
      </div>

      <PickerRow label="Status">
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map(s => (
            <Chip key={s.key} active={status === s.key} onClick={() => setStatus(s.key)}>{s.label}</Chip>
          ))}
        </div>
      </PickerRow>
      <PickerRow label="Severity">
        <div className="flex flex-wrap gap-1.5">
          {SEVERITIES.map(s => (
            <Chip key={s.key} active={severity === s.key} onClick={() => setSeverity(s.key)}>{s.label}</Chip>
          ))}
        </div>
      </PickerRow>
      <PickerRow label="Response notes">
        <textarea
          rows={4}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="What was done? What's next?"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </PickerRow>

      {err && <div className="text-sm text-rose-700">{err}</div>}
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onClose} className="h-9 px-3 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Cancel</button>
        <button onClick={save} disabled={saving}
          className="h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save
        </button>
      </div>
    </Drawer>
  )
}

// ── Shared little primitives ────────────────────────────────────────────

function Drawer({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="p-5 space-y-3">{children}</div>
      </div>
    </div>
  )
}

function PickerRow({ label, children }) {
  return (
    <div>
      <div className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">{label}</div>
      {children}
    </div>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 px-3 rounded-full text-xs border ${
        active
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  )
}
