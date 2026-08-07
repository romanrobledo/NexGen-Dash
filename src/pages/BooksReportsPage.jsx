import { useMemo, useState } from 'react'
import {
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useBooksMonthly } from '../hooks/useBooksMonthly'

/**
 * Books → Reports.
 *
 * All aggregation lives in the views (v_books_monthly,
 * v_books_revenue_by_source, v_books_completeness). This page reads
 * and renders — no JS math on expense/revenue rollups.
 *
 * MANDATORY banner: whenever v_books_completeness.expense_completeness
 * is 'INCOMPLETE' for the selected month, the expense card + net card
 * BOTH render a completeness banner explaining exactly what's missing
 * (staff payroll checks) and why the total shown understates reality.
 *
 * MANDATORY: no margin/profit figure is rendered when the month is
 * incomplete. A missing number is fine; a confident wrong one is not.
 */
export default function BooksReportsPage() {
  const { monthly, revenueBySource, completeness, loading, error, refetch } = useBooksMonthly()

  const months = useMemo(() => {
    const set = new Set()
    for (const r of monthly) set.add(r.month)
    for (const r of revenueBySource) set.add(r.month)
    for (const r of completeness) set.add(r.month)
    return Array.from(set).sort((a, b) => (a > b ? -1 : 1))
  }, [monthly, revenueBySource, completeness])

  const [monthIdx, setMonthIdx] = useState(0)
  const currentMonth = months[monthIdx] || null
  const completenessRow = useMemo(
    () => completeness.find((c) => c.month === currentMonth) || null,
    [completeness, currentMonth]
  )
  const isIncomplete = !!completenessRow?.isIncomplete

  // Month-scoped slices.
  const monthExpenses = useMemo(
    () => monthly.filter((r) => r.month === currentMonth && r.direction === 'debit'),
    [monthly, currentMonth]
  )
  const monthRevenueTotal = useMemo(
    () => revenueBySource
      .filter((r) => r.month === currentMonth)
      .reduce((sum, r) => sum + Number(r.total || 0), 0),
    [revenueBySource, currentMonth]
  )
  const monthExpenseTotal = useMemo(
    () => monthExpenses.reduce((sum, r) => sum + Number(r.total || 0), 0),
    [monthExpenses]
  )
  const monthRevenueRows = useMemo(
    () => revenueBySource
      .filter((r) => r.month === currentMonth)
      .sort((a, b) => b.total - a.total),
    [revenueBySource, currentMonth]
  )
  const monthExpenseByCategory = useMemo(() => {
    const map = new Map()
    for (const r of monthExpenses) {
      const key = r.category || 'unclassified'
      map.set(key, (map.get(key) || 0) + Number(r.total || 0))
    }
    return Array.from(map.entries())
      .map(([category, total]) => ({ category, total }))
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

            {/* Revenue by source */}
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
              }))}
            />

            {/* Expenses by category — banner on top when incomplete */}
            <div>
              {isIncomplete && (
                <CompletenessBanner completenessRow={completenessRow} />
              )}
              <Section
                title="Expenses by category"
                icon={ArrowDownRight}
                accent="red"
                total={monthExpenseTotal}
                totalCaveat={
                  isIncomplete
                    ? 'Excludes uncategorized payroll checks — see banner above.'
                    : null
                }
                empty="No expense lines for this month."
                rows={monthExpenseByCategory.map((r) => ({
                  key: r.category,
                  label: r.category,
                  total: r.total,
                }))}
              />
            </div>

            {/* Net — silent when incomplete, per spec */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">
                Net for {formatMonth(currentMonth)}
              </p>
              {isIncomplete ? (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Net margin is intentionally NOT shown while expense totals are
                    incomplete. Reveals only once every check is categorized —
                    otherwise the number would look ~30-50% better than reality.
                  </span>
                </div>
              ) : (
                <NetLine revenue={monthRevenueTotal} expenses={monthExpenseTotal} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Sections ───────────────────────────────────────────────────────────

function CompletenessBanner({ completenessRow }) {
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
  const totalCls =
    accent === 'emerald' ? 'text-emerald-700' : accent === 'red' ? 'text-red-700' : 'text-gray-900'
  const iconCls =
    accent === 'emerald' ? 'bg-emerald-100 text-emerald-700'
    : accent === 'red' ? 'bg-red-100 text-red-700'
    : 'bg-gray-100 text-gray-700'
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
          {rows.map((r) => {
            const pct = total > 0 ? (r.total / total) * 100 : 0
            return (
              <li key={r.key} className="px-4 py-2.5 flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-800 flex-1 truncate">
                  {r.label}
                </span>
                <span className="text-[10px] text-gray-400 tabular-nums w-14 text-right">
                  {pct.toFixed(1)}%
                </span>
                <span className="text-xs tabular-nums w-24 text-right text-gray-900 font-medium">
                  {formatUSD(r.total)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function NetLine({ revenue, expenses }) {
  const net = revenue - expenses
  const netCls = net >= 0 ? 'text-emerald-700' : 'text-red-700'
  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className="text-xs text-gray-500 tabular-nums">
        {formatUSD(revenue)} revenue
      </span>
      <span className="text-xs text-gray-400">−</span>
      <span className="text-xs text-gray-500 tabular-nums">
        {formatUSD(expenses)} expenses
      </span>
      <span className="text-xs text-gray-400">=</span>
      <span className={`text-xl font-bold tabular-nums ${netCls}`}>
        {net >= 0 ? '+' : ''}{formatUSD(net)}
      </span>
    </div>
  )
}

function formatMonth(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
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
