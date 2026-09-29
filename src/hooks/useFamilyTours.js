import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Load post-enrollment tours for one family + CRUD mutations.
 * Pre-enrollment prospect tours live in the separate /leads/tours
 * pipeline; this hook only knows about family_tours.
 *
 * @typedef {Object} FamilyTour
 * @property {string} id
 * @property {string} familyId
 * @property {string} tourAt
 * @property {'room_visit'|'parent_walkthrough'|'follow_up'|'other'} tourType
 * @property {string|null} ledBy
 * @property {string|null} notes
 * @property {'positive'|'neutral'|'concern'|null} outcome
 * @property {string} createdAt
 */
export function useFamilyTours(familyId) {
  const [rows, setRows] = useState(/** @type {FamilyTour[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(/** @type {string|null} */ (null))

  const fetchRows = useCallback(async () => {
    if (!supabase || !familyId) {
      setRows([])
      setLoading(false)
      return
    }
    try {
      setError(null)
      const { data, error: qErr } = await supabase
        .from('family_tours')
        .select('*')
        .eq('family_id', familyId)
        .order('tour_at', { ascending: false })
      if (qErr) {
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn('[useFamilyTours] table missing; treating as empty')
          setRows([])
          return
        }
        throw qErr
      }
      setRows((data || []).map(mapRow))
    } catch (err) {
      setError(err?.message || 'Failed to load tours')
    } finally {
      setLoading(false)
    }
  }, [familyId])

  useEffect(() => {
    setLoading(true)
    fetchRows()
  }, [fetchRows])

  async function logTour(values) {
    if (!supabase) return { data: null, error: 'Supabase not configured' }
    const payload = normalizePayload(familyId, values)
    const { data, error: iErr } = await supabase
      .from('family_tours')
      .insert(payload)
      .select()
      .single()
    if (iErr) return { data: null, error: iErr.message }
    await fetchRows()
    return { data: mapRow(data), error: null }
  }

  async function updateTour(id, patch) {
    if (!supabase) return { data: null, error: 'Supabase not configured' }
    const payload = normalizePayload(null, patch)
    const { data, error: uErr } = await supabase
      .from('family_tours')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (uErr) return { data: null, error: uErr.message }
    await fetchRows()
    return { data: mapRow(data), error: null }
  }

  async function deleteTour(id) {
    if (!supabase) return { error: 'Supabase not configured' }
    const { error: dErr } = await supabase.from('family_tours').delete().eq('id', id)
    if (dErr) return { error: dErr.message }
    await fetchRows()
    return { error: null }
  }

  return { rows, loading, error, refetch: fetchRows, logTour, updateTour, deleteTour }
}

function normalizePayload(familyId, v) {
  const emptyToNull = (s) => (typeof s === 'string' ? (s.trim() === '' ? null : s.trim()) : s)
  const payload = {
    tour_at: v.tourAt || new Date().toISOString(),
    tour_type: v.tourType || 'other',
    notes: emptyToNull(v.notes),
    outcome: v.outcome || null,
  }
  if (familyId) payload.family_id = familyId
  return payload
}

function mapRow(row) {
  return {
    id: row.id,
    familyId: row.family_id,
    tourAt: row.tour_at,
    tourType: row.tour_type,
    ledBy: row.led_by,
    notes: row.notes,
    outcome: row.outcome,
    createdAt: row.created_at,
  }
}
