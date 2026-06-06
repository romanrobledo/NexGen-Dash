/**
 * cycleMath — date helpers for Ed Bague's Wed/Fri review rhythm.
 *
 * Concepts:
 *   • "Review day" = Wednesday or Friday. These are the 2 anchor points.
 *   • "Current cycle" = the window between the most recent review day
 *     (inclusive) and the next review day (exclusive). So on Thursday,
 *     the cycle started Wednesday. On Saturday, it started Friday.
 *   • "Overdue" = a row's `last_verified_at` is NULL or more than 7 days old.
 *
 * All inputs that are strings are coerced via `new Date(...)` so this works
 * with Supabase ISO timestamps, JS Dates, and numeric epochs alike.
 */

// 3 = Wednesday, 5 = Friday (JS Date.getDay: Sun=0 ... Sat=6)
const REVIEW_DAYS = [3, 5]

const DAY_MS = 24 * 60 * 60 * 1000

/** Midnight of the given Date (does not mutate). */
function atMidnight(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/** The most recent Wed or Fri, inclusive of today. Returns midnight. */
export function mostRecentReviewDay(now = new Date()) {
  const today = atMidnight(now)
  for (let back = 0; back < 7; back++) {
    const d = new Date(today)
    d.setDate(d.getDate() - back)
    if (REVIEW_DAYS.includes(d.getDay())) return d
  }
  return today // unreachable — safety
}

/** The next Wed or Fri strictly AFTER today. Returns midnight. */
export function nextReviewDay(now = new Date()) {
  const today = atMidnight(now)
  for (let forward = 1; forward <= 7; forward++) {
    const d = new Date(today)
    d.setDate(d.getDate() + forward)
    if (REVIEW_DAYS.includes(d.getDay())) return d
  }
  return today // unreachable
}

/** Whole days (floor) between two dates. `to - from`. */
export function daysBetween(from, to = new Date()) {
  if (!from) return null
  const a = atMidnight(new Date(from)).getTime()
  const b = atMidnight(new Date(to)).getTime()
  return Math.floor((b - a) / DAY_MS)
}

/** Row is overdue if never verified or last verify was > 7 days ago. */
export function isOverdue(lastVerifiedAt, now = new Date()) {
  if (!lastVerifiedAt) return true
  const diff = now.getTime() - new Date(lastVerifiedAt).getTime()
  return diff > 7 * DAY_MS
}

/** Row counts as "verified this cycle" if it was verified on/after the
 *  most recent review day. */
export function verifiedThisCycle(lastVerifiedAt, now = new Date()) {
  if (!lastVerifiedAt) return false
  const cycleStart = mostRecentReviewDay(now)
  return new Date(lastVerifiedAt) >= cycleStart
}

/**
 * Roll up a list of rows into a single status:
 *   'verified'      — all rows verified this cycle (or flagged, resolved)
 *   'needs_review'  — some rows still need a check this cycle
 *   'overdue'       — any row has last_verified_at older than 7 days
 *   'flagged'       — any row is flagged and nothing else is overdue
 */
export function rollUpDomainStatus(rows, now = new Date()) {
  if (!rows || rows.length === 0) return 'needs_review'

  let anyOverdue = false
  let anyFlagged = false
  let anyNeedsReview = false

  for (const r of rows) {
    if (r.verification_status === 'flagged') anyFlagged = true
    if (isOverdue(r.last_verified_at, now)) anyOverdue = true
    if (!verifiedThisCycle(r.last_verified_at, now)) anyNeedsReview = true
  }

  if (anyOverdue) return 'overdue'
  if (anyFlagged) return 'flagged'
  if (anyNeedsReview) return 'needs_review'
  return 'verified'
}

/**
 * Friendly sentence: "2 days ago", "today", "5 days ago".
 * Returns null if no timestamp.
 */
export function relativeDaysSentence(lastVerifiedAt, now = new Date()) {
  if (!lastVerifiedAt) return 'never'
  const d = daysBetween(lastVerifiedAt, now)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  return `${d} days ago`
}

/** Nice format: "Wednesday, Apr 17 at 2:14 PM" */
export function fmtFullTimestamp(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/** "Friday, Apr 19" */
export function fmtReviewDay(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}
