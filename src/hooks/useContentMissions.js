import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useContentMissions(year, month) {
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMissions = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

      const { data, error: fetchError } = await supabase
        .from('content_missions')
        .select('*, content_programs(id, name, age_range, color)')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })

      if (fetchError) throw fetchError
      setMissions(data)
    } catch (err) {
      console.error('Error fetching content missions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    fetchMissions()
  }, [fetchMissions])

  return { missions, loading, error, refetch: fetchMissions }
}
