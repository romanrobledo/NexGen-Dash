import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Fetch shot list items from Supabase.
 *
 * Reads `public.shot_items` (created earlier). Joins the parent campaign
 * name via PostgREST embed so the UI can label each shot with its
 * campaign without a second query.
 *
 * Graceful fallback: if the table doesn't exist yet, treat as empty.
 *
 * Returns { shots, loading, error, refetch }
 */
export function useShotItems() {
  const [shots, setShots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRows = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }
    setError(null)
    try {
      const { data, error: qErr } = await supabase
        .from('shot_items')
        .select(
          'id, campaign_id, description, shoot_date, deadline_date, status, assigned_to, notes, created_at, updated_at, campaigns(name)'
        )
        .order('shoot_date', { ascending: true, nullsFirst: false })
      if (qErr) {
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn('[useShotItems] shot_items table missing; treating as empty')
          setShots([])
          return
        }
        throw qErr
      }
      setShots((data || []).map(mapRow))
    } catch (err) {
      console.error('[useShotItems] fetch failed:', err?.message || err)
      setError(err?.message || 'Failed to load shots')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchRows()
  }, [fetchRows])

  return { shots, loading, error, refetch: fetchRows }
}

function mapRow(row) {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    campaignName: row.campaigns?.name || null,
    description: row.description,
    shootDate: row.shoot_date,
    deadlineDate: row.deadline_date,
    status: row.status, // 'todo' | 'shot' | 'edited' | 'posted'
    assignedTo: row.assigned_to,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * @typedef {Object} ShotItem
 * @property {string} id
 * @property {string} campaignId
 * @property {string|null} campaignName
 * @property {string} description
 * @property {string|null} shootDate    ISO date
 * @property {string|null} deadlineDate ISO date
 * @property {'todo'|'shot'|'edited'|'posted'} status
 * @property {string|null} assignedTo
 * @property {string|null} notes
 */
