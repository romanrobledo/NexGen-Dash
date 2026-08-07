import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

/**
 * Read bank_transactions (joined to statement period for filtering) +
 * the review queue view + resolve a transaction with optional
 * vendor_rules autolearn.
 *
 * Filters (all optional): month (YYYY-MM), category, direction, status.
 * Default sort: txn_date desc.
 *
 * @param {{
 *   month?: string,
 *   category?: string,
 *   direction?: 'credit'|'debit'|'',
 *   status?: 'categorized'|'needs_review'|'unmatched'|'',
 *   reviewOnly?: boolean,
 * }} [filters]
 */
export function useBankTransactions(filters = {}) {
  const { staff } = useAuth()
  const [txns, setTxns] = useState(/** @type {Transaction[]} */ ([]))
  const [reviewCount, setReviewCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(/** @type {string|null} */ (null))
  const [saving, setSaving] = useState(false)

  const filterKey = useMemo(
    () => JSON.stringify({
      month: filters.month || '',
      category: filters.category || '',
      direction: filters.direction || '',
      status: filters.status || '',
      reviewOnly: !!filters.reviewOnly,
    }),
    [filters.month, filters.category, filters.direction, filters.status, filters.reviewOnly]
  )

  const fetch = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }
    try {
      setError(null)

      // Review queue count — from the view, always fresh regardless of filters.
      // If the view is missing (or RLS blocks), treat as zero.
      const { count: qc, error: qcErr } = await supabase
        .from('v_books_review_queue')
        .select('id', { count: 'exact', head: true })
      if (!qcErr) setReviewCount(qc || 0)

      // If reviewOnly filter is on, we read straight from the review queue view.
      // Otherwise we hit the base table with joined statement.
      if (filters.reviewOnly) {
        const { data, error: qErr } = await supabase
          .from('v_books_review_queue')
          .select('*')
          .order('txn_date', { ascending: false })
        if (qErr) throw qErr
        setTxns((data || []).map(mapQueueRow))
        return
      }

      let query = supabase
        .from('bank_transactions')
        .select(`
          id, statement_id, txn_date, description, amount, direction,
          txn_type, check_number, category, subcategory,
          categorized_by, matched_rule_id, confidence, status,
          reviewed_by, reviewed_at, created_at,
          statement:bank_statements ( id, period_start, period_end, account_id )
        `)
        .order('txn_date', { ascending: false })
        .limit(500)

      if (filters.category)  query = query.eq('category', filters.category)
      if (filters.direction) query = query.eq('direction', filters.direction)
      if (filters.status)    query = query.eq('status', filters.status)

      const { data, error: qErr } = await query
      if (qErr) throw qErr

      let rows = (data || []).map(mapRow)

      // Month filter — applied client-side because bank_transactions
      // doesn't have a computed month column. Cheap for <500 rows.
      if (filters.month) {
        const [y, m] = filters.month.split('-').map(Number)
        rows = rows.filter((t) => {
          if (!t.txnDate) return false
          const d = new Date(t.txnDate)
          return d.getUTCFullYear() === y && d.getUTCMonth() + 1 === m
        })
      }

      setTxns(rows)
    } catch (err) {
      console.error('[useBankTransactions] fetch failed:', err?.message || err)
      setError(err?.message || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }, [filterKey, filters.reviewOnly])

  useEffect(() => {
    setLoading(true)
    fetch()
  }, [fetch])

  /**
   * Resolve a transaction (write category + subcategory + status=categorized).
   * @param {string} id  transaction id
   * @param {{ category: string, subcategory: string|null }} payload
   */
  async function resolveTransaction(id, { category, subcategory }) {
    if (!supabase) return { data: null, error: 'Supabase not configured' }
    if (!category) return { data: null, error: 'Category is required' }
    try {
      setSaving(true)
      const { data, error: qErr } = await supabase
        .from('bank_transactions')
        .update({
          category,
          subcategory: subcategory || null,
          categorized_by: 'human',
          status: 'categorized',
          reviewed_by: staff?.id || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
      if (qErr) throw qErr
      await fetch()
      return { data, error: null }
    } catch (err) {
      const msg = err?.message || 'Save failed'
      console.error('[useBankTransactions] resolve failed:', msg)
      return { data: null, error: msg }
    } finally {
      setSaving(false)
    }
  }

  return {
    transactions: txns,
    reviewCount,
    loading,
    error,
    saving,
    refetch: fetch,
    resolveTransaction,
  }
}

function mapRow(row) {
  return {
    id: row.id,
    statementId: row.statement_id,
    txnDate: row.txn_date,
    description: row.description,
    amount: row.amount,               // always > 0 per CHECK
    direction: row.direction,          // 'credit' | 'debit'
    txnType: row.txn_type,
    checkNumber: row.check_number,
    category: row.category,
    subcategory: row.subcategory,
    categorizedBy: row.categorized_by, // 'rule' | 'llm' | 'human' | null
    matchedRuleId: row.matched_rule_id,
    confidence: row.confidence,
    status: row.status,                // 'categorized' | 'needs_review' | 'unmatched'
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    statement: row.statement
      ? {
          id: row.statement.id,
          periodStart: row.statement.period_start,
          periodEnd: row.statement.period_end,
          accountId: row.statement.account_id,
        }
      : null,
  }
}

// Row shape from v_books_review_queue is flatter — no joined statement,
// but period_start/end are already denormalized into the view.
function mapQueueRow(row) {
  return {
    id: row.id,
    statementId: null,
    txnDate: row.txn_date,
    description: row.description,
    amount: row.amount,
    direction: row.direction,
    txnType: null,
    checkNumber: row.check_number,
    category: row.category,
    subcategory: row.subcategory,
    categorizedBy: null,
    matchedRuleId: null,
    confidence: null,
    status: row.status,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: null,
    statement: {
      id: null,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      accountId: null,
    },
  }
}

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string|null} statementId
 * @property {string} txnDate
 * @property {string} description
 * @property {number} amount               positive always
 * @property {'credit'|'debit'} direction
 * @property {string|null} txnType
 * @property {string|null} checkNumber
 * @property {string|null} category
 * @property {string|null} subcategory
 * @property {'rule'|'llm'|'human'|null} categorizedBy
 * @property {number|null} matchedRuleId
 * @property {number|null} confidence
 * @property {'categorized'|'needs_review'|'unmatched'} status
 * @property {string|null} reviewedBy
 * @property {string|null} reviewedAt
 * @property {string|null} createdAt
 * @property {{id:string|null, periodStart:string|null, periodEnd:string|null, accountId:string|null}|null} statement
 */
