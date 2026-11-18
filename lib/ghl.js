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

export async function listContacts(limit = 100) {
  const j = await ghlFetch('/contacts/search', {
    method: 'POST',
    body: JSON.stringify({
      locationId: locationId(),
      pageLimit:  Math.min(limit, 500),
      sort: [{ field: 'dateUpdated', direction: 'desc' }],
    }),
  })
  return (j.contacts || []).map(flattenContact)
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
