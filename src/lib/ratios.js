/**
 * Texas HHSC Minimum Standards — child-to-teacher ratios.
 * Reference: 26 TAC §746.1601 (Group Sizes and Child-to-Caregiver Ratios).
 *
 * These are the HARD FLOOR. Violating them is a licensing citation.
 * TRS 4-star bonus-point stricter ratios come later (Foundation phase),
 * when we move standards into a `ratio_standards` DB table so they can
 * be edited by admin without a code deploy.
 *
 * The `maxPerTeacher` value is the maximum children ONE teacher may
 * supervise. A room with N teachers can supervise N × maxPerTeacher
 * children (assuming all teachers are for the same age band — mixed-age
 * rooms are handled by youngestBandFor()).
 */

/** @typedef {'infant' | 'young_toddler' | 'toddler' | 'twos' | 'threes' | 'fours' | 'school_age'} AgeBand */

/**
 * @typedef {Object} AgeBandDef
 * @property {AgeBand} key
 * @property {string} label
 * @property {number} minMonths     inclusive
 * @property {number} maxMonths     exclusive (Infinity for open-ended)
 * @property {number} maxPerTeacher HHSC max children per single teacher
 */

/** @type {AgeBandDef[]} — ordered youngest → oldest. */
export const AGE_BANDS = [
  { key: 'infant',        label: 'Infant (0–11m)',      minMonths: 0,   maxMonths: 12,       maxPerTeacher: 4  },
  { key: 'young_toddler', label: 'Young Toddler (12–17m)', minMonths: 12,  maxMonths: 18,   maxPerTeacher: 5  },
  { key: 'toddler',       label: 'Toddler (18–23m)',    minMonths: 18,  maxMonths: 24,       maxPerTeacher: 9  },
  { key: 'twos',          label: '2-year-olds',         minMonths: 24,  maxMonths: 36,       maxPerTeacher: 11 },
  { key: 'threes',        label: '3-year-olds',         minMonths: 36,  maxMonths: 48,       maxPerTeacher: 15 },
  { key: 'fours',         label: '4-year-olds',         minMonths: 48,  maxMonths: 60,       maxPerTeacher: 18 },
  { key: 'school_age',    label: 'School Age (5+)',     minMonths: 60,  maxMonths: Infinity, maxPerTeacher: 22 },
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
 * Find the age band for a given number of months.
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
 * Youngest kid's age band in a room. This drives the ratio — mixed-age
 * rule from the prompt: "a 5-year-old room with two 2-year-olds pulls
 * the ratio down to 1:11 (twos), not 1:22 (school age)."
 *
 * @param {Array<{ dateOfBirth?: string | null }>} kids
 * @returns {{ band: AgeBandDef, months: number } | null}  null if no kids or no known DOBs
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
 * @property {'ok'|'watch'|'over_capacity'|'over_ratio'|'unknown'} status
 * @property {string} label       short human-facing label ("OK", "Over ratio", …)
 * @property {string} accent      tailwind color name ('emerald'|'amber'|'red'|'gray')
 * @property {number} enrolled
 * @property {number|null} capacity      max_capacity from classrooms; null if unset
 * @property {AgeBandDef|null} band      applicable ratio band (from youngest kid)
 * @property {number|null} youngestMonths
 * @property {number|null} maxPerTeacher HHSC max per single teacher for this band
 * @property {number|null} teachersRequired  ceil(enrolled / maxPerTeacher)
 * @property {number|null} teachersAssumed   how many teachers we assumed for the check
 * @property {string} rationale   one-line explanation for the pill / tooltip
 */

/**
 * Combined health check for a room. Three failure modes, in severity order:
 *   1. over_capacity  — enrolled > capacity (obvious overflow, not just a ratio call)
 *   2. over_ratio     — youngest-kid HHSC ratio would need more teachers than assumed
 *   3. watch          — at 90%+ of capacity or ratio limit
 *   4. ok             — all good
 *   5. unknown        — missing data (no capacity, no DOBs) — we cannot judge
 *
 * `teachersAssumed` defaults to 1 (matches the classrooms.teacher_name
 * single-lead model). Callers with live per-room teacher counts (aides
 * present, lead present) should pass the real number in.
 *
 * @param {{ maxCapacity?: number|null, targetRatio?: number|null }} room
 * @param {Array<{ dateOfBirth?: string|null }>} kids
 * @param {{ teachersAssumed?: number }} [opts]
 * @returns {RoomHealth}
 */
export function computeRoomHealth(room, kids, opts = {}) {
  const teachersAssumed = opts.teachersAssumed ?? 1
  const enrolled = kids.length
  const capacity = room?.maxCapacity ?? null

  const youngest = youngestBandFor(kids)
  const band = youngest?.band ?? null
  const maxPerTeacher = band?.maxPerTeacher ?? null
  const teachersRequired =
    maxPerTeacher != null ? Math.ceil(enrolled / maxPerTeacher) : null

  const base = {
    enrolled,
    capacity,
    band,
    youngestMonths: youngest?.months ?? null,
    maxPerTeacher,
    teachersRequired,
    teachersAssumed,
  }

  // 1. Over physical capacity — the room simply has too many kids.
  if (capacity != null && enrolled > capacity) {
    return {
      ...base,
      status: 'over_capacity',
      label: 'Over capacity',
      accent: 'red',
      rationale: `${enrolled} enrolled in a ${capacity}-cap room`,
    }
  }

  // 2. Over HHSC ratio — need more teachers than we assumed.
  if (teachersRequired != null && teachersRequired > teachersAssumed) {
    return {
      ...base,
      status: 'over_ratio',
      label: 'Over ratio',
      accent: 'red',
      rationale: `Youngest child is ${formatMonths(youngest.months)} → HHSC ${band.label} allows 1:${maxPerTeacher}. ${enrolled} kids need ${teachersRequired} teachers; ${teachersAssumed} assumed.`,
    }
  }

  // 3. Watch — 90%+ of either ceiling.
  const capUse = capacity != null ? enrolled / capacity : 0
  const ratioUse =
    maxPerTeacher != null ? enrolled / (maxPerTeacher * teachersAssumed) : 0
  if (capUse >= 0.9 || ratioUse >= 0.9) {
    return {
      ...base,
      status: 'watch',
      label: 'Near limit',
      accent: 'amber',
      rationale:
        capUse >= 0.9
          ? `${enrolled}/${capacity} — near capacity`
          : `${enrolled}/${maxPerTeacher * teachersAssumed} — near ratio limit`,
    }
  }

  // 4. OK — all good, but qualify if we couldn't compute a ratio.
  if (band == null) {
    return {
      ...base,
      status: 'unknown',
      label: capacity == null ? 'No cap set' : 'No DOB data',
      accent: 'gray',
      rationale:
        capacity == null
          ? 'Room has no configured max_capacity.'
          : 'No child DOBs available to compute HHSC ratio.',
    }
  }

  return {
    ...base,
    status: 'ok',
    label: 'OK',
    accent: 'emerald',
    rationale: `${enrolled} kids · ${band.label} · HHSC allows ${maxPerTeacher * teachersAssumed} with ${teachersAssumed} teacher${teachersAssumed === 1 ? '' : 's'}`,
  }
}

function formatMonths(m) {
  if (m == null) return '—'
  if (m < 24) return `${m}mo`
  const y = Math.floor(m / 12)
  const rem = m % 12
  return rem === 0 ? `${y}yr` : `${y}yr ${rem}mo`
}

/**
 * Tailwind class shortcuts by accent — kept here so tile + drawer render
 * the same colors from the same source.
 */
export const HEALTH_STYLES = {
  emerald: {
    pill: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dot:  'bg-emerald-500',
  },
  amber: {
    pill: 'bg-amber-100 text-amber-800 border-amber-200',
    dot:  'bg-amber-500',
  },
  red: {
    pill: 'bg-red-100 text-red-800 border-red-200',
    dot:  'bg-red-500',
  },
  gray: {
    pill: 'bg-gray-100 text-gray-600 border-gray-200',
    dot:  'bg-gray-400',
  },
}
