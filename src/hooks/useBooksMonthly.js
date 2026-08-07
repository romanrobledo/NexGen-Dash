import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Read the three view surfaces powering Books → Reports.
 * No JS aggregation — the views own the math.
 *
 *   monthly          — v_books_monthly (month, direction, category, subcategory, txn_count, total)
 *   revenueBySource  — v_books_revenue_by_source (month, source, total)
 *   completeness     — v_books_completeness rows keyed by month
 *
 * `completeness` returns the raw rows so the Reports page can render
 * the mandatory "totals exclude N uncategorized checks" banner exactly
 * where the values it caveats are shown.
 */
export function useBooksMonthly() {
  const [monthly, setMonthly] = useState(/** @type {MonthlyRow[]} */ ([]))
  const [revenueBySource, setRevenueBySource] = useState(/** @type {RevenueRow[]} */ ([]))
  const [completeness, setCompleteness] = useState(/** @type {CompletenessRow[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(/** @type {string|null} */ (null))

  const fetchAll = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }
    try {
      setError(null)
      const [monthRes, revRes, compRes] = await Promise.all([
        supabase
          .from('v_books_monthly')
          .select('month, direction, category, subcategory, txn_count, total')
          .order('month', { ascending: false }),
        supabase
          .from('v_books_revenue_by_source')
          .select('month, source, total')
          .order('month', { ascending: false }),
        supabase
          .from('v_books_completeness')
          .select('month, uncategorized_checks, uncategorized_check_total, unresolved_txns, expense_completeness')
          .order('month', { ascending: false }),
      ])

      if (monthRes.error) throw monthRes.error
      if (revRes.error)   throw revRes.error
      if (compRes.error)  throw compRes.error

      setMonthly((monthRes.data || []).map(mapMonthly))
      setRevenueBySource((revRes.data || []).map(mapRevenue))
      setCompleteness((compRes.data || []).map(mapCompleteness))
    } catch (err) {
      console.error('[useBooksMonthly] fetch failed:', err?.message || err)
      setError(err?.message || 'Failed to load Books rollups')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchAll()
  }, [fetchAll])

  return { monthly, revenueBySource, completeness, loading, error, refetch: fetchAll }
}

function mapMonthly(row) {
  return {
    month: row.month,         // date, first-of-month
    direction: row.direction,
    category: row.category,
    subcategory: row.subcategory,
    txnCount: row.txn_count,
    total: Number(row.total),
  }
}

function mapRevenue(row) {
  return {
    month: row.month,
    source: row.source,
    total: Number(row.total),
  }
}

function mapCompleteness(row) {
  return {
    month: row.month,
    uncategorizedChecks: row.uncategorized_checks,
    uncategorizedCheckTotal: Number(row.uncategorized_check_total || 0),
    unresolvedTxns: row.unresolved_txns,
    // Raw string from the view — passed through, not interpreted.
    expenseCompleteness: row.expense_completeness,
    isIncomplete: (row.expense_completeness || '').toUpperCase() === 'INCOMPLETE',
  }
}

/**
 * @typedef {Object} MonthlyRow
 * @property {string} month              ISO date, first-of-month
 * @property {'credit'|'debit'} direction
 * @property {string} category
 * @property {string|null} subcategory
 * @property {number} txnCount
 * @property {number} total
 */

/**
 * @typedef {Object} RevenueRow
 * @property {string} month
 * @property {string} source
 * @property {number} total
 */

/**
 * @typedef {Object} CompletenessRow
 * @property {string}  month
 * @property {number}  uncategorizedChecks
 * @property {number}  uncategorizedCheckTotal
 * @property {number}  unresolvedTxns
 * @property {string}  expenseCompleteness  raw view value
 * @property {boolean} isIncomplete         derived convenience flag
 */
