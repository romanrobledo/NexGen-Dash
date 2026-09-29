import { useMemo, useState } from 'react'
import {
  FileText,
  Plus,
  Loader2,
  AlertCircle,
  X,
  Trash2,
  Search,
  ChevronRight,
} from 'lucide-react'
import { useInvoices } from '../hooks/useInvoices'
import { useBillingPlans } from '../hooks/useBillingPlans'
import { useFamilies } from '../hooks/useFamilies'
import { formatMoney, formatMoneyInput, parseMoneyInput } from '../lib/money'

const STATUSES = ['draft', 'sent', 'paid', 'partial', 'overdue', 'voided']
const STATUS_TONES = {
  draft:   'bg-gray-100 text-gray-700',
  sent:    'bg-blue-100 text-blue-700',
  paid:    'bg-emerald-100 text-emerald-700',
  partial: 'bg-amber-100 text-amber-700',
  overdue: 'bg-rose-100 text-rose-700',
  voided:  'bg-gray-100 text-gray-500 line-through',
}

export default function InvoicesPage() {
  const invoices = useInvoices()
  const plans = useBillingPlans()
  const families = useFamilies()
  const [drawer, setDrawer] = useState(/** @type {{mode:'create'|'edit', invoice?:any}|null} */ (null))
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return invoices.rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (!q) return true
      if (String(r.invoiceNumber).includes(q)) return true
      if (r.familyName.toLowerCase().includes(q)) return true
      return false
    })
  }, [invoices.rows, search, statusFilter])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Invoices
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Bill families for tuition, drop-ins, or one-off charges.
            Payments recorded against an invoice update its status automatically.
          </p>
        </div>
        <button
          onClick={() => setDrawer({ mode: 'create' })}
          className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
        >
          <Plus className="w-3.5 h-3.5" />
          New invoice
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice # or family…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none min-w-[140px]"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {invoices.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{invoices.error}</p>
        </div>
      )}

      {invoices.loading ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center">
          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-semibold">
            {invoices.rows.length === 0 ? 'No invoices yet.' : 'No invoices match those filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <Th>#</Th>
                <Th>Family</Th>
                <Th>Issued</Th>
                <Th>Due</Th>
                <Th>Total</Th>
                <Th>Paid</Th>
                <Th>Status</Th>
                <th className="w-6" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => setDrawer({ mode: 'edit', invoice: inv })}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-blue-50/40 cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-900">
                    INV-{inv.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{inv.familyName}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{fmtDate(inv.issueDate)}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{fmtDate(inv.dueDate)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatMoney(inv.totalCents)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatMoney(inv.amountPaidCents)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${STATUS_TONES[inv.status] || STATUS_TONES.draft}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right"><ChevronRight className="w-4 h-4 text-gray-300" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <InvoiceEditDrawer
        open={!!drawer}
        mode={drawer?.mode || 'create'}
        invoice={drawer?.invoice}
        families={families.families}
        plans={plans.rows}
        onClose={() => setDrawer(null)}
        onSaved={() => setDrawer(null)}
        actions={invoices}
      />
    </div>
  )
}

function InvoiceEditDrawer({ open, mode, invoice, families, plans, onClose, onSaved, actions }) {
  const [values, setValues] = useState(emptyValues())
  const [formError, setFormError] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pending, setPending] = useState(false)

  useMemo(() => {
    if (!open) return
    setFormError(null); setConfirmDelete(false)
    if (mode === 'edit' && invoice) {
      setValues({
        familyId: invoice.familyId,
        status: invoice.status,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate || '',
        notes: invoice.notes || '',
        lineItems: invoice.lineItems.map((l) => ({
          description: l.description,
          planId: l.planId || '',
          quantity: l.quantity,
          unitInput: formatMoneyInput(l.unitAmountCents),
        })),
      })
    } else {
      setValues(emptyValues())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, invoice])

  if (!open) return null

  function updateLine(idx, patch) {
    setValues((s) => ({ ...s, lineItems: s.lineItems.map((l, i) => (i === idx ? { ...l, ...patch } : l)) }))
  }
  function addLine() {
    setValues((s) => ({ ...s, lineItems: [...s.lineItems, { description: '', planId: '', quantity: 1, unitInput: '' }] }))
  }
  function removeLine(idx) {
    setValues((s) => ({ ...s, lineItems: s.lineItems.filter((_, i) => i !== idx) }))
  }
  function pickPlan(idx, planId) {
    const plan = plans.find((p) => p.id === planId)
    if (!plan) { updateLine(idx, { planId: '' }); return }
    updateLine(idx, {
      planId,
      description: plan.name,
      unitInput: formatMoneyInput(plan.amountCents),
    })
  }

  const total = values.lineItems.reduce((sum, l) => {
    const cents = parseMoneyInput(l.unitInput)
    if (Number.isNaN(cents)) return sum
    return sum + Math.round(Number(l.quantity || 0) * cents)
  }, 0)

  async function handleSave() {
    setFormError(null)
    if (!values.familyId) return setFormError('Pick a family.')
    if (values.lineItems.length === 0) return setFormError('Add at least one line item.')
    const lineItems = values.lineItems.map((l) => ({
      description: l.description,
      planId: l.planId || null,
      quantity: Number(l.quantity || 1),
      unitAmountCents: parseMoneyInput(l.unitInput),
    }))
    if (lineItems.some((l) => !l.description || Number.isNaN(l.unitAmountCents) || l.unitAmountCents < 0)) {
      return setFormError('Every line needs a description and a valid unit amount.')
    }
    setPending(true)
    try {
      const payload = {
        familyId: values.familyId,
        status: values.status,
        issueDate: values.issueDate,
        dueDate: values.dueDate || null,
        notes: values.notes,
        lineItems,
      }
      const { error: sErr } = mode === 'edit'
        ? await actions.updateInvoice(invoice.id, payload)
        : await actions.createInvoice(payload)
      if (sErr) return setFormError(sErr)
      onSaved()
    } finally { setPending(false) }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setPending(true)
    try {
      const { error: dErr } = await actions.deleteInvoice(invoice.id)
      if (dErr) return setFormError(dErr)
      onSaved()
    } finally { setPending(false) }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden">
        <header className="px-5 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {mode === 'edit' ? `Invoice INV-${invoice.invoiceNumber}` : 'New invoice'}
            </h2>
            {mode === 'edit' && (
              <p className="text-[11px] text-gray-500">Paid {formatMoney(invoice.amountPaidCents)} of {formatMoney(invoice.totalCents)}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Family" required>
              <select
                value={values.familyId}
                onChange={(e) => setValues((s) => ({ ...s, familyId: e.target.value }))}
                className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="">— pick —</option>
                {families.map((f) => <option key={f.id} value={f.id}>{f.familyName}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={values.status}
                onChange={(e) => setValues((s) => ({ ...s, status: e.target.value }))}
                className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                {STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
            </Field>
            <Field label="Issue date" required>
              <input
                type="date"
                value={values.issueDate}
                onChange={(e) => setValues((s) => ({ ...s, issueDate: e.target.value }))}
                className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </Field>
            <Field label="Due date">
              <input
                type="date"
                value={values.dueDate}
                onChange={(e) => setValues((s) => ({ ...s, dueDate: e.target.value }))}
                className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </Field>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-700">Line items</p>
              <button onClick={addLine} className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add line
              </button>
            </div>
            <div className="space-y-2">
              {values.lineItems.map((l, i) => (
                <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                    <select
                      value={l.planId}
                      onChange={(e) => pickPlan(i, e.target.value)}
                      className="col-span-2 h-9 px-2 rounded border border-gray-200 bg-white text-xs focus:border-blue-400 outline-none"
                    >
                      <option value="">— from plan —</option>
                      {plans.map((p) => <option key={p.id} value={p.id}>{p.name} ({formatMoney(p.amountCents)})</option>)}
                    </select>
                    <input
                      type="text"
                      value={l.description}
                      onChange={(e) => updateLine(i, { description: e.target.value })}
                      placeholder="Description"
                      className="col-span-2 h-9 px-2 rounded border border-gray-200 bg-white text-xs focus:border-blue-400 outline-none"
                    />
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={l.quantity}
                      onChange={(e) => updateLine(i, { quantity: e.target.value })}
                      className="h-9 px-2 rounded border border-gray-200 bg-white text-xs focus:border-blue-400 outline-none"
                    />
                    <div className="flex items-center gap-1">
                      <div className="relative flex-1">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]">$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={l.unitInput}
                          onChange={(e) => updateLine(i, { unitInput: e.target.value })}
                          className="h-9 pl-5 pr-2 w-full rounded border border-gray-200 bg-white text-xs focus:border-blue-400 outline-none"
                        />
                      </div>
                      <button
                        onClick={() => removeLine(i)}
                        className="p-1 rounded text-gray-400 hover:text-red-600"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 text-right">
                    Line total {formatMoney(Math.round(Number(l.quantity || 0) * (parseMoneyInput(l.unitInput) || 0)))}
                  </p>
                </div>
              ))}
              {values.lineItems.length === 0 && (
                <p className="text-xs text-gray-500 italic px-2">No lines yet. Add one from a plan or write it free-form.</p>
              )}
            </div>
            <p className="text-sm text-right mt-3 font-bold text-gray-900">
              Invoice total: {formatMoney(total)}
            </p>
          </div>

          <Field label="Notes">
            <textarea
              rows={2}
              value={values.notes}
              onChange={(e) => setValues((s) => ({ ...s, notes: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              placeholder="Anything to remember about this invoice…"
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
              {confirmDelete ? 'Click again to confirm' : 'Delete invoice'}
            </button>
          ) : <span />}
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={onClose} disabled={pending} className="h-10 px-4 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
            <button onClick={handleSave} disabled={pending} className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50">
              {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {mode === 'edit' ? 'Save changes' : 'Create invoice'}
            </button>
          </div>
        </footer>
      </aside>
    </>
  )
}

function emptyValues() {
  return {
    familyId: '',
    status: 'draft',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    notes: '',
    lineItems: [],
  }
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-500 mt-1">{hint}</p>}
    </div>
  )
}

function Th({ children }) {
  return <th className="text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{children}</th>
}

function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return iso }
}
