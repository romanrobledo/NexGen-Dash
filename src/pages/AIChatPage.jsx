import { useState, useEffect, useRef, useMemo } from 'react'
import {
  BotMessageSquare,
  Send,
  Sparkles,
  User as UserIcon,
  Clock,
  Calendar,
  ListChecks,
  HelpCircle,
  Loader2,
  MessageCircle,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useViewMode } from '../contexts/ViewModeContext'
import { supabase } from '../lib/supabase'

/**
 * AI Chat — n8n Agent Integration with Supabase persistence
 *
 * Architecture:
 *   1. On mount, find the latest active chat_session for this staff member
 *      (or create one). Use its UUID as the sessionId for the whole chat.
 *   2. Load the existing chat_messages for that session and show them as the
 *      initial conversation (history persists across refreshes).
 *   3. When the user sends a message: show it locally, fire the webhook to
 *      n8n, display the reply. n8n is the single writer to chat_messages —
 *      it persists both the user message and the assistant reply.
 *   4. Each staff member has ONE persistent conversation — there is no
 *      "new chat" option. All history stays in their single active session
 *      so the n8n agent has continuous memory of past interactions.
 *
 * ENV:
 *   VITE_N8N_AI_CHAT_WEBHOOK – Production webhook URL from the n8n workflow.
 *
 * Payload to n8n:
 *   {
 *     message:     "user's text",
 *     sessionId:   "uuid of chat_sessions row",
 *     staff_id:    "uuid",
 *     staff_name:  "First Last",
 *     staff_role:  "owner",
 *     staff_email: "roman@nexgen.com",
 *     history:     [] // n8n reads prior turns from Supabase itself
 *   }
 *
 * n8n response:
 *   { "output": "Claude's reply text" }
 */

const N8N_WEBHOOK = import.meta.env.VITE_N8N_AI_CHAT_WEBHOOK || ''

// ─── Suggestion prompts ──────────────────────────────────────────────────────
const SUGGESTIONS = [
  {
    icon: Clock,
    label: 'Summarize my week',
    prompt: 'Summarize my clocked hours and check-ins for this week.',
  },
  {
    icon: ListChecks,
    label: "What's on my plate today?",
    prompt: 'What tasks do I have open today and what should I focus on first?',
  },
  {
    icon: Calendar,
    label: "Today's schedule",
    prompt: "What's on my schedule for today?",
  },
  {
    icon: HelpCircle,
    label: 'Help with a procedure',
    prompt: 'How do I run a TRS Cat 2 interaction check?',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtTime(d) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function makeId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function rowToMessage(row) {
  return {
    id: row.id,
    role: row.role === 'assistant' ? 'assistant' : row.role === 'user' ? 'user' : 'assistant',
    text: row.content || '',
    at: row.created_at ? new Date(row.created_at) : new Date(),
  }
}

// ─── n8n agent call ──────────────────────────────────────────────────────────
async function callN8nAgent({ message, sessionId, staff }) {
  if (!N8N_WEBHOOK) {
    return {
      output:
        "I'm not connected to my backend yet. Once your n8n AI Chat Agent workflow is live and the webhook URL is set in `.env.local`, I'll be able to pull your real data and answer questions.",
    }
  }

  const payload = {
    message,
    sessionId,
    staff_id: staff?.id || null,
    staff_name: staff ? `${staff.first_name || ''} ${staff.last_name || ''}`.trim() : null,
    staff_role: staff?.role || null,
    staff_email: staff?.email || null,
    history: [], // n8n pulls prior history from Supabase itself
  }

  const res = await fetch(N8N_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`n8n returned ${res.status}: ${errText.slice(0, 200)}`)
  }

  const data = await res.json().catch(() => ({}))

  // Accept various response shapes so we're flexible with the n8n workflow wiring.
  const reply =
    data.output ||
    data.reply ||
    data.message ||
    data.text ||
    data.response ||
    (typeof data === 'string' ? data : '')

  return { output: reply || "I got your message but had no text to respond with — check the n8n workflow's Respond node." }
}

// ─── Session management (Supabase) ───────────────────────────────────────────

/**
 * Wrap a Supabase query promise so it rejects after `ms` milliseconds instead
 * of hanging forever. Critical for diagnosing silent stalls — without this, a
 * hung request leaves the chat stuck on "Loading your conversation..." with
 * no console error. With this, we get a clear `query-timeout` we can surface
 * to the user and retry from.
 */
function withQueryTimeout(promise, label, ms = 5000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`query-timeout:${label}:${ms}ms`)), ms)
    ),
  ])
}

async function findOrCreateActiveSession(staffId) {
  if (!supabase) throw new Error('Supabase client not configured')
  if (!staffId) throw new Error('No staff_id available — cannot load session')

  console.log('[AIChat] 🔍 Looking up active chat_session for staff', staffId)

  // Find most recent active session for this staff member
  let findRes
  try {
    findRes = await withQueryTimeout(
      supabase
        .from('chat_sessions')
        .select('*')
        .eq('staff_id', staffId)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      'chat_sessions.select'
    )
  } catch (err) {
    console.error('[AIChat] ❌ chat_sessions SELECT hung/failed:', err.message)
    throw err
  }

  const { data: existing, error: findErr } = findRes
  if (findErr) {
    // Missing table — surface clearly so Roman sees it and can run the migration.
    if (/relation|does not exist|schema cache/i.test(findErr.message)) {
      console.error(
        '[AIChat] ❌ chat_sessions table is missing. Run supabase/migrations/phase1_ai_operational.sql.'
      )
      throw new Error('chat_sessions table does not exist — run phase1_ai_operational.sql')
    }
    console.error('[AIChat] ❌ chat_sessions SELECT error:', findErr.message)
    throw new Error(findErr.message)
  }

  if (existing) {
    console.log('[AIChat] ✅ Found existing active session:', existing.id)
    return existing
  }

  console.log('[AIChat] ➕ No active session — creating one…')

  // None found — create a fresh one
  let createRes
  try {
    createRes = await withQueryTimeout(
      supabase
        .from('chat_sessions')
        .insert({
          staff_id: staffId,
          title: 'New Conversation',
          status: 'active',
        })
        .select()
        .single(),
      'chat_sessions.insert'
    )
  } catch (err) {
    console.error('[AIChat] ❌ chat_sessions INSERT hung/failed:', err.message)
    throw err
  }

  const { data: created, error: createErr } = createRes
  if (createErr) {
    console.error('[AIChat] ❌ chat_sessions INSERT error:', createErr.message)
    throw new Error(createErr.message)
  }

  console.log('[AIChat] ✅ Created new session:', created.id)
  return created
}

async function loadSessionMessages(sessionId) {
  if (!supabase || !sessionId) return []

  console.log('[AIChat] 📜 Loading chat_messages for session', sessionId)

  let res
  try {
    res = await withQueryTimeout(
      supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(50),
      'chat_messages.select'
    )
  } catch (err) {
    console.error('[AIChat] ❌ chat_messages SELECT hung/failed:', err.message)
    throw err
  }

  const { data, error } = res
  if (error) {
    if (/relation|does not exist|schema cache/i.test(error.message)) {
      console.warn('[AIChat] chat_messages table missing — returning empty history')
      return []
    }
    console.error('[AIChat] ❌ chat_messages SELECT error:', error.message)
    throw new Error(error.message)
  }

  console.log(`[AIChat] ✅ Loaded ${data?.length || 0} messages`)
  return data || []
}

// ─── Message bubble ──────────────────────────────────────────────────────────
function MessageBubble({ msg, staff }) {
  const isUser = msg.role === 'user'
  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-3">
        <div className="max-w-[80%]">
          <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 text-right tabular-nums">{fmtTime(msg.at)}</p>
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
          style={{ backgroundColor: staff?.avatar_color || '#6b7280' }}
          title={staff ? `${staff.first_name} ${staff.last_name}` : 'You'}
        >
          {staff
            ? (staff.first_name?.[0] || '') + (staff.last_name?.[0] || '')
            : <UserIcon className="w-4 h-4" />}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
        <BotMessageSquare className="w-4 h-4" />
      </div>
      <div className="max-w-[80%]">
        <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm">
          {msg.loading ? (
            <div className="flex items-center gap-2 py-0.5">
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse [animation-delay:300ms]" />
            </div>
          ) : msg.error ? (
            <p className="text-sm leading-relaxed text-red-500 whitespace-pre-wrap">{msg.text}</p>
          ) : (
            <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">{msg.text}</p>
          )}
        </div>
        {!msg.loading && (
          <p className="text-[10px] text-gray-400 mt-1 tabular-nums">{fmtTime(msg.at)}</p>
        )}
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AIChatPage() {
  const { staff } = useAuth()
  const { mobileMode } = useViewMode()

  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [bootstrapError, setBootstrapError] = useState(null)
  const [retryCounter, setRetryCounter] = useState(0)

  const scrollerRef = useRef(null)
  const inputRef = useRef(null)
  const textareaRef = useRef(null)
  // Guard against redundant bootstrap runs. If `staff` reference flickers
  // (AuthContext re-setting session on TOKEN_REFRESHED creates a new `value`
  // object) we don't want to re-run the DB calls and flash our own spinner.
  const bootstrappedForStaffIdRef = useRef(null)
  // Monotonically increasing run id. The latest run is the authoritative one
  // whose results are allowed to update state. Older runs become a no-op if
  // superseded. This replaces the old `cancelled` pattern, which was broken
  // under React StrictMode's intentional double-mount-then-cleanup dance:
  // StrictMode would cancel run #1 before it finished, and the ref guard
  // would prevent run #2 from ever starting — leaving historyLoading stuck
  // at `true` forever (see the "stuck on Loading your conversation…" bug).
  const runIdRef = useRef(0)

  const isConnected = !!N8N_WEBHOOK

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
    const name = staff?.first_name || 'there'
    return `Good ${period}, ${name}`
  }, [staff?.first_name])

  // Bootstrap: find/create session + load messages.
  //
  // StrictMode-safe design:
  //   • `bootstrappedForStaffIdRef` prevents StrictMode's second effect run
  //     from kicking off a duplicate bootstrap for the same user.
  //   • `runIdRef` lets the latest run supersede older ones when deps
  //     genuinely change (Retry, staff switch). Older runs become no-ops.
  //   • No `cancelled` / cleanup teardown — React 18 makes setState after
  //     unmount a silent no-op, which is fine here and avoids the StrictMode
  //     deadlock that left historyLoading stuck at true.
  //
  // Supabase calls are wrapped in `withQueryTimeout` so a silent hang cannot
  // freeze the UI — it'll surface as `query-timeout:<label>:5000ms`.
  useEffect(() => {
    console.log('[AIChat] 🧭 Bootstrap effect fired — staff?.id:', staff?.id, 'retryCounter:', retryCounter)

    const currentId = staff?.id
    if (!currentId) {
      console.log('[AIChat] ⏸ No staff.id yet — waiting for AuthContext to populate')
      return
    }

    // Skip if already bootstrapped for this user. Retry button resets the ref
    // so this early-return does not block retries.
    if (bootstrappedForStaffIdRef.current === currentId) {
      console.log('[AIChat] ⏭ Already bootstrapped for this staff — skipping (StrictMode or staff-reference flicker)')
      return
    }
    bootstrappedForStaffIdRef.current = currentId

    // Claim this run. If a later effect bumps runIdRef, this run becomes stale
    // and its state updates are suppressed.
    const myRunId = ++runIdRef.current
    const isLatest = () => runIdRef.current === myRunId

    async function bootstrap() {
      console.log(`[AIChat] ▶️ Bootstrap starting (run #${myRunId}) for staff`, currentId)
      setHistoryLoading(true)
      setBootstrapError(null)
      try {
        const sess = await findOrCreateActiveSession(currentId)
        console.log('[AIChat] 📦 findOrCreateActiveSession returned:', sess)

        if (!isLatest()) {
          console.log(`[AIChat] ⏹ Run #${myRunId} superseded — discarding session result`)
          return
        }
        setSession(sess)

        if (sess?.id) {
          console.log('[AIChat] ➡️ About to call loadSessionMessages for session:', sess.id)
          const rows = await loadSessionMessages(sess.id)
          console.log('[AIChat] 📥 loadSessionMessages returned', rows?.length ?? 0, 'rows')

          if (!isLatest()) {
            console.log(`[AIChat] ⏹ Run #${myRunId} superseded — discarding messages result`)
            return
          }
          setMessages(rows.map(rowToMessage))
        } else {
          console.warn('[AIChat] ⚠️ session had no id — skipping messages load. session was:', sess)
        }
        console.log(`[AIChat] ✅ Bootstrap complete (run #${myRunId})`)
      } catch (err) {
        console.error(`[AIChat] ❌ Bootstrap failed (run #${myRunId}):`, err?.message || err)
        if (!isLatest()) return
        // Reset ref so Retry (or next effect run) re-attempts.
        bootstrappedForStaffIdRef.current = null
        setBootstrapError(err?.message || 'Failed to load chat')
      } finally {
        // ALWAYS turn off the spinner for the latest run. The old code had
        // `if (!cancelled)` here, which was the root cause of the stuck spinner.
        if (isLatest()) setHistoryLoading(false)
      }
    }
    bootstrap()
    // No cleanup: we deliberately don't cancel in-flight runs. React 18 handles
    // setState-after-unmount as a silent no-op, so there's no leak. Genuine
    // supersession (new staff, Retry) is handled by runIdRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff?.id, retryCounter])

  function retryBootstrap() {
    console.log('[AIChat] 🔁 Retry clicked — resetting guard and re-running bootstrap')
    bootstrappedForStaffIdRef.current = null
    setBootstrapError(null)
    setRetryCounter((n) => n + 1)
  }

  // Auto-scroll
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, historyLoading])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = '0px'
    const max = 160
    el.style.height = Math.min(el.scrollHeight, max) + 'px'
  }, [input])

  async function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    const userMsg = { id: makeId(), role: 'user', text: trimmed, at: new Date() }
    const loadingMsg = { id: makeId(), role: 'assistant', text: '', at: new Date(), loading: true }

    setMessages((prev) => [...prev, userMsg, loadingMsg])
    setInput('')
    setSending(true)

    try {
      const { output } = await callN8nAgent({
        message: trimmed,
        sessionId: session?.id || null,
        staff,
      })
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id ? { ...m, loading: false, text: output, at: new Date() } : m
        )
      )
      // Intentionally NO silent refetch here. The optimistic local copies are
      // already the correct text (user input + the exact n8n response), so we
      // don't need to re-query Supabase. Skipping this avoids a side effect
      // where Supabase's auth listener can fire TOKEN_REFRESHED during the
      // chat_messages query and briefly clobber staff, triggering
      // ProtectedRoute's "Loading profile..." spinner.
      //
      // Canonical state from chat_messages is pulled on the next mount
      // (page refresh), which is what makes history persistence work.
    } catch (err) {
      console.error('AI Chat error:', err)
      const errorText = err.message?.includes('Failed to fetch')
        ? "Couldn't reach the AI agent — check that your n8n workflow is active and the webhook URL is correct."
        : err.message?.includes('n8n returned')
          ? `The AI agent returned an error: ${err.message}`
          : 'Sorry — something went wrong reaching the assistant. Try again in a moment.'
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? { ...m, loading: false, text: errorText, error: true, at: new Date() }
            : m
        )
      )
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const empty = messages.length === 0

  return (
    // Mobile: size against the DYNAMIC viewport height (`dvh`) so the chat
    // resizes cleanly as the mobile browser's URL bar shows/hides, and
    // subtract the real chrome stack (top toolbar ~52 + main pt-4 = 16 +
    // main pb-20 = 80, total ~148, plus a small buffer for the home-indicator
    // safe area on iPhone). Without this, the input bubble used to fall
    // below the visible viewport on mobile, forcing the user to scroll the
    // outer <main> instead of the chat's internal message list.
    //
    // Desktop keeps the old `vh` math since there's no URL-bar dance.
    <div
      className={
        mobileMode
          ? 'flex flex-col h-[calc(100dvh-160px)] overflow-hidden'
          : 'flex flex-col h-[calc(100vh-128px)] max-w-4xl mx-auto'
      }
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-5 shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
          <BotMessageSquare className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className={`font-bold text-gray-900 ${mobileMode ? 'text-xl' : 'text-2xl'}`}>
              AI Assistant
            </h1>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-600 border-amber-200'
              }`}
            >
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5 truncate">
            Your personal helper — ask about your day, tasks, or training.
          </p>
        </div>
        {/* "New chat" button intentionally removed — each staff member has a
            single persistent conversation. All history for a given user stays
            in their one active chat_session so future interactions (and the
            n8n agent's memory) stay continuous. */}
      </div>

      {/* Chat surface */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden min-h-0">
        <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4">
          {bootstrapError ? (
            <div className="h-full flex items-center justify-center px-4">
              <div className="text-center max-w-md">
                <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-3">
                  <WifiOff className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Couldn't load your conversation
                </p>
                <p className="text-xs text-gray-500 mb-1 break-words">
                  {bootstrapError}
                </p>
                <p className="text-[11px] text-gray-400 mb-4">
                  Check the browser console (Cmd+Option+J) for the <code>[AIChat]</code> logs
                  showing exactly which step failed.
                </p>
                <button
                  onClick={retryBootstrap}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Loader2 className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />
                  Retry
                </button>
              </div>
            </div>
          ) : historyLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Loading your conversation…</span>
            </div>
          ) : empty ? (
            <EmptyState
              greeting={greeting}
              staff={staff}
              isConnected={isConnected}
              onPick={(p) => sendMessage(p)}
            />
          ) : (
            messages.map((m) => <MessageBubble key={m.id} msg={m} staff={staff} />)
          )}
        </div>

        <div className="border-t border-gray-100 bg-gray-50/60 p-3 md:p-4">
          <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <textarea
              ref={(el) => { inputRef.current = el; textareaRef.current = el }}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={sending ? 'Thinking…' : 'Ask me anything — press Enter to send'}
              disabled={sending || historyLoading}
              className="flex-1 resize-none bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none py-1.5 px-1 max-h-40 leading-relaxed"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || sending || historyLoading}
              className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${
                input.trim() && !sending && !historyLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
              title="Send"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 px-1 text-center">
            AI Assistant can make mistakes. Verify critical information before acting.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ greeting, staff, isConnected, onPick }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-8">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md mb-5">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-xl font-bold text-gray-900">{greeting} 👋</h2>
      <p className="text-sm text-gray-500 mt-2 max-w-md">
        I can help with your schedule, time clock, open tasks, training materials, and
        questions about how we do things here. What's on your mind today?
      </p>

      <div className="flex items-center gap-2 mt-5 flex-wrap justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs text-blue-700">
          <MessageCircle className="w-3.5 h-3.5" />
          {staff
            ? `Chatting as ${staff.first_name} ${staff.last_name}`
            : 'Personal assistant'}
        </div>
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs ${
            isConnected
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
              : 'bg-amber-50 border-amber-100 text-amber-600'
          }`}
        >
          {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {isConnected ? 'n8n agent connected' : 'Agent not connected — set VITE_N8N_AI_CHAT_WEBHOOK'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 w-full max-w-xl">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => onPick(s.prompt)}
            className="group flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/40 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-100 transition-colors">
              <s.icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{s.label}</p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{s.prompt}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
