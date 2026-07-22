import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Fetch the live classroom roster from Supabase's `classroom_enrollment`
 * view. That view joins `classrooms` (metadata) with `children` (roster) on
 * `room_number`, so `enrolled` always reflects the current Google Sheet
 * sync — no stale hardcoded numbers, no cache to bust.
 *
 * The n8n "Facility Metrics Sync" workflow keeps `children` fresh from the
 * Sheet; this hook just reads whatever the last sync landed.
 *
 * Returns app-shaped objects (camelCase, `roomNumber` promoted to the
 * primary identifier since Sheet + FK use it), not raw DB rows.
 *
 * @returns {{
 *   rooms: Room[],
 *   loading: boolean,
 *   error: string | null,
 *   refetch: () => Promise<void>,
 * }}
 */
export function useClassrooms() {
  const [rooms, setRooms] = useState(/** @type {Room[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(/** @type {string | null} */ (null))

  const fetchRooms = async () => {
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
            setTimeout(() => reject(new Error('classrooms-fetch-timeout')), ms)
          ),
        ])

      const { data, error: qErr } = await withTimeout(
        supabase.from('classroom_enrollment').select('*')
      )
      if (qErr) {
        // Missing view/table → treat as "no classrooms configured yet" so
        // pages render an empty state instead of a red error banner.
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn('[useClassrooms] view missing; treating as empty')
          setRooms([])
          return
        }
        throw qErr
      }
      setRooms((data || []).map(mapRow))
    } catch (err) {
      console.error('[useClassrooms] fetch failed:', err?.message || err)
      setError(err?.message || 'Failed to load classrooms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchRooms()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { rooms, loading, error, refetch: fetchRooms }
}

// ─── Small utilities ─────────────────────────────────────────────────────────

/**
 * Aggregate rollup used by the Facility Map summary strip:
 *   { enrolled, capacity, roomsWithKnownCap, roomsWithUnknownCap }
 * @param {Room[]} rooms
 */
export function summarizeEnrollment(rooms) {
  let enrolled = 0
  let capacity = 0
  let roomsWithKnownCap = 0
  let roomsWithUnknownCap = 0
  for (const r of rooms) {
    enrolled += r.enrolled || 0
    if (r.maxCapacity != null) {
      capacity += r.maxCapacity
      roomsWithKnownCap += 1
    } else {
      roomsWithUnknownCap += 1
    }
  }
  return { enrolled, capacity, roomsWithKnownCap, roomsWithUnknownCap }
}

/**
 * Find a room by its `roomNumber` (integer). Accepts strings too so URL
 * params (which arrive as strings from React Router) work directly.
 * Returns null if not found or if the input can't be parsed.
 * @param {Room[]} rooms
 * @param {string | number | null | undefined} value
 * @returns {Room | null}
 */
export function findRoomByNumber(rooms, value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return rooms.find((r) => r.roomNumber === n) || null
}

// ─── Row → app-shape mapper ─────────────────────────────────────────────────

function mapRow(row) {
  return {
    id: row.id,                      // UUID from DB (kept for React keys)
    roomNumber: row.room_number,     // stable natural key + URL param
    teacherTitle: row.teacher_title,
    teacherName: row.teacher_name,
    name: row.name,
    ageRange: row.age_range,
    targetRatio: row.target_ratio,   // nullable
    maxCapacity: row.max_capacity,   // nullable
    enrolled: row.enrolled ?? 0,     // computed by the view
    accent: row.accent,
    iconName: row.icon_name,
    note: row.note,                  // nullable
  }
}

/**
 * @typedef {Object} Room
 * @property {string}       id
 * @property {number}       roomNumber
 * @property {string}       teacherTitle
 * @property {string}       teacherName
 * @property {string}       name
 * @property {string}       ageRange
 * @property {number|null}  targetRatio
 * @property {number|null}  maxCapacity
 * @property {number}       enrolled
 * @property {string}       accent
 * @property {string}       iconName
 * @property {string|null}  [note]
 */
