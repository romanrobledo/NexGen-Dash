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
   * Preview — count transactions whose category WOULD change if
   * categorize_statement ran right now. Parallel RPC per eligible
   * transaction, then aggregate client-side.
   *
   * Slow-ish (5-10s for a 250-txn statement over ~200 concurrent RPCs).
   * Roman explicitly wants an exact count before applying, so a client
   * loop is preferred over an approximation. Candidate future optimization:
   * a preview_categorize_statement(uuid) Postgres function returning the
   * count directly — a small helper, not a schema change.
   */
  const previewChanges = useCallback(async (statementId) => {
    if (!supabase) return { data: null, error: 'Supabase not configured' }
    if (!statementId) return { data: null, error: 'Statement id required.' }
    setBusy(true)
    setError(null)
    try {
      // 1. Fetch eligible transactions — mirrors categorize_statement's guards.
      const { data: txns, error: tErr } = await supabase
        .from('bank_transactions')
        .select('id, description, direction, category, subcategory, matched_rule_id')
        .eq('statement_id', statementId)
        .neq('description', '')
        .not('categorized_by', 'eq', 'human')

      if (tErr) throw tErr
      const eligible = txns || []
      if (eligible.length === 0) {
        return { data: { eligible: 0, wouldChange: 0, sampleChanges: [] }, error: null }
      }

      // 2. Match each in parallel. Supabase handles ~50-100 concurrent
      //    requests fine; batching keeps memory + backpressure sane.
      const BATCH = 50
      const results = new Array(eligible.length)
      for (let i = 0; i < eligible.length; i += BATCH) {
        const slice = eligible.slice(i, i + BATCH)
        const matched = await Promise.all(
          slice.map((t) =>
            supabase.rpc('match_vendor_rule', {
              p_description: t.description,
              p_direction: t.direction,
            })
          )
        )
        matched.forEach((res, k) => {
          const row = Array.isArray(res.data) ? res.data[0] || null : null
          results[i + k] = { txn: slice[k], match: row, error: res.error?.message || null }
        })
      }

      // 3. Diff — a change is a difference in category, subcategory,
      //    OR matched_rule_id. (Same three fields categorize_statement
      //    writes.) Also count rule-going-away (match was NULL): the
      //    function itself doesn't clear stale matches, so those don't
      //    change on re-apply — we don't count them as "would change."
      let wouldChange = 0
      const samples = []
      for (const r of results) {
        if (!r || !r.match) continue // no match → function leaves alone
        const changed =
          r.match.category    !== r.txn.category    ||
          r.match.subcategory !== r.txn.subcategory ||
          r.match.rule_id     !== r.txn.matched_rule_id
        if (changed) {
          wouldChange++
          if (samples.length < 5) {
            samples.push({
              description: r.txn.description,
              from: `${r.txn.category || '—'}${r.txn.subcategory ? '/' + r.txn.subcategory : ''}`,
              to:   `${r.match.category || '—'}${r.match.subcategory ? '/' + r.match.subcategory : ''}`,
              matchedOn: r.match.matched_on,
            })
          }
        }
      }

      return {
        data: {
          eligible: eligible.length,
          wouldChange,
          sampleChanges: samples,
          rpcErrors: results.filter((r) => r?.error).length,
        },
        error: null,
      }
    } catch (err) {
      const msg = err?.message || 'Preview failed'
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
