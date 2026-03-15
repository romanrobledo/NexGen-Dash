import { useState } from 'react'
import { supabase } from '../lib/supabase'

const ZAPIER_CHECKIN_URL = import.meta.env.VITE_ZAPIER_CHECKIN_WEBHOOK || ''
const ZAPIER_CHECKOUT_URL = import.meta.env.VITE_ZAPIER_CHECKOUT_WEBHOOK || ''

export function useCheckinMutations() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function submitCheckin({ staff_id, staff_name, staff_email, staff_role, type, rating, activities, improvements, tomorrow_plan }) {
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

      // Fire-and-forget webhook to Zapier (don't block the UI)
      const webhookUrl = type === 'checkout' ? ZAPIER_CHECKOUT_URL : ZAPIER_CHECKIN_URL
      if (webhookUrl) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            staff_name: staff_name || '',
            staff_email: staff_email || '',
            staff_role: staff_role || '',
            type,
            rating,
            activities,
            improvements,
            tomorrow_plan,
            timestamp: row.timestamp,
          }),
        }).catch((err) => console.warn('Zapier webhook failed:', err))
      }

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
