import { useEffect, useState } from 'react'
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  Power,
  PowerOff,
  Plus,
  Pencil,
  Info,
} from 'lucide-react'

/**
 * Right-side drawer for creating or editing a vendor_rules row.
 *   rule === null       → create mode (Add)
 *   rule === {existing} → edit mode
 *
 * Editable: pattern, direction, category, subcategory, priority,
 * needs_review, active, notes.
 *
 * Deactivate (in edit mode) sets active=false. The confirm dialog
 * surfaces usage count so Roman knows the audit trail impact.
 *
 * No delete. bank_transactions.matched_rule_id is a FK; a rule with
 * usage cannot be safely removed without breaking why-was-this-
 * categorized history. Soft-delete via active=false is the contract.
 */
export default function RuleEditDrawer({
  open,
  rule,
  usage,             // number — how many bank_transactions reference this rule
  categories,        // string[] — from useVendorRulesAdmin
  subcategoriesFor,  // (category) => (string|null)[]
  onClose,
  onSave,            // async (patch) => { data, error }
  onDeactivate,      // async () => { data, error }
  onReactivate,      // async () => { data, error }
  saving,
}) {
  const isCreate = open && !rule

  const [form, setForm] = useState(() => initialForm(rule))
  const [freeCategory, setFreeCategory] = useState('')
  const [freeSubcategory, setFreeSubcategory] = useState('')
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!open) return
    setForm(initialForm(rule))
    setFreeCategory('')
    setFreeSubcategory('')
    setConfirmDeactivate(false)
    setErrorMsg('')
  }, [open, rule])

  useEffect(() => {
    if (!open) return
    const h = (e) => {
      if (e.key === 'Escape') {
        if (confirmDeactivate) setConfirmDeactivate(false)
        else onClose()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, confirmDeactivate, onClose])

  if (!open) return null

  const effectiveCategory =
    form.category === '__new__' ? freeCategory.trim() : form.category
  const effectiveSubcategory =
    form.subcategory === '__new__'
      ? (freeSubcategory.trim() || null)
      : (form.subcategory === '' ? null : form.subcategory)

  const availableSubcategories =
    effectiveCategory && form.category !== '__new__'
      ? subcategoriesFor(effectiveCategory)
      : []

  async function handleSave() {
    setErrorMsg('')
    if (!form.pattern?.trim()) {
      setErrorMsg('Pattern is required.')
      return
    }
    if (!effectiveCategory) {
      setErrorMsg('Category is required.')
      return
    }
    const patch = {
      pattern: form.pattern.trim(),
      direction: form.direction || null,
      category: effectiveCategory,
      subcategory: effectiveSubcategory,
      priority: Number(form.priority) || 50,
      needsReview: !!form.needsReview,
      active: !!form.active,
      notes: form.notes || null,
    }
    const res = await onSave(patch)
    if (res?.error) {
      setErrorMsg(res.error)
      return
    }
    onClose()
  }

  async function handleDeactivate() {
    setErrorMsg('')
    const res = await onDeactivate()
    if (res?.error) {
      setErrorMsg(res.error)
      return
    }
    setConfirmDeactivate(false)
    onClose()
  }

  async function handleReactivate() {
    setErrorMsg('')
    const res = await onReactivate()
    if (res?.error) {
      setErrorMsg(res.error)
      return
    }
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed right-0 top-0 h-full w-full sm:w-[540px] bg-white z-50 shadow-2xl flex flex-col"
        role="dialog"
        aria-label={isCreate ? 'Add rule' : `Edit rule ${rule?.id}`}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-200">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
            {isCreate ? <Plus className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
              Vendor rule
            </p>
            <h2 className="text-base font-bold text-gray-900 leading-tight truncate">
              {isCreate ? 'New rule' : `#${rule.id} · ${rule.pattern}`}
            </h2>
            {!isCreate && (
              <p className="text-xs text-gray-500 mt-0.5">
                Used by <strong className="text-gray-900 tabular-nums">{usage || 0}</strong> transaction{usage === 1 ? '' : 's'}
                {!rule.active && <span className="ml-2 text-red-600 font-semibold">· INACTIVE</span>}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex-shrink-0"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <Field label="Pattern *" hint="Substring, case-insensitive. Match this text anywhere in the transaction description.">
            <input
              type="text"
              value={form.pattern}
              onChange={(e) => setForm({ ...form, pattern: e.target.value })}
              placeholder="e.g. STARBUCKS"
              className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              autoFocus={isCreate}
            />
          </Field>

          <Field label="Direction" hint="NULL matches either credit or debit. Set explicitly when a vendor only shows up as one.">
            <div className="flex gap-2">
              {[
                { v: '',       label: 'Any' },
                { v: 'debit',  label: 'Debit (out)' },
                { v: 'credit', label: 'Credit (in)' },
              ].map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setForm({ ...form, direction: opt.v })}
                  className={`flex-1 h-10 rounded-lg border-2 text-xs font-semibold transition ${
                    (form.direction || '') === opt.v
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category *">
              <select
                value={form.category}
                onChange={(e) => {
                  setForm({ ...form, category: e.target.value, subcategory: '' })
                  setFreeCategory('')
                }}
                className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              >
                <option value="">— Pick —</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__new__">+ Add new…</option>
              </select>
              {form.category === '__new__' && (
                <input
                  type="text"
                  value={freeCategory}
                  onChange={(e) => setFreeCategory(e.target.value)}
                  placeholder="e.g. equipment_purchase"
                  className="w-full mt-2 h-11 px-3 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                />
              )}
            </Field>

            <Field label="Subcategory">
              <select
                value={form.subcategory ?? ''}
                disabled={!effectiveCategory || form.category === '__new__'}
                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">(no subcategory)</option>
                {availableSubcategories
                  .filter((s) => s !== null)
                  .map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                <option value="__new__">+ Add new…</option>
              </select>
              {form.subcategory === '__new__' && (
                <input
                  type="text"
                  value={freeSubcategory}
                  onChange={(e) => setFreeSubcategory(e.target.value)}
                  placeholder="e.g. copier_toner"
                  className="w-full mt-2 h-11 px-3 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                />
              )}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Priority" hint="Lower wins on tie. 10 = specific multi-token · 50 = named vendor · 100 = generic fallback.">
              <input
                type="number"
                min="0"
                step="1"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm tabular-nums focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </Field>
            <Field label="Flags">
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.needsReview}
                    onChange={(e) => setForm({ ...form, needsReview: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700">Needs review</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
            </Field>
          </div>

          <Field label="Notes" hint="Why this rule exists — the explanation you'd give someone auditing categorization.">
            <textarea
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={4}
              placeholder="What vendor is this? What are we categorizing it as, and why?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
            />
          </Field>

          {errorMsg && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-5 py-4 flex items-center gap-3">
          {!isCreate && rule.active && (
            <button
              onClick={() => setConfirmDeactivate(true)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 h-11 px-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
            >
              <PowerOff className="w-4 h-4" />
              Deactivate
            </button>
          )}
          {!isCreate && !rule.active && (
            <button
              onClick={handleReactivate}
              disabled={saving}
              className="inline-flex items-center gap-1.5 h-11 px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg disabled:opacity-50"
            >
              <Power className="w-4 h-4" />
              Reactivate
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
            className="inline-flex items-center gap-1.5 h-11 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isCreate ? 'Add rule' : 'Save'}
          </button>
        </div>
      </aside>

      {/* Deactivate confirm */}
      {confirmDeactivate && rule && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <PowerOff className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-900">
                  Deactivate rule "{rule.pattern}"?
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  It will no longer match new transactions. The{' '}
                  <strong className="tabular-nums">{usage || 0}</strong>{' '}
                  existing transaction{usage === 1 ? '' : 's'} already matched
                  by this rule keep their category — the function preserves the
                  audit trail. Reactivate anytime.
                </p>
                <div className="mt-2 flex items-start gap-1.5 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded p-2">
                  <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>
                    No delete option by design. Hard-deleting would break
                    <code className="mx-1">bank_transactions.matched_rule_id</code>
                    and destroy the why-was-this-categorized history.
                  </span>
                </div>
              </div>
            </div>
            {errorMsg && (
              <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 mb-3">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setConfirmDeactivate(false)}
                className="h-10 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={saving}
                className="inline-flex items-center gap-1.5 h-10 px-4 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PowerOff className="w-4 h-4" />}
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1.5">
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-[10px] text-gray-500 italic mt-1 leading-relaxed">{hint}</p>
      )}
    </div>
  )
}

function initialForm(rule) {
  if (!rule) {
    return {
      pattern: '',
      direction: '',
      category: '',
      subcategory: '',
      priority: 50,
      needsReview: false,
      active: true,
      notes: '',
    }
  }
  return {
    pattern: rule.pattern || '',
    direction: rule.direction || '',
    category: rule.category || '',
    subcategory: rule.subcategory ?? '',
    priority: rule.priority ?? 50,
    needsReview: !!rule.needsReview,
    active: !!rule.active,
    notes: rule.notes || '',
  }
}
