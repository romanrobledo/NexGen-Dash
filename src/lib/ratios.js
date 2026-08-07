/**
 * Age-band metadata + honest room-health calculator for the Facility Map.
 *
 * DISPLAY-ONLY module. No ratio thresholds are hardcoded here. Ratio
 * thresholds must come from the database (via room.targetRatio) — the
 * source of truth is the `room_capacity.required_ratio_staff_to_kids`
 * column, exposed to the app as `target_ratio` through the
 * `classroom_enrollment` view.
 *
 * TODO: Ratio standards are unsourced as of 2026-08-07. They must come
 * from the TRS February 2026 guidelines and the Texas HHSC Minimum
 * Standards. Once Roman ships them to a database table (candidate
 * name: `ratio_standards`), populate `room_capacity` per room and this
 * module will start returning real ratio evaluations. Until then,
 * `computeRoomHealth` returns `status: 'unknown'` for anything a real
 * ratio would answer. Do NOT hardcode ratios in this file to fill the
 * gap — that reintroduces the shadow-engine bug ripped out on
 * 2026-08-07 (see MEMORY.md → shadow-ratio-engine-lesson).
 */

/** @typedef {'infant' | 'young_toddler' | 'toddler' | 'twos' | 'threes' | 'fours' | 'school_age'} AgeBand */

/**
 * @typedef {Object} AgeBandDef
 * @property {AgeBand} key
 * @property {string} label     display-only human label
 * @property {number} minMonths inclusive
 * @property {number} maxMonths exclusive (Infinity for open-ended)
 */

/**
 * Age bands — DISPLAY LABELS + month ranges ONLY. No ratio thresholds.
 * Used to describe the youngest kid in a room ("the youngest kid here
 * is in the toddler band") without asserting any pass/fail state.
 * @type {AgeBandDef[]}
 */
export const AGE_BANDS = [
  { key: 'infant',        label: 'Infant (0–11m)',         minMonths: 0,   maxMonths: 12       },
  { key: 'young_toddler', label: 'Young Toddler (12–17m)', minMonths: 12,  maxMonths: 18       },
  { key: 'toddler',       label: 'Toddler (18–23m)',       minMonths: 18,  maxMonths: 24       },
  { key: 'twos',          label: '2-year-olds',            minMonths: 24,  maxMonths: 36       },
  { key: 'threes',        label: '3-year-olds',            minMonths: 36,  maxMonths: 48       },
  { key: 'fours',         label: '4-year-olds',            minMonths: 48,  maxMonths: 60       },
  { key: 'school_age',    label: 'School Age (5+)',        minMonths: 60,  maxMonths: Infinity },
]

/**
 * Age of a child in whole months as of `asOf` (default now).
 * Returns null for missing/invalid DOB.
 * @param {string | null | undefined} isoDob
 * @param {Date} [asOf]
 * @returns {number | null}
 */
export function ageInMonths(isoDob, asOf = new Date()) {
  if (!isoDob) return null
  const d = new Date(isoDob)
  if (Number.isNaN(d.getTime())) return null
  let months = (asOf.getFullYear() - d.getFullYear()) * 12
  months += asOf.getMonth() - d.getMonth()
  if (asOf.getDate() < d.getDate()) months -= 1
  return Math.max(0, months)
}

/**
 * Find the age band label for a given number of months.
 * @param {number} months
 * @returns {AgeBandDef}  falls back to school_age for out-of-range values
 */
export function bandForMonths(months) {
  for (const b of AGE_BANDS) {
    if (months >= b.minMonths && months < b.maxMonths) return b
  }
  return AGE_BANDS[AGE_BANDS.length - 1] // school_age catch-all
}

/**
 * Youngest kid's age band in a room. Used for display context in the
 * drawer (e.g., "youngest kid here is in the toddler band"). NOT used
 * for ratio math — ratios come from the database, not the age band.
 *
 * @param {Array<{ dateOfBirth?: string | null }>} kids
 * @returns {{ band: AgeBandDef, months: number } | null}
 */
export function youngestBandFor(kids) {
  let youngestMonths = null
  for (const k of kids) {
    const m = ageInMonths(k.dateOfBirth)
    if (m == null) continue
    if (youngestMonths == null || m < youngestMonths) youngestMonths = m
  }
  if (youngestMonths == null) return null
  return { band: bandForMonths(youngestMonths), months: youngestMonths }
}

/**
 * @typedef {Object} RoomHealth
 * @property {'over_capacity'|'watch'|'unknown'} status
 * @property {string} label       short pill label
 * @property {string} accent      'red' | 'amber' | 'gray'
 * @property {number} enrolled
 * @property {number|null} capacity      max_capacity from DB; null if unset
 * @property {number|null} targetRatio   target_ratio from DB; null until sourced
 * @property {AgeBandDef|null} band      youngest kid's band (display only)
 * @property {number|null} youngestMonths
 * @property {string} rationale   one-line explanation for the pill / tooltip
 */

/**
 * Room health based STRICTLY on database-backed values. Two things
 * this function will report on today:
 *
 *   1. Capacity overflow (`over_capacity`) — enrolled > max_capacity.
 *      Real, DB-backed, no ratio involved.
 *   2. Near-capacity watch (`watch`) — enrolled >= 90% of capacity.
 *      Also real.
 *
 * Everything else returns `unknown` (grey pill) with an honest
 * explanation. In particular:
 *   • If `room.targetRatio` is NULL (no ratio in the database),
 *     status is `unknown` with label "No ratio set".
 *   • If ratio IS present but there's no per-room staffing data
 *     source in the app, status is `unknown` with a different label.
 *     (Staffing table doesn't exist yet as of 2026-08-07.)
 *
 * DO NOT add "assumed teacher count" or "assumed ratio" fallbacks
 * here — that reintroduces the shadow-engine bug we ripped out.
 *
 * @param {{ maxCapacity?: number|null, targetRatio?: number|null }} room
 * @param {Array<{ dateOfBirth?: string|null }>} kids
 * @returns {RoomHealth}
 */
export function computeRoomHealth(room, kids) {
  const enrolled = kids.length
  const capacity = room?.maxCapacity ?? null
  const targetRatio = room?.targetRatio ?? null
  const youngest = youngestBandFor(kids)

  const base = {
    enrolled,
    capacity,
    targetRatio,
    band: youngest?.band ?? null,
    youngestMonths: youngest?.months ?? null,
  }

  // 1. Over physical capacity — real, DB-backed, no ratio involved.
  if (capacity != null && enrolled > capacity) {
    return {
      ...base,
      status: 'over_capacity',
      label: 'Over cap',
      accent: 'red',
      rationale: `${enrolled} enrolled in a ${capacity}-cap room.`,
    }
  }

  // 2. Near-capacity watch — real, capacity-only.
  if (capacity != null && capacity > 0 && enrolled >= capacity * 0.9) {
    return {
      ...base,
      status: 'watch',
      label: 'Near cap',
      accent: 'amber',
      rationale: `${enrolled} of ${capacity} — near capacity.`,
    }
  }

  // 3. Ratio evaluation is DEFERRED. Two branches, both `unknown` /
  //    grey pill. The rationale distinguishes why so admins reading
  //    the tile know which upstream data is missing.
  if (targetRatio == null) {
    return {
      ...base,
      status: 'unknown',
      label: 'No ratio',
      accent: 'gray',
      rationale:
        'No ratio standard set in the database. Waiting on TRS Feb 2026 / HHSC minimum standards.',
    }
  }
  return {
    ...base,
    status: 'unknown',
    label: 'No staff data',
    accent: 'gray',
    rationale: `Ratio 1:${targetRatio} is set, but no per-room staffing data source to evaluate against.`,
  }
}

/**
 * Tailwind class shortcuts by accent. Kept so tile + drawer render
 * the same colors from the same source.
 */
export const HEALTH_STYLES = {
  amber: { pill: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  red:   { pill: 'bg-red-100 text-red-800 border-red-200',       dot: 'bg-red-500'   },
  gray:  { pill: 'bg-gray-100 text-gray-600 border-gray-200',    dot: 'bg-gray-400'  },
}
