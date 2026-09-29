import { useMemo, useState } from 'react'
import { Loader2, AlertCircle, CheckCircle2, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCheckEvents } from '../hooks/useCheckEvents'

const ROOM_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8]

const ACCENTS = {
  green: {
    button: 'bg-emerald-600 hover:bg-emerald-700',
    ring: 'text-emerald-600',
    ok: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  rose: {
    button: 'bg-rose-600 hover:bg-rose-700',
    ring: 'text-rose-600',
    ok: 'bg-rose-50 text-rose-800 border-rose-200',
  },
}

export default function CheckPunchView({ mode, title, subtitle, icon: Icon, accent = 'green' }) {
  const { staff } = useAuth()
  const staffId = staff?.id
  const { rows, latestByStaff, loading, error, submit } = useCheckEvents({ staffId, days: 7 })

  const [roomNumber, setRoomNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [flash, setFlash] = useState(null)
  const [submitError, setSubmitError] = useState(null)

  const latest = staffId ? latestByStaff.get(staffId) : null
  const isDoubleTap = latest && latest.eventType === mode

  // Only today's events for the log tile.
  const todaysEvents = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return rows.filter((r) => new Date(r.eventAt) >= start)
  }, [rows])

  async function onPunch() {
    if (!staffId) {
      setSubmitError('No staff profile linked to your login.')
      return
    }
    setSubmitError(null); setSubmitting(true)
    const { error: eErr } = await submit({
      staffId,
      eventType: mode,
      roomNumber: roomNumber ? Number(roomNumber) : null,
      notes: notes.trim() || null,
    })
    setSubmitting(false)
    if (eErr) { setSubmitError(eErr); return }
    setFlash(`${title} recorded.`)
    setRoomNumber(''); setNotes('')
    setTimeout(() => setFlash(null), 3500)
  }

  const A = ACCENTS[accent] || ACCENTS.green

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Icon className={`w-6 h-6 ${A.ring}`} />
          {title}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      {isDoubleTap && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            Your last event was a <b>{mode === 'check_in' ? 'check-in' : 'check-out'}</b> already.
            Recording another {mode === 'check_in' ? 'check-in' : 'check-out'} may be a duplicate.
          </div>
        </div>
      )}

      {flash && (
        <div className={`rounded-lg border px-3 py-2 text-sm flex items-center gap-2 ${A.ok}`}>
          <CheckCircle2 className="w-4 h-4" />
          {flash}
        </div>
      )}

      {submitError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-3 py-2 text-sm">
          {submitError}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">
            Room (optional)
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setRoomNumber('')}
              className={`h-9 px-3 rounded-lg text-sm border ${
                roomNumber === ''
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              —
            </button>
            {ROOM_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRoomNumber(String(n))}
                className={`h-9 w-10 rounded-lg text-sm border ${
                  roomNumber === String(n)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Anything worth flagging?"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="button"
          disabled={submitting || !staffId}
          onClick={onPunch}
          className={`w-full h-14 rounded-xl text-white text-lg font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 ${A.button}`}
        >
          {submitting
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</>
            : <><Icon className="w-5 h-5" /> {title}</>}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Today's events</h2>
          <span className="text-xs text-gray-500">{todaysEvents.length}</span>
        </div>
        {loading ? (
          <div className="p-6 text-center text-sm text-gray-500 inline-flex items-center gap-2 justify-center w-full">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-rose-700">{error}</div>
        ) : todaysEvents.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">Nothing yet today.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {todaysEvents.map((r) => (
              <li key={r.id} className="px-5 py-2.5 flex items-center gap-3 text-sm">
                {r.eventType === 'check_in'
                  ? <LogIn className="w-4 h-4 text-emerald-600 shrink-0" />
                  : <LogOut className="w-4 h-4 text-rose-600 shrink-0" />}
                <span className="font-mono text-xs text-gray-500 w-14">
                  {new Date(r.eventAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </span>
                <span className="capitalize font-medium text-gray-800">
                  {r.eventType === 'check_in' ? 'Check-in' : 'Check-out'}
                </span>
                {r.roomNumber != null && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">Room {r.roomNumber}</span>
                )}
                {r.notes && <span className="text-gray-500 truncate">— {r.notes}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
