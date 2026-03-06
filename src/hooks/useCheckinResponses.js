import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCheckinResponses(staffId) {
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!staffId) {
      setLoading(false)
      return
    }

    async function fetchResponses() {
      if (!supabase) {
        setError('Supabase not configured')
        setLoading(false)
        return
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('checkin_responses')
          .select('*')
          .eq('staff_id', staffId)
          .order('timestamp', { ascending: false })

        if (fetchError) throw fetchError
        setResponses(data)
      } catch (err) {
        console.error('Error fetching responses:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchResponses()
  }, [staffId])

  return { responses, loading, error }
}
