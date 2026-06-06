import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  Pencil,
  Flag,
  Loader2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'
import InlineEditField from './InlineEditField'
import { relativeDaysSentence, isOverdue, verifiedThisCycle } from './utils/cycleMath'

/**
 * DomainRow — one row of data with its current value + action buttons.
 *
 * Props
 * -----
 *   row          — the Supabase row (includes verification_status, last_verified_at, etc.)
 *   displayLabel — the human-friendly name to show first ("New Leads This Week")
 *   displayExtra — optional secondary line under the label ("Weekly")
 *   value        — the current value shown in the middle column
 *   valueType    — 'number' | 'text' (passed to the <input> when editing)
 *   canEdit      — true if the logged-in user is Ed (shows action buttons)
 *   isActioning  — true while a write is in-flight for this row
 *   onVerify     — () => Promise
 *   onCorrect    — (newValue) => Promise
 *   onFlag       — (notes) => Promise
 */
export default function DomainRow({
  row,
  displayLabel,
  displayExtra,
  value,
  valueType = 'text',
  canEdit,
  isActioning,
  detailHref,
  onVerify,
  onCorrect,
  onFlag,
}) {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)

  function handleRowClick(e) {
    if (!detailHref) return
    if (editing) return
    // Don't navigate when the click came from a button, input, etc.
    if (e.target.closest('button, input, a, textarea')) return
    navigate(detailHref)
  }

  const status = row.verification_status
  const verifiedCycle = verifiedThisCycle(row.last_verified_at)
  const overdue = isOverdue(row.last_verified_at)

  async function handleSave(newValue) {
    await onCorrect(newValue)
    setEditing(false)
  }

  async function handleFlag() {
    const notes = window.prompt("What seems off with this one? (add a short note for the admin log)")
    if (notes == null) return // user cancelled
    await onFlag(notes.trim() || null)
  }

  return (
    <div
      onClick={handleRowClick}
      className={`flex flex-col sm:flex-row sm:items-center gap-3 py-3 px-4 rounded-xl border transition-colors ${
        detailHref && !editing ? 'cursor-pointer hover:shadow-sm' : ''
      } ${
        status === 'flagged'
          ? 'bg-red-50/50 border-red-200 hover:border-red-300'
          : status === 'verified' && verifiedCycle
            ? 'bg-[#EDF4EC] border-[#52B788]/40 hover:border-[#52B788]'
            : overdue
              ? 'bg-amber-50 border-amber-200 hover:border-amber-300'
              : 'bg-white border-gray-200 hover:border-[#52B788]/60'
      }`}
      title={detailHref && !editing ? 'Click to open the full metric view' : undefined}
    >
      {/* Left — label + status meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 truncate">{displayLabel}</p>
          <RowStatusChip status={status} verifiedCycle={verifiedCycle} overdue={overdue} />
        </div>
        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
          {displayExtra && <span>{displayExtra}</span>}
          {displayExtra && <span className="text-gray-300">•</span>}
          <span>
            Last checked: <span className="font-medium text-gray-500">{relativeDaysSentence(row.last_verified_at)}</span>
          </span>
        </p>
      </div>

      {/* Middle — value (editable inline) */}
      <div className="shrink-0 min-w-[140px] flex items-center justify-start sm:justify-end">
        <InlineEditField
          value={value}
          type={valueType}
          editing={editing}
          saving={isActioning}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      </div>

      {/* Right — action buttons (Ed only) */}
      {canEdit && !editing && (
        <div className="shrink-0 flex items-center gap-1.5 flex-wrap">
          <button
            onClick={onVerify}
            disabled={isActioning}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1B4332] text-white hover:bg-[#081C15] disabled:opacity-50 transition-colors"
            title="Looks right — mark this verified"
          >
            {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Accurate
          </button>
          <button
            onClick={() => setEditing(true)}
            disabled={isActioning}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#52B788] text-[#1B4332] hover:bg-[#EDF4EC] disabled:opacity-50 transition-colors"
            title="Type in the correct value"
          >
            <Pencil className="w-3.5 h-3.5" />
            Needs Correction
          </button>
          <button
            onClick={handleFlag}
            disabled={isActioning}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
            title="Something's off — flag it for later"
          >
            <Flag className="w-3.5 h-3.5" />
            Flag
          </button>
        </div>
      )}

      {/* Drill-in hint for clickable rows */}
      {detailHref && !editing && (
        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 hidden sm:block" />
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
