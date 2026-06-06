import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { canCurateSops } from '../lib/sopRoles'
import { compareSops } from '../lib/sopSort'

/**
 * Fetch SOPs from Supabase, role-aware.
 *
 * Policy:
 *   - Curators (founder/operator/director) see every row regardless of status.
 *   - Everyone else sees only `status = 'live'`.
 *
 * This is belt-and-suspenders with the DB-side RLS: the policy on `sops`
 * already filters drafts away from non-curators. The client filter exists
 * so (a) the UI can confidently render counts/lists without ever seeing a
 * draft leak through, and (b) we don't waste bytes transferring rows the
 * current user isn't allowed to read anyway.
 *
 * Single-fetch caching:
 *   438 SOP rows with array columns is still ~200 KB of JSON. Rather than
 *   round-tripping on every navigation (library → chapter → detail), we
 *   fetch once and let the pages derive their views via `useMemo`. That
 *   keeps the detail page instant on back-navigation and avoids flashing
 *   spinners between the three levels. If the working set grows, we can
 *   switch to per-view queries without changing the consumer API.
 *
 * @returns {{
 *   sops: import('../lib/sopTypes').Sop[],
 *   loading: boolean,
 *   error: string | null,
 *   canCurate: boolean,
 *   refetch: () => Promise<void>,
 * }}
 */
export function useSops() {
  const { staff } = useAuth()
  const canCurate = useMemo(() => canCurateSops(staff), [staff])

  const [sops, setSops] = useState(/** @type {import('../lib/sopTypes').Sop[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(/** @type {string | null} */ (null))

  const fetchSops = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }
    setError(null)
    try {
      // Hard 8s timeout so a hung query can't freeze the page. Same pattern
      // as MetricsDashboard / AuthContext — consistency matters here because
      // SOP Library is a prime target for "why is this page stuck?" bug
      // reports once it's carrying 438 rows.
      const withTimeout = (p, ms = 8000) =>
        Promise.race([
          p,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('sops-fetch-timeout')), ms)
          ),
        ])

      let query = supabase
        .from('sops')
        .select('*')
        .order('chapter_num', { ascending: true })

      if (!canCurate) {
        query = query.eq('status', 'live')
      }

      const { data, error: qErr } = await withTimeout(query)
      if (qErr) {
        // Missing table → show empty state, not a red error banner. Keeps the
        // page usable in dev environments where the migration hasn't been
        // applied yet. Production has the table live already.
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn('[useSops] sops table missing; treating as empty set')
          setSops([])
          return
        }
        throw qErr
      }

      // Final sort is by sop_id natural order within chapter. The DB order by
      // chapter_num only gets us partway; "2.10" vs "2.2" needs our
      // compareSops.
      const sorted = [...(data || [])].sort(compareSops)
      setSops(sorted)
    } catch (err) {
      console.error('[useSops] fetch failed:', err?.message || err)
      setError(err?.message || 'Failed to load SOPs')
    } finally {
      setLoading(false)
    }
  }, [canCurate])

  useEffect(() => {
    // Reset loading on role change (e.g., auth resolving) so the spinner
    // comes back while the second fetch runs. Without this, a teacher→admin
    // upgrade would briefly show the teacher-scoped set while the new fetch
    // is in flight.
    setLoading(true)
    fetchSops()
  }, [fetchSops])

  return { sops, loading, error, canCurate, refetch: fetchSops }
}
