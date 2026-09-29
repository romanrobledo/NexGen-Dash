import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * One hook family for issues + ideas — they share the same "submitted
 * by staff, triaged by admin" pattern with slightly different columns.
 * Splitting them into two components would double the file for very
 * little gain.
 */

// ── ISSUES ──────────────────────────────────────────────────────────────────

export function useIssues({ status = null, staffId = null } = {}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRows = useCallback(async () => {
    if (!supabase) { setError('Supabase not configured'); setLoading(false); return }
    try {
      setError(null)
      let q = supabase
        .from('staff_issues')
        .select(`
          *,
          submitter:staff!staff_issues_submitted_by_fkey ( full_name ),
          resolver:staff!staff_issues_resolver_id_fkey ( full_name )
        `)
        .order('submitted_at', { ascending: false })
      if (status) q = q.eq('status', status)
      if (staffId) q = q.eq('submitted_by', staffId)
      const { data, error: qErr } = await q
      if (qErr) {
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn('[useIssues] table missing; treating as empty')
          setRows([]); return
        }
        throw qErr
      }
      setRows((data || []).map(mapIssue))
    } catch (err) {
      setError(err?.message || 'Failed to load issues')
    } finally { setLoading(false) }
  }, [status, staffId])

  useEffect(() => { setLoading(true); fetchRows() }, [fetchRows])

  async function submit(values) {
    const payload = {
      submitted_by: values.submittedBy,
      category: values.category,
      severity: values.severity || 'medium',
      description: values.description?.trim(),
    }
    const { data, error: iErr } = await supabase.from('staff_issues').insert(payload).select().single()
    if (iErr) return { data: null, error: iErr.message }
    await fetchRows()
    return { data, error: null }
  }

  async function update(id, patch) {
    const dbPatch = {}
    if ('status' in patch) dbPatch.status = patch.status
    if ('severity' in patch) dbPatch.severity = patch.severity
    if ('resolverNotes' in patch) dbPatch.resolver_notes = patch.resolverNotes?.trim() || null
    if ('resolverId' in patch) dbPatch.resolver_id = patch.resolverId || null
    if (patch.status === 'resolved' && !patch.resolvedAt) dbPatch.resolved_at = new Date().toISOString()
    const { error: uErr } = await supabase.from('staff_issues').update(dbPatch).eq('id', id)
    if (uErr) return { error: uErr.message }
    await fetchRows()
    return { error: null }
  }

  return { rows, loading, error, refetch: fetchRows, submit, update }
}

// ── IDEAS ────────────────────────────────────────────────────────────────────

export function useIdeas({ status = null, staffId = null } = {}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRows = useCallback(async () => {
    if (!supabase) { setError('Supabase not configured'); setLoading(false); return }
    try {
      setError(null)
      let q = supabase
        .from('staff_ideas')
        .select(`
          *,
          submitter:staff!staff_ideas_submitted_by_fkey ( full_name )
        `)
        .order('submitted_at', { ascending: false })
      if (status) q = q.eq('status', status)
      if (staffId) q = q.eq('submitted_by', staffId)
      const { data, error: qErr } = await q
      if (qErr) {
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn('[useIdeas] table missing; treating as empty')
          setRows([]); return
        }
        throw qErr
      }
      setRows((data || []).map(mapIdea))
    } catch (err) {
      setError(err?.message || 'Failed to load ideas')
    } finally { setLoading(false) }
  }, [status, staffId])

  useEffect(() => { setLoading(true); fetchRows() }, [fetchRows])

  async function submit(values) {
    const payload = {
      submitted_by: values.submittedBy,
      category: values.category,
      title: values.title?.trim(),
      description: values.description?.trim() || null,
    }
    const { data, error: iErr } = await supabase.from('staff_ideas').insert(payload).select().single()
    if (iErr) return { data: null, error: iErr.message }
    await fetchRows()
    return { data, error: null }
  }

  async function update(id, patch) {
    const dbPatch = {}
    if ('status' in patch) dbPatch.status = patch.status
    if ('responseNotes' in patch) dbPatch.response_notes = patch.responseNotes?.trim() || null
    const { error: uErr } = await supabase.from('staff_ideas').update(dbPatch).eq('id', id)
    if (uErr) return { error: uErr.message }
    await fetchRows()
    return { error: null }
  }

  return { rows, loading, error, refetch: fetchRows, submit, update }
}

// ── mappers ────────────────────────────────────────────────────────────────

function mapIssue(row) {
  return {
    id: row.id,
    submittedBy: row.submitted_by,
    submittedByName: row.submitter?.full_name || '',
    submittedAt: row.submitted_at,
    category: row.category,
    severity: row.severity,
    description: row.description,
    status: row.status,
    resolverId: row.resolver_id,
    resolverName: row.resolver?.full_name || '',
    resolverNotes: row.resolver_notes,
    resolvedAt: row.resolved_at,
    updatedAt: row.updated_at,
  }
}

function mapIdea(row) {
  return {
    id: row.id,
    submittedBy: row.submitted_by,
    submittedByName: row.submitter?.full_name || '',
    submittedAt: row.submitted_at,
    category: row.category,
    title: row.title,
    description: row.description,
    status: row.status,
    responseNotes: row.response_notes,
    updatedAt: row.updated_at,
  }
}
