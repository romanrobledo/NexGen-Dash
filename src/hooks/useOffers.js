import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { normalizeSection } from '../lib/offerSections'

/**
 * Offer pages — full Sterling-style pitch documents built from typed
 * section blocks. Sections are stored as jsonb and validated at the
 * app boundary via normalizeSection().
 */
export function useOffers({ includeInactive = false } = {}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRows = useCallback(async () => {
    if (!supabase) { setError('Supabase not configured'); setLoading(false); return }
    try {
      setError(null)
      let q = supabase
        .from('offers')
        .select('*')
        .order('position', { ascending: true })
        .order('name',     { ascending: true })
      if (!includeInactive) q = q.eq('active', true)
      const { data, error: qErr } = await q
      if (qErr) {
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn('[useOffers] table missing; run sql/offers-schema.sql')
          setRows([]); return
        }
        throw qErr
      }
      setRows((data || []).map(mapRow))
    } catch (err) {
      setError(err?.message || 'Failed to load offers')
    } finally { setLoading(false) }
  }, [includeInactive])

  useEffect(() => { setLoading(true); fetchRows() }, [fetchRows])

  async function createOffer(values) {
    const payload = toDb(values)
    if (!payload.slug) payload.slug = slugify(payload.name)
    const { data, error: iErr } = await supabase.from('offers').insert(payload).select().single()
    if (iErr) return { data: null, error: iErr.message }
    await fetchRows()
    return { data: mapRow(data), error: null }
  }

  async function updateOffer(id, patch) {
    const { error: uErr } = await supabase.from('offers').update(toDb(patch)).eq('id', id)
    if (uErr) return { error: uErr.message }
    await fetchRows()
    return { error: null }
  }

  async function deleteOffer(id) {
    const { error: dErr } = await supabase.from('offers').delete().eq('id', id)
    if (dErr) return { error: dErr.message }
    await fetchRows()
    return { error: null }
  }

  function bySlug(slug) {
    return rows.find(r => r.slug === slug) || null
  }

  return { rows, loading, error, refetch: fetchRows, createOffer, updateOffer, deleteOffer, bySlug }
}

function mapRow(row) {
  const sections = Array.isArray(row.sections) ? row.sections : []
  return {
    id:            row.id,
    slug:          row.slug,
    name:          row.name,
    subtitle:      row.subtitle || '',
    summary:       row.summary  || '',
    priceHeadline: row.price_headline || '',
    priceNote:     row.price_note     || '',
    sections:      sections.map(normalizeSection).filter(Boolean),
    position:      row.position,
    active:        row.active,
    createdAt:     row.created_at,
    updatedAt:     row.updated_at,
  }
}

function toDb(values) {
  const out = {}
  if ('slug'          in values) out.slug           = values.slug ? slugify(values.slug) : null
  if ('name'          in values) out.name           = values.name?.trim()
  if ('subtitle'      in values) out.subtitle       = values.subtitle?.trim() || null
  if ('summary'       in values) out.summary        = values.summary?.trim()  || null
  if ('priceHeadline' in values) out.price_headline = values.priceHeadline?.trim() || null
  if ('priceNote'     in values) out.price_note     = values.priceNote?.trim()     || null
  if ('sections'      in values) out.sections       = Array.isArray(values.sections) ? values.sections : []
  if ('position'      in values) out.position       = Number(values.position) || 0
  if ('active'        in values) out.active         = !!values.active
  return out
}

export function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
