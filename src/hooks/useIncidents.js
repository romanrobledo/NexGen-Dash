import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Facility incidents by scope. Scope is one of:
 *   - 'family'     — dropoff/pickup conflicts, custody notes, allergy updates
 *   - 'facility'   — building-wide events (power outage, fire drill, equipment)
 *   - 'classroom'  — room-level events (injury, disruption, specific-child)
 *
 * Rows are shared across all authenticated staff via RLS. Insert is
 * self-only (reported_by must match caller); update/delete is admin.
 */
export function useIncidents({ scope, days = 30 } = {}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchRows = useCallback(async () => {
    if (!supabase) { setError('Supabase not configured'); setLoading(false); return }
    if (!scope)    { setError('scope required');           setLoading(false); return }
    try {
      setError(null)
      const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString()
      const { data, error: qErr } = await supabase
        .from('facility_incidents')
        .select(`
          *,
          reporter:staff ( full_name )
        `)
        .eq('scope', scope)
        .gte('reported_at', since)
        .order('reported_at', { ascending: false })
      if (qErr) {
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn('[useIncidents] table missing; run sql/facility-incidents-schema.sql')
          setRows([]); return
        }
        throw qErr
      }
      setRows((data || []).map(mapRow))
    } catch (err) {
      setError(err?.message || 'Failed to load incidents')
    } finally { setLoading(false) }
  }, [scope, days])

  useEffect(() => { setLoading(true); fetchRows() }, [fetchRows])

  async function submit(values) {
    if (!scope) return { ok: false, error: 'scope required' }
    if (!values.description?.trim()) return { ok: false, error: 'description required' }
    setSubmitting(true)
    try {
      const payload = {
        scope,
        severity: values.severity || 'info',
        description: values.description.trim(),
        child_name: values.childName?.trim() || null,
        parent_name: values.parentName?.trim() || null,
        room_number: values.roomNumber ? Number(values.roomNumber) : null,
        reported_by: values.reportedBy || null,
      }
      const { data, error: iErr } = await supabase
        .from('facility_incidents')
        .insert(payload)
        .select()
        .single()
      if (iErr) return { ok: false, error: iErr.message }
      await fetchRows()
      return { ok: true, row: mapRow(data) }
    } finally { setSubmitting(false) }
  }

  return { rows, loading, error, submitting, submit, refetch: fetchRows }
}

function mapRow(row) {
  return {
    id:              row.id,
    scope:           row.scope,
    severity:        row.severity,
    childName:       row.child_name,
    parentName:      row.parent_name,
    roomNumber:      row.room_number,
    description:     row.description,
    reportedBy:      row.reported_by,
    reportedByName:  row.reporter?.full_name || '',
    reportedAt:      row.reported_at,
    resolutionNotes: row.resolution_notes,
    resolvedAt:      row.resolved_at,
  }
}
