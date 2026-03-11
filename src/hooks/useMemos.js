import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useMemos({ staffId, weekOf } = {}) {
  const [memos, setMemos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMemos = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      let query = supabase
        .from('memos')
        .select('*')
        .order('week_of', { ascending: false })

      if (staffId) {
        query = query.eq('staff_id', staffId)
      }

      if (weekOf) {
        query = query.eq('week_of', weekOf)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setMemos(data)
    } catch (err) {
      console.error('Error fetching memos:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [staffId, weekOf])

  useEffect(() => {
    fetchMemos()
  }, [fetchMemos])

  return { memos, loading, error, refetch: fetchMemos }
}
