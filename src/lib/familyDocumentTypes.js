/**
 * Required document types for a NexGen family, driving the Paperwork
 * compliance grid on the family detail page.
 *
 * Adding a new doc type = a new entry here. No schema migration needed
 * because family_documents.doc_type is free text at the DB layer; this
 * lib is the app-side source of truth for what "required" means.
 *
 * Schema:
 *   key         — stable identifier written to family_documents.doc_type
 *   label       — human-readable column/row label
 *   scope       — 'family' (one doc per household)
 *                 | 'child'  (one doc per enrolled child)
 *   expires     — true for docs with an expiration date (immunization,
 *                 physical, etc.); false for one-time signatures
 *                 (enrollment agreement, handbook acknowledgment)
 *   description — one-liner Roman sees on hover / in the upload drawer
 *
 * Types are grouped visually in the paperwork tab by their scope —
 * family-scoped items render first, child-scoped items after. The
 * `order` field keeps them stable within each group.
 *
 * @typedef {Object} DocType
 * @property {string}  key
 * @property {string}  label
 * @property {'family'|'child'} scope
 * @property {boolean} expires
 * @property {string}  description
 * @property {number}  order
 */

/** @type {DocType[]} */
export const FAMILY_DOCUMENT_TYPES = [
  // ── FAMILY-SCOPED — one per household ──────────────────────────────────────
  {
    key: 'enrollment_agreement',
    label: 'Enrollment Agreement',
    scope: 'family',
    expires: false,
    description: 'Signed enrollment contract listing tuition, days of care, and family responsibilities.',
    order: 1,
  },
  {
    key: 'parent_handbook_ack',
    label: 'Parent Handbook Acknowledgment',
    scope: 'family',
    expires: false,
    description: 'Signed page confirming the parent has read and agrees to the parent handbook.',
    order: 2,
  },
  {
    key: 'emergency_contact_sheet',
    label: 'Emergency Contact Sheet',
    scope: 'family',
    expires: false,
    description: 'Authorized pickup list, emergency contacts, and physician info. Re-sign annually or when contacts change.',
    order: 3,
  },
  {
    key: 'photo_release',
    label: 'Photo / Video Release',
    scope: 'family',
    expires: false,
    description: 'Consent for classroom photos on Instagram, marketing, and portraits.',
    order: 4,
  },
  {
    key: 'ccms_application',
    label: 'CCMS Application',
    scope: 'family',
    expires: true,
    description: 'Southwest Key CCMS application + approval letter. Only required if the family is on CCMS.',
    order: 5,
  },
  {
    key: 'custody_paperwork',
    label: 'Custody Paperwork',
    scope: 'family',
    expires: false,
    description: 'Court order or legal custody document. Only required if custody is contested or split.',
    order: 6,
  },

  // ── CHILD-SCOPED — one per enrolled child ──────────────────────────────────
  {
    key: 'immunization_record',
    label: 'Immunization Record',
    scope: 'child',
    expires: true,
    description: 'TDLR-required current immunization record. Track expiration for upcoming boosters.',
    order: 101,
  },
  {
    key: 'physician_statement',
    label: 'Physician Statement / Medical Release',
    scope: 'child',
    expires: true,
    description: 'Annual physical + medical release from the child\'s physician.',
    order: 102,
  },
  {
    key: 'allergy_action_plan',
    label: 'Allergy Action Plan',
    scope: 'child',
    expires: true,
    description: 'Physician-signed action plan. Only required if the child has a diagnosed allergy.',
    order: 103,
  },
  {
    key: 'vision_hearing_screening',
    label: 'Vision & Hearing Screening',
    scope: 'child',
    expires: true,
    description: 'Annual screening. Required for children 4+ under TX rules.',
    order: 104,
  },
]

/**
 * Convenience: doc types by key. Renderers look up label / scope /
 * expires by the doc_type string from the DB.
 */
export const DOC_TYPES_BY_KEY = FAMILY_DOCUMENT_TYPES.reduce((acc, t) => {
  acc[t.key] = t
  return acc
}, /** @type {Record<string, DocType>} */ ({}))

export const FAMILY_SCOPED_TYPES = FAMILY_DOCUMENT_TYPES.filter((t) => t.scope === 'family')
  .sort((a, b) => a.order - b.order)

export const CHILD_SCOPED_TYPES = FAMILY_DOCUMENT_TYPES.filter((t) => t.scope === 'child')
  .sort((a, b) => a.order - b.order)

/**
 * Compute a document's compliance status:
 *   * submitted — file exists, not expiring soon
 *   * expiring  — expires within 30 days
 *   * expired   — past expiration date
 *   * missing   — no file at all
 *
 * `expiringWindowDays` is 30 by default; passed as a param so a caller
 * can widen the yellow zone (e.g. 60 days out) without editing the lib.
 *
 * @param {{ expires_at?: string|null } | null | undefined} doc
 * @param {number} [expiringWindowDays=30]
 * @returns {'submitted'|'expiring'|'expired'|'missing'}
 */
export function docStatus(doc, expiringWindowDays = 30) {
  if (!doc) return 'missing'
  if (!doc.expires_at) return 'submitted'
  const now = Date.now()
  const exp = new Date(doc.expires_at).getTime()
  if (Number.isNaN(exp)) return 'submitted'
  if (exp < now) return 'expired'
  const daysUntil = (exp - now) / (1000 * 60 * 60 * 24)
  if (daysUntil <= expiringWindowDays) return 'expiring'
  return 'submitted'
}
