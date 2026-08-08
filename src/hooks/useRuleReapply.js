import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * RPC wrappers for the two Postgres functions that own rule matching:
 *   match_vendor_rule(p_description, p_direction) — single best match
 *   categorize_statement(p_statement_id)          — apply to a statement
 *
 * Also implements a client-side preview that counts how many
 * transactions in a statement WOULD change category on re-apply.
 * The preview calls match_vendor_rule via RPC per transaction — one
 * source of truth for the matching logic (the DB function), the JS side
 * only compares returned categories to current ones and counts.
 *
 * The two guards mirror categorize_statement exactly:
 *   description <> ''                         (skip paper checks)
 *   categorized_by IS DISTINCT FROM 'human'   (skip manual decisions)
 * If those guards change in categorize_statement, update them HERE too.
 */
export function useRuleReapply() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(/** @type {string|null} */ (null))

  /**
   * Test a single description/direction pair. Returns the single winning
   * rule (from match_vendor_rule) or null when nothing matches.
   */
  const testPattern = useCallback(async ({ description, direction }) => {
    if (!supabase) return { data: null, error: 'Supabase not configured' }
    if (!description?.trim()) return { data: null, error: 'Description is required.' }
    if (!direction) return { data: null, error: 'Direction is required (credit or debit).' }
    try {
      const { data, error: qErr } = await supabase.rpc('match_vendor_rule', {
        p_description: description,
        p_direction: direction,
      })
      if (qErr) throw qErr
      const row = Array.isArray(data) ? data[0] || null : data || null
      return { data: row, error: null }
    } catch (err) {
      const msg = err?.message || 'match_vendor_rule failed'
      console.error('[useRuleReapply.testPattern]', msg)
      return { data: null, error: msg }
    }
  }, [])

  /**
   * Preview — single RPC to preview_categorize_statement. Returns four
   * counts computed by the DB function via LEFT JOIN LATERAL against
   * match_vendor_rule, sharing the exact same eligibility WHERE clause
   * as categorize_statement.
   *
   * One source of truth for both eligibility and matching. No JS-side
   * mirror. If the SQL guards change, this call reflects it
   * automatically — preview and apply cannot diverge.
   *
   * (Replaced a JS parallel-RPC loop on 2026-08-07 that duplicated the
   *  eligibility WHERE clause in the frontend — see the memory note
   *  preview-categorize-statement for the history.)
   */
  const previewChanges = useCallback(async (statementId) => {
    if (!supabase) return { data: null, error: 'Supabase not configured' }
    if (!statementId) return { data: null, error: 'Statement id required.' }
    setBusy(true)
    setError(null)
    try {
      const { data, error: qErr } = await supabase.rpc(
        'preview_categorize_statement',
        { p_statement_id: statementId }
      )
      if (qErr) throw qErr
      const row = Array.isArray(data) ? data[0] || null : data || null
      if (!row) {
        return {
          data: {
            eligibleTotal: 0,
            wouldRecategorize: 0,
            wouldUncategorize: 0,
            wouldNewlyMatch: 0,
            totalChanges: 0,
          },
          error: null,
        }
      }
      const wouldRecategorize = Number(row.would_recategorize || 0)
      const wouldUncategorize = Number(row.would_uncategorize || 0)
      const wouldNewlyMatch   = Number(row.would_newly_match   || 0)
      return {
        data: {
          eligibleTotal: Number(row.eligible_total || 0),
          wouldRecategorize,
          wouldUncategorize,
          wouldNewlyMatch,
          totalChanges: wouldRecategorize + wouldUncategorize + wouldNewlyMatch,
        },
        error: null,
      }
    } catch (err) {
      const msg = err?.message || 'preview_categorize_statement failed'
      console.error('[useRuleReapply.previewChanges]', msg)
      setError(msg)
      return { data: null, error: msg }
    } finally {
      setBusy(false)
    }
  }, [])

  /**
   * Apply — call categorize_statement and return the four counts the
   * function reports (categorized / needs_review / unmatched / checks).
   * The function itself owns the guards + the write.
   */
  const applyChanges = useCallback(async (statementId) => {
    if (!supabase) return { data: null, error: 'Supabase not configured' }
    if (!statementId) return { data: null, error: 'Statement id required.' }
    setBusy(true)
    setError(null)
    try {
      const { data, error: qErr } = await supabase.rpc('categorize_statement', {
        p_statement_id: statementId,
      })
      if (qErr) throw qErr
      const row = Array.isArray(data) ? data[0] || null : data || null
      return { data: row, error: null }
    } catch (err) {
      const msg = err?.message || 'categorize_statement failed'
      console.error('[useRuleReapply.applyChanges]', msg)
      setError(msg)
      return { data: null, error: msg }
    } finally {
      setBusy(false)
    }
  }, [])

  return { testPattern, previewChanges, applyChanges, busy, error }
}
