import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useKpiMutations() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function createKpiDefinition({ name, category, roleIds, unit, targetValue, greenThreshold, yellowThreshold, redThreshold, cadence, description, sortOrder }) {
    if (!supabase) {
      setError('Supabase not configured')
      return { data: null, error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('kpi_definitions')
        .insert({
          name,
          category,
          role_ids: roleIds || [],
          unit: unit || '',
          target_value: targetValue || null,
          green_threshold: greenThreshold || null,
          yellow_threshold: yellowThreshold || null,
          red_threshold: redThreshold || null,
          cadence: cadence || 'weekly',
          description: description || '',
          sort_order: sortOrder || 0,
        })
        .select()
        .single()

      if (insertError) throw insertError
      return { data, error: null }
    } catch (err) {
      console.error('Error creating KPI definition:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  async function createScore({ kpiId, periodStart, periodEnd, value, status, notes, enteredBy }) {
    if (!supabase) {
      setError('Supabase not configured')
      return { data: null, error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('kpi_scores')
        .insert({
          kpi_id: kpiId,
          period_start: periodStart,
          period_end: periodEnd,
          value,
          status: status || null,
          notes: notes || '',
          entered_by: enteredBy || null,
        })
        .select('*, kpi_definitions(id, name, category)')
        .single()

      if (insertError) throw insertError
      return { data, error: null }
    } catch (err) {
      console.error('Error creating KPI score:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  async function updateScore(id, updates) {
    if (!supabase) {
      setError('Supabase not configured')
      return { data: null, error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('kpi_scores')
        .update(updates)
        .eq('id', id)
        .select('*, kpi_definitions(id, name, category)')
        .single()

      if (updateError) throw updateError
      return { data, error: null }
    } catch (err) {
      console.error('Error updating KPI score:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  return {
    createKpiDefinition,
    createScore,
    updateScore,
    saving,
    error,
  }
}
