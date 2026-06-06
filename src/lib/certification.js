// Shared constants + helpers for the Compliance dashboard and Staff Profile
// certification panel.

export const COMPLIANCE_AREAS = [
  { key: 'trs_requirements', label: 'TRS Requirements' },
  { key: 'hhsc_licensing', label: 'HHSC Licensing' },
  { key: 'staff-certifications', label: 'Staff Certifications' },
  { key: 'training-hours', label: 'Training Hours' },
  { key: 'policy_documents', label: 'Policy Documents' },
  { key: 'insurance', label: 'Insurance' },
]

export const CERT_TYPES = [
  { key: 'cpr', label: 'CPR', keywords: ['cpr'], renewal: '2yr' },
  { key: 'first_aid', label: 'First Aid', keywords: ['first aid', 'first-aid'], renewal: '2yr' },
  { key: 'food_handler', label: 'Food Handler', keywords: ['food handler', 'food-handler'], renewal: '3yr' },
  { key: 'mandated_reporter', label: 'Mandated Reporter', keywords: ['mandated reporter', 'mandated-reporter'], renewal: '1yr' },
  { key: 'cda', label: 'CDA Credential', keywords: ['cda'], renewal: '—' },
]

export const TRAINING_HOUR_TARGET = 30

export function eventToStatusKind(event) {
  if (!event) return { kind: 'missing', label: '—' }
  const status = event.status
  const due = event.due_date ? new Date(event.due_date) : null
  const daysLeft = due ? Math.floor((due - new Date()) / (1000 * 60 * 60 * 24)) : null

  if (status === 'compliant') {
    if (daysLeft !== null) {
      if (daysLeft < 0) return { kind: 'expired', label: 'Expired', daysLeft }
      if (daysLeft <= 30) return { kind: 'expiring', label: `${daysLeft}d`, daysLeft }
    }
    return { kind: 'current', label: 'Current', daysLeft }
  }
  if (status === 'expiring_soon') {
    return { kind: 'expiring', label: daysLeft != null ? `${daysLeft}d` : 'Soon', daysLeft }
  }
  if (status === 'expired') return { kind: 'expired', label: 'Expired', daysLeft }
  if (status === 'missing') return { kind: 'missing', label: 'Missing', daysLeft }
  return { kind: 'missing', label: '—', daysLeft }
}

export function healthColor(pct) {
  if (pct >= 90)
    return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', ring: 'ring-green-500', label: 'Healthy' }
  if (pct >= 70)
    return { text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', ring: 'ring-yellow-500', label: 'Needs Attention' }
  return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', ring: 'ring-red-500', label: 'At Risk' }
}

/** Find a staff-certification event for a given staff member + cert type. */
export function findCertEvent(events, staffName, cert) {
  const name = (staffName || '').toLowerCase().trim()
  if (!name) return null
  return events.find((e) => {
    if (e.compliance_area !== 'staff-certifications') return false
    const item = (e.item_name || '').toLowerCase()
    if (!item.includes(name)) return false
    return cert.keywords.some((kw) => item.includes(kw))
  })
}

/** Find a training-hours event for a staff member matching any of the given keywords. */
export function findTrainingEvent(events, staffName, keywords) {
  const name = (staffName || '').toLowerCase().trim()
  if (!name) return null
  return events.find((e) => {
    if (e.compliance_area !== 'training-hours') return false
    const item = (e.item_name || '').toLowerCase()
    if (!item.includes(name)) return false
    return keywords.some((kw) => item.includes(kw))
  })
}

/** Extract a numeric value from an event's notes or item_name. */
export function extractNumber(event) {
  if (!event) return null
  const text = `${event.notes || ''} ${event.item_name || ''}`
  const match = text.match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : null
}

/**
 * Match any compliance event to a staff member by fuzzy name containment.
 * Used to make action items clickable regardless of compliance area.
 *
 * Tiered fallback so minor spelling drift in the DB doesn't break the link:
 *   1. Full-name substring  ("angelica ramos" in item_name)
 *   2. First+last both appear individually (handles reordering)
 *   3. Last-name-only match (catches misspelled first names — e.g.
 *      DB says "Anjelica Ramos" but staff table has "Angelica Ramos";
 *      "ramos" still matches)
 *
 * Accepts either an array of staff records or a Map<lowerName, staff>
 * for backward compatibility.
 */
export function resolveStaffForEvent(event, staff) {
  if (!event) return null
  const item = (event.item_name || '').toLowerCase()
  if (!item) return null

  // Normalize input to a plain staff array.
  const list = Array.isArray(staff)
    ? staff
    : staff instanceof Map
      ? Array.from(staff.values())
      : []

  // 1) Full-name substring match.
  for (const s of list) {
    const full = (s.full_name || '').toLowerCase().trim()
    if (full && item.includes(full)) return s
  }

  // 2) Both first and last name appear (any order, any separator).
  for (const s of list) {
    const first = (s.first_name || '').toLowerCase().trim()
    const last = (s.last_name || '').toLowerCase().trim()
    if (first && last && item.includes(first) && item.includes(last)) return s
  }

  // 3) Last-name-only fallback — catches misspelled first names.
  //    Require length >= 3 to avoid matching tiny common tokens.
  for (const s of list) {
    const last = (s.last_name || '').toLowerCase().trim()
    if (last && last.length >= 3 && item.includes(last)) return s
  }

  return null
}

export function shortDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  })
}
