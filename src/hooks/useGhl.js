import { useCallback, useEffect, useState } from 'react'

/**
 * Thin client for /api/ghl. One hook variant per surface — the shared
 * helpers at the bottom (apiGet/apiPost) make each specific hook tiny.
 *
 * All calls go to the Vercel serverless function; GHL credentials live
 * ONLY on the server (GHL_LOCATION_ID + GHL_PIT env vars). In local dev
 * (`npm run dev`) /api/ghl returns 404 — use `vercel dev` or a preview
 * deploy to exercise live GHL calls.
 */

export function useGhlContacts({ tag = null, enabled = true } = {}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)

  const fetchRows = useCallback(async () => {
    if (!enabled) { setLoading(false); return }
    try {
      setError(null)
      const r = tag
        ? await apiGet('contacts_by_tag', { tag })
        : await apiGet('list_contacts', { limit: 200 })
      setRows(r.contacts || [])
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }, [tag, enabled])

  useEffect(() => { if (enabled) { setLoading(true); fetchRows() } }, [fetchRows, enabled])

  return { rows, loading, error, refetch: fetchRows }
}

/**
 * Thread + contact for one phone number. Primary caller is the Family
 * detail Communications tab — pass the primary guardian's phone, get
 * back the GHL contact + the SMS/call/email thread.
 *
 * Returns { contact, conversationId, messages, loading, error, refetch,
 *           sendSms } where sendSms optimistically appends and refetches.
 */
export function useGhlThread({ phone, enabled = true } = {}) {
  const [contact, setContact] = useState(null)
  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)

  const fetchThread = useCallback(async () => {
    if (!enabled || !phone) { setLoading(false); return }
    try {
      setError(null); setLoading(true)
      const r = await apiGet('thread_by_phone', { phone })
      setContact(r.contact || null)
      setConversationId(r.conversationId || null)
      setMessages(Array.isArray(r.messages) ? r.messages : [])
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }, [phone, enabled])

  useEffect(() => { fetchThread() }, [fetchThread])

  async function sendSms(body) {
    if (!phone || !body?.trim()) return { ok: false, error: 'phone + body required' }
    setSending(true)
    try {
      const r = await apiPost('send_sms_by_phone', { phone, message: body.trim() })
      // Refetch so the new outbound message appears with its real GHL id.
      await fetchThread()
      return { ok: true, ...r }
    } catch (e) {
      return { ok: false, error: e.message }
    } finally { setSending(false) }
  }

  return { contact, conversationId, messages, loading, error, sending, refetch: fetchThread, sendSms }
}

/**
 * One contact by id. Used by GhlContactDetailPage.
 */
export function useGhlContact({ id, enabled = true } = {}) {
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)

  const fetchRow = useCallback(async () => {
    if (!enabled || !id) { setLoading(false); return }
    try {
      setError(null); setLoading(true)
      const r = await apiGet('contact_get', { id })
      setContact(r.contact || null)
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }, [id, enabled])

  useEffect(() => { fetchRow() }, [fetchRow])

  return { contact, loading, error, refetch: fetchRow }
}

export function useGhlSmartLists({ enabled = true } = {}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)

  const fetchRows = useCallback(async () => {
    if (!enabled) { setLoading(false); return }
    try {
      setError(null)
      const r = await apiGet('smart_lists')
      setRows(r.smart_lists || [])
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }, [enabled])

  useEffect(() => { if (enabled) { setLoading(true); fetchRows() } }, [fetchRows, enabled])

  return { rows, loading, error, refetch: fetchRows }
}

/**
 * One-shot sends. No local state — caller tracks loading/result.
 */
export async function sendSmsByPhone({ phone, message, firstName, lastName }) {
  try {
    const r = await apiPost('send_sms_by_phone', { phone, message, firstName, lastName })
    return { ok: true, ...r }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function sendBulkSms({ contactIds, message }) {
  try {
    const r = await apiPost('bulk_sms', { contactIds, message })
    return { ok: true, ...r }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

/**
 * Fan out the Notify webhook: our serverless pulls every contact with
 * the given tag and fires the GHL workflow webhook once per contact,
 * staggered by `throttleSeconds`. Each workflow instance waits its own
 * stagger before sending, so SMS actually fan out one every N seconds
 * without burning serverless time.
 *
 * `audienceKey` picks which webhook URL to use (enrolled/staff/custom),
 * mapping to its own GHL workflow. Falls back to the generic URL if
 * the audience-specific env var isn't set.
 */
export async function fireNotifyBlast({ tag, message, throttleSeconds = 30, audienceKey, audienceLabel, senderName }) {
  try {
    const r = await apiPost('notify_blast', { tag, message, throttleSeconds, audienceKey, audienceLabel, senderName })
    return { ok: true, ...r }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// ── low-level helpers ───────────────────────────────────────────────────────

async function apiGet(action, params = {}) {
  const qs = new URLSearchParams({ action, ...params }).toString()
  const r = await fetch(`/api/ghl?${qs}`)
  if (!r.ok) throw new Error(await errorText(r))
  return r.json()
}

async function apiPost(action, body) {
  const r = await fetch(`/api/ghl?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  })
  if (!r.ok) throw new Error(await errorText(r))
  return r.json()
}

async function errorText(r) {
  const body = await r.text().catch(() => '')
  try {
    const j = JSON.parse(body)
    return j.error || `${r.status} ${r.statusText}`
  } catch { return body || `${r.status} ${r.statusText}` }
}
