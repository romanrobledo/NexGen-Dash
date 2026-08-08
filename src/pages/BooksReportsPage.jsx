import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { useBooksMonthly } from '../hooks/useBooksMonthly'

// Build a link into Books → Transactions with the current month + optional
// category / subcategory pre-filled. Uses real react-router Links so
// cmd/ctrl-click opens in a new tab and links are shareable.
function txnLink({ month, category, subcategory }) {
  const params = new URLSearchParams()
  if (month)       params.set('month', month)
  if (category)    params.set('category', category)
  if (subcategory) params.set('subcategory', subcategory)
  const qs = params.toString()
  return `/finance/books/transactions${qs ? '?' + qs : ''}`
}

/**
 * Books → Reports.
 *
 * All aggregation lives in the views (v_books_monthly,
 * v_books_revenue_by_source, v_books_completeness). This page reads
 * and renders — no JS math on expense/revenue rollups.
 *
 * MANDATORY banner: whenever v_books_completeness for the selected
 * month is 'INCOMPLETE' — OR when NO row exists for the month at all
 * (unknown state) — the expense card + net card BOTH render a
 * completeness banner. Absent is not complete; treating "no row" as
 * "verified complete" is the same failure mode as the Finance
 * Dashboard's $0.00-subsidies-for-missing-data bug.
 *
 * MANDATORY: no margin/profit figure is rendered when completeness is
 * anything other than 'complete'. A missing number is fine; a
 * confident wrong one is not.
 */

// Categories that must NOT flow into the operating-net calculation.
// owner_draw is personal withdrawal, not operating spend.
// unclassified is unfiled — including it in net is filing-by-default.
// TODO: this list belongs on a DB-side table (a bool column on a
// categories table, or a view like v_books_operating_monthly), not
// hardcoded in JS. Same shadow-engine failure mode we ripped out of
// src/lib/ratios.js — flagging as tech debt so it doesn't compound.
const NON_OPERATING_EXPENSE_CATEGORIES = new Set([
  'owner_draw',
  'unclassified',
])

// Normalize month values to "YYYY-MM" so string comparisons work
// regardless of whether the source column is `date` ("2026-07-01") or
// `timestamptz` ("2026-07-01T00:00:00+00:00").
const monthKey = (iso) => String(iso || '').slice(0, 7)
export default function BooksReportsPage() {
  const { monthly, revenueBySource, completeness, loading, error, refetch } = useBooksMonthly()

  // Months use "YYYY-MM" keys throughout so filter comparisons don't
  // silently miss when one source returns date and another returns
  // timestamptz. (This is what let the completeness lookup fail earlier
  // — v_books_completeness may return a different column type than
  // v_books_monthly, and strict === made them non-matching.)
  const months = useMemo(() => {
    const set = new Set()
    for (const r of monthly)          set.add(monthKey(r.month))
    for (const r of revenueBySource)  set.add(monthKey(r.month))
    for (const r of completeness)     set.add(monthKey(r.month))
    return Array.from(set).sort((a, b) => (a > b ? -1 : 1))
  }, [monthly, revenueBySource, completeness])

  const [monthIdx, setMonthIdx] = useState(0)
  const currentMonth = months[monthIdx] || null   // "YYYY-MM"
  const completenessRow = useMemo(
    () => completeness.find((c) => monthKey(c.month) === currentMonth) || null,
    [completeness, currentMonth]
  )

  // Three-state completeness:
  //   'incomplete' — row exists AND expense_completeness starts with 'INCOMPLETE'
  //   'complete'   — row exists AND expense_completeness starts with 'COMPLETE'
  //   'unknown'    — anything else (no row, NULL, PARTIAL, or a string we
  //                  don't recognize). Defaulting to unknown when unsure
  //                  is the same rule as [[null-ratio-means-cannot-evaluate]]:
  //                  absent evidence of completeness is not evidence of it.
  //
  // Only 'complete' is safe to show a net figure against. Both
  // 'incomplete' and 'unknown' suppress net and render a banner.
  const completenessState = !completenessRow
    ? 'unknown'
    : completenessRow.isIncomplete
      ? 'incomplete'
      : completenessRow.isComplete
        ? 'complete'
        : 'unknown'
  const netIsSafeToShow = completenessState === 'complete'

  // Month-scoped slices.
  const monthExpenses = useMemo(
    () => monthly.filter((r) => monthKey(r.month) === currentMonth && r.direction === 'debit'),
    [monthly, currentMonth]
  )
  const monthRevenueTotal = useMemo(
    () => revenueBySource
      .filter((r) => monthKey(r.month) === currentMonth)
      .reduce((sum, r) => sum + Number(r.total || 0), 0),
    [revenueBySource, currentMonth]
  )
  // Gross debit total — used ONLY for the expense card total display,
  // NOT for the net calculation. Net uses monthOperatingExpenseTotal.
  const monthExpenseTotal = useMemo(
    () => monthExpenses.reduce((sum, r) => sum + Number(r.total || 0), 0),
    [monthExpenses]
  )
  // Operating expenses — excludes owner_draw and unclassified. This is
  // the number that flows into net. Excluded amounts still render on
  // the expense card so their existence is visible; they just don't
  // count as "operating spend."
  const monthOperatingExpenseTotal = useMemo(
    () => monthExpenses
      .filter((r) => !NON_OPERATING_EXPENSE_CATEGORIES.has(r.category))
      .reduce((sum, r) => sum + Number(r.total || 0), 0),
    [monthExpenses]
  )
  const monthExcludedFromOperating = useMemo(() => {
    const map = new Map()
    for (const r of monthExpenses) {
      if (!NON_OPERATING_EXPENSE_CATEGORIES.has(r.category)) continue
      map.set(r.category, (map.get(r.category) || 0) + Number(r.total || 0))
    }
    return Array.from(map.entries()).map(([category, total]) => ({ category, total }))
  }, [monthExpenses])
  const monthRevenueRows = useMemo(
    () => revenueBySource
      .filter((r) => monthKey(r.month) === currentMonth)
      .sort((a, b) => b.total - a.total),
    [revenueBySource, currentMonth]
  )
  // Two-level aggregation: category → subcategory. v_books_monthly
  // already returns subcategory per row, so no new query.
  //   { category, total, subs: [{ subcategory, total }...] }
  const monthExpensesGrouped = useMemo(() => {
    const catMap = new Map()
    for (const r of monthExpenses) {
      const catKey = r.category || 'unclassified'
      if (!catMap.has(catKey)) catMap.set(catKey, { total: 0, subs: new Map() })
      const cat = catMap.get(catKey)
      const val = Number(r.total || 0)
      cat.total += val
      const subKey = r.subcategory ?? null // null preserved as a real bucket
      cat.subs.set(subKey, (cat.subs.get(subKey) || 0) + val)
    }
    return Array.from(catMap.entries())
      .map(([category, { total, subs }]) => ({
        category,
        total,
        subs: Array.from(subs.entries())
          .map(([subcategory, subTotal]) => ({ subcategory, total: subTotal }))
          .sort((a, b) => b.total - a.total),
      }))
      .sort((a, b) => b.total - a.total)
  }, [monthExpenses])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-start gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                Finance · Books
              </p>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                Reports
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Monthly rollups from the DB views. Aggregation happens in SQL, not here.
              </p>
            </div>
            <button
              onClick={refetch}
              disabled={loading}
              className="inline-flex items-center gap-1.5 h-10 px-3 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-400 italic py-12 text-center">Loading reports…</p>
        ) : months.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-16 text-center">
            No reconciled statements yet.
          </p>
        ) : (
          <>
            {/* Month picker */}
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => setMonthIdx(Math.min(months.length - 1, monthIdx + 1))}
                disabled={monthIdx >= months.length - 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                title="Older month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex-1 text-center">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                  Reporting month
                </p>
                <p className="text-base font-bold text-gray-900 tabular-nums">
                  {formatMonth(currentMonth)}
                </p>
              </div>
              <button
                onClick={() => setMonthIdx(Math.max(0, monthIdx - 1))}
                disabled={monthIdx <= 0}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                title="Newer month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Revenue by source — each source is really a subcategory
                under category='revenue'. Link filters Transactions to both. */}
            <Section
              title="Revenue by source"
              icon={ArrowUpRight}
              accent="emerald"
              total={monthRevenueTotal}
              empty="No revenue lines for this month."
              rows={monthRevenueRows.map((r) => ({
                key: r.source,
                label: r.source,
                total: r.total,
                href: txnLink({
                  month: currentMonth,
                  category: 'revenue',
                  subcategory: r.source,
                }),
              }))}
            />

            {/* Expenses by category — banner on top when incomplete OR unknown */}
            <div>
              {completenessState !== 'complete' && (
                <CompletenessBanner
                  state={completenessState}
                  completenessRow={completenessRow}
                />
              )}
              <Section
                title="Expenses by category"
                icon={ArrowDownRight}
                accent="red"
                total={monthExpenseTotal}
                totalCaveat={
                  completenessState !== 'complete'
                    ? 'Gross outflow shown — see banner above for what may be missing.'
                    : null
                }
                empty="No expense lines for this month."
                rows={monthExpensesGrouped.map((r) => ({
                  key: r.category,
                  label: r.category,
                  total: r.total,
                  href: txnLink({ month: currentMonth, category: r.category }),
                  subrows: r.subs.map((s) => ({
                    key: `${r.category}::${s.subcategory ?? '_null'}`,
                    label: s.subcategory ?? '(no subcategory)',
                    total: s.total,
                    href: s.subcategory
                      ? txnLink({ month: currentMonth, category: r.category, subcategory: s.subcategory })
                      : txnLink({ month: currentMonth, category: r.category }),
                  })),
                }))}
              />
            </div>

            {/* Net — silent whenever completeness is not 'complete'. */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">
                Net for {formatMonth(currentMonth)}
              </p>
              {netIsSafeToShow ? (
                <NetLine
                  revenue={monthRevenueTotal}
                  operatingExpenses={monthOperatingExpenseTotal}
                  excluded={monthExcludedFromOperating}
                />
              ) : (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    {completenessState === 'unknown'
                      ? 'Net margin hidden: v_books_completeness has no row for this month, so completeness cannot be verified. Absent is not the same as complete.'
                      : 'Net margin hidden while expense totals are incomplete. Reveals only once every check is categorized — otherwise the number would look ~30–50% better than reality.'}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Sections ───────────────────────────────────────────────────────────

function CompletenessBanner({ state, completenessRow }) {
  if (state === 'unknown') {
    return (
      <div className="mb-3 flex items-start gap-3 p-4 rounded-xl border border-amber-300 bg-amber-50">
        <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900 leading-relaxed">
          <p className="font-semibold mb-1">Completeness unknown for this month.</p>
          <p>
            <code>v_books_completeness</code> returned no row for this reporting
            period, so we cannot verify whether every check has been categorized.
            Treating as incomplete — net margin hidden. If this persists after
            the parser runs, check the view definition.
          </p>
        </div>
      </div>
    )
  }
  const count = completenessRow?.uncategorizedChecks || 0
  const total = completenessRow?.uncategorizedCheckTotal || 0
  return (
    <div className="mb-3 flex items-start gap-3 p-4 rounded-xl border border-amber-300 bg-amber-50">
      <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-amber-900 leading-relaxed">
        <p className="font-semibold mb-1">Expense totals are incomplete.</p>
        <p>
          Excludes <strong className="tabular-nums">{count}</strong> uncategorized{' '}
          {count === 1 ? 'check' : 'checks'} totalling{' '}
          <strong className="tabular-nums">{formatUSD(total)}</strong>. Staff wages
          are paid by paper check and carry no description, so they cannot be
          categorized automatically. Totals shown are incomplete.
        </p>
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, accent, total, totalCaveat, rows, empty }) {
  const [expanded, setExpanded] = useState(() => new Set())
  const toggle = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }

  const totalCls =
    accent === 'emerald' ? 'text-emerald-700' : accent === 'red' ? 'text-red-700' : 'text-gray-900'
  const iconCls =
    accent === 'emerald' ? 'bg-emerald-100 text-emerald-700'
    : accent === 'red' ? 'bg-red-100 text-red-700'
    : 'bg-gray-100 text-gray-700'
  const rowHover =
    accent === 'emerald' ? 'hover:bg-emerald-50/60'
    : accent === 'red' ? 'hover:bg-red-50/60'
    : 'hover:bg-gray-50'

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 flex-wrap">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconCls}`}>
          <Icon className="w-4 h-4" />
        </div>
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <div className="ml-auto text-right">
          <p className={`text-lg font-bold tabular-nums ${totalCls}`}>{formatUSD(total)}</p>
          {totalCaveat && (
            <p className="text-[10px] text-amber-700 font-semibold italic">{totalCaveat}</p>
          )}
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-xs text-gray-400 italic text-center">{empty}</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {rows.flatMap((r) => {
            const pct = total > 0 ? (r.total / total) * 100 : 0
            const hasSubrows = Array.isArray(r.subrows) && r.subrows.length > 0
            const isExpanded = expanded.has(r.key)
            const out = [
              <li key={r.key} className={`px-4 py-2.5 flex items-center gap-2 group ${rowHover}`}>
                {hasSubrows ? (
                  <button
                    type="button"
                    onClick={() => toggle(r.key)}
                    className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-800 rounded hover:bg-gray-100"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    title={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
                  >
                    {isExpanded
                      ? <ChevronDown className="w-3.5 h-3.5" />
                      : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                ) : (
                  <span className="w-5" />
                )}
                {r.href ? (
                  <Link
                    to={r.href}
                    className="text-xs font-semibold text-gray-800 flex-1 truncate hover:text-indigo-600 hover:underline underline-offset-2"
                  >
                    {r.label}
                  </Link>
                ) : (
                  <span className="text-xs font-semibold text-gray-800 flex-1 truncate">
                    {r.label}
                  </span>
                )}
                <span className="text-[10px] text-gray-400 tabular-nums w-14 text-right">
                  {pct.toFixed(1)}%
                </span>
                <span className="text-xs tabular-nums w-24 text-right text-gray-900 font-medium">
                  {formatUSD(r.total)}
                </span>
              </li>,
            ]
            if (hasSubrows && isExpanded) {
              r.subrows.forEach((sub) => {
                const subPct = total > 0 ? (sub.total / total) * 100 : 0
                out.push(
                  <li
                    key={sub.key}
                    className="px-4 py-2 pl-11 flex items-center gap-2 bg-gray-50/60 hover:bg-gray-100/70"
                  >
                    {sub.href ? (
                      <Link
                        to={sub.href}
                        className="text-[11px] text-gray-700 flex-1 truncate hover:text-indigo-600 hover:underline underline-offset-2"
                      >
                        {sub.label}
                      </Link>
                    ) : (
                      <span className="text-[11px] text-gray-500 italic flex-1 truncate">
                        {sub.label}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 tabular-nums w-14 text-right">
                      {subPct.toFixed(1)}%
                    </span>
                    <span className="text-[11px] tabular-nums w-24 text-right text-gray-700">
                      {formatUSD(sub.total)}
                    </span>
                  </li>
                )
              })
            }
            return out
          })}
        </ul>
      )}
    </div>
  )
}

function NetLine({ revenue, operatingExpenses, excluded }) {
  const net = revenue - operatingExpenses
  const netCls = net >= 0 ? 'text-emerald-700' : 'text-red-700'
  const excludedTotal = (excluded || []).reduce((sum, r) => sum + Number(r.total || 0), 0)
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-xs text-gray-500 tabular-nums">
          {formatUSD(revenue)} revenue
        </span>
        <span className="text-xs text-gray-400">−</span>
        <span className="text-xs text-gray-500 tabular-nums">
          {formatUSD(operatingExpenses)} operating expenses
        </span>
        <span className="text-xs text-gray-400">=</span>
        <span className={`text-xl font-bold tabular-nums ${netCls}`}>
          {net >= 0 ? '+' : ''}{formatUSD(net)}
        </span>
      </div>
      {excluded && excluded.length > 0 && (
        <p className="text-[10px] text-gray-500 italic leading-relaxed">
          Excluded from operating (not counted in net):{' '}
          {excluded
            .map((r) => `${r.category} ${formatUSD(r.total)}`)
            .join(' · ')}
          {excludedTotal > 0 && ` — ${formatUSD(excludedTotal)} total`}
        </p>
      )}
    </div>
  )
}

// Month formatter — parses "YYYY-MM" or "YYYY-MM-DD..." with local
// components rather than through new Date(iso). The old version called
// `new Date("2026-07-01")` which JS parses as UTC midnight, then
// toLocaleDateString formatted it in local TZ (US Central, UTC-5/-6),
// where UTC midnight July 1 is 6-7pm June 30 — so "July 2026" rendered
// as "June 2026." Constructing from (year, month-1, 1) avoids the trip
// through UTC entirely.
function formatMonth(monthKey) {
  if (!monthKey) return '—'
  const s = String(monthKey).slice(0, 7) // accepts "YYYY-MM" or "YYYY-MM-DD..."
  const [y, m] = s.split('-').map(Number)
  if (!y || !m) return String(monthKey)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
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
