import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Admin surface for public.vendor_rules — full CRUD + usage counts.
 *
 * Different from useVendorRules (which filters to active + drops the
 * 'unclassified' category for the resolve-drawer picker). This hook
 * returns EVERYTHING: active AND inactive rules, needs_review included,
 * plus a usage count derived from bank_transactions.matched_rule_id.
 *
 * The Books → Rules page is the only intended consumer.
 *
 * Contract:
 *   - No delete method. Rows are soft-deleted via active=false.
 *     bank_transactions.matched_rule_id references vendor_rules(id);
 *     hard-deleting a used rule would break the audit trail of why a
 *     transaction was categorized.
 *   - categories (for the composer dropdown) excludes 'unclassified'
 *     for the same reason useVendorRules does: it's the "unfiled"
 *     bucket, not a filing target.
 */
export function useVendorRulesAdmin() {
  const [rules, setRules] = useState(/** @type {Rule[]} */ ([]))
  const [usageById, setUsageById] = useState(/** @type {Map<number, number>} */ (new Map()))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(/** @type {string|null} */ (null))
  const [saving, setSaving] = useState(false)

  const fetchAll = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }
    try {
      setError(null)

      // Rules — no active filter. The admin page must show both.
      // Order: category, then priority ascending (lower = more specific
      // per matcher rule), then pattern for stable display.
      const rulesRes = await supabase
        .from('vendor_rules')
        .select('id, pattern, direction, category, subcategory, priority, needs_review, active, notes, created_at, updated_at')
        .order('category', { ascending: true })
        .order('priority', { ascending: true })
        .order('pattern', { ascending: true })

      if (rulesRes.error) throw rulesRes.error

      // Usage counts — aggregate client-side. PostgREST doesn't
      // expose GROUP BY cleanly, but bank_transactions is scoped by
      // the same admin RLS and the row set is bounded.
      const usageRes = await supabase
        .from('bank_transactions')
        .select('matched_rule_id')
        .not('matched_rule_id', 'is', null)

      if (usageRes.error) throw usageRes.error

      const usage = new Map()
      for (const t of usageRes.data || []) {
        const key = t.matched_rule_id
        usage.set(key, (usage.get(key) || 0) + 1)
      }

      setRules((rulesRes.data || []).map(mapRow))
      setUsageById(usage)
    } catch (err) {
      console.error('[useVendorRulesAdmin] fetch failed:', err?.message || err)
      setError(err?.message || 'Failed to load vendor rules')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchAll()
  }, [fetchAll])

  // Category dropdown source — excludes 'unclassified' (which means
  // "unfiled") and excludes categories that only exist on needs_review
  // rules (parser-flagged suggestions we haven't blessed).
  const categories = useMemo(() => {
    const set = new Set()
    for (const r of rules) {
      if (!r.category) continue
      if (r.needsReview) continue
      if (r.category === 'unclassified') continue
      set.add(r.category)
    }
    return Array.from(set).sort()
  }, [rules])

  const subcategoriesFor = useCallback((category) => {
    if (!category) return []
    if (category === 'unclassified') return []
    const set = new Set()
    for (const r of rules) {
      if (r.needsReview) continue
      if (r.category === category) set.add(r.subcategory) // null intentionally kept
    }
    return Array.from(set).sort((a, b) => {
      if (a === null) return -1
      if (b === null) return 1
      return String(a).localeCompare(String(b))
    })
  }, [rules])

  async function createRule(input) {
    return run(async () => {
      const row = mapInputToRow(input, { forCreate: true })
      const { data, error: qErr } = await supabase
        .from('vendor_rules')
        .insert(row)
        .select()
        .single()
      if (qErr) throw qErr
      await fetchAll()
      return mapRow(data)
    })
  }

  async function updateRule(id, patch) {
    return run(async () => {
      const row = mapInputToRow(patch, { forCreate: false })
      row.updated_at = new Date().toISOString()
      const { data, error: qErr } = await supabase
        .from('vendor_rules')
        .update(row)
        .eq('id', id)
        .select()
        .single()
      if (qErr) throw qErr
      await fetchAll()
      return mapRow(data)
    })
  }

  async function deactivateRule(id) {
    return run(async () => {
      const { data, error: qErr } = await supabase
        .from('vendor_rules')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (qErr) throw qErr
      await fetchAll()
      return mapRow(data)
    })
  }

  async function reactivateRule(id) {
    return run(async () => {
      const { data, error: qErr } = await supabase
        .from('vendor_rules')
        .update({ active: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (qErr) throw qErr
      await fetchAll()
      return mapRow(data)
    })
  }

  async function run(fn) {
    if (!supabase) return { data: null, error: 'Supabase not configured' }
    try {
      setSaving(true)
      const data = await fn()
      return { data, error: null }
    } catch (err) {
      const msg = err?.message || 'Write failed'
      console.error('[useVendorRulesAdmin]', msg, err)
      return { data: null, error: msg }
    } finally {
      setSaving(false)
    }
  }

  return {
    rules,
    usageById,
    categories,
    subcategoriesFor,
    loading,
    error,
    saving,
    refetch: fetchAll,
    createRule,
    updateRule,
    deactivateRule,
    reactivateRule,
  }
}

function mapRow(row) {
  return {
    id: row.id,
    pattern: row.pattern,
    direction: row.direction,
    category: row.category,
    subcategory: row.subcategory,
    priority: row.priority,
    needsReview: row.needs_review,
    active: row.active,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Only sends explicitly-provided fields — a partial patch won't
// null-out unrelated columns.
function mapInputToRow(input, { forCreate }) {
  const row = {}
  if ('pattern' in input)      row.pattern      = String(input.pattern || '').trim()
  if ('direction' in input)    row.direction    = input.direction || null
  if ('category' in input)     row.category     = input.category
  if ('subcategory' in input)  row.subcategory  = input.subcategory || null
  if ('priority' in input)     row.priority     = Number(input.priority)
  if ('needsReview' in input)  row.needs_review = !!input.needsReview
  if ('active' in input)       row.active       = !!input.active
  if ('notes' in input)        row.notes        = input.notes?.trim() || null
  if (forCreate) {
    // Sensible defaults matching the DB column defaults.
    if (row.priority == null)      row.priority     = 50   // "specific vendor"
    if (row.needs_review == null)  row.needs_review = false
    if (row.active == null)        row.active       = true
  }
  return row
}

/**
 * @typedef {Object} Rule
 * @property {number}  id
 * @property {string}  pattern
 * @property {'credit'|'debit'|null} direction
 * @property {string}  category
 * @property {string|null} subcategory
 * @property {number}  priority
 * @property {boolean} needsReview
 * @property {boolean} active
 * @property {string|null} notes
 * @property {string}  createdAt
 * @property {string}  updatedAt
 */
