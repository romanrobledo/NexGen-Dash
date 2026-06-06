/**
 * webhookClient — fires the two N8N webhooks.
 *
 *   fireFieldUpdated()  — called after each Verified / Corrected / Flagged action
 *   fireCycleVerified() — called from the "Send to Paperclip" button
 *
 * Phase 3 is when the actual N8N workflows get wired. Until those URLs are
 * set in .env.local, these functions log a warning and no-op so the UI
 * stays functional during dev. Never throw — webhook failures should not
 * block the user's Supabase write from landing.
 */

const FIELD_URL =
  import.meta.env.VITE_N8N_DATA_INTEGRITY_FIELD_WEBHOOK || ''
const CYCLE_URL =
  import.meta.env.VITE_N8N_DATA_INTEGRITY_VERIFIED_WEBHOOK || ''

/**
 * Fire the per-field webhook. Called after any verify / correct / flag action.
 *
 * @param {object} payload
 * @param {string} payload.domain            — 'baseline_numbers' | 'staff_roster' | ...
 * @param {string} payload.action            — 'verified' | 'corrected' | 'flagged'
 * @param {string} payload.field             — field name that was touched (or row identifier)
 * @param {string|null} payload.old_value
 * @param {string|null} payload.new_value
 * @param {string} payload.verified_by_name  — staff's full name (for human-friendly log)
 * @param {string} payload.timestamp         — ISO timestamp
 * @param {string|null} payload.notes
 */
export async function fireFieldUpdated(payload) {
  if (!FIELD_URL) {
    console.warn('[DataIntegrity] No field webhook configured (VITE_N8N_DATA_INTEGRITY_FIELD_WEBHOOK) — skipping.')
    return { ok: false, skipped: true }
  }
  try {
    const res = await fetch(FIELD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      console.warn(`[DataIntegrity] field webhook returned ${res.status}: ${txt.slice(0, 200)}`)
      return { ok: false, status: res.status }
    }
    return { ok: true }
  } catch (err) {
    console.warn('[DataIntegrity] field webhook threw:', err.message)
    return { ok: false, error: err.message }
  }
}

/**
 * Fire the cycle-complete webhook. Called when the user clicks
 * "Send verified data to Paperclip agents" at the bottom of the page.
 *
 * @param {object} payload
 * @param {string} payload.cycle_id          — e.g. "2026-04-17"
 * @param {string} payload.verified_at       — ISO timestamp
 * @param {string} payload.verified_by       — staff.id (uuid)
 * @param {string[]} payload.domains_included
 */
export async function fireCycleVerified(payload) {
  if (!CYCLE_URL) {
    console.warn('[DataIntegrity] No cycle webhook configured (VITE_N8N_DATA_INTEGRITY_VERIFIED_WEBHOOK) — skipping.')
    return { ok: false, skipped: true }
  }
  try {
    const res = await fetch(CYCLE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      console.warn(`[DataIntegrity] cycle webhook returned ${res.status}: ${txt.slice(0, 200)}`)
      return { ok: false, status: res.status }
    }
    return { ok: true }
  } catch (err) {
    console.warn('[DataIntegrity] cycle webhook threw:', err.message)
    return { ok: false, error: err.message }
  }
}

/** Simple runtime check — used to show "n8n not wired yet" hints in the UI. */
export function webhooksConfigured() {
  return { field: !!FIELD_URL, cycle: !!CYCLE_URL }
}
