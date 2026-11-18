import { useState } from 'react'
import { Loader2, Send, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const SEVERITIES = [
  { key: 'info',     label: 'Info',     tone: 'bg-gray-100 text-gray-700' },
  { key: 'minor',    label: 'Minor',    tone: 'bg-blue-100 text-blue-800' },
  { key: 'serious',  label: 'Serious',  tone: 'bg-amber-100 text-amber-800' },
  { key: 'critical', label: 'Critical', tone: 'bg-rose-100 text-rose-800' },
]

const ROOM_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8]

/**
 * Shared form for logging a Family / Facility / Classroom incident.
 * The parent page decides which fields to show via `fields` prop so
 * each page can tailor what gets captured (e.g. classroom needs room,
 * family needs child/parent, facility needs neither).
 *
 * @param {object} props
 * @param {'family'|'facility'|'classroom'} props.scope
 * @param {object} props.hook  useIncidents() result
 * @param {Array<'child'|'parent'|'room'>} props.fields
 */
export default function IncidentForm({ scope, hook, fields = [] }) {
  const { staff } = useAuth()
  const [childName,  setChildName]  = useState('')
  const [parentName, setParentName] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [severity,   setSeverity]   = useState('info')
  const [description, setDescription] = useState('')
  const [flash,  setFlash]  = useState(null)
  const [errMsg, setErrMsg] = useState(null)

  async function onSubmit() {
    setErrMsg(null); setFlash(null)
    const r = await hook.submit({
      childName,
      parentName,
      roomNumber,
      severity,
      description,
      reportedBy: staff?.id,
    })
    if (!r.ok) { setErrMsg(r.error); return }
    setChildName(''); setParentName(''); setRoomNumber('')
    setSeverity('info'); setDescription('')
    setFlash('Logged.')
    setTimeout(() => setFlash(null), 2500)
  }

  const show = (f) => fields.includes(f)
  const disabled = hook.submitting || !description.trim()

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          Log {scope === 'family' ? 'Family / Parent' : scope === 'classroom' ? 'Classroom' : 'Facility'} Incident
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">{descFor(scope)}</p>
      </div>

      {(show('child') || show('parent')) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {show('child') && (
            <Field label="Child name">
              <input value={childName} onChange={e => setChildName(e.target.value)}
                placeholder="Optional"
                className={inputCls} />
            </Field>
          )}
          {show('parent') && (
            <Field label="Parent name">
              <input value={parentName} onChange={e => setParentName(e.target.value)}
                placeholder="Optional"
                className={inputCls} />
            </Field>
          )}
        </div>
      )}

      {show('room') && (
        <Field label="Room">
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={() => setRoomNumber('')}
              className={`h-9 px-3 rounded-lg text-sm border ${
                roomNumber === ''
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}>—</button>
            {ROOM_OPTIONS.map(n => (
              <button key={n} type="button" onClick={() => setRoomNumber(String(n))}
                className={`h-9 w-10 rounded-lg text-sm border ${
                  roomNumber === String(n)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}>{n}</button>
            ))}
          </div>
        </Field>
      )}

      <Field label="Severity">
        <div className="flex flex-wrap gap-1.5">
          {SEVERITIES.map(s => (
            <button key={s.key} type="button" onClick={() => setSeverity(s.key)}
              className={`h-9 px-3 rounded-full text-xs font-semibold border ${
                severity === s.key
                  ? `${s.tone} border-current`
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}>{s.label}</button>
          ))}
        </div>
      </Field>

      <Field label="Describe the incident">
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          rows={4}
          placeholder="What happened? Who was involved? What was the response?"
          className={textareaCls} />
      </Field>

      {errMsg && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-3 py-2 text-sm">
          {errMsg}
        </div>
      )}
      {flash && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2 text-sm inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> {flash}
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={onSubmit} disabled={disabled}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold disabled:opacity-50">
          {hook.submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Log incident
        </button>
      </div>
    </div>
  )
}

function descFor(scope) {
  switch (scope) {
    case 'family':    return 'Dropoff/pickup conflicts, custody notes, allergy updates, communication requests.'
    case 'classroom': return 'Room-level events — injury, disruption, child behavior specifics.'
    case 'facility':  return 'Building-wide events — power outage, fire drill, equipment failure.'
    default: return ''
  }
}

const inputCls    = 'w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const textareaCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

function Field({ label, children }) {
  return (
    <div>
      <div className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">{label}</div>
      {children}
    </div>
  )
}
