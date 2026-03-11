import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useTargetTaskMutations() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // ── Target mutations ──────────────────────────────

  async function createTarget({ label, detail, icon, color, sort_order }) {
    if (!supabase) {
      setError('Supabase not configured')
      return { data: null, error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('targets')
        .insert({ label, detail, icon, color, sort_order })
        .select()
        .single()

      if (insertError) throw insertError
      return { data, error: null }
    } catch (err) {
      console.error('Error creating target:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  async function updateTarget(id, updates) {
    if (!supabase) {
      setError('Supabase not configured')
      return { data: null, error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('targets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      return { data, error: null }
    } catch (err) {
      console.error('Error updating target:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  // ── Priority mutations ────────────────────────────

  async function createPriority({ code, name, color, sort_order }) {
    if (!supabase) {
      setError('Supabase not configured')
      return { data: null, error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('priorities')
        .insert({ code, name, color, sort_order })
        .select()
        .single()

      if (insertError) throw insertError
      return { data, error: null }
    } catch (err) {
      console.error('Error creating priority:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  // ── Task mutations ────────────────────────────────

  async function createTask(taskData) {
    if (!supabase) {
      setError('Supabase not configured')
      return { data: null, error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select('*, priorities(id, code, name, color)')
        .single()

      if (insertError) throw insertError
      return { data, error: null }
    } catch (err) {
      console.error('Error creating task:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  async function updateTask(id, updates) {
    if (!supabase) {
      setError('Supabase not configured')
      return { data: null, error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select('*, priorities(id, code, name, color)')
        .single()

      if (updateError) throw updateError
      return { data, error: null }
    } catch (err) {
      console.error('Error updating task:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  async function toggleTaskCompletion(id, currentlyCompleted) {
    const updates = currentlyCompleted
      ? { is_completed: false, completed_at: null }
      : { is_completed: true, completed_at: new Date().toISOString() }
    return updateTask(id, updates)
  }

  async function deleteTask(id) {
    if (!supabase) {
      setError('Supabase not configured')
      return { error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      return { error: null }
    } catch (err) {
      console.error('Error deleting task:', err)
      setError(err.message)
      return { error: err.message }
    } finally {
      setSaving(false)
    }
  }

  return {
    createTarget,
    updateTarget,
    createPriority,
    createTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask,
    saving,
    error,
  }
}
