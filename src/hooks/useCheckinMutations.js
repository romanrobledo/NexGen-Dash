import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useCheckinMutations() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function submitCheckin({ staff_id, type, rating, activities, improvements, tomorrow_plan }) {
    if (!supabase) {
      setError('Supabase not configured')
      return { data: null, error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const row = {
        staff_id,
        type,
        rating,
        activities,
        improvements,
        tomorrow_plan,
        timestamp: new Date().toISOString(),
      }

      let result = await supabase
        .from('checkin_responses')
        .insert(row)
        .select()
        .single()

      // If type column doesn't exist yet, retry without it
      if (result.error && result.error.message?.includes("'type'")) {
        const { type: _, ...rowWithoutType } = row
        result = await supabase
          .from('checkin_responses')
          .insert(rowWithoutType)
          .select()
          .single()
      }

      if (result.error) throw result.error
      const data = result.data
      return { data, error: null }
    } catch (err) {
      console.error('Error submitting checkin:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  return { submitCheckin, saving, error }
}
