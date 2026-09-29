import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// SMS webhook — set to fire outbound texts through Roman's GoHighLevel /
// Bizsync flow. Vite exposes VITE_* env vars to the browser; if not set,
// the composer stays visible but sendSms() returns an error the UI
// surfaces as "webhook not configured — set VITE_FAMILY_SMS_WEBHOOK".
const SMS_WEBHOOK_URL    = import.meta.env.VITE_FAMILY_SMS_WEBHOOK
const SMS_WEBHOOK_SECRET = import.meta.env.VITE_FAMILY_SMS_SECRET
const SMS_WEBHOOK_TIMEOUT_MS = 10_000

/**
 * Load the communication timeline for one family, with mutations for
 * log / update / delete plus a sendSms() helper that hits Roman's SMS
 * webhook and auto-logs an outbound-sms row into family_communications.
 *
 * Timeline order: newest first (contact_at DESC). Follow-ups render
 * with an amber pin regardless of age.
 *
 * @typedef {Object} FamilyCommunication
 * @property {string}       id
 * @property {string}       familyId
 * @property {string|null}  childId
 * @property {string}       contactAt       ISO
 * @property {'call'|'email'|'sms'|'in_person'|'note'} method
 * @property {'inbound'|'outbound'|null}   direction
 * @property {string|null}  subject
 * @property {string|null}  body
 * @property {boolean}      followUpNeeded
 * @property {string|null}  followUpBy       ISO date
 * @property {string|null}  smsProviderRef
 * @property {string|null}  loggedBy
 * @property {string}       createdAt
 */
export function useFamilyCommunications(familyId) {
  const [rows, setRows] = useState(/** @type {FamilyCommunication[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(/** @type {string|null} */ (null))
  const [sending, setSending] = useState(false)

  const fetchRows = useCallback(async () => {
    if (!supabase || !familyId) {
      setRows([])
      setLoading(false)
      return
    }
    try {
      setError(null)
      const { data, error: qErr } = await supabase
        .from('family_communications')
        .select('*')
        .eq('family_id', familyId)
        .order('contact_at', { ascending: false })
      if (qErr) {
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn('[useFamilyCommunications] table missing; treating as empty')
          setRows([])
          return
        }
        throw qErr
      }
      setRows((data || []).map(mapRow))
    } catch (err) {
      setError(err?.message || 'Failed to load communications')
    } finally {
      setLoading(false)
    }
  }, [familyId])

  useEffect(() => {
    setLoading(true)
    fetchRows()
  }, [fetchRows])

  async function logCommunication(values) {
    if (!supabase) return { data: null, error: 'Supabase not configured' }
    const payload = normalizePayload(familyId, values)
    const { data, error: iErr } = await supabase
      .from('family_communications')
      .insert(payload)
      .select()
      .single()
    if (iErr) return { data: null, error: iErr.message }
    await fetchRows()
    return { data: mapRow(data), error: null }
  }

  async function updateCommunication(id, patch) {
    if (!supabase) return { data: null, error: 'Supabase not configured' }
    const payload = normalizePayload(null, patch)
    const { data, error: uErr } = await supabase
      .from('family_communications')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (uErr) return { data: null, error: uErr.message }
    await fetchRows()
    return { data: mapRow(data), error: null }
  }

  async function deleteCommunication(id) {
    if (!supabase) return { error: 'Supabase not configured' }
    const { error: dErr } = await supabase
      .from('family_communications')
      .delete()
      .eq('id', id)
    if (dErr) return { error: dErr.message }
    await fetchRows()
    return { error: null }
  }

  /**
   * Fire the GoHighLevel / Bizsync SMS webhook, then log an outbound
   * SMS row into family_communications. Same fire-and-log pattern as
   * the bank-statement parse trigger — if the log write fails after
   * the webhook succeeded, we surface a warning but still return
   * success to the caller (the SMS DID send).
   *
   * @param {{ toPhone: string, body: string, familyId?: string, guardianName?: string }} opts
   */
  async function sendSms(opts) {
    if (!SMS_WEBHOOK_URL) {
      return { ok: false, error: 'SMS webhook not configured — set VITE_FAMILY_SMS_WEBHOOK in Vercel.' }
    }
    if (!SMS_WEBHOOK_SECRET) {
      return { ok: false, error: 'SMS secret not configured — set VITE_FAMILY_SMS_SECRET in Vercel.' }
    }
    if (!opts?.toPhone) return { ok: false, error: 'Missing phone number' }
    if (!opts?.body) return { ok: false, error: 'Message body is empty' }

    setSending(true)
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), SMS_WEBHOOK_TIMEOUT_MS)
      let res
      try {
        res = await fetch(SMS_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': SMS_WEBHOOK_SECRET,
          },
          body: JSON.stringify({
            family_id: opts.familyId ?? familyId,
            to_phone: opts.toPhone,
            guardian_name: opts.guardianName || null,
            body: opts.body,
          }),
          signal: controller.signal,
        })
      } finally { clearTimeout(timer) }

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        return { ok: false, error: `SMS webhook returned HTTP ${res.status}. ${text.slice(0, 200)}` }
      }
      const providerRef = await extractProviderRef(res)

      // Log into the timeline so the SMS shows up as an outbound row.
      const { error: logErr } = await logCommunication({
        method: 'sms',
        direction: 'outbound',
        body: opts.body,
        subject: opts.guardianName ? `SMS → ${opts.guardianName}` : 'SMS',
        smsProviderRef: providerRef,
      })
      if (logErr) {
        console.warn('[useFamilyCommunications] SMS sent but log failed:', logErr)
      }
      return { ok: true, providerRef }
    } catch (err) {
      const reason = err?.name === 'AbortError'
        ? `no response within ${SMS_WEBHOOK_TIMEOUT_MS / 1000}s`
        : err?.message || 'network error'
      return { ok: false, error: reason }
    } finally {
      setSending(false)
    }
  }

  return {
    rows,
    loading,
    error,
    refetch: fetchRows,
    logCommunication,
    updateCommunication,
    deleteCommunication,
    sendSms,
    sending,
    smsConfigured: !!SMS_WEBHOOK_URL && !!SMS_WEBHOOK_SECRET,
  }
}

async function extractProviderRef(res) {
  try {
    const j = await res.clone().json()
    return j?.messageId || j?.message_id || j?.id || null
  } catch {
    return null
  }
}

function normalizePayload(familyId, v) {
  const emptyToNull = (s) => (typeof s === 'string' ? (s.trim() === '' ? null : s.trim()) : s)
  const payload = {
    contact_at: v.contactAt || new Date().toISOString(),
    method: v.method,
    direction: v.direction || null,
    subject: emptyToNull(v.subject),
    body: emptyToNull(v.body),
    child_id: v.childId || null,
    follow_up_needed: !!v.followUpNeeded,
    follow_up_by: v.followUpBy || null,
    sms_provider_ref: v.smsProviderRef || null,
  }
  if (familyId) payload.family_id = familyId
  return payload
}

function mapRow(row) {
  return {
    id: row.id,
    familyId: row.family_id,
    childId: row.child_id,
    contactAt: row.contact_at,
    method: row.method,
    direction: row.direction,
    subject: row.subject,
    body: row.body,
    followUpNeeded: !!row.follow_up_needed,
    followUpBy: row.follow_up_by,
    smsProviderRef: row.sms_provider_ref,
    loggedBy: row.logged_by,
    createdAt: row.created_at,
  }
}
