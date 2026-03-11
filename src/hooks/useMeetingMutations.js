import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useMeetingMutations() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function createMeeting({ title, meetingType, cadence, scheduledAt, durationMin, attendees, agenda }) {
    if (!supabase) {
      setError('Supabase not configured')
      return { data: null, error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('meetings')
        .insert({
          title,
          meeting_type: meetingType,
          cadence,
          scheduled_at: scheduledAt,
          duration_min: durationMin || null,
          attendees: attendees || [],
          agenda: agenda || [],
        })
        .select()
        .single()

      if (insertError) throw insertError
      return { data, error: null }
    } catch (err) {
      console.error('Error creating meeting:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  async function updateMeeting(id, updates) {
    if (!supabase) {
      setError('Supabase not configured')
      return { data: null, error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('meetings')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      return { data, error: null }
    } catch (err) {
      console.error('Error updating meeting:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  async function completeMeeting(id, { outcomes, actionItems }) {
    return updateMeeting(id, {
      status: 'completed',
      outcomes: outcomes || '',
      action_items: actionItems || [],
    })
  }

  async function cancelMeeting(id) {
    return updateMeeting(id, { status: 'cancelled' })
  }

  async function markMissed(id) {
    return updateMeeting(id, { status: 'missed' })
  }

  return {
    createMeeting,
    updateMeeting,
    completeMeeting,
    cancelMeeting,
    markMissed,
    saving,
    error,
  }
}
