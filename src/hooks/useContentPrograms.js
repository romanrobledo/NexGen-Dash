import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useContentPrograms() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchPrograms() {
      if (!supabase) {
        setError('Supabase not configured')
        setLoading(false)
        return
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('content_programs')
          .select('*')
          .order('sort_order', { ascending: true })

        if (fetchError) throw fetchError
        setPrograms(data)
      } catch (err) {
        console.error('Error fetching content programs:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  return { programs, loading, error }
}
