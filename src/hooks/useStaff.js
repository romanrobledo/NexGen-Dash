import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useStaff() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchStaff() {
      if (!supabase) {
        setError('Supabase not configured')
        setLoading(false)
        return
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('staff')
          .select('*')
          .order('last_name', { ascending: true })

        if (fetchError) throw fetchError
        setStaff(data)
      } catch (err) {
        console.error('Error fetching staff:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStaff()
  }, [])

  return { staff, loading, error }
}
