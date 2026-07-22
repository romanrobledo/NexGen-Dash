import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Fetch the full active-children roster from Supabase (populated by the n8n
 * Facility Metrics Sync workflow from Google Sheets). Groups them by
 * `room_number` for cheap per-room lookup.
 *
 * Returns:
 *   children       — flat array of all active children
 *   childrenByRoom — Map<number, Child[]> keyed by roomNumber
 *                    (Map, not object, so integer keys stay integers)
 *   unassigned     — Child[] with no room_number (Sheet rows missing "Room #")
 *   loading, error, refetch
 *
 * For a childcare center this size (~90 kids), fetching everything on mount
 * and grouping in memory is fine. If the roster grows to thousands we'd
 * switch to a per-room query, but the API of this hook wouldn't change.
 */
export function useChildren() {
  const [rows, setRows] = useState(/** @type {Child[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(/** @type {string | null} */ (null))

  const fetchRows = async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }
    setError(null)
    try {
      const withTimeout = (p, ms = 8000) =>
        Promise.race([
          p,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('children-fetch-timeout')), ms)
          ),
        ])

      const { data, error: qErr } = await withTimeout(
        supabase
          .from('children')
          .select('id, full_name, date_of_birth, room_number, teacher_name, on_ccms, program_class, remarks')
          .eq('active', true)
          .order('full_name', { ascending: true })
      )
      if (qErr) {
        // Missing table → treat as empty. Same graceful pattern as
        // useClassrooms(), so a fresh Supabase project doesn't crash the UI.
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn('[useChildren] children table missing; treating as empty')
          setRows([])
          return
        }
        throw qErr
      }
      setRows((data || []).map(mapRow))
    } catch (err) {
      console.error('[useChildren] fetch failed:', err?.message || err)
      setError(err?.message || 'Failed to load children')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchRows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Group memo — recomputed only when the fetched rows change.
  const { childrenByRoom, unassigned } = useMemo(() => {
    /** @type {Map<number, Child[]>} */
    const byRoom = new Map()
    /** @type {Child[]} */
    const noRoom = []
    for (const c of rows) {
      if (c.roomNumber == null) {
        noRoom.push(c)
      } else {
        if (!byRoom.has(c.roomNumber)) byRoom.set(c.roomNumber, [])
        byRoom.get(c.roomNumber).push(c)
      }
    }
    return { childrenByRoom: byRoom, unassigned: noRoom }
  }, [rows])

  return {
    children: rows,
    childrenByRoom,
    unassigned,
    loading,
    error,
    refetch: fetchRows,
  }
}

// ─── Row → app-shape mapper ─────────────────────────────────────────────────

function mapRow(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth,
    roomNumber: row.room_number,
    teacherName: row.teacher_name,
    onCcms: row.on_ccms,
    programClass: row.program_class,
    remarks: row.remarks,
  }
}

// ─── Age helper (kept here so consumers don't recreate it) ──────────────────

/**
 * Compute a compact human-readable age from an ISO date string.
 * Examples: "3 yr 2 mo", "8 mo", "1 yr".
 * Returns "" for missing / invalid dates.
 * @param {string | null | undefined} isoDate
 * @returns {string}
 */
export function formatAge(isoDate) {
  if (!isoDate) return ''
  const dob = new Date(isoDate)
  if (Number.isNaN(dob.getTime())) return ''
  const now = new Date()
  let years = now.getFullYear() - dob.getFullYear()
  let months = now.getMonth() - dob.getMonth()
  if (now.getDate() < dob.getDate()) months -= 1
  if (months < 0) {
    years -= 1
    months += 12
  }
  if (years <= 0 && months <= 0) return 'newborn'
  if (years <= 0) return `${months} mo`
  if (months === 0) return `${years} yr`
  return `${years} yr ${months} mo`
}

/**
 * @typedef {Object} Child
 * @property {string} id
 * @property {string} fullName
 * @property {string|null} dateOfBirth   ISO date (YYYY-MM-DD)
 * @property {number|null} roomNumber
 * @property {string|null} teacherName
 * @property {boolean|null} onCcms
 * @property {string|null} programClass
 * @property {string|null} remarks
 */
