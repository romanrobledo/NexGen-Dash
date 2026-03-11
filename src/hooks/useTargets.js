import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTargets() {
  const [targets, setTargets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTargets = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('targets')
        .select('*')
        .order('sort_order', { ascending: true })

      if (fetchError) throw fetchError
      setTargets(data)
    } catch (err) {
      console.error('Error fetching targets:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTargets()
  }, [fetchTargets])

  return { targets, loading, error, refetch: fetchTargets }
}
