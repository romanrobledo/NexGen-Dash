import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Megaphone, Users, Loader2, Send, AlertCircle, CheckCircle2, Tag,
  ChevronLeft, List,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isBooksAdmin } from '../lib/roles'
import { useGhlContacts, useGhlSmartLists, sendBulkSms } from '../hooks/useGhl'

/**
 * Bulk SMS blast to a GHL audience.
 *
 * Two audience modes:
 *   - Smart List: lets Roman reuse saved segments in GHL
 *   - Tag: filters contacts by one tag (defaults to "enrolled")
 *
 * After picking the audience, Roman sees the recipient list with per-row
 * checkboxes (deselect anyone he doesn't want), composes the SMS, hits
 * send. The /api/ghl bulk_sms endpoint iterates sequentially to stay
 * under GHL rate limits.
 */
export default function FamilyNotifyPage() {
  const { staff } = useAuth()
  const admin = isBooksAdmin(staff)

  const [mode, setMode] = useState('tag')      // 'tag' | 'smart_list'
  const [tag, setTag] = useState('enrolled')
  const [smartListId, setSmartListId] = useState(null)
  const [search, setSearch] = useState('')

  const contacts = useGhlContacts({ tag: mode === 'tag' ? tag : null, enabled: mode === 'tag' })
  const smartLists = useGhlSmartLists({ enabled: mode === 'smart_list' })

  // Local selection state — defaults to everyone included.
  const [excluded, setExcluded] = useState(new Set())

  // Filter contacts by search term across name/phone/email.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return contacts.rows
    return contacts.rows.filter(c =>
      [c.name, c.phone, c.email].filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    )
  }, [contacts.rows, search])

  const selected = filtered.filter(c => !excluded.has(c.id) && c.phone)
  const skipNoPhone = filtered.filter(c => !c.phone).length

  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)
  const [confirming, setConfirming] = useState(false)

  async function doSend() {
    if (!selected.length || !message.trim()) return
    setSending(true); setSendResult(null)
    const r = await sendBulkSms({
      contactIds: selected.map(c => c.id),
      message: message.trim(),
    })
    setSending(false); setConfirming(false)
    setSendResult(r)
    if (r.ok) { setMessage(''); setExcluded(new Set()) }
  }

  if (!admin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 text-center text-sm text-gray-500">
        Notify is admin-only.
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div>
        <Link to="/families" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2">
          <ChevronLeft className="w-4 h-4" /> Families
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-blue-600" />
          Notify
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Bulk SMS a GHL Smart List or every contact with a tag. One message, one send, one log row per contact in GHL.
        </p>
      </div>

      {/* Audience picker */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">Audience</div>

        <div className="flex gap-2">
          <ModeTab active={mode === 'tag'}         onClick={() => setMode('tag')}        icon={Tag}  label="Tag" />
          <ModeTab active={mode === 'smart_list'}  onClick={() => setMode('smart_list')} icon={List} label="Smart List" />
        </div>

        {mode === 'tag' && (
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Tag</label>
            <input
              value={tag}
              onChange={e => setTag(e.target.value)}
              placeholder="enrolled"
              className="w-60 h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Pulls every GHL contact carrying this exact tag.
            </p>
          </div>
        )}

        {mode === 'smart_list' && (
          <SmartListPicker
            lists={smartLists.rows}
            loading={smartLists.loading}
            error={smartLists.error}
            value={smartListId}
            onChange={setSmartListId}
          />
        )}
      </section>

      {/* Recipients */}
      {mode === 'tag' && (
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-gray-900">
                {contacts.loading ? 'Loading…' : `${selected.length} will receive`}
              </span>
              {!contacts.loading && filtered.length !== contacts.rows.length && (
                <span className="text-xs text-gray-500">({filtered.length} shown · {contacts.rows.length} total)</span>
              )}
              {skipNoPhone > 0 && (
                <span className="text-xs text-amber-700">· {skipNoPhone} skipped (no phone)</span>
              )}
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by name / phone / email"
              className="w-60 h-8 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <RecipientList
            loading={contacts.loading}
            error={contacts.error}
            rows={filtered}
            excluded={excluded}
            onToggle={(id) => {
              const next = new Set(excluded)
              if (next.has(id)) next.delete(id); else next.add(id)
              setExcluded(next)
            }}
          />
        </section>
      )}

      {/* Composer */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">Message</div>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={5}
          maxLength={1000}
          placeholder="Hi {name} — quick note from NexGen…"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="text-[11px] text-gray-500 text-right">{message.length} / 1000</div>

        {sendResult && !sendResult.ok && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-3 py-2 text-sm inline-flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{sendResult.error}</span>
          </div>
        )}
        {sendResult && sendResult.ok && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2 text-sm inline-flex items-start gap-1.5">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Sent to {sendResult.sent}
              {sendResult.failed > 0 && ` · ${sendResult.failed} failed`}.
            </span>
          </div>
        )}

        {!confirming ? (
          <div className="flex justify-end">
            <button
              onClick={() => setConfirming(true)}
              disabled={sending || mode !== 'tag' || !selected.length || !message.trim()}
              className="h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Review & send
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
            <div className="text-sm text-amber-900">
              Send this message to <b>{selected.length}</b> contact{selected.length === 1 ? '' : 's'}? This hits GHL and can't be undone.
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="h-8 px-3 rounded-lg text-sm text-gray-700 hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={doSend}
                disabled={sending}
                className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Yes, send
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function ModeTab({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm border ${
        active
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  )
}

function SmartListPicker({ lists, loading, error, value, onChange }) {
  if (loading) {
    return (
      <div className="text-sm text-gray-500 inline-flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading Smart Lists…
      </div>
    )
  }
  if (error) return <div className="text-sm text-rose-700">{error}</div>
  if (!lists.length) {
    return (
      <div className="text-sm text-gray-600">
        No Smart Lists available — GHL hasn't returned any for this location (or the endpoint shape has shifted).
        Use Tag mode for now, or create a Smart List in GHL first.
      </div>
    )
  }
  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      className="w-full sm:w-80 h-9 rounded-lg border border-gray-200 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Pick a Smart List…</option>
      {lists.map(l => (
        <option key={l.id} value={l.id}>
          {l.name}{l.count != null ? ` (${l.count})` : ''}
        </option>
      ))}
    </select>
  )
}

function RecipientList({ loading, error, rows, excluded, onToggle }) {
  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-gray-500 inline-flex items-center justify-center gap-2 w-full">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading recipients…
      </div>
    )
  }
  if (error) return <div className="p-4 text-sm text-rose-700">{error}</div>
  if (!rows.length) {
    return <div className="p-6 text-center text-sm text-gray-500">No contacts match.</div>
  }
  return (
    <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
      {rows.map(c => {
        const isExcluded = excluded.has(c.id)
        const noPhone = !c.phone
        return (
          <li key={c.id} className="px-5 py-2 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={!isExcluded && !noPhone}
              disabled={noPhone}
              onChange={() => onToggle(c.id)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <div className="min-w-0 flex-1">
              <div className={`font-medium ${noPhone ? 'text-gray-400' : 'text-gray-900'}`}>
                {c.name || '(no name)'}
              </div>
              <div className="text-xs text-gray-500">
                {c.phone || <span className="text-amber-700">no phone</span>}
                {c.email && ` · ${c.email}`}
              </div>
            </div>
            {c.tags?.length > 0 && (
              <div className="hidden sm:flex items-center gap-1 flex-wrap">
                {c.tags.slice(0, 3).map((t, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{t}</span>
                ))}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
