import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ChevronLeft, Search, RefreshCw, Loader2,
  MessageSquare, AlertCircle, Phone, Mail, Inbox,
} from 'lucide-react'
import { useGhlConversations } from '../hooks/useGhl'
import GhlConversationPanel from '../components/GhlConversationPanel'

/**
 * Conversations inbox — mirrors GHL's inbox inside NexGen so staff don't
 * leave the app to see parent replies.
 *
 * Layout:
 *   - Desktop: left column = conversation list, right column = selected thread
 *   - Mobile:  drill-down. List fills the screen; tapping a row opens the
 *              thread full-screen with a back arrow to return to the list.
 *
 * Data:
 *   - useGhlConversations polls /api/ghl?action=list_conversations every 30s
 *     so new inbound messages show up without a manual reload.
 *   - The right-column thread uses GhlConversationPanel, which fetches by
 *     phone and handles its own send flow (send bar + optimistic refresh).
 *
 * Permission: route is admin-gated at the App.jsx layer (BOOKS_ADMIN_ROLES).
 * Teacher scoping lands in Phase 2 of the plan.
 */
export default function GhlConversationsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [limit, setLimit] = useState(50)
  const [selectedId, setSelectedId] = useState(null)

  const { rows, loading, error, refetch } = useGhlConversations({
    limit,
    unreadOnly,
    // Server-side query handles name/phone/email search when the user
    // types. Debouncing is overkill for a list under ~200 rows — the
    // GHL call fires on every keystroke and settles in <300ms.
    query: search,
  })

  const selected = useMemo(
    () => rows.find(r => r.id === selectedId) || null,
    [rows, selectedId]
  )

  const unreadCount = useMemo(
    () => rows.reduce((n, r) => n + (r.unread_count > 0 ? 1 : 0), 0),
    [rows]
  )

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-4">
        <Link to="/families" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Families
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-1 inline-flex items-center gap-2">
          <Inbox className="w-6 h-6 text-indigo-600" />
          Conversations
        </h1>
        <p className="text-sm text-gray-600 mt-0.5">
          Every SMS / call / email thread across the NexGen GHL sub-account. Reply inline — delivered through GHL.
        </p>
      </div>

      {/* Split view
          Desktop: two columns side-by-side.
          Mobile: show list OR thread based on `selected`. The `hidden/md:flex`
          dance keeps the layout simple without a route change. */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[640px]">
        {/* ── LEFT: conversation list ───────────────────────────────── */}
        <aside
          className={`
            ${selected ? 'hidden md:flex' : 'flex'}
            md:w-96 md:border-r border-gray-100 flex-col shrink-0
          `}
        >
          {/* Search + filters */}
          <div className="p-3 border-b border-gray-100 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, phone, email…"
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="inline-flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={e => setUnreadOnly(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Unread only
                {unreadCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white">
                    {unreadCount}
                  </span>
                )}
              </label>
              <button
                onClick={refetch}
                disabled={loading}
                title="Refresh"
                className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading && rows.length === 0 && (
              <div className="text-center text-sm text-gray-500 inline-flex items-center justify-center gap-2 w-full py-10">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading inbox…
              </div>
            )}
            {error && (
              <div className="m-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-3 py-2 text-xs inline-flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  GHL unreachable: {error}
                  <div className="text-rose-600 mt-0.5">
                    Check <code>GHL_LOCATION_ID</code> + <code>GHL_PIT</code> in Vercel.
                  </div>
                </div>
              </div>
            )}
            {!loading && !error && rows.length === 0 && (
              <EmptyState
                icon={MessageSquare}
                title={unreadOnly ? 'No unread' : 'No conversations yet'}
                hint={unreadOnly ? 'Everyone\'s caught up.' : 'When a parent texts your GHL number, their thread appears here.'}
              />
            )}
            {rows.map(c => (
              <ConversationRow
                key={c.id}
                row={c}
                active={selectedId === c.id}
                onClick={() => setSelectedId(c.id)}
              />
            ))}
            {rows.length >= limit && (
              <div className="p-3 text-center">
                <button
                  onClick={() => setLimit(l => l + 50)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Load 50 more
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ── RIGHT: selected thread ────────────────────────────────── */}
        <section
          className={`
            ${selected ? 'flex' : 'hidden md:flex'}
            flex-1 flex-col min-h-[640px]
          `}
        >
          {!selected && (
            <div className="flex-1 flex items-center justify-center text-gray-400 p-10 text-center">
              <div>
                <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <div className="text-sm font-semibold text-gray-600">Pick a conversation</div>
                <div className="text-xs text-gray-500 mt-0.5">Tap a row on the left to open the thread.</div>
              </div>
            </div>
          )}

          {selected && (
            <>
              {/* Mobile back button — hidden on md+ because the list is visible */}
              <div className="md:hidden px-3 py-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                <button
                  onClick={() => setSelectedId(null)}
                  className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
                >
                  <ChevronLeft className="w-4 h-4" /> Inbox
                </button>
                {selected.contact_id && (
                  <button
                    onClick={() => navigate(`/families/contacts/${selected.contact_id}`)}
                    className="ml-auto text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Open contact
                  </button>
                )}
              </div>

              {/* Panel header strip — only on desktop, where mobile has its own */}
              <div className="hidden md:flex px-4 py-2.5 border-b border-gray-100 items-center gap-3 bg-gray-50">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-900 truncate">{selected.name}</div>
                  <div className="text-[11px] text-gray-500 truncate inline-flex items-center gap-2">
                    {selected.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" /> {selected.phone}</span>}
                    {selected.email && <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" /> {selected.email}</span>}
                  </div>
                </div>
                {selected.contact_id && (
                  <button
                    onClick={() => navigate(`/families/contacts/${selected.contact_id}`)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Open contact →
                  </button>
                )}
              </div>

              {/* The panel itself. It owns its own fetch (by phone), send bar,
                  and refresh. We disable it if the conversation has no phone
                  (rare — email-only contacts). */}
              <div className="flex-1 overflow-hidden">
                {selected.phone ? (
                  <GhlConversationPanel
                    phone={selected.phone}
                    toName={selected.name}
                  />
                ) : (
                  <EmptyState
                    icon={MessageSquare}
                    title="No phone on file"
                    hint="This GHL contact has no phone number, so we can't open the SMS thread here. View the contact detail for the full history."
                  />
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

// ── ConversationRow ────────────────────────────────────────────────────────

function ConversationRow({ row, active, onClick }) {
  const hasUnread = row.unread_count > 0
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-3 py-2.5 border-b border-gray-50 flex items-start gap-2.5 transition-colors
        ${active ? 'bg-indigo-50' : hasUnread ? 'bg-white hover:bg-gray-50' : 'bg-white hover:bg-gray-50'}
      `}
    >
      {/* Avatar bubble */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${hasUnread ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
        {initialsOf(row.name)}
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className={`text-sm truncate ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
            {row.name}
          </div>
          <div className="ml-auto text-[10px] text-gray-400 shrink-0">
            {fmtRelative(row.last_message_at)}
          </div>
        </div>
        <div className={`text-xs mt-0.5 line-clamp-2 ${hasUnread ? 'text-gray-800' : 'text-gray-500'}`}>
          {row.last_message_body || <span className="italic text-gray-400">(no preview)</span>}
        </div>
      </div>

      {/* Unread dot */}
      {hasUnread && (
        <div className="shrink-0 ml-1 mt-1.5">
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white">
            {row.unread_count > 9 ? '9+' : row.unread_count}
          </span>
        </div>
      )}
    </button>
  )
}

// ── small helpers ──────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="p-10 text-center">
      <Icon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <div className="text-sm font-semibold text-gray-700">{title}</div>
      {hint && <div className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">{hint}</div>}
    </div>
  )
}

function initialsOf(name) {
  if (!name) return '·'
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '·'
}

function fmtRelative(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const diffMs = Date.now() - d.getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1)   return 'now'
  if (mins < 60)  return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7)   return `${days}d`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
