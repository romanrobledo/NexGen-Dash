import { useState } from 'react'
import { X, Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { sendSmsByPhone } from '../hooks/useGhl'

/**
 * One-off SMS-to-GHL modal. Caller passes the recipient phone + name;
 * the hook looks up the GHL contact by phone (creates one if missing)
 * then sends the SMS. Stays open on success for a beat so the user
 * sees the confirmation, then closes.
 */
export default function SendSmsModal({ open, onClose, toPhone, toName, firstName, lastName }) {
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)   // {ok, error?, created?}

  if (!open) return null

  const disabled = !toPhone || !body.trim() || sending

  async function send() {
    if (!toPhone) { setResult({ ok: false, error: 'No phone on file.' }); return }
    if (!body.trim()) return
    setSending(true); setResult(null)
    const r = await sendSmsByPhone({
      phone: toPhone,
      message: body.trim(),
      firstName,
      lastName,
    })
    setSending(false)
    setResult(r)
    if (r.ok) {
      setBody('')
      setTimeout(() => { setResult(null); onClose() }, 1500)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl"
      >
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
            <Send className="w-4 h-4 text-blue-600" />
            Send SMS via GHL
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="text-xs text-gray-600">
            <span className="font-semibold text-gray-900">To:</span>{' '}
            {toName || '—'}
            {toPhone && <span className="text-gray-500"> · {toPhone}</span>}
            {!toPhone && (
              <span className="ml-1 text-amber-700">(no phone on file)</span>
            )}
          </div>

          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={5}
            placeholder="Type your message…"
            maxLength={1000}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-[11px] text-gray-500 text-right">
            {body.length} / 1000
          </div>

          {result && !result.ok && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-3 py-2 text-sm inline-flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{result.error}</span>
            </div>
          )}
          {result && result.ok && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2 text-sm inline-flex items-start gap-1.5">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                Sent{result.created ? ' (new GHL contact created)' : ''}.
              </span>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="h-9 px-3 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={send}
            disabled={disabled}
            className="h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
