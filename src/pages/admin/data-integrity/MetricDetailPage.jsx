import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  Plus,
  Pencil,
  Check,
  Flag,
  Loader2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Info,
  Megaphone,
  ClipboardList,
  UserPlus,
  UserMinus,
  Percent,
  Users,
  Home,
  DollarSign,
  Banknote,
  Award,
  CalendarRange,
} from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { useViewMode } from '../../../contexts/ViewModeContext'
import { supabase } from '../../../lib/supabase'
import { useIsEd, usePageAccess } from './hooks/useIsEd'
import { getMetricDef } from './metricDefinitions'
import { fireFieldUpdated } from './utils/webhookClient'
import {
  fmtFullTimestamp,
  relativeDaysSentence,
  isOverdue,
  verifiedThisCycle,
} from './utils/cycleMath'

/**
 * MetricDetailPage — /admin/data-integrity/metric/:metricName
 *
 * Drill-in view for a single Baseline Number KPI. Shows:
 *   1. Metric context (what it means, how to get it, formula, target, cadence)
 *   2. A "Submit a new value" form with smart period_ending defaults
 *   3. Latest submission at a glance
 *   4. Full history table with per-row Verify / Correct / Flag actions
 *
 * All writes go through Supabase and fire the per-field webhook, same as the
 * main Data Integrity page. Only rows flagged as inserts (new submissions)
 * vs. updates (edits) differ — both are treated as Ed's authoritative action
 * and mark the row 'verified' with his staff.id.
 */

// Icon resolver — maps name strings from metricDefinitions to Lucide components
const ICON_MAP = {
  Megaphone, ClipboardList, UserPlus, UserMinus, Percent, Users, Home,
  DollarSign, Banknote, Award, TrendingUp, TrendingDown,
}

export default function MetricDetailPage() {
  const { metricName } = useParams()
  const navigate = useNavigate()
  const { staff } = useAuth()
  const { mobileMode } = useViewMode()
  const canEdit = useIsEd()
  const { canView, role } = usePageAccess()

  const def = getMetricDef(metricName)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null) // row currently being written

  const fetchSubmissions = useCallback(async () => {
    if (!supabase || !metricName) return
    setError(null)
    const { data, error: err } = await supabase
      .from('data_integrity_baseline_numbers')
      .select('*')
      .eq('metric_name', metricName)
      .order('period_ending', { ascending: false, nullsFirst: false })
      .order('updated_at', { ascending: false })
    if (err) {
      console.error(`[MetricDetail:${metricName}] fetch failed:`, err.message)
      setError(err.message)
    } else {
      setSubmissions(data || [])
    }
    setLoading(false)
  }, [metricName])

  useEffect(() => {
    setLoading(true)
    fetchSubmissions()
  }, [fetchSubmissions])

  // Gate: Founder/Operator/Co-Integrator can view; others get the denial view
  if (!canView) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center px-4">
        <h2 className="text-lg font-semibold text-gray-900">Not your lane</h2>
        <p className="text-sm text-gray-500 mt-2">
          This page is for Ed, Roman, and Robyn. Your role ({role || 'unknown'}) isn't on the list.
        </p>
      </div>
    )
  }

  // Common actions shared across rows + submit form
  async function logAction({ action, rowId, oldValue, newValue, notes }) {
    try {
      await supabase.from('data_integrity_verification_log').insert({
        domain: 'baseline_numbers',
        action,
        field_changed: 'metric_value',
        old_value: oldValue != null ? String(oldValue) : null,
        new_value: newValue != null ? String(newValue) : null,
        verified_by: staff?.id || null,
        notes: notes || null,
      })
    } catch (err) {
      console.warn('verification_log insert failed (non-fatal):', err.message)
    }
  }

  async function fireWebhook({ action, oldValue, newValue, notes }) {
    const staffName = staff ? `${staff.first_name} ${staff.last_name}`.trim() : 'Unknown'
    await fireFieldUpdated({
      domain: 'baseline_numbers',
      action,
      field: metricName,
      old_value: oldValue != null ? String(oldValue) : null,
      new_value: newValue != null ? String(newValue) : null,
      verified_by_name: staffName,
      timestamp: new Date().toISOString(),
      notes: notes || null,
    })
  }

  async function handleSubmitNew({ value, periodEnding, notes }) {
    if (!staff?.id) return { ok: false, error: 'No staff session' }
    try {
      const payload = {
        metric_name: metricName,
        metric_value: value,
        period_type: def.cadence || 'weekly',
        period_ending: periodEnding || null,
        notes: notes || null,
        verification_status: 'verified',
        last_verified_at: new Date().toISOString(),
        last_verified_by: staff.id,
      }
      const { data, error: insErr } = await supabase
        .from('data_integrity_baseline_numbers')
        .insert(payload)
        .select()
        .single()
      if (insErr) throw insErr

      await logAction({ action: 'verified', rowId: data.id, newValue: value, notes })
      await fireWebhook({ action: 'verified', newValue: value, notes })
      await fetchSubmissions()
      return { ok: true }
    } catch (err) {
      console.error('Submit new failed:', err.message)
      return { ok: false, error: err.message }
    }
  }

  async function handleVerify(row) {
    if (busyId || !staff?.id) return
    setBusyId(row.id)
    try {
      const { error: upErr } = await supabase
        .from('data_integrity_baseline_numbers')
        .update({
          last_verified_at: new Date().toISOString(),
          last_verified_by: staff.id,
          verification_status: 'verified',
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id)
      if (upErr) throw upErr
      await logAction({ action: 'verified', rowId: row.id })
      await fireWebhook({ action: 'verified' })
      await fetchSubmissions()
    } catch (err) {
      console.error('Verify failed:', err.message)
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleCorrect(row, { value, periodEnding, notes }) {
    if (busyId || !staff?.id) return
    setBusyId(row.id)
    try {
      const oldValue = row.metric_value
      const { error: upErr } = await supabase
        .from('data_integrity_baseline_numbers')
        .update({
          metric_value: value,
          period_ending: periodEnding || null,
          notes: notes ?? row.notes,
          last_verified_at: new Date().toISOString(),
          last_verified_by: staff.id,
          verification_status: 'verified',
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id)
      if (upErr) throw upErr
      await logAction({ action: 'corrected', rowId: row.id, oldValue, newValue: value, notes })
      await fireWebhook({ action: 'corrected', oldValue, newValue: value, notes })
      await fetchSubmissions()
    } catch (err) {
      console.error('Correct failed:', err.message)
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleFlag(row) {
    if (busyId || !staff?.id) return
    const notes = window.prompt("What's off with this submission? (short note for the audit log)")
    if (notes == null) return
    setBusyId(row.id)
    try {
      const { error: upErr } = await supabase
        .from('data_integrity_baseline_numbers')
        .update({
          verification_status: 'flagged',
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id)
      if (upErr) throw upErr
      await logAction({ action: 'flagged', rowId: row.id, notes: notes.trim() || null })
      await fireWebhook({ action: 'flagged', notes: notes.trim() || null })
      await fetchSubmissions()
    } catch (err) {
      console.error('Flag failed:', err.message)
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const latestSubmission = submissions.find((s) => s.metric_value != null) || submissions[0]
  const iconComp = ICON_MAP[def.icon] || Info
  const DirectionIcon =
    def.direction === 'higher_better'
      ? TrendingUp
      : def.direction === 'lower_better'
        ? TrendingDown
        : null

  return (
    <div className={mobileMode ? 'space-y-5' : 'max-w-5xl mx-auto space-y-6'}>
      {/* Back link */}
      <button
        onClick={() => navigate('/admin/data-integrity')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1B4332] hover:text-[#081C15] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Data Integrity
      </button>

      {/* Header + metadata */}
      <MetricHeader
        def={def}
        iconComp={iconComp}
        DirectionIcon={DirectionIcon}
        latestSubmission={latestSubmission}
      />

      {/* About the metric */}
      <MetricAboutCard def={def} />

      {/* Submit new value */}
      {canEdit && (
        <SubmitNewForm def={def} onSubmit={handleSubmitNew} />
      )}

      {/* History */}
      <SubmissionHistory
        submissions={submissions}
        loading={loading}
        error={error}
        canEdit={canEdit}
        busyId={busyId}
        def={def}
        onVerify={handleVerify}
        onCorrect={handleCorrect}
        onFlag={handleFlag}
      />
    </div>
  )
}

// ─── Header ─────────────────────────────────────────────────────────────────
function MetricHeader({ def, iconComp: Icon, DirectionIcon, latestSubmission }) {
  const cadenceLabel = def.cadence === 'weekly' ? 'Weekly' : def.cadence === 'monthly' ? 'Monthly' : 'Ongoing'
  const directionLabel =
    def.direction === 'higher_better' ? 'Higher is better' :
    def.direction === 'lower_better' ? 'Lower is better' : null

  const latestValue = latestSubmission?.metric_value
  const latestPeriod = latestSubmission?.period_ending

  return (
    <section className="rounded-2xl border border-[#52B788]/30 bg-gradient-to-br from-[#EDF4EC] to-white p-6 shadow-sm">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="w-12 h-12 rounded-2xl bg-[#1B4332] flex items-center justify-center shadow-sm shrink-0">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-[#081C15]">{def.label}</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">{def.description}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-white border border-[#52B788]/40 text-[#1B4332]">
              <CalendarRange className="w-3 h-3" />
              {cadenceLabel}
            </span>
            {directionLabel && DirectionIcon && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                <DirectionIcon className="w-3 h-3" />
                {directionLabel}
              </span>
            )}
            {def.targetValue != null && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                <Target className="w-3 h-3" />
                Target: {def.unit === '$' ? '$' : ''}{def.targetValue}{def.unit && def.unit !== '$' ? def.unit : ''}
              </span>
            )}
          </div>
        </div>

        {/* Latest value at a glance */}
        <div className="shrink-0 bg-white rounded-2xl border border-gray-100 p-4 min-w-[160px] text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Latest value</p>
          <p className="text-3xl font-bold text-[#1B4332] tabular-nums mt-1">
            {latestValue != null ? (
              <>
                {def.unit === '$' ? '$' : ''}
                {formatValue(latestValue, def.unit)}
                {def.unit && def.unit !== '$' ? <span className="text-lg ml-0.5">{def.unit}</span> : null}
              </>
            ) : (
              <span className="text-gray-300 text-lg italic">not set</span>
            )}
          </p>
          {latestPeriod && (
            <p className="text-[11px] text-gray-400 mt-1">
              {periodLabel(latestPeriod, def.cadence)}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── About card ─────────────────────────────────────────────────────────────
function MetricAboutCard({ def }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="text-base font-bold text-[#081C15] flex items-center gap-2 mb-4">
        <Info className="w-4 h-4 text-[#1B4332]" />
        About this metric
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AboutBlock title="Where to find the number" body={def.howToGet} />
        {def.formula && <AboutBlock title="How it's calculated" body={def.formula} mono />}
      </div>
    </section>
  )
}

function AboutBlock({ title, body, mono = false }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
        {title}
      </p>
      <p className={`text-sm text-gray-700 leading-relaxed ${mono ? 'font-mono bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 text-[13px]' : ''}`}>
        {body}
      </p>
    </div>
  )
}

// ─── Submit new value form ──────────────────────────────────────────────────
function SubmitNewForm({ def, onSubmit }) {
  const [value, setValue] = useState('')
  const [periodEnding, setPeriodEnding] = useState(defaultPeriodEnding(def.cadence))
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const canSubmit = value !== '' && !isNaN(Number(value)) && !busy

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setBusy(true)
    setError(null)
    const result = await onSubmit({
      value: Number(value),
      periodEnding,
      notes: notes.trim() || null,
    })
    setBusy(false)
    if (result.ok) {
      setSuccess(true)
      setValue('')
      setNotes('')
      setTimeout(() => setSuccess(false), 2500)
    } else {
      setError(result.error || 'Something went wrong.')
    }
  }

  return (
    <section className="rounded-2xl border border-[#52B788]/40 bg-white p-6">
      <h2 className="text-base font-bold text-[#081C15] flex items-center gap-2 mb-1">
        <Plus className="w-4 h-4 text-[#1B4332]" />
        Submit a new value
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Enter the value for a specific {def.cadence === 'monthly' ? 'month' : 'week'}. This gets recorded and verified in one step.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Value {def.unit ? <span className="text-gray-400 font-normal">({def.unit})</span> : ''}
            </label>
            <input
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={def.unit === '$' ? '0.00' : '0'}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52B788]/40 focus:border-[#1B4332] transition-colors tabular-nums"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              {def.cadence === 'monthly' ? 'Month ending' : 'Week ending'}
            </label>
            <input
              type="date"
              value={periodEnding}
              onChange={(e) => setPeriodEnding(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52B788]/40 focus:border-[#1B4332] transition-colors"
            />
          </div>
          <div className="md:col-span-1 flex flex-col justify-end">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#1B4332] text-white hover:bg-[#081C15] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Submit & verify
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
            Notes (optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., excludes 3 disqualified leads, includes the Tuesday walk-in"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52B788]/40 focus:border-[#1B4332] transition-colors placeholder:text-gray-300"
          />
        </div>

        {success && (
          <p className="text-xs text-[#1B4332] bg-[#EDF4EC] border border-[#52B788]/40 rounded-lg px-3 py-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Saved. This value is now live.
          </p>
        )}
        {error && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </p>
        )}
      </form>
    </section>
  )
}

// ─── History table ──────────────────────────────────────────────────────────
function SubmissionHistory({ submissions, loading, error, canEdit, busyId, def, onVerify, onCorrect, onFlag }) {
  const withValues = submissions.filter((s) => s.metric_value != null)
  const placeholders = submissions.filter((s) => s.metric_value == null)

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-[#081C15]">Submission History</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Every value ever submitted, newest first. Click Edit to correct any one of them.
          </p>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {withValues.length} {withValues.length === 1 ? 'submission' : 'submissions'}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading history…
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          Couldn't load history: {error}
        </div>
      ) : submissions.length === 0 ? (
        <p className="text-sm text-gray-400 italic py-8 text-center">
          No submissions yet. Use the form above to enter the first value.
        </p>
      ) : (
        <div className="space-y-2">
          {withValues.map((row) => (
            <SubmissionRow
              key={row.id}
              row={row}
              def={def}
              canEdit={canEdit}
              busy={busyId === row.id}
              onVerify={() => onVerify(row)}
              onCorrect={(payload) => onCorrect(row, payload)}
              onFlag={() => onFlag(row)}
            />
          ))}

          {/* Placeholder rows from the seed — value=null, nothing submitted yet */}
          {placeholders.length > 0 && (
            <div className="pt-3 mt-3 border-t border-dashed border-gray-200">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Placeholder slots ({placeholders.length}) — waiting for first submission
              </p>
              {placeholders.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-gray-50 text-xs text-gray-400 italic"
                >
                  <span>
                    {row.period_type === 'weekly' ? 'Weekly slot' : 'Monthly slot'} (created {fmtFullTimestamp(row.created_at)})
                  </span>
                  {canEdit && (
                    <button
                      onClick={() => onFlag(row)}
                      disabled={busyId === row.id}
                      className="text-[10px] text-gray-500 hover:text-red-500 transition-colors"
                    >
                      Flag / remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

// ─── Individual history row (with inline edit mode) ─────────────────────────
function SubmissionRow({ row, def, canEdit, busy, onVerify, onCorrect, onFlag }) {
  const [editing, setEditing] = useState(false)
  const [draftValue, setDraftValue] = useState(row.metric_value ?? '')
  const [draftPeriod, setDraftPeriod] = useState(row.period_ending || '')
  const [draftNotes, setDraftNotes] = useState(row.notes || '')

  const status = row.verification_status
  const verifiedCycle = verifiedThisCycle(row.last_verified_at)
  const overdue = isOverdue(row.last_verified_at)

  function startEdit() {
    setDraftValue(row.metric_value ?? '')
    setDraftPeriod(row.period_ending || '')
    setDraftNotes(row.notes || '')
    setEditing(true)
  }

  async function saveEdit() {
    if (draftValue === '' || isNaN(Number(draftValue))) return
    await onCorrect({
      value: Number(draftValue),
      periodEnding: draftPeriod || null,
      notes: draftNotes.trim() || null,
    })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="rounded-xl border-2 border-[#52B788] bg-[#EDF4EC]/40 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Value</label>
            <input
              type="number"
              step="any"
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52B788]/40 tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              {def.cadence === 'monthly' ? 'Month ending' : 'Week ending'}
            </label>
            <input
              type="date"
              value={draftPeriod}
              onChange={(e) => setDraftPeriod(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52B788]/40"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Notes</label>
            <input
              type="text"
              value={draftNotes}
              onChange={(e) => setDraftNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52B788]/40"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={saveEdit}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1B4332] text-white hover:bg-[#081C15] disabled:opacity-50 transition-colors"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Save & verify
          </button>
          <button
            onClick={() => setEditing(false)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-3 py-3 px-4 rounded-xl border transition-colors ${
        status === 'flagged'
          ? 'bg-red-50/50 border-red-200'
          : status === 'verified' && verifiedCycle
            ? 'bg-[#EDF4EC] border-[#52B788]/40'
            : overdue
              ? 'bg-amber-50 border-amber-200'
              : 'bg-white border-gray-200'
      }`}
    >
      {/* Period + status */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900">
            {row.period_ending
              ? periodLabel(row.period_ending, row.period_type)
              : <span className="text-gray-400 italic">No period set</span>}
          </p>
          <RowStatusChip status={status} verifiedCycle={verifiedCycle} overdue={overdue} />
        </div>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Last checked: <span className="font-medium text-gray-500">{relativeDaysSentence(row.last_verified_at)}</span>
          {row.notes && (
            <>
              <span className="mx-1.5 text-gray-300">•</span>
              <span className="italic">{row.notes}</span>
            </>
          )}
        </p>
      </div>

      {/* Value */}
      <div className="shrink-0 min-w-[100px] sm:text-right">
        <p className="text-lg font-bold text-[#1B4332] tabular-nums">
          {def.unit === '$' ? '$' : ''}
          {formatValue(row.metric_value, def.unit)}
          {def.unit && def.unit !== '$' ? <span className="text-xs ml-0.5 text-gray-500">{def.unit}</span> : null}
        </p>
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="shrink-0 flex items-center gap-1.5 flex-wrap">
          <button
            onClick={onVerify}
            disabled={busy}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1B4332] text-white hover:bg-[#081C15] disabled:opacity-50 transition-colors"
            title="Mark this submission verified"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Accurate
          </button>
          <button
            onClick={startEdit}
            disabled={busy}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#52B788] text-[#1B4332] hover:bg-[#EDF4EC] disabled:opacity-50 transition-colors"
            title="Edit this submission"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={onFlag}
            disabled={busy}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
            title="Flag for later review"
          >
            <Flag className="w-3.5 h-3.5" />
            Flag
          </button>
        </div>
      )}
    </div>
  )
}

function RowStatusChip({ status, verifiedCycle, overdue }) {
  if (status === 'flagged') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
        <Flag className="w-3 h-3" />
        FLAGGED
      </span>
    )
  }
  if (status === 'verified' && verifiedCycle) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1B4332] bg-[#52B788]/20 border border-[#52B788]/40 px-1.5 py-0.5 rounded">
        <CheckCircle2 className="w-3 h-3" />
        VERIFIED
      </span>
    )
  }
  if (overdue) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
        <AlertTriangle className="w-3 h-3" />
        OVERDUE
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
      <Clock className="w-3 h-3" />
      NEEDS REVIEW
    </span>
  )
}

// ─── Formatting helpers ─────────────────────────────────────────────────────
function formatValue(value, unit) {
  if (value == null) return '—'
  if (unit === '$') return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (unit === '%') return Number(value).toFixed(1)
  if (Number.isInteger(Number(value))) return String(Number(value))
  return Number(value).toFixed(2)
}

function periodLabel(dateStr, periodType) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const fmt = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${periodType === 'monthly' ? 'Month' : 'Week'} ending ${fmt}`
}

function defaultPeriodEnding(cadence) {
  const d = new Date()
  if (cadence === 'monthly') {
    // Last day of the CURRENT month (change to `previous month` if you prefer)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    return toDateInput(end)
  }
  // Weekly: most recent Sunday (including today if Sunday)
  const day = d.getDay()
  const back = day === 0 ? 0 : day
  const sunday = new Date(d)
  sunday.setDate(d.getDate() - back + (day === 0 ? 0 : 0))
  // Actually: we want "week ending Sunday" = the Sunday just past OR today
  const weekEnd = new Date(d)
  weekEnd.setDate(d.getDate() - ((day + 0) % 7))
  // Simpler: go back to the nearest Sunday at/before today
  const candidate = new Date(d)
  candidate.setDate(d.getDate() - day)
  return toDateInput(candidate)
}

function toDateInput(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
