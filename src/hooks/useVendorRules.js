import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Read vendor_rules for dropdown population + insert new rules from
 * the manual-resolve flow (that's the whole point: every human
 * categorization can teach the rule engine).
 *
 * Distinct categories and subcategories are computed client-side from
 * the fetched rows. We deliberately do NOT hardcode a category list in
 * the frontend — that would be a shadow source of truth for a domain
 * the DB owns. If categories drift, they show up here automatically.
 */
export function useVendorRules() {
  const [rules, setRules] = useState(/** @type {Rule[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(/** @type {string|null} */ (null))
  const [saving, setSaving] = useState(false)

  const fetchRules = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }
    try {
      setError(null)
      const { data, error: qErr } = await supabase
        .from('vendor_rules')
        .select('id, pattern, direction, category, subcategory, priority, needs_review, active, notes')
        .eq('active', true)
        .order('priority', { ascending: false })
      if (qErr) throw qErr
      setRules((data || []).map(mapRow))
    } catch (err) {
      console.error('[useVendorRules] fetch failed:', err?.message || err)
      setError(err?.message || 'Failed to load vendor rules')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchRules()
  }, [fetchRules])

  // Category list intended for the resolve drawer + transaction filter.
  // Two exclusions:
  //   1. 'unclassified' — that's the bucket meaning "unfiled." Selecting
  //      it during manual categorization looks like filing but does
  //      nothing. Not a legitimate filing target.
  //   2. rules where needs_review=true — those are auto-generated rule
  //      proposals the parser flagged as uncertain. They must not
  //      contribute their category to a manual-picker UI, because that
  //      would let a human unwittingly rely on an unreviewed suggestion.
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

  const subcategoriesFor = useCallback(
    /**
     * @param {string} category
     * @returns {Array<string|null>}  includes null when at least one
     *   contributing rule for this category has subcategory=NULL.
     *   Same exclusions apply: 'unclassified' filtered upstream, and
     *   needs_review=true rules skipped here.
     */
    (category) => {
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
    },
    [rules]
  )

  /**
   * Insert a new rule. Called by the manual-resolve flow when the user
   * checks "apply to all future transactions matching <pattern>".
   */
  async function createRule({
    pattern,
    direction,
    category,
    subcategory,
    priority = 50,
    needsReview = false,
    notes,
  }) {
    if (!supabase) return { data: null, error: 'Supabase not configured' }
    if (!pattern?.trim()) return { data: null, error: 'Pattern is required' }
    if (!category) return { data: null, error: 'Category is required' }

    try {
      setSaving(true)
      const { data, error: qErr } = await supabase
        .from('vendor_rules')
        .insert({
          pattern: pattern.trim(),
          direction: direction || null,
          category,
          subcategory: subcategory || null,
          priority,
          needs_review: needsReview,
          notes: notes || null,
        })
        .select()
        .single()
      if (qErr) throw qErr
      await fetchRules()
      return { data: mapRow(data), error: null }
    } catch (err) {
      const msg = err?.message || 'Failed to save rule'
      console.error('[useVendorRules] createRule failed:', msg)
      return { data: null, error: msg }
    } finally {
      setSaving(false)
    }
  }

  return {
    rules,
    categories,
    subcategoriesFor,
    loading,
    error,
    saving,
    refetch: fetchRules,
    createRule,
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
  }
}

/**
 * @typedef {Object} Rule
 * @property {number} id
 * @property {string} pattern
 * @property {'credit'|'debit'|null} direction
 * @property {string} category
 * @property {string|null} subcategory
 * @property {number} priority
 * @property {boolean} needsReview
 * @property {boolean} active
 * @property {string|null} notes
 */
