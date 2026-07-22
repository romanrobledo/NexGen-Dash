import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'

// Kids are grouped into these cohorts based on the Sheet's Enrollment Status
// column. `active` is the default for existing rows; the other two are
// semantic states the office uses to plan the roster (kids arriving next
// semester, kids leaving at end of semester). Alumni are moved to a separate
// Alumni sheet on the user's side, so we don't track them in the app.
export const ENROLLMENT_STATUSES = /** @type {const} */ ([
  'active',
  'incoming',
  'departing',
])

/**
 * Fetch the full active-children roster from Supabase (populated by the n8n
 * Facility Metrics Sync workflow from Google Sheets). Groups them by
 * `room_number` for cheap per-room lookup, and by `enrollment_status` for
 * cohort tiles.
 *
 * Returns:
 *   children         — flat array of all rows (any enrollment status)
 *   childrenByRoom   — Map<number, Child[]> keyed by roomNumber, ONLY
 *                      contains active kids (incoming/departing/alumni are
 *                      not on the floor today so they shouldn't count
 *                      toward classroom rosters)
 *   childrenByStatus — Map<'active'|'incoming'|'departing'|'alumni', Child[]>
 *   unassigned       — active Child[] with no room_number (Sheet rows
 *                      missing "Room #")
 *   loading, error, refetch
 *
 * Graceful fallback: if the enrollment_status / start_date columns don't
 * exist yet (i.e. the user hasn't run the migration), we retry the fetch
 * without them and default every row to `active`. Lets us ship code first
 * and migrate the schema on the user's schedule.
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

      const SELECT_WITH_STATUS =
        'id, full_name, date_of_birth, room_number, teacher_name, on_ccms, program_class, remarks, enrollment_status, start_date'
      const SELECT_LEGACY =
        'id, full_name, date_of_birth, room_number, teacher_name, on_ccms, program_class, remarks'

      let { data, error: qErr } = await withTimeout(
        supabase
          .from('children')
          .select(SELECT_WITH_STATUS)
          .eq('active', true)
          .order('full_name', { ascending: true })
      )

      // Migration not run yet — retry without the enrollment columns. Every
      // row will fall back to 'active' via mapRow, matching current behavior.
      if (
        qErr &&
        /enrollment_status|start_date|column .* does not exist|schema cache/i.test(qErr.message)
      ) {
        console.warn(
          '[useChildren] enrollment columns not present; falling back to legacy select'
        )
        const legacy = await withTimeout(
          supabase
            .from('children')
            .select(SELECT_LEGACY)
            .eq('active', true)
            .order('full_name', { ascending: true })
        )
        data = legacy.data
        qErr = legacy.error
      }

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
  const { childrenByRoom, childrenByStatus, unassigned } = useMemo(() => {
    /** @type {Map<number, Child[]>} */
    const byRoom = new Map()
    /** @type {Map<string, Child[]>} */
    const byStatus = new Map()
    /** @type {Child[]} */
    const noRoom = []
    for (const c of rows) {
      // Group by status regardless — cohort tiles need to count kids in
      // every cohort, not just active.
      if (!byStatus.has(c.enrollmentStatus)) byStatus.set(c.enrollmentStatus, [])
      byStatus.get(c.enrollmentStatus).push(c)
      // Room grouping is active-only. Incoming/departing/alumni kids
      // shouldn't inflate the count on a classroom tile they aren't
      // physically in today.
      if (c.enrollmentStatus === 'active') {
        if (c.roomNumber == null) {
          noRoom.push(c)
        } else {
          if (!byRoom.has(c.roomNumber)) byRoom.set(c.roomNumber, [])
          byRoom.get(c.roomNumber).push(c)
        }
      }
    }
    return { childrenByRoom: byRoom, childrenByStatus: byStatus, unassigned: noRoom }
  }, [rows])

  return {
    children: rows,
    childrenByRoom,
    childrenByStatus,
    unassigned,
    loading,
    error,
    refetch: fetchRows,
  }
}

// ─── Row → app-shape mapper ─────────────────────────────────────────────────

function mapRow(row) {
  // Normalize enrollment_status: missing / null / anything unexpected all
  // collapse to 'active'. That way pre-migration rows and dirty Sheet
  // values still show up on the classroom tiles instead of vanishing.
  const rawStatus = (row.enrollment_status || '').toString().toLowerCase()
  const enrollmentStatus = ENROLLMENT_STATUSES.includes(rawStatus)
    ? rawStatus
    : 'active'
  return {
    id: row.id,
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth,
    roomNumber: row.room_number,
    teacherName: row.teacher_name,
    onCcms: row.on_ccms,
    programClass: row.program_class,
    remarks: row.remarks,
    enrollmentStatus,
    startDate: row.start_date || null,
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
 * @property {'active'|'incoming'|'departing'|'alumni'} enrollmentStatus
 * @property {string|null} startDate   ISO date; meaningful for 'incoming'
 */
