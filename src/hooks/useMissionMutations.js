import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { DEFAULT_CHECKLIST } from '../lib/contentCalendarConstants'

export function useMissionMutations() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function createMission({ date, program_id, bucket }) {
    if (!supabase) {
      setError('Supabase not configured')
      return { data: null, error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('content_missions')
        .insert({
          date,
          program_id,
          bucket,
          status: 'pending',
          checklist: DEFAULT_CHECKLIST,
          photos_taken: 0,
          videos_taken: 0,
          uniform_check: false,
          handoff_notes: '',
        })
        .select('*, content_programs(id, name, age_range, color)')
        .single()

      if (insertError) throw insertError
      return { data, error: null }
    } catch (err) {
      console.error('Error creating mission:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  async function updateMission(id, updates) {
    if (!supabase) {
      setError('Supabase not configured')
      return { data: null, error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('content_missions')
        .update(updates)
        .eq('id', id)
        .select('*, content_programs(id, name, age_range, color)')
        .single()

      if (updateError) throw updateError
      return { data, error: null }
    } catch (err) {
      console.error('Error updating mission:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  async function deleteMission(id) {
    if (!supabase) {
      setError('Supabase not configured')
      return { error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { error: deleteError } = await supabase
        .from('content_missions')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      return { error: null }
    } catch (err) {
      console.error('Error deleting mission:', err)
      setError(err.message)
      return { error: err.message }
    } finally {
      setSaving(false)
    }
  }

  return { createMission, updateMission, deleteMission, saving, error }
}
