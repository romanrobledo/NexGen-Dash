import { useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Write-side companion to useChildren. Three ops:
 *   • createChild   — INSERT a new enrollment
 *   • updateChild   — UPDATE any editable field on an existing child
 *   • withdrawChild — soft-delete (active=false, enrollment_status='withdrawn')
 *
 * The DB trigger auto-populates updated_by from the JWT, so callers don't
 * pass it. RLS lets any authenticated staff INSERT/UPDATE; DELETE is
 * intentionally not exposed — withdrawing is a soft-delete.
 *
 * Every op returns { data, error }. Consumer decides whether to toast/
 * navigate/refetch. Loading + last-error state live on the hook for
 * button-disable convenience.
 */
export function useChildrenMutations() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(/** @type {string | null} */ (null))

  async function createChild(input) {
    return run(async () => {
      const row = mapInputToRow(input, { forCreate: true })
      const { data, error: qErr } = await supabase
        .from('children')
        .insert(row)
        .select()
        .single()
      if (qErr) throw qErr
      return data
    })
  }

  async function updateChild(id, patch) {
    return run(async () => {
      const row = mapInputToRow(patch, { forCreate: false })
      const { data, error: qErr } = await supabase
        .from('children')
        .update(row)
        .eq('id', id)
        .select()
        .single()
      if (qErr) throw qErr
      return data
    })
  }

  async function withdrawChild(id) {
    return run(async () => {
      const { data, error: qErr } = await supabase
        .from('children')
        .update({ active: false, enrollment_status: 'withdrawn' })
        .eq('id', id)
        .select()
        .single()
      if (qErr) throw qErr
      return data
    })
  }

  async function run(fn) {
    if (!supabase) {
      const msg = 'Supabase not configured'
      setError(msg)
      return { data: null, error: msg }
    }
    try {
      setSaving(true)
      setError(null)
      const data = await fn()
      return { data, error: null }
    } catch (err) {
      const msg = err?.message || 'Write failed'
      console.error('[useChildrenMutations]', msg, err)
      setError(msg)
      return { data: null, error: msg }
    } finally {
      setSaving(false)
    }
  }

  return { createChild, updateChild, withdrawChild, saving, error }
}

/**
 * App-shape → DB-shape. Only sends fields the caller actually set — that
 * way a partial update doesn't clobber unrelated columns to null.
 */
function mapInputToRow(input, { forCreate }) {
  const row = {}
  if ('fullName' in input)          row.full_name         = input.fullName
  if ('dateOfBirth' in input)       row.date_of_birth     = input.dateOfBirth || null
  if ('roomNumber' in input)        row.room_number       = input.roomNumber
  if ('teacherName' in input)       row.teacher_name      = input.teacherName || null
  if ('onCcms' in input)            row.on_ccms           = !!input.onCcms
  if ('ccmsAmount' in input)        row.ccms_amount       = input.ccmsAmount ?? 0
  if ('programClass' in input)      row.program_class     = input.programClass || null
  if ('remarks' in input)           row.remarks           = input.remarks || null
  if ('enrollmentStatus' in input)  row.enrollment_status = input.enrollmentStatus
  if ('startDate' in input)         row.start_date        = input.startDate || null
  if (forCreate) {
    // Sensible defaults for a fresh enrollment — office typically enrolls
    // kids before their first day, so 'incoming' is the right default.
    row.active            = true
    row.enrollment_status = row.enrollment_status || 'incoming'
  }
  return row
}
