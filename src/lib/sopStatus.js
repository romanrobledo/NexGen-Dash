/**
 * Single source of truth for SOP status labels + chip styling.
 *
 * Both the SopStatusChip component and any future filter dropdowns import
 * from here so the palette and labels never drift between surfaces.
 *
 * Chip className pattern follows the standard `bg-* text-* border-*` triple
 * used by other pill components in the app, so SOP chips look native next
 * to any future status pill (lead stages, training completion, etc.).
 */

/**
 * @typedef {import('./sopTypes').SopStatus} SopStatus
 */

/**
 * @typedef {Object} SopStatusInfo
 * @property {string} label     Human-readable label (capitalized for display)
 * @property {string} chipClass Tailwind classes for the pill container
 * @property {string} dotClass  Tailwind background class for a small dot/indicator
 */

/** @type {Record<SopStatus, SopStatusInfo>} */
export const SOP_STATUS_INFO = Object.freeze({
  live: {
    label: 'Live',
    chipClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  in_review: {
    label: 'In Review',
    chipClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  draft: {
    label: 'Draft',
    chipClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
  },
  needs_update: {
    label: 'Needs Update',
    chipClass: 'bg-orange-50 text-orange-700 border-orange-200',
    dotClass: 'bg-orange-500',
  },
  not_started: {
    label: 'Not Started',
    chipClass: 'bg-gray-50 text-gray-600 border-gray-200',
    dotClass: 'bg-gray-400',
  },
  approved: {
    label: 'Approved',
    chipClass: 'bg-teal-50 text-teal-700 border-teal-200',
    dotClass: 'bg-teal-500',
  },
  archived: {
    label: 'Archived',
    chipClass: 'bg-slate-100 text-slate-600 border-slate-300',
    dotClass: 'bg-slate-400',
  },
})

/** Fallback used when a row comes back with an unknown status. */
export const SOP_STATUS_FALLBACK = Object.freeze({
  label: 'Unknown',
  chipClass: 'bg-gray-50 text-gray-500 border-gray-200',
  dotClass: 'bg-gray-300',
})

/**
 * Look up the info for a status, with a safe fallback for unknown values.
 * @param {string | null | undefined} status
 * @returns {SopStatusInfo}
 */
export function getSopStatusInfo(status) {
  if (!status) return SOP_STATUS_FALLBACK
  return SOP_STATUS_INFO[status] || SOP_STATUS_FALLBACK
}
