import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function usePriorities() {
  const [priorities, setPriorities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPriorities = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('priorities')
        .select('*')
        .order('sort_order', { ascending: true })

      if (fetchError) throw fetchError
      setPriorities(data)
    } catch (err) {
      console.error('Error fetching priorities:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPriorities()
  }, [fetchPriorities])

  return { priorities, loading, error, refetch: fetchPriorities }
}
