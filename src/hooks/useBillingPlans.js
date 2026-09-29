import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Plans (tuition tiers). Fetch active plans by default; the page can
 * opt into showing inactive ones via includeInactive: true.
 *
 * @typedef {Object} BillingPlan
 * @property {string}  id
 * @property {string}  name
 * @property {string|null} description
 * @property {number}  amountCents
 * @property {'weekly'|'monthly'|'one_time'} frequency
 * @property {string|null} ageRange
 * @property {boolean} active
 * @property {string|null} notes
 * @property {string}  updatedAt
 */
export function useBillingPlans({ includeInactive = false } = {}) {
  const [rows, setRows] = useState(/** @type {BillingPlan[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(/** @type {string|null} */ (null))

  const fetchRows = useCallback(async () => {
    if (!supabase) { setError('Supabase not configured'); setLoading(false); return }
    try {
      setError(null)
      let q = supabase.from('billing_plans').select('*').order('amount_cents', { ascending: false })
      if (!includeInactive) q = q.eq('active', true)
      const { data, error: qErr } = await q
      if (qErr) {
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn('[useBillingPlans] table missing; treating as empty')
          setRows([]); return
        }
        throw qErr
      }
      setRows((data || []).map(mapRow))
    } catch (err) {
      setError(err?.message || 'Failed to load plans')
    } finally { setLoading(false) }
  }, [includeInactive])

  useEffect(() => { setLoading(true); fetchRows() }, [fetchRows])

  async function createPlan(values) {
    const { data, error: iErr } = await supabase.from('billing_plans').insert(normalizePayload(values)).select().single()
    if (iErr) return { data: null, error: iErr.message }
    await fetchRows()
    return { data: mapRow(data), error: null }
  }
  async function updatePlan(id, patch) {
    const { data, error: uErr } = await supabase.from('billing_plans').update(normalizePayload(patch)).eq('id', id).select().single()
    if (uErr) return { data: null, error: uErr.message }
    await fetchRows()
    return { data: mapRow(data), error: null }
  }
  async function deletePlan(id) {
    const { error: dErr } = await supabase.from('billing_plans').delete().eq('id', id)
    if (dErr) return { error: dErr.message }
    await fetchRows()
    return { error: null }
  }

  return { rows, loading, error, refetch: fetchRows, createPlan, updatePlan, deletePlan }
}

function normalizePayload(v) {
  return {
    name: (v.name || '').trim(),
    description: v.description?.trim() || null,
    amount_cents: Math.round(Number(v.amountCents || 0)),
    frequency: v.frequency || 'monthly',
    age_range: v.ageRange?.trim() || null,
    active: v.active !== false,
    notes: v.notes?.trim() || null,
  }
}

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    amountCents: row.amount_cents,
    frequency: row.frequency,
    ageRange: row.age_range,
    active: !!row.active,
    notes: row.notes,
    updatedAt: row.updated_at,
  }
}
