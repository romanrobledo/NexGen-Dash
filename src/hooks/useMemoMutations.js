import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useMemoMutations() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function createMemo({ staffId, roleId, weekOf, memoType, content, highlights, concerns, actionItems }) {
    if (!supabase) {
      setError('Supabase not configured')
      return { data: null, error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('memos')
        .insert({
          staff_id: staffId || null,
          role_id: roleId || null,
          week_of: weekOf,
          memo_type: memoType || 'weekly',
          content: content || {},
          highlights: highlights || [],
          concerns: concerns || [],
          action_items: actionItems || [],
        })
        .select()
        .single()

      if (insertError) throw insertError
      return { data, error: null }
    } catch (err) {
      console.error('Error creating memo:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  async function updateMemo(id, updates) {
    if (!supabase) {
      setError('Supabase not configured')
      return { data: null, error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('memos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      return { data, error: null }
    } catch (err) {
      console.error('Error updating memo:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  async function addAiSummary(id, { aiSummary, aiRecommendations }) {
    return updateMemo(id, {
      ai_summary: aiSummary,
      ai_recommendations: aiRecommendations || [],
    })
  }

  return {
    createMemo,
    updateMemo,
    addAiSummary,
    saving,
    error,
  }
}
