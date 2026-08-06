import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Fetch marketing campaigns from Supabase.
 *
 * Reads `public.campaigns` (created earlier). Returns rows in a stable
 * camelCase shape so pages don't need to know about the DB casing.
 *
 * Graceful fallback: if the table doesn't exist yet (migration not run)
 * we treat it as an empty array so the UI never crashes.
 *
 * Returns { campaigns, loading, error, refetch }
 */
export function useCampaigns() {
  const [campaigns, setCampaigns] = useState([])
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
        .from('campaigns')
        .select(
          'id, name, description, timeframe, start_date, end_date, status, program_id, created_at, updated_at'
        )
        .order('start_date', { ascending: true })
      if (qErr) {
        // Missing table → treat as empty. Matches useClassrooms /
        // useChildren pattern so a fresh Supabase project doesn't crash.
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn('[useCampaigns] campaigns table missing; treating as empty')
          setCampaigns([])
          return
        }
        throw qErr
      }
      setCampaigns((data || []).map(mapRow))
    } catch (err) {
      console.error('[useCampaigns] fetch failed:', err?.message || err)
      setError(err?.message || 'Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchRows()
  }, [fetchRows])

  return { campaigns, loading, error, refetch: fetchRows }
}

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    timeframe: row.timeframe, // 'day' | 'week' | 'month' | 'quarter' | 'annual'
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status, // 'planned' | 'active' | 'complete'
    programId: row.program_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * @typedef {Object} Campaign
 * @property {string} id
 * @property {string} name
 * @property {string|null} description
 * @property {'day'|'week'|'month'|'quarter'|'annual'} timeframe
 * @property {string} startDate   ISO date (YYYY-MM-DD)
 * @property {string|null} endDate
 * @property {'planned'|'active'|'complete'} status
 * @property {string|null} programId
 * @property {string} createdAt
 * @property {string} updatedAt
 */
