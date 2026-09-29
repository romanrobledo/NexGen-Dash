/**
 * Money helpers. Every amount inside the DB is integer cents; UI only
 * formats or parses at the edges.
 */

export function formatMoney(cents, { showZero = true } = {}) {
  if (cents == null) return '—'
  if (!showZero && cents === 0) return '—'
  const dollars = cents / 100
  return dollars.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  })
}

/**
 * Parse a user's "$1,234.56" or "1234.5" or "1234" input into cents.
 * Returns NaN on garbage so the caller can show a form error.
 */
export function parseMoneyInput(str) {
  if (typeof str === 'number') return Math.round(str * 100)
  const clean = String(str || '').replace(/[$,\s]/g, '').trim()
  if (clean === '') return 0
  const n = Number(clean)
  if (Number.isNaN(n)) return NaN
  return Math.round(n * 100)
}

export function formatMoneyInput(cents) {
  if (cents == null) return ''
  return (cents / 100).toFixed(2)
}
