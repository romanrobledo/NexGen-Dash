// GHL proxy — single Vercel serverless function, ?action= dispatcher.
//
// Actions:
//   GET  /api/ghl?action=list_contacts&limit=100
//   GET  /api/ghl?action=search_contacts&q=alex
//   GET  /api/ghl?action=contacts_by_tag&tag=enrolled
//   GET  /api/ghl?action=contact_get&id=...
//   GET  /api/ghl?action=contact_thread&id=...
//   GET  /api/ghl?action=smart_lists
//   POST /api/ghl?action=send_message        body: { contactId, type?, message }
//   POST /api/ghl?action=send_sms_by_phone   body: { phone, message, firstName?, lastName? }
//   POST /api/ghl?action=bulk_sms            body: { contactIds: [...], message }
//
// Auth: same-origin (browser→own-origin fetch), OR x-api-key header
// matching GHL_PROXY_API_KEY env (for server-to-server). Not JWT-verified
// against Supabase — tighten here if Roman wants per-user gating later.

import {
  listContacts, searchContacts, listContactsByTag,
  getContact, getThreadForContact, getThreadByPhone,
  listOwners, listSmartLists,
  sendMessage, sendSmsByPhone,
} from '../lib/ghl.js'

async function hydrateOwners(rows) {
  const ids = Array.from(new Set((rows || []).map(r => r.owner_id).filter(Boolean)))
  if (ids.length === 0) return rows
  try {
    const owners = await listOwners()
    const byId = Object.fromEntries(owners.map(o => [o.id, o.name]))
    return rows.map(r => ({ ...r, owner_name: r.owner_id ? (byId[String(r.owner_id)] || null) : null }))
  } catch { return rows }
}

function authed(req) {
  const apiKey = req.headers['x-api-key']
  if (apiKey && process.env.GHL_PROXY_API_KEY && apiKey === process.env.GHL_PROXY_API_KEY) return true
  const origin = req.headers.origin
  const host   = req.headers.host
  if (!origin) return true   // non-browser (curl without Origin, server tasks)
  try {
    const oh = new URL(origin).host
    return oh === host || oh.endsWith('.vercel.app')
  } catch { return false }
}

export default async function handler(req, res) {
  if (!authed(req)) return res.status(401).json({ error: 'Unauthorized' })
  const action = String(req.query?.action || '').toLowerCase()

  try {
    // ── GETs ────────────────────────────────────────────────────────────
    if (req.method === 'GET' && action === 'list_contacts') {
      const contacts = await hydrateOwners(await listContacts(Number(req.query.limit) || 100))
      return res.json({ contacts })
    }
    if (req.method === 'GET' && action === 'search_contacts') {
      const contacts = await hydrateOwners(await searchContacts(req.query.q, Number(req.query.limit) || 100))
      return res.json({ contacts })
    }
    if (req.method === 'GET' && action === 'contacts_by_tag') {
      const contacts = await hydrateOwners(await listContactsByTag(req.query.tag, Number(req.query.limit) || 500))
      return res.json({ contacts })
    }
    if (req.method === 'GET' && action === 'contact_get') {
      const id = req.query.id
      if (!id) return res.status(400).json({ error: 'id required' })
      return res.json({ contact: await getContact(id) })
    }
    if (req.method === 'GET' && action === 'contact_thread') {
      const id = req.query.id
      if (!id) return res.status(400).json({ error: 'id required' })
      return res.json(await getThreadForContact(id, Number(req.query.limit) || 50))
    }
    if (req.method === 'GET' && action === 'thread_by_phone') {
      const phone = req.query.phone
      if (!phone) return res.status(400).json({ error: 'phone required' })
      return res.json(await getThreadByPhone(phone, Number(req.query.limit) || 50))
    }
    if (req.method === 'GET' && action === 'smart_lists') {
      return res.json({ smart_lists: await listSmartLists() })
    }

    // ── POSTs ───────────────────────────────────────────────────────────
    if (req.method === 'POST' && action === 'send_message') {
      const { contactId, type, message, subject, html } = req.body || {}
      if (!contactId) return res.status(400).json({ error: 'contactId required' })
      const result = await sendMessage({ contactId, type, message, subject, html })
      return res.json({ ok: true, result })
    }
    if (req.method === 'POST' && action === 'send_sms_by_phone') {
      const { phone, message, firstName, lastName } = req.body || {}
      if (!phone || !message) return res.status(400).json({ error: 'phone + message required' })
      const r = await sendSmsByPhone({ phone, message, firstName, lastName })
      return res.json(r)
    }
    if (req.method === 'POST' && action === 'bulk_sms') {
      const { contactIds, message } = req.body || {}
      if (!Array.isArray(contactIds) || !contactIds.length) {
        return res.status(400).json({ error: 'contactIds array required' })
      }
      if (!message) return res.status(400).json({ error: 'message required' })
      // Fire sequentially to stay under GHL rate limits (10 req/s burst).
      const results = []
      for (const id of contactIds) {
        try {
          await sendMessage({ contactId: id, type: 'SMS', message })
          results.push({ contactId: id, ok: true })
        } catch (e) {
          results.push({ contactId: id, ok: false, error: e.message })
        }
      }
      const sent = results.filter(r => r.ok).length
      return res.json({ ok: true, sent, failed: results.length - sent, results })
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(400).json({ error: `unknown action: ${action}` })
  } catch (e) {
    console.error('ghl endpoint error:', e)
    return res.status(500).json({ error: e.message })
  }
}
