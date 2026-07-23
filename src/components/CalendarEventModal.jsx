import { useState, useEffect } from 'react'
import { X, Calendar as CalendarIcon, Clock, MapPin, FileText, Trash2, Loader2 } from 'lucide-react'

/**
 * Two-mode modal for calendar events. Kept as ONE component because view
 * and create share ~80% of the layout — a header + body of fields — and
 * splitting into two files creates copy-paste drift when the field list
 * grows.
 *
 *   - mode="create": empty form pre-filled with the clicked day's date;
 *     Save writes to Supabase via onSave.
 *   - mode="view":   read-only summary of an existing event with a Delete
 *     button. Edit is a follow-up (delete + re-add works today).
 *
 * @param {{
 *   mode: 'create' | 'view',
 *   accent: 'indigo' | 'emerald' | 'amber',
 *   calendarLabel: string,
 *   event?: import('../hooks/useCalendarEvents').Event | null,
 *   defaultDate?: Date,
 *   onClose: () => void,
 *   onSave?: (evt: any) => Promise<void>,
 *   onDelete?: (id: string) => Promise<void>,
 * }} props
 */
const ACCENT_BUTTONS = {
  indigo:  'bg-indigo-600 hover:bg-indigo-700',
  emerald: 'bg-emerald-600 hover:bg-emerald-700',
  amber:   'bg-amber-500 hover:bg-amber-600',
}

const ACCENT_RINGS = {
  indigo:  'focus:ring-indigo-200 focus:border-indigo-400',
  emerald: 'focus:ring-emerald-200 focus:border-emerald-400',
  amber:   'focus:ring-amber-200 focus:border-amber-400',
}

export default function CalendarEventModal({
  mode,
  accent = 'indigo',
  calendarLabel,
  event = null,
  defaultDate,
  onClose,
  onSave,
  onDelete,
}) {
  const isCreate = mode === 'create'
  const buttonClass = ACCENT_BUTTONS[accent] || ACCENT_BUTTONS.indigo
  const ringClass = ACCENT_RINGS[accent] || ACCENT_RINGS.indigo

  // Form state (create mode only) — initialized from defaultDate so a click
  // on the 15th opens the modal with the 15th preselected.
  const initialDate = toDateInput(defaultDate || new Date())
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(initialDate)
  const [endDate, setEndDate] = useState(initialDate)
  const [allDay, setAllDay] = useState(true)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  // When the user shifts Start Date, keep End Date in sync IF End was still
  // equal to the old Start (i.e. they haven't explicitly picked a multi-day
  // range yet). If End is already different, leave it alone.
  function handleStartDateChange(newStart) {
    if (endDate === startDate) setEndDate(newStart)
    setStartDate(newStart)
  }

  // ESC to close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && !saving && !deleting) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, saving, deleting])

  async function handleSave() {
    if (!title.trim() || !startDate || !endDate) return
    // Reject inverted ranges — form should have prevented but be safe
    if (endDate < startDate) {
      setError('End date must be on or after the start date')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const startsAt = allDay
        ? new Date(`${startDate}T00:00:00`).toISOString()
        : new Date(`${startDate}T${startTime}:00`).toISOString()
      const endsAt = allDay
        ? new Date(`${endDate}T23:59:59`).toISOString()
        : new Date(`${endDate}T${endTime}:00`).toISOString()
      await onSave({
        title: title.trim(),
        startsAt,
        endsAt,
        allDay,
        location: location.trim(),
        description: description.trim(),
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!event || !onDelete) return
    if (!confirm(`Delete "${event.title}"? This can't be undone.`)) return
    setDeleting(true)
    setError(null)
    try {
      await onDelete(event.id)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to delete')
      setDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={saving || deleting ? undefined : onClose}
      />
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <CalendarIcon className="w-4.5 h-4.5 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
              {calendarLabel}
            </p>
            <h3 className="text-base font-bold text-gray-900 leading-tight">
              {isCreate ? 'New event' : event?.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={saving || deleting}
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center flex-shrink-0 disabled:opacity-40"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body — create form OR view details */}
        <div className="p-5 space-y-4">
          {isCreate ? (
            <>
              <Field label="Title" required>
                <input
                  autoFocus
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What is it?"
                  className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 ${ringClass}`}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Start date" required>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 ${ringClass}`}
                  />
                </Field>
                <Field label="End date" required>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 ${ringClass}`}
                  />
                </Field>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                All day
              </label>

              {!allDay && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start time">
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 ${ringClass}`}
                    />
                  </Field>
                  <Field label="End time">
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 ${ringClass}`}
                    />
                  </Field>
                </div>
              )}

              <Field label="Location" hint="optional">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Room, address, or link"
                  className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 ${ringClass}`}
                />
              </Field>

              <Field label="Description" hint="optional">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="More details, agenda, links…"
                  className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none resize-none focus:ring-2 ${ringClass}`}
                />
              </Field>
            </>
          ) : (
            <ViewDetails event={event} />
          )}

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-gray-100 flex gap-2">
          {isCreate ? (
            <>
              <button
                onClick={onClose}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !title.trim() || !startDate || !endDate || endDate < startDate}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors ${buttonClass}`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save event'
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-40"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label className="text-xs font-semibold text-gray-600">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-[10px] text-gray-400">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function ViewDetails({ event }) {
  if (!event) return null
  const start = new Date(event.startsAt)
  const end = event.endsAt ? new Date(event.endsAt) : null
  return (
    <div className="space-y-3 text-sm">
      <Row icon={CalendarIcon}>
        {formatEventDate(start, end, event.allDay)}
      </Row>
      {!event.allDay && end && (
        <Row icon={Clock}>
          {formatTimeRange(start, end)}
        </Row>
      )}
      {event.location && (
        <Row icon={MapPin}>{event.location}</Row>
      )}
      {event.description && (
        <Row icon={FileText}>
          <span className="whitespace-pre-wrap">{event.description}</span>
        </Row>
      )}
      {event.createdBy && (
        <p className="text-[11px] text-gray-400 pt-1 border-t border-gray-100">
          Added by {event.createdBy}
        </p>
      )}
    </div>
  )
}

function Row({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0 text-gray-800">{children}</div>
    </div>
  )
}

// ─── Date helpers ────────────────────────────────────────────────────────────

function toDateInput(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatEventDate(start, end, allDay) {
  const dateOpts = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  const startStr = start.toLocaleDateString('en-US', dateOpts)
  // Multi-day events: show a range. Compare calendar dates (not times), since
  // an all-day event ending at 23:59:59 on the same date is still one day.
  const isMultiDay = end && !isSameCalendarDay(start, end)
  if (isMultiDay) {
    const endStr = end.toLocaleDateString('en-US', dateOpts)
    return `${startStr} → ${endStr}${allDay ? ' · All day' : ''}`
  }
  return startStr + (allDay ? ' · All day' : '')
}

function isSameCalendarDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatTimeRange(start, end) {
  const opts = { hour: 'numeric', minute: '2-digit', hour12: true }
  return `${start.toLocaleTimeString('en-US', opts)} – ${end.toLocaleTimeString('en-US', opts)}`
}
