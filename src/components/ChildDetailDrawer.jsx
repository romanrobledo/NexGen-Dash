import { useEffect, useState } from 'react'
import {
  X,
  Save,
  UserMinus,
  Loader2,
  AlertCircle,
  Baby,
  Plus,
  Trash2,
} from 'lucide-react'
import { useChildrenMutations } from '../hooks/useChildrenMutations'
import { formatAge, ENROLLMENT_STATUSES } from '../hooks/useChildren'

/**
 * Right-side slide-in for creating or editing a child.
 *   • child === null → create mode (empty form, INSERT on save)
 *   • child object   → edit mode (populated form, UPDATE on save)
 *
 * Save calls onSaved(record) so the parent can refetch + close. Withdraw
 * calls onWithdrawn(id) — a confirm modal gates it since it's destructive
 * from the app's POV (the row becomes invisible to useChildren).
 */
export default function ChildDetailDrawer({
  open,
  child,
  rooms = [],
  onClose,
  onSaved,
  onWithdrawn,
}) {
  const isCreate = open && !child
  const { createChild, updateChild, withdrawChild, saving, error } =
    useChildrenMutations()

  const [form, setForm] = useState(() => initialForm(child))
  const [confirmWithdraw, setConfirmWithdraw] = useState(false)
  const [localError, setLocalError] = useState('')

  // Reset form whenever the drawer opens with a different child.
  useEffect(() => {
    if (!open) return
    setForm(initialForm(child))
    setConfirmWithdraw(false)
    setLocalError('')
  }, [open, child])

  // ESC closes.
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (confirmWithdraw) setConfirmWithdraw(false)
        else onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, confirmWithdraw, onClose])

  if (!open) return null

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setLocalError('')
  }

  async function handleSave() {
    if (!form.fullName?.trim()) {
      setLocalError('Full name is required.')
      return
    }
    // Trim + coerce empty strings to null where DB expects it.
    const payload = {
      fullName: form.fullName.trim(),
      dateOfBirth: form.dateOfBirth || null,
      roomNumber: form.roomNumber === '' ? null : Number(form.roomNumber),
      teacherName: rooms.find((r) => r.roomNumber === Number(form.roomNumber))
        ?.teacherName || null,
      onCcms: !!form.onCcms,
      ccmsAmount: form.onCcms ? Number(form.ccmsAmount || 0) : 0,
      programClass: form.programClass?.trim() || null,
      remarks: form.remarks?.trim() || null,
      enrollmentStatus: form.enrollmentStatus,
      startDate: form.startDate || null,
    }
    const { data, error: err } = isCreate
      ? await createChild(payload)
      : await updateChild(child.id, payload)
    if (err) {
      setLocalError(err)
      return
    }
    onSaved?.(data)
  }

  async function handleWithdraw() {
    if (!child?.id) return
    const { error: err } = await withdrawChild(child.id)
    if (err) {
      setLocalError(err)
      return
    }
    setConfirmWithdraw(false)
    onWithdrawn?.(child.id)
  }

  const title = isCreate ? 'New Enrollment' : child.fullName
  const subtitle = isCreate
    ? 'Add a child to the roster'
    : `${formatAge(child.dateOfBirth) || 'age unknown'}${
        child.roomNumber != null ? ` · Room ${child.roomNumber}` : ''
      }`

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed right-0 top-0 h-full w-full sm:w-[520px] bg-white z-50 shadow-2xl flex flex-col"
        role="dialog"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-200">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-100 text-indigo-700">
            {isCreate ? <Plus className="w-5 h-5" /> : <Baby className="w-5 h-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
              {isCreate ? 'Roster' : 'Child'}
            </p>
            <h2 className="text-lg font-bold text-gray-900 leading-tight truncate">
              {title}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex-shrink-0"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <Field label="Full name" required>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              placeholder="Last, First"
              className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              autoFocus={isCreate}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date of birth">
              <input
                type="date"
                value={form.dateOfBirth || ''}
                onChange={(e) => update('dateOfBirth', e.target.value)}
                className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </Field>
            <Field label="Start date">
              <input
                type="date"
                value={form.startDate || ''}
                onChange={(e) => update('startDate', e.target.value)}
                className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </Field>
          </div>

          <Field label="Room">
            <select
              value={form.roomNumber ?? ''}
              onChange={(e) => update('roomNumber', e.target.value)}
              className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            >
              <option value="">— Unassigned —</option>
              {rooms
                .slice()
                .sort((a, b) => a.roomNumber - b.roomNumber)
                .map((r) => (
                  <option key={r.roomNumber} value={r.roomNumber}>
                    Room {r.roomNumber} · {r.teacherName} ({r.ageRange})
                  </option>
                ))}
            </select>
          </Field>

          <Field label="Enrollment status">
            <div className="flex gap-2">
              {ENROLLMENT_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update('enrollmentStatus', s)}
                  className={`flex-1 h-10 rounded-lg border-2 text-xs font-semibold capitalize transition ${
                    form.enrollmentStatus === s
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          <Field label="CCMS subsidy">
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.onCcms}
                  onChange={(e) => update('onCcms', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">On CCMS</span>
              </label>
              {form.onCcms && (
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-sm text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.ccmsAmount ?? ''}
                    onChange={(e) => update('ccmsAmount', e.target.value)}
                    placeholder="0.00"
                    className="flex-1 h-11 px-3 border border-gray-300 rounded-lg text-sm text-right tabular-nums focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  />
                  <span className="text-xs text-gray-400">/week</span>
                </div>
              )}
            </div>
          </Field>

          <Field label="Program / class label">
            <input
              type="text"
              value={form.programClass || ''}
              onChange={(e) => update('programClass', e.target.value)}
              placeholder="e.g. Pre-K 4, Infant, School Age"
              className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            />
          </Field>

          <Field label="Remarks">
            <textarea
              value={form.remarks || ''}
              onChange={(e) => update('remarks', e.target.value)}
              rows={3}
              placeholder="Allergies, notes, special considerations…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
            />
          </Field>

          {/* Errors — bottom of form so they land near the save button */}
          {(localError || error) && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{localError || error}</span>
            </div>
          )}
        </div>

        {/* Footer — Save + Withdraw */}
        <div className="border-t border-gray-200 px-5 py-4 flex items-center gap-3">
          {!isCreate && (
            <button
              onClick={() => setConfirmWithdraw(true)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 h-11 px-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserMinus className="w-4 h-4" />
              Withdraw
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="h-11 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 h-11 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isCreate ? 'Enroll' : 'Save'}
          </button>
        </div>
      </aside>

      {/* Withdraw confirm — modal-in-drawer, since destructive. */}
      {confirmWithdraw && child && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-900">
                  Withdraw {child.fullName}?
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  They'll be removed from active roster and classroom counts.
                  Their record stays in the database for compliance history —
                  this is a soft-delete, not permanent removal.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setConfirmWithdraw(false)}
                className="h-10 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={saving}
                className="inline-flex items-center gap-1.5 h-10 px-4 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function initialForm(child) {
  if (!child) {
    return {
      fullName: '',
      dateOfBirth: '',
      roomNumber: '',
      onCcms: false,
      ccmsAmount: '',
      programClass: '',
      remarks: '',
      enrollmentStatus: 'incoming',
      startDate: '',
    }
  }
  return {
    fullName: child.fullName || '',
    dateOfBirth: child.dateOfBirth || '',
    roomNumber: child.roomNumber ?? '',
    onCcms: !!child.onCcms,
    ccmsAmount: '',
    programClass: child.programClass || '',
    remarks: child.remarks || '',
    enrollmentStatus: child.enrollmentStatus || 'active',
    startDate: child.startDate || '',
  }
}
