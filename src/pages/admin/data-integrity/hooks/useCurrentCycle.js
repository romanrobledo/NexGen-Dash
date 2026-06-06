import { useMemo } from 'react'
import {
  mostRecentReviewDay,
  nextReviewDay,
  daysBetween,
} from '../utils/cycleMath'

/**
 * useCurrentCycle — wraps the pure cycleMath helpers into the values
 * the UI layer actually wants.
 *
 * Optionally pass the most recent verified-at timestamp from any domain
 * so the page can show "Last reviewed: Wednesday, Apr 15 at 2:14 PM"
 * and "Days since last review: 2".
 */
export function useCurrentCycle(latestVerifiedAt = null) {
  return useMemo(() => {
    const now = new Date()
    const cycleStart = mostRecentReviewDay(now)
    const cycleEnd = nextReviewDay(now)
    const daysSinceLastReview =
      latestVerifiedAt != null ? daysBetween(latestVerifiedAt, now) : null

    return {
      now,
      cycleStart,
      cycleEnd,
      cycleId: cycleStart.toISOString().slice(0, 10), // "2026-04-17"
      latestVerifiedAt,
      daysSinceLastReview,
    }
  }, [latestVerifiedAt])
}
