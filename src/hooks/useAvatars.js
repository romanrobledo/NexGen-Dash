import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Avatar personas (Public Course Pete–style profiles).
 *
 * Identity is a jsonb array of { label, value } pairs; pains / goals /
 * objections are jsonb string arrays. The hook normalizes DB shapes so
 * every array field is always a plain JS array on the way out.
 */
export function useAvatars({ includeInactive = false } = {}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRows = useCallback(async () => {
    if (!supabase) { setError('Supabase not configured'); setLoading(false); return }
    try {
      setError(null)
      let q = supabase
        .from('avatars')
        .select('*')
        .order('position', { ascending: true })
        .order('name',     { ascending: true })
      if (!includeInactive) q = q.eq('active', true)
      const { data, error: qErr } = await q
      if (qErr) {
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn('[useAvatars] table missing; run sql/avatars-schema.sql')
          setRows([]); return
        }
        throw qErr
      }
      setRows((data || []).map(mapRow))
    } catch (err) {
      setError(err?.message || 'Failed to load avatars')
    } finally { setLoading(false) }
  }, [includeInactive])

  useEffect(() => { setLoading(true); fetchRows() }, [fetchRows])

  async function createAvatar(values) {
    const payload = toDb(values)
    if (!payload.slug) payload.slug = slugify(payload.name)
    const { data, error: iErr } = await supabase.from('avatars').insert(payload).select().single()
    if (iErr) return { data: null, error: iErr.message }
    await fetchRows()
    return { data: mapRow(data), error: null }
  }

  async function updateAvatar(id, patch) {
    const { error: uErr } = await supabase.from('avatars').update(toDb(patch)).eq('id', id)
    if (uErr) return { error: uErr.message }
    await fetchRows()
    return { error: null }
  }

  async function deleteAvatar(id) {
    const { error: dErr } = await supabase.from('avatars').delete().eq('id', id)
    if (dErr) return { error: dErr.message }
    await fetchRows()
    return { error: null }
  }

  function bySlug(slug) {
    return rows.find(r => r.slug === slug) || null
  }

  return { rows, loading, error, refetch: fetchRows, createAvatar, updateAvatar, deleteAvatar, bySlug }
}

function mapRow(row) {
  return {
    id:         row.id,
    slug:       row.slug,
    name:       row.name,
    subtitle:   row.subtitle || '',
    summary:    row.summary || '',
    identity:   normalizeIdentity(row.identity),
    pains:      normalizeStringList(row.pains),
    goals:      normalizeStringList(row.goals),
    objections: normalizeStringList(row.objections),
    position:   row.position,
    active:     row.active,
    createdAt:  row.created_at,
    updatedAt:  row.updated_at,
  }
}

function toDb(values) {
  const out = {}
  if ('slug'       in values) out.slug       = values.slug ? slugify(values.slug) : null
  if ('name'       in values) out.name       = values.name?.trim()
  if ('subtitle'   in values) out.subtitle   = values.subtitle?.trim() || null
  if ('summary'    in values) out.summary    = values.summary?.trim() || null
  if ('identity'   in values) out.identity   = normalizeIdentity(values.identity)
  if ('pains'      in values) out.pains      = normalizeStringList(values.pains)
  if ('goals'      in values) out.goals      = normalizeStringList(values.goals)
  if ('objections' in values) out.objections = normalizeStringList(values.objections)
  if ('position'   in values) out.position   = Number(values.position) || 0
  if ('active'     in values) out.active     = !!values.active
  return out
}

function normalizeIdentity(v) {
  if (!Array.isArray(v)) return []
  return v
    .map(row => ({
      label: String(row?.label ?? '').trim(),
      value: String(row?.value ?? '').trim(),
    }))
    .filter(row => row.label || row.value)
}

function normalizeStringList(v) {
  if (!Array.isArray(v)) return []
  return v.map(s => String(s ?? '').trim()).filter(Boolean)
}

export function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
