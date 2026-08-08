import { useMemo, useState } from 'react'
import {
  BookOpen,
  Search,
  Plus,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  Play,
  Loader2,
  X,
  Filter,
  Info,
} from 'lucide-react'
import { useVendorRulesAdmin } from '../hooks/useVendorRulesAdmin'
import { useRuleReapply } from '../hooks/useRuleReapply'
import { useBankStatements } from '../hooks/useBankStatements'
import RuleEditDrawer from '../components/RuleEditDrawer'

/**
 * Books → Rules. Full admin surface for vendor_rules.
 *
 * Three sections above the table:
 *   1. Test a pattern — call match_vendor_rule to see which rule wins
 *      for a given description + direction. Prevents accidental
 *      priority collisions before they hit a full statement.
 *   2. Re-apply rules — preview + apply via categorize_statement.
 *   3. Filter bar — search, category, direction, needs_review, active.
 *
 * Table below: sortable, click-to-edit, usage counts inline.
 */
export default function BooksRulesPage() {
  const admin = useVendorRulesAdmin()
  const reapply = useRuleReapply()
  const { statements } = useBankStatements()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [directionFilter, setDirectionFilter] = useState('')
  const [needsReviewOnly, setNeedsReviewOnly] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const [drawer, setDrawer] = useState({ open: false, rule: null })

  const visibleRules = useMemo(() => {
    const q = search.trim().toLowerCase()
    return admin.rules.filter((r) => {
      if (!showInactive && !r.active) return false
      if (needsReviewOnly && !r.needsReview) return false
      if (categoryFilter && r.category !== categoryFilter) return false
      if (directionFilter && (r.direction || '') !== directionFilter) return false
      if (q) {
        const inPattern = r.pattern?.toLowerCase().includes(q)
        const inNotes = r.notes?.toLowerCase().includes(q)
        if (!inPattern && !inNotes) return false
      }
      return true
    })
  }, [admin.rules, search, categoryFilter, directionFilter, needsReviewOnly, showInactive])

  const totalActive = admin.rules.filter((r) => r.active).length
  const totalInactive = admin.rules.length - totalActive
  const totalReview = admin.rules.filter((r) => r.needsReview).length

  const hasFilters = search || categoryFilter || directionFilter || needsReviewOnly || showInactive

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-start gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                Finance · Books
              </p>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Rules</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Vendor pattern → category mapping. Editing a rule does NOT retroactively
                recategorize past transactions — use <em>Re-apply rules</em> below to sync.
              </p>
            </div>
            <button
              onClick={() => admin.refetch()}
              disabled={admin.loading}
              className="inline-flex items-center gap-1.5 h-10 px-3 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${admin.loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setDrawer({ open: true, rule: null })}
              className="inline-flex items-center gap-1.5 h-10 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              Add rule
            </button>
          </div>

          {/* Stats strip */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="Active rules" value={totalActive} accent="emerald" />
            <Stat label="Inactive"     value={totalInactive} accent="gray" />
            <Stat label="Needs review" value={totalReview} accent="amber" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {admin.error && <Banner tone="error" text={admin.error} />}

        {/* Test + Re-apply panels side by side on wide screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TestPatternPanel testPattern={reapply.testPattern} />
          <ReapplyPanel
            statements={statements}
            previewChanges={reapply.previewChanges}
            applyChanges={reapply.applyChanges}
            busy={reapply.busy}
          />
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pattern or notes…"
              className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            />
          </div>
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
          >
            <option value="">All categories</option>
            {admin.categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            className="h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
          >
            <option value="">Any direction</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <label className="inline-flex items-center gap-1.5 h-10 px-3 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={needsReviewOnly}
              onChange={(e) => setNeedsReviewOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-amber-600"
            />
            Needs review only
          </label>
          <label className="inline-flex items-center gap-1.5 h-10 px-3 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-gray-600"
            />
            Show inactive
          </label>
          {hasFilters && (
            <button
              onClick={() => {
                setSearch(''); setCategoryFilter(''); setDirectionFilter('')
                setNeedsReviewOnly(false); setShowInactive(false)
              }}
              className="h-10 px-3 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg inline-flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Rules table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-[10px] uppercase tracking-wider font-bold text-gray-500">
            {visibleRules.length} of {admin.rules.length}{' '}
            {visibleRules.length === 1 ? 'rule' : 'rules'}
          </div>

          {admin.loading ? (
            <p className="px-4 py-10 text-sm text-gray-400 italic text-center">
              Loading rules…
            </p>
          ) : visibleRules.length === 0 ? (
            <p className="px-4 py-16 text-sm text-gray-400 italic text-center">
              {hasFilters
                ? 'No rules match those filters.'
                : 'No rules yet. Add one to start categorizing transactions.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-[10px] uppercase tracking-wider font-bold text-gray-500">
                    <th className="text-left px-3 py-2 min-w-[200px]">Pattern</th>
                    <th className="text-left px-3 py-2">Dir</th>
                    <th className="text-left px-3 py-2">Category</th>
                    <th className="text-left px-3 py-2">Subcategory</th>
                    <th className="text-right px-3 py-2">Prio</th>
                    <th className="text-right px-3 py-2">Used</th>
                    <th className="text-left px-3 py-2">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleRules.map((r) => (
                    <RuleRow
                      key={r.id}
                      rule={r}
                      usage={admin.usageById.get(r.id) || 0}
                      onClick={() => setDrawer({ open: true, rule: r })}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <RuleEditDrawer
        open={drawer.open}
        rule={drawer.rule}
        usage={drawer.rule ? admin.usageById.get(drawer.rule.id) || 0 : 0}
        categories={admin.categories}
        subcategoriesFor={admin.subcategoriesFor}
        onClose={() => setDrawer({ open: false, rule: null })}
        onSave={(patch) => drawer.rule
          ? admin.updateRule(drawer.rule.id, patch)
          : admin.createRule(patch)
        }
        onDeactivate={() => drawer.rule ? admin.deactivateRule(drawer.rule.id) : null}
        onReactivate={() => drawer.rule ? admin.reactivateRule(drawer.rule.id) : null}
        saving={admin.saving}
      />
    </div>
  )
}

// ─── Test Pattern Panel ─────────────────────────────────────────────────────

function TestPatternPanel({ testPattern }) {
  const [description, setDescription] = useState('')
  const [direction, setDirection] = useState('debit')
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function run() {
    setErrorMsg('')
    setResult(null)
    setBusy(true)
    const res = await testPattern({ description: description.trim(), direction })
    setBusy(false)
    if (res.error) {
      setErrorMsg(res.error)
      return
    }
    setResult(res.data) // may be null = no match
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <FlaskConical className="w-4 h-4 text-blue-600" />
        <h2 className="text-sm font-bold text-gray-900">Test a pattern</h2>
        <span className="text-[10px] text-gray-400 ml-auto">
          Calls match_vendor_rule — same logic categorize_statement uses.
        </span>
      </div>
      <div className="space-y-2">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Paste a transaction description…"
          className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        />
        <div className="flex items-center gap-2">
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          >
            <option value="debit">Debit (out)</option>
            <option value="credit">Credit (in)</option>
          </select>
          <button
            onClick={run}
            disabled={busy || !description.trim()}
            className="inline-flex items-center gap-1.5 h-10 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Test
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {result === null && !errorMsg && !busy && (
        <p className="mt-3 text-[11px] text-gray-400 italic">
          Enter a description and hit Test. If Direction matters for a rule
          (many are direction-agnostic), pick the right one.
        </p>
      )}

      {result && (
        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
          <p className="font-semibold text-emerald-900 mb-1">
            Matched rule #{result.rule_id}
          </p>
          <p className="text-emerald-800 tabular-nums">
            <strong>{result.category}</strong>
            {result.subcategory && <span className="text-emerald-700"> / {result.subcategory}</span>}
            {result.needs_review && <span className="ml-2 text-amber-700 font-semibold">· needs review</span>}
          </p>
          <p className="text-[10px] text-emerald-700 mt-1 italic font-mono">
            matched on pattern: {result.matched_on}
          </p>
        </div>
      )}

      {result === null && !errorMsg && description && !busy && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 italic">
          No match — no active rule's pattern is a substring of this description.
        </div>
      )}
    </div>
  )
}

// ─── Re-apply Panel ─────────────────────────────────────────────────────────

function ReapplyPanel({ statements, previewChanges, applyChanges, busy }) {
  const reconciled = useMemo(
    () => (statements || []).filter((s) => s.status === 'reconciled'),
    [statements]
  )
  const [statementId, setStatementId] = useState('')
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function doPreview() {
    setErrorMsg('')
    setResult(null)
    setPreview(null)
    if (!statementId) {
      setErrorMsg('Pick a statement first.')
      return
    }
    const res = await previewChanges(statementId)
    if (res.error) {
      setErrorMsg(res.error)
      return
    }
    setPreview(res.data)
  }

  async function doApply() {
    setErrorMsg('')
    setResult(null)
    if (!statementId) {
      setErrorMsg('Pick a statement first.')
      return
    }
    const res = await applyChanges(statementId)
    if (res.error) {
      setErrorMsg(res.error)
      return
    }
    setResult(res.data)
    setPreview(null)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <RefreshCw className="w-4 h-4 text-amber-600" />
        <h2 className="text-sm font-bold text-gray-900">Re-apply rules</h2>
        <span className="text-[10px] text-gray-400 ml-auto">
          Human categorizations + paper checks are skipped.
        </span>
      </div>

      <div className="space-y-2">
        <select
          value={statementId}
          onChange={(e) => { setStatementId(e.target.value); setPreview(null); setResult(null) }}
          className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
        >
          <option value="">— Pick a reconciled statement —</option>
          {reconciled.map((s) => (
            <option key={s.id} value={s.id}>
              {formatPeriod(s.periodStart, s.periodEnd)}
              {s.account?.accountLabel && ` · ${s.account.accountLabel}`}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <button
            onClick={doPreview}
            disabled={busy || !statementId}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-3 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-lg disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FlaskConical className="w-3.5 h-3.5" />}
            Preview changes
          </button>
          <button
            onClick={doApply}
            disabled={busy || !statementId}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-3 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Apply
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {preview && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
          <p className="font-semibold mb-1">
            <strong className="tabular-nums">{preview.totalChanges}</strong> change
            {preview.totalChanges === 1 ? '' : 's'} across{' '}
            <strong className="tabular-nums">{preview.eligibleTotal}</strong> eligible
            transaction{preview.eligibleTotal === 1 ? '' : 's'}.
          </p>
          {preview.totalChanges === 0 ? (
            <p className="italic mt-1">Rules already match current data.</p>
          ) : (
            <ul className="mt-2 space-y-0.5 text-[11px]">
              <li className="tabular-nums">
                <strong>{preview.wouldRecategorize}</strong> would recategorize
                <span className="text-amber-700 italic ml-1">
                  (had a rule match, new match differs)
                </span>
              </li>
              <li className="tabular-nums">
                <strong>{preview.wouldUncategorize}</strong> would uncategorize
                <span className="text-amber-700 italic ml-1">
                  (had a rule match, no longer matches any active rule)
                </span>
              </li>
              <li className="tabular-nums">
                <strong>{preview.wouldNewlyMatch}</strong> would newly match
                <span className="text-amber-700 italic ml-1">
                  (currently unmatched, a rule now matches)
                </span>
              </li>
            </ul>
          )}
        </div>
      )}

      {result && (
        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
          <p className="font-semibold mb-1 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Re-applied. Final state:
          </p>
          <p className="tabular-nums">
            <strong>{result.categorized}</strong> categorized ·{' '}
            <strong>{result.needs_review}</strong> needs review ·{' '}
            <strong>{result.unmatched}</strong> unmatched ·{' '}
            <strong>{result.checks}</strong> paper checks
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Rule row ───────────────────────────────────────────────────────────────

function RuleRow({ rule, usage, onClick }) {
  const rowCls = !rule.active
    ? 'opacity-50 hover:opacity-100'
    : rule.needsReview
      ? 'bg-amber-50/40'
      : ''
  return (
    <tr onClick={onClick} className={`cursor-pointer hover:bg-gray-50 ${rowCls}`}>
      <td className="px-3 py-2 text-xs font-mono font-semibold text-gray-900 truncate max-w-[260px]">
        {rule.pattern}
        {!rule.active && <span className="ml-1 text-red-600 font-sans font-bold text-[9px]">INACTIVE</span>}
        {rule.needsReview && <span className="ml-1 text-amber-700 font-sans font-bold text-[9px]">REVIEW</span>}
      </td>
      <td className="px-3 py-2 text-[11px] text-gray-500">
        {rule.direction || <span className="italic text-gray-400">any</span>}
      </td>
      <td className="px-3 py-2 text-xs text-gray-800">{rule.category}</td>
      <td className="px-3 py-2 text-xs text-gray-600">
        {rule.subcategory || <span className="italic text-gray-400">—</span>}
      </td>
      <td className="px-3 py-2 text-xs text-right tabular-nums text-gray-700">{rule.priority}</td>
      <td className="px-3 py-2 text-xs text-right tabular-nums font-semibold text-gray-900">
        {usage}
      </td>
      <td className="px-3 py-2 text-[11px] text-gray-500 max-w-[320px] truncate" title={rule.notes || ''}>
        {rule.notes || <span className="italic text-gray-400">—</span>}
      </td>
    </tr>
  )
}

// ─── Small bits ─────────────────────────────────────────────────────────────

function Stat({ label, value, accent }) {
  const styles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber:   'bg-amber-50 text-amber-700 border-amber-200',
    gray:    'bg-gray-50 text-gray-600 border-gray-200',
  }
  return (
    <div className={`rounded-lg border px-3 py-2 ${styles[accent]}`}>
      <p className="text-[10px] uppercase tracking-wider font-bold opacity-80">{label}</p>
      <p className="text-lg font-bold tabular-nums leading-none mt-0.5">{value}</p>
    </div>
  )
}

function Banner({ tone, text }) {
  const cls = tone === 'error'
    ? 'bg-red-50 border-red-200 text-red-700'
    : 'bg-amber-50 border-amber-200 text-amber-800'
  return (
    <div className={`flex items-start gap-2 p-3 border rounded-lg text-xs ${cls}`}>
      {tone === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
      <span>{text}</span>
    </div>
  )
}

function formatPeriod(start, end) {
  if (!start && !end) return 'Statement (awaiting parse)'
  const fmt = (iso) => {
    const s = String(iso).slice(0, 10)
    const [y, m, d] = s.split('-').map(Number)
    if (!y || !m || !d) return String(iso)
    const dt = new Date(y, m - 1, d)
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  if (start && end) return `${fmt(start)} – ${fmt(end)}`
  return fmt(start || end)
}
