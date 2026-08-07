import { useEffect, useMemo, useState } from 'react'
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  Tag,
  Sparkles,
  Info,
} from 'lucide-react'

/**
 * Right-side drawer for categorizing a single transaction. Two writes
 * happen on save:
 *   (1) UPDATE bank_transactions — category, subcategory, status,
 *       categorized_by='human'
 *   (2) OPTIONAL INSERT into vendor_rules if "apply to future" is
 *       checked (default ON). The user can edit the auto-suggested
 *       pattern before saving.
 *
 * Both writes are commanded by the parent via callbacks. This
 * component owns no data — only form state.
 */
export default function TransactionResolveDrawer({
  open,
  transaction,
  categories,
  subcategoriesFor,
  onClose,
  onResolve,       // async (txnId, { category, subcategory }) => { data, error }
  onCreateRule,    // async ({ pattern, direction, category, subcategory }) => { data, error }
  saving,
}) {
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [addRule, setAddRule] = useState(true)
  const [pattern, setPattern] = useState('')
  const [freeCategory, setFreeCategory] = useState('')
  const [freeSubcategory, setFreeSubcategory] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !transaction) return
    setCategory(transaction.category || '')
    setSubcategory(transaction.subcategory ?? '')
    setAddRule(true)
    setPattern(suggestPattern(transaction.description))
    setFreeCategory('')
    setFreeSubcategory('')
    setError('')
  }, [open, transaction])

  // ESC closes.
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  const effectiveCategory = category === '__new__' ? freeCategory.trim() : category
  const effectiveSubcategory =
    subcategory === '__new__' ? freeSubcategory.trim() || null
    : subcategory === '' ? null
    : subcategory

  const availableSubcategories = useMemo(
    () => (effectiveCategory && category !== '__new__' ? subcategoriesFor(effectiveCategory) : []),
    [effectiveCategory, category, subcategoriesFor]
  )

  if (!open || !transaction) return null

  async function handleSave() {
    if (!effectiveCategory) {
      setError('Category is required.')
      return
    }
    if (addRule && !pattern.trim()) {
      setError('Pattern is required to save a matching rule.')
      return
    }
    setError('')

    const resolveRes = await onResolve(transaction.id, {
      category: effectiveCategory,
      subcategory: effectiveSubcategory,
    })
    if (resolveRes?.error) {
      setError(resolveRes.error)
      return
    }

    if (addRule) {
      const ruleRes = await onCreateRule({
        pattern: pattern.trim(),
        direction: transaction.direction || null,
        category: effectiveCategory,
        subcategory: effectiveSubcategory,
      })
      if (ruleRes?.error) {
        // Transaction was already saved; report the rule failure but
        // don't block the close. The user's manual categorization stuck.
        setError(`Transaction saved, but rule creation failed: ${ruleRes.error}`)
        return
      }
    }

    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} aria-hidden="true" />
      <aside
        className="fixed right-0 top-0 h-full w-full sm:w-[520px] bg-white z-50 shadow-2xl flex flex-col"
        role="dialog"
        aria-label="Resolve transaction"
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-200">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
              Resolve
            </p>
            <h2 className="text-base font-bold text-gray-900 leading-tight truncate">
              {transaction.description || '(no description)'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatDate(transaction.txnDate)} ·{' '}
              <span
                className={`font-semibold ${
                  transaction.direction === 'credit' ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {transaction.direction === 'credit' ? '+' : '−'}
                {formatUSD(transaction.amount)}
              </span>
              {transaction.checkNumber ? ` · check #${transaction.checkNumber}` : ''}
            </p>
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
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Category */}
          <div>
            <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 block mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                setSubcategory('')
              }}
              className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
            >
              <option value="">— Pick a category —</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="__new__">+ Add new category…</option>
            </select>
            {category === '__new__' && (
              <input
                type="text"
                value={freeCategory}
                onChange={(e) => setFreeCategory(e.target.value)}
                placeholder="e.g. equipment_purchase"
                className="w-full mt-2 h-11 px-3 border border-gray-300 rounded-lg text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
              />
            )}
          </div>

          {/* Subcategory */}
          <div>
            <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 block mb-1.5">
              Subcategory
            </label>
            <select
              value={subcategory ?? ''}
              disabled={!effectiveCategory || category === '__new__'}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">(no subcategory)</option>
              {availableSubcategories
                .filter((s) => s !== null)
                .map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              <option value="__new__">+ Add new subcategory…</option>
            </select>
            {subcategory === '__new__' && (
              <input
                type="text"
                value={freeSubcategory}
                onChange={(e) => setFreeSubcategory(e.target.value)}
                placeholder="e.g. copier_toner"
                className="w-full mt-2 h-11 px-3 border border-gray-300 rounded-lg text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
              />
            )}
          </div>

          {/* Vendor rule */}
          <div className="border-t border-gray-200 pt-4">
            <label className="inline-flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={addRule}
                onChange={(e) => setAddRule(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">
                <strong className="font-semibold text-gray-900">Also apply to future matches.</strong>{' '}
                Save this as a vendor rule so the parser can auto-categorize the
                next one.
              </span>
            </label>
            {addRule && (
              <div className="mt-3 space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                  Pattern (edit as needed)
                </label>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm font-mono focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                />
                <p className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                  <Info className="w-3 h-3" />
                  Pattern matches any transaction whose description contains this substring.
                  Direction: <span className="font-semibold ml-0.5">{transaction.direction}</span>.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-5 py-4 flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            className="h-11 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 h-11 px-4 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {addRule ? 'Save + Learn' : 'Save'}
          </button>
        </div>
      </aside>
    </>
  )
}

function suggestPattern(description) {
  if (!description) return ''
  // Reasonable heuristic: strip leading transaction-type prefixes and
  // trailing dates/refs, take the first substantive chunk. User can
  // always edit before saving — this is a starting point, not a rule.
  return String(description)
    .replace(/^(POS |ACH |DEBIT |CREDIT |PURCHASE |CHECK CARD |WEB PMT |RECURRING )/i, '')
    .split(/\s{2,}|#|\d{4,}/)[0]
    .trim()
    .slice(0, 40) || description.slice(0, 40)
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function formatUSD(n) {
  if (n == null) return '—'
  const num = Number(n)
  if (Number.isNaN(num)) return '—'
  return num.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
