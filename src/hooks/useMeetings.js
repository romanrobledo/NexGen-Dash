import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useMeetings({ startDate, endDate, status } = {}) {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMeetings = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      let query = supabase
        .from('meetings')
        .select('*')
        .order('scheduled_at', { ascending: false })

      if (startDate) {
        query = query.gte('scheduled_at', startDate)
      }

      if (endDate) {
        query = query.lte('scheduled_at', endDate)
      }

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setMeetings(data)
    } catch (err) {
      console.error('Error fetching meetings:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, status])

  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  return { meetings, loading, error, refetch: fetchMeetings }
}
