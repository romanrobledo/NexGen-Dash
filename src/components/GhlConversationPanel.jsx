import { useMemo, useRef, useState, useEffect } from 'react'
import {
  Loader2, Send, Phone, Mail, MessageSquare, Voicemail,
  AlertCircle, RefreshCw,
} from 'lucide-react'
import { useGhlThread } from '../hooks/useGhl'

/**
 * GHL conversation thread — bubble UI like the native GHL inbox.
 *
 * Two use modes:
 *   1. Pass `thread` — the parent already owns the useGhlThread result
 *      and shares it across panels (preferred inside CommunicationsTab
 *      so only one network call fires).
 *   2. Pass `phone` only — the component runs its own useGhlThread
 *      (handy when using this component standalone).
 *
 * Empty / error states:
 *   - no phone              → "primary needs a phone" guidance
 *   - phone with no contact → empty thread + "first send creates GHL contact"
 *   - API unreachable       → "GHL unreachable" error card (likely env not set)
 */
export default function GhlConversationPanel({ phone, toName, thread }) {
  const own = useGhlThread({ phone, enabled: !!phone && !thread })
  const { contact, messages, loading, error, sending, refetch, sendSms } = thread || own

  const [body, setBody] = useState('')
  const [sendError, setSendError] = useState(null)

  const bottomRef = useRef(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages.length])

  const grouped = useMemo(() => groupByDay(messages), [messages])

  async function doSend() {
    setSendError(null)
    const r = await sendSms(body)
    if (!r.ok) { setSendError(r.error); return }
    setBody('')
  }

  // ── guard states ────────────────────────────────────────────────────
  if (!phone) {
    return (
      <PanelShell>
        <EmptyState
          icon={MessageSquare}
          title="No phone on file"
          hint="Add a phone to the primary guardian on the Guardians tab."
        />
      </PanelShell>
    )
  }

  return (
    <PanelShell>
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
          {initialsOf(toName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-gray-900 truncate">{toName || phone}</div>
          <div className="text-[11px] text-gray-500 truncate">
            {phone}
            {contact?.id && <span className="ml-2 text-indigo-600">· GHL linked</span>}
            {!loading && !contact && <span className="ml-2 text-amber-600">· not in GHL yet</span>}
          </div>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          title="Refresh thread"
          className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Thread */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 space-y-4 min-h-[320px] max-h-[520px]">
        {loading && messages.length === 0 && (
          <div className="text-center text-sm text-gray-500 inline-flex items-center justify-center gap-2 w-full py-8">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading thread…
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-3 py-2 text-xs inline-flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              GHL unreachable: {error}
              <div className="text-rose-600 mt-0.5">
                Is <code>GHL_LOCATION_ID</code> + <code>GHL_PIT</code> set in Vercel?
              </div>
            </div>
          </div>
        )}
        {!loading && !error && messages.length === 0 && (
          <EmptyState
            icon={MessageSquare}
            title={contact ? 'No messages yet' : 'No GHL contact yet'}
            hint={contact ? 'Send one below to start the thread.' : 'First send below will create the GHL contact and start the thread.'}
          />
        )}

        {grouped.map(day => (
          <div key={day.key} className="space-y-2">
            <div className="flex items-center justify-center">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                {day.label}
              </span>
            </div>
            {day.items.map(m => <MessageBubble key={m.id} m={m} />)}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div className="border-t border-gray-100 p-3 bg-white">
        {sendError && (
          <div className="mb-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-2.5 py-1.5 text-xs">
            {sendError}
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); doSend() }
            }}
            rows={2}
            placeholder="Type a message… (⌘+Enter to send)"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            onClick={doSend}
            disabled={sending || !body.trim()}
            className="h-10 w-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center justify-center disabled:opacity-50 shrink-0"
            title="Send SMS"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </PanelShell>
  )
}

// ── bubble ────────────────────────────────────────────────────────────────

function MessageBubble({ m }) {
  const outbound = m.direction === 'outbound'
  const TypeIcon = typeIcon(m.type)
  const ts = m.created_at ? new Date(m.created_at) : null

  // Centered activity strips for: CALL without recording, pipeline /
  // opportunity events (TYPE_ACTIVITY_*, ACTIVITY), and anything GHL
  // labels as a DnD / system event. Mirrors the "Opportunity created
  // in Facebook Ads Pipeline" row from the native GHL UI.
  const isActivity =
    (m.type === 'CALL' && !m.recording_url) ||
    /^(ACTIVITY|TYPE_ACTIVITY)/i.test(m.type || '')
  if (isActivity) {
    const label = prettyActivity(m.type, m.body)
    return (
      <div className="flex items-center justify-center">
        <div className="text-[11px] text-gray-600 bg-white border border-gray-200 rounded-full px-3 py-1 inline-flex items-center gap-1.5 max-w-full">
          <TypeIcon className="w-3 h-3 text-gray-500 shrink-0" />
          <span className="truncate">{label}</span>
          {ts && <span className="text-gray-400 shrink-0">· {fmtTime(ts)}</span>}
        </div>
      </div>
    )
  }

  const bubbleCls = outbound
    ? 'ml-auto bg-indigo-50 border-indigo-200 text-gray-900'
    : 'mr-auto bg-white border-gray-200 text-gray-900'

  return (
    <div className={`max-w-[85%] rounded-2xl border px-3 py-2 shadow-sm ${bubbleCls}`}>
      {m.type !== 'SMS' && (
        <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide mb-1 ${outbound ? 'text-indigo-700' : 'text-gray-500'}`}>
          <TypeIcon className="w-3 h-3" />
          {m.type}
        </div>
      )}
      <div className="text-sm whitespace-pre-wrap break-words">{m.body || <span className="text-gray-400 italic">(no body)</span>}</div>
      {m.recording_url && (
        <audio controls className="mt-2 w-full h-8" src={m.recording_url}>
          Call recording
        </audio>
      )}
      {m.attachments?.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {m.attachments.map((a, i) => (
            <a key={i} href={typeof a === 'string' ? a : a.url} target="_blank" rel="noreferrer"
               className="text-[11px] underline text-indigo-700 hover:text-indigo-800 truncate max-w-[200px]">
              attachment {i + 1}
            </a>
          ))}
        </div>
      )}
      <div className={`text-[10px] mt-1 ${outbound ? 'text-indigo-700/70' : 'text-gray-400'}`}>
        {ts ? fmtTime(ts) : ''}
        {m.status && <span className="ml-1">· {m.status}</span>}
      </div>
    </div>
  )
}

// ── small helpers ─────────────────────────────────────────────────────────

function typeIcon(type) {
  if (!type) return MessageSquare
  if (/CALL/i.test(type))             return Phone
  if (/EMAIL/i.test(type))            return Mail
  if (/VOICEMAIL/i.test(type))        return Voicemail
  if (/OPPORTUNITY|PIPELINE|ACTIVITY/i.test(type)) return RefreshCw
  return MessageSquare
}

function prettyActivity(type, body) {
  if (body && body.trim()) return body
  // Fallback: humanize the type when there's no body ("DnD enabled" etc.)
  return String(type || 'Activity')
    .replace(/^TYPE_ACTIVITY_?/i, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^./, c => c.toUpperCase())
}

function groupByDay(messages) {
  // Chron-asc order inside the thread — newer at the bottom like a chat.
  const asc = [...messages].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
  const map = new Map()
  for (const m of asc) {
    const d = m.created_at ? new Date(m.created_at) : null
    const key = d ? d.toDateString() : 'unknown'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(m)
  }
  return Array.from(map.entries()).map(([key, items]) => ({
    key,
    label: labelForDay(key),
    items,
  }))
}

function labelForDay(key) {
  if (key === 'unknown') return '—'
  const d = new Date(key)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((today - new Date(d).setHours(0, 0, 0, 0)) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7)   return d.toLocaleDateString(undefined, { weekday: 'long' })
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: today.getFullYear() === d.getFullYear() ? undefined : 'numeric' })
}

function fmtTime(d) {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function initialsOf(name) {
  if (!name) return '·'
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '·'
}

function PanelShell({ children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col overflow-hidden">
      {children}
    </div>
  )
}

function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="p-10 text-center">
      <Icon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <div className="text-sm font-semibold text-gray-700">{title}</div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  )
}
