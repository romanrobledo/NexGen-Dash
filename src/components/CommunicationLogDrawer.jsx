import { useEffect, useState } from 'react'
import { X, Loader2, Trash2, AlertCircle } from 'lucide-react'

const METHODS = [
  { key: 'call',      label: 'Phone call' },
  { key: 'sms',       label: 'Text / SMS' },
  { key: 'email',     label: 'Email' },
  { key: 'in_person', label: 'In-person' },
  { key: 'note',      label: 'Staff note' },
]

const DIRECTIONS = [
  { key: 'inbound',  label: 'Parent → us' },
  { key: 'outbound', label: 'Us → parent' },
]

/**
 * Log a communication entry. Modes:
 *   * 'create' — insert. Requires method + body.
 *   * 'edit'   — update. Includes Delete button.
 *
 * Notes (method = 'note') hide the direction control since a staff note
 * has no direction. Everything else exposes it as required.
 *
 * @param {{
 *   open: boolean,
 *   mode: 'create'|'edit',
 *   entry?: import('../hooks/useFamilyCommunications').FamilyCommunication|null,
 *   familyChildren: {id:string, fullName:string}[],
 *   onClose: () => void,
 *   onSaved: () => void,
 *   comms: {
 *     logCommunication: (v:any) => Promise<{data,error}>,
 *     updateCommunication: (id:string, v:any) => Promise<{data,error}>,
 *     deleteCommunication: (id:string) => Promise<{error}>,
 *   },
 * }} props
 */
export default function CommunicationLogDrawer({
  open,
  mode,
  entry,
  familyChildren = [],
  onClose,
  onSaved,
  comms,
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
        contactAt: entry.contactAt ? new Date(entry.contactAt).toISOString().slice(0, 16) : '',
        method: entry.method,
        direction: entry.direction || '',
        subject: entry.subject || '',
        body: entry.body || '',
        childId: entry.childId || '',
        followUpNeeded: !!entry.followUpNeeded,
        followUpBy: entry.followUpBy || '',
      })
    } else {
      setValues(emptyValues())
    }
  }, [open, mode, entry])

  if (!open) return null

  async function handleSave() {
    setFormError(null)
    if (!values.method) return setFormError('Pick a method.')
    if (!values.body?.trim()) return setFormError('Body is required — even one line is fine.')
    if (values.method !== 'note' && !values.direction) return setFormError('Pick inbound or outbound.')

    setPending(true)
    try {
      const payload = {
        contactAt: values.contactAt ? new Date(values.contactAt).toISOString() : new Date().toISOString(),
        method: values.method,
        direction: values.method === 'note' ? null : values.direction,
        subject: values.subject,
        body: values.body,
        childId: values.childId || null,
        followUpNeeded: values.followUpNeeded,
        followUpBy: values.followUpBy || null,
      }
      const { error: sErr } =
        mode === 'edit'
          ? await comms.updateCommunication(entry.id, payload)
          : await comms.logCommunication(payload)
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
      const { error: dErr } = await comms.deleteCommunication(entry.id)
      if (dErr) return setFormError(dErr)
      onSaved()
    } finally {
      setPending(false)
    }
  }

  const isNote = values.method === 'note'

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
        <header className="px-5 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === 'edit' ? 'Edit entry' : 'Log communication'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="When" required>
              <input
                type="datetime-local"
                value={values.contactAt}
                onChange={(e) => setValues((s) => ({ ...s, contactAt: e.target.value }))}
                className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </Field>
            <Field label="Method" required>
              <select
                value={values.method}
                onChange={(e) => setValues((s) => ({ ...s, method: e.target.value }))}
                className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="">—</option>
                {METHODS.map((m) => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {!isNote && (
            <Field label="Direction" required>
              <div className="flex gap-2">
                {DIRECTIONS.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setValues((s) => ({ ...s, direction: d.key }))}
                    className={`flex-1 h-10 rounded-lg border text-sm font-semibold ${
                      values.direction === d.key
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {familyChildren.length > 0 && (
            <Field label="Related to a specific child?" hint="Leave blank for family-wide entries.">
              <select
                value={values.childId}
                onChange={(e) => setValues((s) => ({ ...s, childId: e.target.value }))}
                className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="">— family-wide —</option>
                {familyChildren.map((c) => (
                  <option key={c.id} value={c.id}>{c.fullName}</option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Subject" hint="Optional one-line summary.">
            <input
              type="text"
              value={values.subject}
              onChange={(e) => setValues((s) => ({ ...s, subject: e.target.value }))}
              className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              placeholder="e.g. Late pickup discussion"
            />
          </Field>

          <Field label="Details" required>
            <textarea
              rows={5}
              value={values.body}
              onChange={(e) => setValues((s) => ({ ...s, body: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              placeholder="Write what was said, decided, or noticed…"
            />
          </Field>

          <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={values.followUpNeeded}
                onChange={(e) => setValues((s) => ({ ...s, followUpNeeded: e.target.checked }))}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Follow-up needed</p>
                <p className="text-[11px] text-gray-500">Pins this entry with an amber flag on the timeline.</p>
              </div>
            </label>
            {values.followUpNeeded && (
              <input
                type="date"
                value={values.followUpBy}
                onChange={(e) => setValues((s) => ({ ...s, followUpBy: e.target.value }))}
                className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            )}
          </div>

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
              {mode === 'edit' ? 'Save' : 'Log entry'}
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
    contactAt: new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    method: '',
    direction: '',
    subject: '',
    body: '',
    childId: '',
    followUpNeeded: false,
    followUpBy: '',
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
