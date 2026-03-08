import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTrainings() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchSubjects() {
      if (!supabase) {
        setError('Supabase not configured')
        setLoading(false)
        return
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('training_subjects')
          .select('*')
          .order('sort_order', { ascending: true })

        if (fetchError) throw fetchError
        setSubjects(data)
      } catch (err) {
        console.error('Error fetching training subjects:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSubjects()
  }, [])

  return { subjects, loading, error }
}
