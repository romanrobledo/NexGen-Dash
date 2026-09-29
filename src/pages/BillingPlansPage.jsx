import { useMemo, useState } from 'react'
import {
  DollarSign,
  Plus,
  Pencil,
  Loader2,
  AlertCircle,
  Trash2,
  X,
} from 'lucide-react'
import { useBillingPlans } from '../hooks/useBillingPlans'
import { formatMoney, formatMoneyInput, parseMoneyInput } from '../lib/money'

const FREQUENCIES = [
  { key: 'weekly',   label: 'per week' },
  { key: 'monthly',  label: 'per month' },
  { key: 'one_time', label: 'one-time' },
]

export default function BillingPlansPage() {
  const [showInactive, setShowInactive] = useState(false)
  const { rows, loading, error, createPlan, updatePlan, deletePlan } =
    useBillingPlans({ includeInactive: showInactive })
  const [drawer, setDrawer] = useState(/** @type {{mode:'create'|'edit', plan?:any}|null} */ (null))

  const rowsSorted = useMemo(
    () =>
      [...rows].sort((a, b) => {
        if (a.active !== b.active) return a.active ? -1 : 1
        return b.amountCents - a.amountCents
      }),
    [rows]
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
            Billing Plans
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tuition tiers, drop-in rates, one-time fees. Drives the plan picker on invoices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 inline-flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600"
            />
            Show inactive
          </label>
          <button
            onClick={() => setDrawer({ mode: 'create' })}
            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            New plan
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : rowsSorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center">
          <p className="text-sm text-gray-600 font-semibold">No plans yet.</p>
          <p className="text-xs text-gray-400 mt-1">
            The starter seed in sql/billing-schema.sql inserts six typical tuition tiers.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rowsSorted.map((p) => (
            <li
              key={p.id}
              className={`rounded-xl border p-4 flex items-start gap-3 ${
                p.active ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-70'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-gray-900">{p.name}</p>
                  {p.ageRange && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">
                      {p.ageRange}
                    </span>
                  )}
                  {!p.active && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-600 rounded px-1.5 py-0.5">
                      Inactive
                    </span>
                  )}
                </div>
                {p.description && <p className="text-xs text-gray-600 mt-1">{p.description}</p>}
                {p.notes && <p className="text-[11px] text-gray-500 italic mt-1">{p.notes}</p>}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{formatMoney(p.amountCents)}</p>
                <p className="text-[11px] text-gray-500">
                  {FREQUENCIES.find((f) => f.key === p.frequency)?.label || p.frequency}
                </p>
              </div>
              <button
                onClick={() => setDrawer({ mode: 'edit', plan: p })}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <PlanEditDrawer
        open={!!drawer}
        mode={drawer?.mode || 'create'}
        plan={drawer?.plan}
        onClose={() => setDrawer(null)}
        onSaved={() => setDrawer(null)}
        actions={{ createPlan, updatePlan, deletePlan }}
      />
    </div>
  )
}

function PlanEditDrawer({ open, mode, plan, onClose, onSaved, actions }) {
  const [values, setValues] = useState(emptyValues())
  const [formError, setFormError] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pending, setPending] = useState(false)

  useMemo(() => {
    if (!open) return
    setFormError(null); setConfirmDelete(false)
    if (mode === 'edit' && plan) {
      setValues({
        name: plan.name || '',
        description: plan.description || '',
        amountInput: formatMoneyInput(plan.amountCents),
        frequency: plan.frequency,
        ageRange: plan.ageRange || '',
        active: plan.active,
        notes: plan.notes || '',
      })
    } else {
      setValues(emptyValues())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, plan])

  if (!open) return null

  async function handleSave() {
    setFormError(null)
    if (!values.name.trim()) return setFormError('Name is required.')
    const cents = parseMoneyInput(values.amountInput)
    if (Number.isNaN(cents) || cents < 0) return setFormError('Amount must be a positive number.')
    setPending(true)
    try {
      const payload = {
        name: values.name,
        description: values.description,
        amountCents: cents,
        frequency: values.frequency,
        ageRange: values.ageRange,
        active: values.active,
        notes: values.notes,
      }
      const { error: sErr } = mode === 'edit'
        ? await actions.updatePlan(plan.id, payload)
        : await actions.createPlan(payload)
      if (sErr) return setFormError(sErr)
      onSaved()
    } finally { setPending(false) }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setPending(true)
    try {
      const { error: dErr } = await actions.deletePlan(plan.id)
      if (dErr) return setFormError(dErr)
      onSaved()
    } finally { setPending(false) }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
        <header className="px-5 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === 'edit' ? 'Edit plan' : 'New plan'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <Field label="Name" required>
            <input
              type="text"
              value={values.name}
              autoFocus
              onChange={(e) => setValues((s) => ({ ...s, name: e.target.value }))}
              className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              placeholder="Full-Time — 4-5 yr"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount" required hint="Dollars — cents optional.">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={values.amountInput}
                  onChange={(e) => setValues((s) => ({ ...s, amountInput: e.target.value }))}
                  className="h-10 pl-6 pr-3 rounded-lg border border-gray-200 bg-white text-sm w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="198.00"
                />
              </div>
            </Field>
            <Field label="Frequency">
              <select
                value={values.frequency}
                onChange={(e) => setValues((s) => ({ ...s, frequency: e.target.value }))}
                className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                {FREQUENCIES.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Age range" hint="Optional label — 0-17mo, 4-5yr, etc.">
            <input
              type="text"
              value={values.ageRange}
              onChange={(e) => setValues((s) => ({ ...s, ageRange: e.target.value }))}
              className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              placeholder="4-5yr"
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={2}
              value={values.description}
              onChange={(e) => setValues((s) => ({ ...s, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </Field>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={values.active}
              onChange={(e) => setValues((s) => ({ ...s, active: e.target.checked }))}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Active</p>
              <p className="text-[11px] text-gray-500">Inactive plans stay in the DB but don't show on the invoice picker.</p>
            </div>
          </label>
          <Field label="Notes">
            <textarea
              rows={2}
              value={values.notes}
              onChange={(e) => setValues((s) => ({ ...s, notes: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </Field>
          {formError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{formError}</p>
            </div>
          )}
        </div>
        <footer className="px-5 py-4 border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
          {mode === 'edit' ? (
            <button
              onClick={handleDelete}
              disabled={pending}
              className={`inline-flex items-center gap-1.5 h-10 px-3 rounded-lg text-sm font-semibold transition ${
                confirmDelete ? 'bg-red-600 hover:bg-red-700 text-white' : 'text-red-600 hover:bg-red-50 border border-red-200'
              } disabled:opacity-50`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {confirmDelete ? 'Click again to confirm' : 'Delete'}
            </button>
          ) : <span />}
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={onClose} disabled={pending} className="h-10 px-4 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
            <button onClick={handleSave} disabled={pending} className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50">
              {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {mode === 'edit' ? 'Save' : 'Create'}
            </button>
          </div>
        </footer>
      </aside>
    </>
  )
}

function emptyValues() {
  return { name: '', description: '', amountInput: '', frequency: 'monthly', ageRange: '', active: true, notes: '' }
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-500 mt-1">{hint}</p>}
    </div>
  )
}
