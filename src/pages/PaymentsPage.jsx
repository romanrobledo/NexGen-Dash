import { useMemo, useState } from 'react'
import {
  CreditCard,
  Plus,
  Loader2,
  AlertCircle,
  X,
  Trash2,
  Search,
} from 'lucide-react'
import { usePayments } from '../hooks/usePayments'
import { useInvoices } from '../hooks/useInvoices'
import { useFamilies } from '../hooks/useFamilies'
import { formatMoney, formatMoneyInput, parseMoneyInput } from '../lib/money'

const METHODS = [
  { key: 'cash',  label: 'Cash' },
  { key: 'check', label: 'Check' },
  { key: 'card',  label: 'Card' },
  { key: 'ach',   label: 'ACH / Bank transfer' },
  { key: 'ccms',  label: 'CCMS / Subsidy' },
  { key: 'other', label: 'Other' },
]
const METHOD_LABELS = METHODS.reduce((m, x) => { m[x.key] = x.label; return m }, {})

export default function PaymentsPage() {
  const payments = usePayments()
  const invoices = useInvoices()
  const families = useFamilies()
  const [drawer, setDrawer] = useState(/** @type {{mode:'create'|'edit', payment?:any}|null} */ (null))
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return payments.rows.filter((p) => {
      if (!q) return true
      if (p.familyName.toLowerCase().includes(q)) return true
      if (p.invoiceNumber && String(p.invoiceNumber).includes(q)) return true
      if (p.referenceNumber && p.referenceNumber.toLowerCase().includes(q)) return true
      return false
    })
  }, [payments.rows, search])

  const totalReceived = payments.rows.reduce((sum, p) => sum + p.amountCents, 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            Payments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Log payments received. Applying one to an invoice auto-updates that invoice's status.
          </p>
        </div>
        <button
          onClick={() => setDrawer({ mode: 'create' })}
          className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
        >
          <Plus className="w-3.5 h-3.5" />
          Record payment
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total received</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{formatMoney(totalReceived)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-gray-500">Payments logged</p>
          <p className="text-lg font-semibold text-gray-700">{payments.rows.length}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search family, invoice #, or reference…"
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
        />
      </div>

      {payments.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{payments.error}</p>
        </div>
      )}

      {payments.loading ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center">
          <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-semibold">
            {payments.rows.length === 0 ? 'No payments logged yet.' : 'No payments match the search.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <Th>Date</Th>
                <Th>Family</Th>
                <Th>Method</Th>
                <Th>Ref</Th>
                <Th>Invoice</Th>
                <Th>Amount</Th>
                <th className="w-6" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setDrawer({ mode: 'edit', payment: p })}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-blue-50/40 cursor-pointer"
                >
                  <td className="px-4 py-3 text-xs text-gray-600">{fmtDate(p.paymentDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{p.familyName}</td>
                  <td className="px-4 py-3 text-xs text-gray-700">{METHOD_LABELS[p.paymentMethod] || p.paymentMethod}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 font-mono">{p.referenceNumber || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 font-mono">
                    {p.invoiceNumber ? `INV-${p.invoiceNumber}` : <span className="text-gray-400">unapplied</span>}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatMoney(p.amountCents)}</td>
                  <td className="px-4 py-3 text-right"><span className="text-gray-300">›</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaymentEditDrawer
        open={!!drawer}
        mode={drawer?.mode || 'create'}
        payment={drawer?.payment}
        families={families.families}
        invoices={invoices.rows}
        onClose={() => setDrawer(null)}
        onSaved={() => setDrawer(null)}
        actions={payments}
      />
    </div>
  )
}

function PaymentEditDrawer({ open, mode, payment, families, invoices, onClose, onSaved, actions }) {
  const [values, setValues] = useState(emptyValues())
  const [formError, setFormError] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pending, setPending] = useState(false)

  useMemo(() => {
    if (!open) return
    setFormError(null); setConfirmDelete(false)
    if (mode === 'edit' && payment) {
      setValues({
        familyId: payment.familyId,
        invoiceId: payment.invoiceId || '',
        amountInput: formatMoneyInput(payment.amountCents),
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate,
        referenceNumber: payment.referenceNumber || '',
        notes: payment.notes || '',
      })
    } else {
      setValues(emptyValues())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, payment])

  if (!open) return null

  const familyInvoices = invoices.filter(
    (i) => i.familyId === values.familyId && i.status !== 'voided'
  )

  async function handleSave() {
    setFormError(null)
    if (!values.familyId) return setFormError('Pick a family.')
    const cents = parseMoneyInput(values.amountInput)
    if (Number.isNaN(cents) || cents <= 0) return setFormError('Amount must be greater than $0.')
    setPending(true)
    try {
      const payload = {
        familyId: values.familyId,
        invoiceId: values.invoiceId || null,
        amountCents: cents,
        paymentMethod: values.paymentMethod,
        paymentDate: values.paymentDate,
        referenceNumber: values.referenceNumber,
        notes: values.notes,
      }
      const { error: sErr } = mode === 'edit'
        ? await actions.updatePayment(payment.id, payload)
        : await actions.createPayment(payload)
      if (sErr) return setFormError(sErr)
      onSaved()
    } finally { setPending(false) }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setPending(true)
    try {
      const { error: dErr } = await actions.deletePayment(payment.id)
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
            {mode === 'edit' ? 'Edit payment' : 'Record payment'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <Field label="Family" required>
            <select
              value={values.familyId}
              onChange={(e) => setValues((s) => ({ ...s, familyId: e.target.value, invoiceId: '' }))}
              className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="">— pick —</option>
              {families.map((f) => <option key={f.id} value={f.id}>{f.familyName}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount" required>
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
            <Field label="Payment date" required>
              <input
                type="date"
                value={values.paymentDate}
                onChange={(e) => setValues((s) => ({ ...s, paymentDate: e.target.value }))}
                className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </Field>
          </div>
          <Field label="Method">
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setValues((s) => ({ ...s, paymentMethod: m.key }))}
                  className={`h-10 rounded-lg border text-xs font-semibold ${
                    values.paymentMethod === m.key
                      ? 'border-blue-400 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Reference number" hint="Check number, card last-4, ACH ref, etc.">
            <input
              type="text"
              value={values.referenceNumber}
              onChange={(e) => setValues((s) => ({ ...s, referenceNumber: e.target.value }))}
              className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </Field>
          <Field label="Apply to invoice" hint="Auto-updates that invoice's status. Leave blank for account credits.">
            <select
              value={values.invoiceId}
              onChange={(e) => setValues((s) => ({ ...s, invoiceId: e.target.value }))}
              disabled={!values.familyId}
              className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none disabled:opacity-50"
            >
              <option value="">— unapplied —</option>
              {familyInvoices.map((i) => (
                <option key={i.id} value={i.id}>
                  INV-{i.invoiceNumber} · {formatMoney(i.totalCents)} · {i.status}
                </option>
              ))}
            </select>
          </Field>
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
              {mode === 'edit' ? 'Save' : 'Record'}
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
    invoiceId: '',
    amountInput: '',
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().slice(0, 10),
    referenceNumber: '',
    notes: '',
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
