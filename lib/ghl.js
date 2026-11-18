// GHL (GoHighLevel) REST client.
//
// Server-side only — reads GHL_LOCATION_ID + GHL_PIT from process.env.
// Called by api/ghl.js (the serverless proxy); never imported from the
// frontend. GHL REST v2 docs: https://highlevel.stoplight.io/docs/integrations
//
// Env:
//   GHL_LOCATION_ID — sub-account location id (e.g. MGqpP9WHjk...)
//   GHL_PIT         — Private Integration Token (pit-us-...)

const BASE = 'https://services.leadconnectorhq.com'
const API_VERSION = '2021-07-28'   // required Version header on every call

function locationId() {
  const id = process.env.GHL_LOCATION_ID
  if (!id) throw new Error('GHL env not configured (GHL_LOCATION_ID missing)')
  return id
}

function token() {
  const t = process.env.GHL_PIT
  if (!t) throw new Error('GHL env not configured (GHL_PIT missing)')
  return t
}

async function ghlFetch(path, init = {}) {
  const r = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${token()}`,
      'Version':       API_VERSION,
      'Accept':        'application/json',
      'Content-Type':  'application/json',
      ...(init.headers || {}),
    },
  })
  if (!r.ok) {
    const body = await r.text().catch(() => '')
    throw new Error(`GHL ${r.status}: ${body.slice(0, 400)}`)
  }
  return r.json()
}

// ── Contacts ────────────────────────────────────────────────────────────────

/**
 * Paginated contacts list. GHL's search endpoint caps at 500 per call
 * and returns a `searchAfter` cursor on each page. We walk pages until
 * we've collected `limit` contacts or GHL stops returning a cursor.
 *
 * `pageSize` is how big each GHL call is (default 100); `limit` is the
 * total we collect. The caller gets one flat array — the UI doesn't
 * need to think about pages.
 */
export async function listContacts(limit = 100, pageSize = 100) {
  const results = []
  const perPage = Math.min(pageSize, 500)
  let searchAfter = null
  while (results.length < limit) {
    const body = {
      locationId: locationId(),
      pageLimit:  Math.min(perPage, limit - results.length),
      sort: [{ field: 'dateUpdated', direction: 'desc' }],
    }
    if (searchAfter) body.searchAfter = searchAfter
    const j = await ghlFetch('/contacts/search', { method: 'POST', body: JSON.stringify(body) })
    const batch = j.contacts || []
    if (!batch.length) break
    results.push(...batch)
    // Last item's searchAfter array keeps us cursoring forward.
    const last = batch[batch.length - 1]
    searchAfter = last.searchAfter || null
    if (!searchAfter) break   // GHL has no more pages
  }
  return results.slice(0, limit).map(flattenContact)
}

export async function searchContacts(q, limit = 100) {
  if (!q || !q.trim()) return []
  const term = q.trim()
  const j = await ghlFetch('/contacts/search', {
    method: 'POST',
    body: JSON.stringify({
      locationId: locationId(),
      pageLimit:  Math.min(limit, 500),
      filters: [{
        group: 'OR',
        filters: [
          { field: 'firstNameLowerCase', operator: 'contains', value: term.toLowerCase() },
          { field: 'lastNameLowerCase',  operator: 'contains', value: term.toLowerCase() },
          { field: 'email',              operator: 'contains', value: term.toLowerCase() },
          { field: 'phone',              operator: 'contains', value: term },
          { field: 'companyName',        operator: 'contains', value: term },
        ],
      }],
    }),
  })
  return (j.contacts || []).map(flattenContact)
}

/**
 * Find a contact by exact phone match. Returns the first hit or null.
 * Used by sendSmsByPhone to turn a guardian phone into a GHL contactId.
 */
export async function findContactByPhone(phone) {
  if (!phone) return null
  const j = await ghlFetch('/contacts/search', {
    method: 'POST',
    body: JSON.stringify({
      locationId: locationId(),
      pageLimit:  5,
      filters: [{
        group: 'AND',
        filters: [{ field: 'phone', operator: 'eq', value: phone }],
      }],
    }),
  })
  const list = (j.contacts || []).map(flattenContact)
  return list[0] || null
}

/**
 * Filter contacts by tag — e.g. tag='enrolled' returns every contact
 * carrying that tag. Used by the Notify page for bulk sends.
 */
export async function listContactsByTag(tag, limit = 500) {
  if (!tag) return []
  const j = await ghlFetch('/contacts/search', {
    method: 'POST',
    body: JSON.stringify({
      locationId: locationId(),
      pageLimit:  Math.min(limit, 500),
      filters: [{
        group: 'AND',
        filters: [{ field: 'tags', operator: 'contains', value: tag }],
      }],
    }),
  })
  return (j.contacts || []).map(flattenContact)
}

export async function getContact(id) {
  const j = await ghlFetch(`/contacts/${encodeURIComponent(id)}`)
  return flattenContact(j.contact || j)
}

export async function createContact(properties) {
  const body = normalizeContactProps(properties)
  body.locationId = locationId()
  const j = await ghlFetch('/contacts/', { method: 'POST', body: JSON.stringify(body) })
  const c = j.contact || j
  return { id: c.id, properties: c }
}

// ── Smart Lists ─────────────────────────────────────────────────────────────

/**
 * GHL Smart Lists live as saved filters per location. The public v2
 * endpoint is /contacts/smart-lists/{locationId} (confirm against the
 * caller's workspace — endpoint has shifted historically).
 */
export async function listSmartLists() {
  try {
    const j = await ghlFetch(`/contacts/smart-lists/${encodeURIComponent(locationId())}`)
    const lists = j.smartLists || j.lists || j || []
    return (Array.isArray(lists) ? lists : []).map(sl => ({
      id:    sl.id   || sl._id,
      name:  sl.name || sl.title || '(unnamed smart list)',
      count: sl.count ?? null,
    }))
  } catch (e) {
    // Endpoint shape varies by GHL plan — bubble up as empty rather than hard fail.
    console.warn('[ghl] smart-lists unavailable:', e.message)
    return []
  }
}

// ── Owners (users in the location) ──────────────────────────────────────────

let _ownersCache = null
let _ownersCachedAt = 0
export async function listOwners() {
  const fresh = Date.now() - _ownersCachedAt < 5 * 60 * 1000
  if (_ownersCache && fresh) return _ownersCache
  try {
    const j = await ghlFetch(`/users/?locationId=${encodeURIComponent(locationId())}`)
    _ownersCache = (j.users || []).map(u => ({
      id:    String(u.id),
      name:  [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || null,
      email: u.email || null,
    }))
    _ownersCachedAt = Date.now()
    return _ownersCache
  } catch { return [] }
}

// ── Conversations + messages ────────────────────────────────────────────────

export async function listConversationsForContact(contactId) {
  const j = await ghlFetch(
    `/conversations/search?locationId=${encodeURIComponent(locationId())}&contactId=${encodeURIComponent(contactId)}`
  )
  return j.conversations || []
}

/**
 * Location-wide conversation list — powers the Conversations inbox page.
 *
 * GHL's `/conversations/search` endpoint returns the location's full
 * conversation list sorted by last-message date desc. Each row carries
 * the latest message snippet, contact id/name/phone, unread count, and
 * last-message timestamp.
 *
 * Params:
 *   - limit (default 50, hard-capped at 100 per GHL plan)
 *   - unreadOnly (bool) — maps to GHL's `status=unread`
 *   - query (string) — search by contact name/phone/email
 *
 * Returns a flattened array of inbox rows. Empty on error (we warn
 * rather than throw so the inbox falls back to an empty state instead
 * of a red error card).
 */
export async function listConversations({ limit = 50, unreadOnly = false, query = '' } = {}) {
  const params = new URLSearchParams({
    locationId: locationId(),
    limit:      String(Math.min(limit, 100)),
    sort:       'desc',
    sortBy:     'last_message_date',
  })
  if (unreadOnly)    params.set('status', 'unread')
  if (query?.trim()) params.set('query', query.trim())
  try {
    const j = await ghlFetch(`/conversations/search?${params.toString()}`)
    const rows = j.conversations || j.data || []
    return rows.map(flattenConversation)
  } catch (e) {
    console.warn('[ghl] listConversations failed:', e.message)
    return []
  }
}

export async function listMessages(conversationId, limit = 50) {
  const j = await ghlFetch(
    `/conversations/${encodeURIComponent(conversationId)}/messages?limit=${limit}`
  )
  const msgs = j?.messages?.messages || j?.messages || []
  return msgs.map(flattenMessage)
}

export async function getThreadForContact(contactId, limit = 50) {
  const convos = await listConversationsForContact(contactId)
  if (!convos.length) return { conversationId: null, messages: [] }
  const convo = convos[0]
  const messages = await listMessages(convo.id, limit)
  return { conversationId: convo.id, messages }
}

/**
 * One-shot lookup for the Family detail Communications tab: given a
 * phone number, return the full GHL contact + its message thread. Used
 * so the client makes a single /api/ghl call per tab load instead of
 * two sequential ones.
 */
export async function getThreadByPhone(phone, limit = 50) {
  const c = await findContactByPhone(phone)
  if (!c) return { contact: null, conversationId: null, messages: [] }
  const t = await getThreadForContact(c.id, limit)
  return { contact: c, conversationId: t.conversationId, messages: t.messages }
}

/**
 * Send an outbound message. GHL auto-creates the conversation if one
 * doesn't exist yet for this contactId.
 */
export async function sendMessage({ contactId, type = 'SMS', message, subject, html }) {
  if (!contactId) throw new Error('contactId required')
  if (!message && !html) throw new Error('message or html required')
  const body = { type, contactId }
  if (message) body.message = message
  if (subject) body.subject = subject
  if (html)    body.html    = html
  return ghlFetch('/conversations/messages', { method: 'POST', body: JSON.stringify(body) })
}

/**
 * Fire the Notify workflow webhook ONCE for a single contact.
 *
 * GHL doesn't expose Tag as a filter field inside the Find-Contact
 * workflow action, so we do the fan-out on our side: fetch contacts by
 * tag here, call this helper once per contact, each call opens its own
 * workflow instance with the contact already identified by contact_id
 * in the payload.
 *
 * The throttle lives in `delay_seconds` — each workflow instance waits
 * its own stagger before sending. We stagger across contacts (0s, 30s,
 * 60s, …) so even if 120 instances kick off within seconds, the actual
 * SMS fan out one every 30s.
 *
 * GHL-side setup (documented in GHL_SETUP.md §3b):
 *   - Inbound Webhook trigger, "Identify contact by: contact_id"
 *   - Wait: {{inboundWebhookRequest.delay_seconds}} seconds
 *   - Send SMS: body = {{inboundWebhookRequest.message}}
 */
export async function fireNotifyWebhook({ contactId, message, delaySeconds = 0, audienceLabel, senderName, webhookUrl }) {
  const url = webhookUrl || process.env.GHL_NOTIFY_WEBHOOK_URL
  if (!url) throw new Error('No Notify webhook URL configured (set GHL_NOTIFY_WEBHOOK_URL or an audience-specific one)')
  if (!contactId)                  throw new Error('contactId required')
  if (!message || !message.trim()) throw new Error('message required')

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contact_id:     String(contactId),
      message:        message.trim(),
      delay_seconds:  Math.max(0, Math.floor(delaySeconds)),
      audience_label: audienceLabel || null,
      sender_name:    senderName    || null,
      fired_at:       new Date().toISOString(),
    }),
  })
  if (!r.ok) {
    const body = await r.text().catch(() => '')
    throw new Error(`GHL webhook ${r.status}: ${body.slice(0, 300)}`)
  }
  return { ok: true, status: r.status }
}

// Map an audience preset key → the env var that holds its webhook URL.
// Add a row here when Roman stands up a new workflow in GHL and wants
// the app's toggle to route to it.
const WEBHOOK_ENV_BY_AUDIENCE = {
  enrolled: 'GHL_NOTIFY_WEBHOOK_PARENTS_URL',
  staff:    'GHL_NOTIFY_WEBHOOK_STAFF_URL',
  // 'custom' falls through to the default below.
}

/**
 * Resolve the webhook URL for a given audience preset.
 * Prefers the audience-specific env var; falls back to the generic
 * GHL_NOTIFY_WEBHOOK_URL so a half-configured setup still works.
 */
export function resolveNotifyWebhookUrl(audienceKey) {
  const envName = WEBHOOK_ENV_BY_AUDIENCE[audienceKey]
  const specific = envName ? process.env[envName] : null
  const fallback = process.env.GHL_NOTIFY_WEBHOOK_URL
  return specific || fallback || null
}

/**
 * Convenience: pull all contacts with `tag`, fire the Notify webhook
 * once per contact, staggered by `throttleSeconds`. Returns a summary.
 *
 * `audienceKey` picks which env var holds the webhook URL for this
 * blast (see WEBHOOK_ENV_BY_AUDIENCE). Falls back to the generic URL
 * when a preset doesn't have its own workflow configured yet.
 */
export async function fanOutNotifyWebhook({ tag, message, throttleSeconds = 30, audienceKey, audienceLabel, senderName }) {
  const webhookUrl = resolveNotifyWebhookUrl(audienceKey)
  if (!webhookUrl) {
    throw new Error(
      `No webhook URL for audience "${audienceKey || 'default'}". ` +
      `Set ${WEBHOOK_ENV_BY_AUDIENCE[audienceKey] || 'GHL_NOTIFY_WEBHOOK_URL'} in Vercel.`
    )
  }

  const contacts = await listContactsByTag(tag)
  const targets  = contacts.filter(c => c.phone)
  const skipped  = contacts.length - targets.length

  const results = []
  for (let i = 0; i < targets.length; i++) {
    const c = targets[i]
    const delay = i * throttleSeconds
    try {
      await fireNotifyWebhook({
        contactId:     c.id,
        message,
        delaySeconds:  delay,
        audienceLabel,
        senderName,
        webhookUrl,
      })
      results.push({ contactId: c.id, name: c.name, ok: true, scheduledSeconds: delay })
    } catch (e) {
      results.push({ contactId: c.id, name: c.name, ok: false, error: e.message })
    }
  }
  const queued = results.filter(r => r.ok).length
  const lastSend = targets.length > 0 ? (targets.length - 1) * throttleSeconds : 0
  return {
    ok: true,
    totalMatched:       contacts.length,
    skippedNoPhone:     skipped,
    queued,
    failed:             results.length - queued,
    lastSendEtaSeconds: lastSend,
    webhookUrlFingerprint: webhookUrl.slice(-6), // trailing 6 chars for debug
    results,
  }
}

/**
 * Convenience: send SMS to a phone number. Looks up the GHL contact by
 * phone; if none exists, creates one first (so the thread lands against
 * a real contact). Returns { ok, contactId, created }.
 */
export async function sendSmsByPhone({ phone, message, firstName, lastName }) {
  if (!phone)   throw new Error('phone required')
  if (!message) throw new Error('message required')

  let contact = await findContactByPhone(phone)
  let created = false
  if (!contact) {
    const props = { phone }
    if (firstName) props.firstName = firstName
    if (lastName)  props.lastName  = lastName
    const r = await createContact(props)
    contact = { id: r.id }
    created = true
  }
  await sendMessage({ contactId: contact.id, type: 'SMS', message })
  return { ok: true, contactId: contact.id, created }
}

// ── Shape helpers ──────────────────────────────────────────────────────────

function flattenContact(c) {
  if (!c) return null
  const name =
    [c.firstName, c.lastName].filter(Boolean).join(' ') ||
    c.contactName || c.email || c.phone || null
  const address = [c.address1, c.city, c.state, c.postalCode].filter(Boolean).join(', ') || null
  return {
    id:            c.id,
    name,
    first_name:    c.firstName || null,
    last_name:     c.lastName  || null,
    email:         c.email     || null,
    phone:         c.phone     || null,
    title:         c.title     || null,
    company:       c.companyName || null,
    tags:          c.tags || [],
    owner_id:      c.assignedTo || null,
    followers:     c.followers || [],
    dnd:           !!c.dnd,
    date_of_birth: c.dateOfBirth || null,
    source:        c.source || null,
    type:          c.type || null,
    address,
    website:       c.website  || null,
    timezone:      c.timezone || null,
    country:       c.country  || null,
    custom_fields: c.customFields || [],
    date_added:    c.dateAdded   || null,
    date_updated:  c.dateUpdated || null,
    ghl_url: `https://app.gohighlevel.com/v2/location/${process.env.GHL_LOCATION_ID || ''}/contacts/detail/${c.id}`,
  }
}

function flattenConversation(c) {
  if (!c) return null
  const name =
    c.fullName ||
    [c.firstName, c.lastName].filter(Boolean).join(' ') ||
    c.contactName || c.email || c.phone || '(unnamed)'
  // GHL uses a few different field names for the last-message snippet
  // across API versions. Normalize to one `last_message_body`.
  const lastBody = c.lastMessageBody || c.lastMessage?.body || c.snippet || ''
  const lastAt   = c.lastMessageDate || c.lastMessage?.dateAdded || c.dateUpdated || null
  const unread   = Number(c.unreadCount ?? c.unread ?? 0) || 0
  return {
    id:                 c.id,
    contact_id:         c.contactId || c.contact?.id || null,
    name,
    phone:              c.phone || c.contact?.phone || null,
    email:              c.email || c.contact?.email || null,
    last_message_body:  lastBody,
    last_message_type:  c.lastMessageType || c.lastMessage?.type || null,
    last_message_at:    lastAt,
    unread_count:       unread,
    starred:            !!c.starred,
    assigned_to:        c.assignedTo || null,
    type:               c.type || null,
  }
}

function flattenMessage(m) {
  const typeNum = typeof m.type === 'number' ? m.type : (m.messageType || null)
  const typeMap = { 1: 'SMS', 2: 'EMAIL', 3: 'CALL', 4: 'VOICEMAIL', 25: 'ACTIVITY' }
  const type = (typeof m.type === 'string' && m.type) || typeMap[typeNum] || m.messageType || 'MSG'
  const call = m.meta?.call || null
  let body = m.body || m.message || null
  if (!body && type === 'CALL') {
    const dur = call?.duration
    const status = call?.status || m.status || ''
    body = dur ? `Call · ${Math.round(dur)}s · ${status}` : `Call · ${status || 'no body'}`
  }
  if (!body && type === 'VOICEMAIL') body = 'Voicemail'
  return {
    id:            m.id,
    direction:     m.direction,
    type,
    body:          body || '',
    status:        m.status || call?.status || null,
    created_at:    m.dateAdded || m.dateCreated || null,
    attachments:   m.attachments || [],
    recording_url: call?.recordingUrl || null,
    duration:      call?.duration || null,
  }
}

function normalizeContactProps(input = {}) {
  const map = {
    FirstName: 'firstName', LastName: 'lastName',
    firstname: 'firstName', lastname: 'lastName',
    Email:     'email',     Phone:    'phone',
    Company:   'companyName', company: 'companyName',
  }
  const out = {}
  for (const [k, v] of Object.entries(input)) {
    const key = map[k] || k
    if (v !== undefined && v !== null && v !== '') out[key] = v
  }
  if (!out.email && !(out.firstName || out.lastName) && !out.phone) {
    throw new Error('GHL contact create needs email, phone, or firstName+lastName')
  }
  return out
}
