import { useEffect, useState } from 'react'
import { X, Loader2, Trash2, AlertCircle } from 'lucide-react'

const TOUR_TYPES = [
  { key: 'room_visit',         label: 'Room visit' },
  { key: 'parent_walkthrough', label: 'Parent walkthrough' },
  { key: 'follow_up',          label: 'Follow-up meeting' },
  { key: 'other',              label: 'Other' },
]

const OUTCOMES = [
  { key: 'positive', label: 'Positive', tone: 'emerald' },
  { key: 'neutral',  label: 'Neutral',  tone: 'gray' },
  { key: 'concern',  label: 'Concern',  tone: 'rose' },
]

/**
 * Log a post-enrollment tour. Same drawer shape as
 * CommunicationLogDrawer for consistency. Pre-enrollment prospect
 * tours belong to the /leads/tours pipeline, not here.
 */
export default function TourLogDrawer({
  open,
  mode,
  entry,
  onClose,
  onSaved,
  tours,
}) {
  const [values, setValues] = useState(emptyValues)
  const [formError, setFormError] = useState(/** @type {string|null} */ (null))
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!open) return
    setFormError(null)
    setConfirmDelete(false)
    if (mode === 'edit' && entry) {
      setValues({
        tourAt: entry.tourAt ? new Date(entry.tourAt).toISOString().slice(0, 16) : '',
        tourType: entry.tourType,
        notes: entry.notes || '',
        outcome: entry.outcome || '',
      })
    } else {
      setValues(emptyValues())
    }
  }, [open, mode, entry])

  if (!open) return null

  async function handleSave() {
    setFormError(null)
    if (!values.tourType) return setFormError('Pick a tour type.')
    setPending(true)
    try {
      const payload = {
        tourAt: values.tourAt ? new Date(values.tourAt).toISOString() : new Date().toISOString(),
        tourType: values.tourType,
        notes: values.notes,
        outcome: values.outcome || null,
      }
      const { error: sErr } =
        mode === 'edit'
          ? await tours.updateTour(entry.id, payload)
          : await tours.logTour(payload)
      if (sErr) return setFormError(sErr)
      onSaved()
    } finally {
      setPending(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return setConfirmDelete(true)
    setPending(true)
    try {
      const { error: dErr } = await tours.deleteTour(entry.id)
      if (dErr) return setFormError(dErr)
      onSaved()
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
        <header className="px-5 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === 'edit' ? 'Edit tour' : 'Log a tour'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <Field label="When" required>
            <input
              type="datetime-local"
              value={values.tourAt}
              onChange={(e) => setValues((s) => ({ ...s, tourAt: e.target.value }))}
              className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </Field>

          <Field label="Type" required>
            <div className="grid grid-cols-2 gap-2">
              {TOUR_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setValues((s) => ({ ...s, tourType: t.key }))}
                  className={`h-10 rounded-lg border text-sm font-semibold ${
                    values.tourType === t.key
                      ? 'border-blue-400 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Outcome" hint="Optional. Sets a colored pill on the tour row.">
            <div className="flex gap-2">
              {OUTCOMES.map((o) => {
                const active = values.outcome === o.key
                const tones = {
                  emerald: active ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
                  gray:    active ? 'bg-gray-100 border-gray-400 text-gray-800'         : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
                  rose:    active ? 'bg-rose-50 border-rose-300 text-rose-700'          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
                }
                return (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setValues((s) => ({ ...s, outcome: active ? '' : o.key }))}
                    className={`flex-1 h-10 rounded-lg border text-sm font-semibold ${tones[o.tone]}`}
                  >
                    {o.label}
                  </button>
                )
              })}
            </div>
          </Field>

          <Field label="Notes">
            <textarea
              rows={5}
              value={values.notes}
              onChange={(e) => setValues((s) => ({ ...s, notes: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              placeholder="What did the family ask? What did we show them? What's next?"
            />
          </Field>

          {formError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{formError}</p>
            </div>
          )}
        </div>

        <footer className="px-5 py-4 border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
          {mode === 'edit' ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className={`inline-flex items-center gap-1.5 h-10 px-3 rounded-lg text-sm font-semibold transition ${
                confirmDelete
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'text-red-600 hover:bg-red-50 border border-red-200'
              } disabled:opacity-50`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {confirmDelete ? 'Click again to confirm' : 'Delete'}
            </button>
          ) : <span />}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="h-10 px-4 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={pending}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
            >
              {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {mode === 'edit' ? 'Save' : 'Log tour'}
            </button>
          </div>
        </footer>
      </aside>
    </>
  )
}

function emptyValues() {
  const now = new Date()
  return {
    tourAt: new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    tourType: '',
    notes: '',
    outcome: '',
  }
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-500 mt-1">{hint}</p>}
    </div>
  )
}
