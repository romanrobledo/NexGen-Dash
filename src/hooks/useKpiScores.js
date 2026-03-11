import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useKpiScores({ startDate, endDate } = {}) {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchScores = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      let query = supabase
        .from('kpi_scores')
        .select('*, kpi_definitions(id, name, category, unit, target_value, green_threshold, yellow_threshold, red_threshold)')
        .order('period_start', { ascending: false })

      if (startDate) {
        query = query.gte('period_start', startDate)
      }

      if (endDate) {
        query = query.lte('period_end', endDate)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setScores(data)
    } catch (err) {
      console.error('Error fetching KPI scores:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchScores()
  }, [fetchScores])

  return { scores, loading, error, refetch: fetchScores }
}
