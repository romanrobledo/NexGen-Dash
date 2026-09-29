import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Shift check-in / check-out events.
 *
 * The DB stores one row per event (check_in OR check_out). Pairing them
 * into "shifts" is derived here — walk the list ordered by event_at ASC
 * per staff and pair consecutive check_in → check_out. An unmatched
 * check_in is an "open shift" (staff currently on-site).
 *
 * @param {{ staffId?: string, days?: number, all?: boolean }} opts
 *   staffId — scope to one staff (default: current authenticated user)
 *   days    — window in days (default 30)
 *   all     — pass true to skip staffId filter (admin roster view)
 */
export function useCheckEvents({ staffId, days = 30, all = false } = {}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRows = useCallback(async () => {
    if (!supabase) { setError('Supabase not configured'); setLoading(false); return }
    try {
      setError(null)
      const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString()
      let q = supabase
        .from('staff_check_events')
        .select(`
          id, staff_id, event_type, event_at, room_number, notes, created_at,
          staff:staff ( full_name )
        `)
        .gte('event_at', since)
        .order('event_at', { ascending: false })
      if (staffId && !all) q = q.eq('staff_id', staffId)
      const { data, error: qErr } = await q
      if (qErr) {
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn('[useCheckEvents] table missing; treating as empty')
          setRows([]); return
        }
        throw qErr
      }
      setRows((data || []).map(mapRow))
    } catch (err) {
      setError(err?.message || 'Failed to load check events')
    } finally { setLoading(false) }
  }, [staffId, days, all])

  useEffect(() => { setLoading(true); fetchRows() }, [fetchRows])

  /**
   * Insert a check-in or check-out for `staffId`. Doesn't guard against
   * doubling up (two check-ins in a row) — the app UI should hide the
   * button if the last event was the same type.
   */
  async function submit({ staffId: sid, eventType, roomNumber = null, notes = null }) {
    if (!supabase) return { data: null, error: 'Supabase not configured' }
    if (!sid) return { data: null, error: 'Missing staff id' }
    const { data, error: iErr } = await supabase
      .from('staff_check_events')
      .insert({
        staff_id: sid,
        event_type: eventType,
        room_number: roomNumber,
        notes: notes || null,
      })
      .select()
      .single()
    if (iErr) return { data: null, error: iErr.message }
    await fetchRows()
    return { data: mapRow(data), error: null }
  }

  /**
   * Pair events into shifts. Each shift has:
   *   { staffId, staffName, checkIn, checkOut (nullable), durationMs (nullable) }
   */
  const shifts = useMemo(() => derivePairs(rows), [rows])

  /**
   * Latest event per staff — used to know if someone's "on the clock."
   */
  const latestByStaff = useMemo(() => {
    const m = new Map()
    for (const r of rows) {
      const cur = m.get(r.staffId)
      if (!cur || new Date(r.eventAt) > new Date(cur.eventAt)) m.set(r.staffId, r)
    }
    return m
  }, [rows])

  return { rows, shifts, latestByStaff, loading, error, refetch: fetchRows, submit }
}

function derivePairs(rows) {
  // Group by staff, then walk ASC and pair consecutive in/out.
  const byStaff = new Map()
  for (const r of rows) {
    if (!byStaff.has(r.staffId)) byStaff.set(r.staffId, [])
    byStaff.get(r.staffId).push(r)
  }
  const out = []
  for (const [staffId, events] of byStaff) {
    const asc = [...events].sort((a, b) => new Date(a.eventAt) - new Date(b.eventAt))
    let open = null
    for (const e of asc) {
      if (e.eventType === 'check_in') {
        // If there's already an open in without an out, flush it as unmatched.
        if (open) {
          out.push({
            staffId,
            staffName: open.staffName,
            checkIn: open,
            checkOut: null,
            durationMs: null,
          })
        }
        open = e
      } else if (e.eventType === 'check_out') {
        if (open) {
          out.push({
            staffId,
            staffName: e.staffName,
            checkIn: open,
            checkOut: e,
            durationMs: new Date(e.eventAt) - new Date(open.eventAt),
          })
          open = null
        } else {
          // Orphan check-out. Render as its own row.
          out.push({
            staffId,
            staffName: e.staffName,
            checkIn: null,
            checkOut: e,
            durationMs: null,
          })
        }
      }
    }
    if (open) {
      out.push({
        staffId,
        staffName: open.staffName,
        checkIn: open,
        checkOut: null,
        durationMs: null,
      })
    }
  }
  // Newest first: sort by whichever of check_in/check_out is present.
  return out.sort((a, b) => {
    const at = new Date(a.checkOut?.eventAt || a.checkIn?.eventAt || 0)
    const bt = new Date(b.checkOut?.eventAt || b.checkIn?.eventAt || 0)
    return bt - at
  })
}

function mapRow(row) {
  return {
    id: row.id,
    staffId: row.staff_id,
    staffName: row.staff?.full_name || '',
    eventType: row.event_type,
    eventAt: row.event_at,
    roomNumber: row.room_number,
    notes: row.notes,
    createdAt: row.created_at,
  }
}
