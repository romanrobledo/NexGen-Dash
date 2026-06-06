/**
 * Natural sort for `sop_id` values formatted as "{chapter_num}.{order}".
 *
 * Examples the app must handle correctly:
 *   "2.1"  comes before "2.10"   (string-sort would place "2.10" before "2.2")
 *   "3.40" is the deepest sub-item we've seen
 *   "21.11" is the last chapter
 *
 * The formula `major * 1000 + minor` works because:
 *   - major chapters only go up to 21 (fits way under 1000 gaps)
 *   - sub-item counts peak around 40 (well under 1000)
 *   - the resulting integer is monotonic: 2.10 → 2010, 2.2 → 2002, so 2.2 sorts first.
 */

/**
 * Convert an sop_id to a numeric sort key.
 * Falls back to Number.POSITIVE_INFINITY for malformed ids so garbage sorts
 * to the bottom rather than breaking the comparator.
 *
 * @param {string} sopId
 * @returns {number}
 */
export function sopSortKey(sopId) {
  if (typeof sopId !== 'string') return Number.POSITIVE_INFINITY
  const [majorStr, minorStr] = sopId.split('.')
  const major = Number(majorStr)
  const minor = Number(minorStr)
  if (!Number.isFinite(major) || !Number.isFinite(minor)) {
    return Number.POSITIVE_INFINITY
  }
  return major * 1000 + minor
}

/**
 * Comparator suitable for `Array.prototype.sort`.
 * Sorts by sop_id ascending using the natural key above.
 *
 * @param {{ sop_id: string }} a
 * @param {{ sop_id: string }} b
 * @returns {number}
 */
export function compareSops(a, b) {
  return sopSortKey(a?.sop_id) - sopSortKey(b?.sop_id)
}
