import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useKpiDefinitions() {
  const [kpis, setKpis] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchKpis = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('kpi_definitions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (fetchError) throw fetchError
      setKpis(data)
    } catch (err) {
      console.error('Error fetching KPI definitions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKpis()
  }, [fetchKpis])

  return { kpis, loading, error, refetch: fetchKpis }
}
