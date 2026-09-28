import { useEffect, useState } from 'react'
import { X, Loader2, Trash2, AlertCircle } from 'lucide-react'
import { useGuardianMutations } from '../hooks/useGuardianMutations'

/**
 * Add / edit a guardian for one family.
 *
 * Modal-style drawer that slides in from the right on desktop, covers
 * the screen on mobile. Two modes:
 *
 *   * mode: 'create' — familyId required, saves via createGuardian
 *   * mode: 'edit'   — guardian required, saves via updateGuardian.
 *                      Includes a Delete button.
 *
 * The parent owns close + refetch. onSaved fires after a successful
 * write so the parent can refetch useFamilies and close the drawer.
 *
 * @param {{
 *   open: boolean,
 *   mode: 'create' | 'edit',
 *   familyId?: string,
 *   guardian?: import('../hooks/useFamilies').Guardian | null,
 *   onClose: () => void,
 *   onSaved: () => void,
 * }} props
 */
export default function GuardianEditDrawer({
  open,
  mode,
  familyId,
  guardian,
  onClose,
  onSaved,
}) {
  const { createGuardian, updateGuardian, deleteGuardian, pending } =
    useGuardianMutations()
  const [values, setValues] = useState(() => emptyValues())
  const [customRelationship, setCustomRelationship] = useState('')
  const [formError, setFormError] = useState(/** @type {string|null} */ (null))
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Reset form when the drawer opens for a different guardian / mode.
  useEffect(() => {
    if (!open) return
    setFormError(null)
    setConfirmDelete(false)
    if (mode === 'edit' && guardian) {
      const preset = RELATIONSHIPS.includes(guardian.relationship)
      setValues({
        first_name: guardian.firstName || '',
        last_name: guardian.lastName || '',
        relationship: preset ? guardian.relationship : (guardian.relationship ? 'Other' : ''),
        phone: guardian.phone || '',
        email: guardian.email || '',
        is_primary: !!guardian.isPrimary,
        pickup_authorized: guardian.pickupAuthorized !== false,
        emergency_priority: guardian.emergencyPriority ?? '',
        notes: guardian.notes || '',
      })
      setCustomRelationship(preset ? '' : (guardian.relationship || ''))
    } else {
      setValues(emptyValues())
      setCustomRelationship('')
    }
  }, [open, mode, guardian])

  if (!open) return null

  async function handleSave(e) {
    e.preventDefault()
    setFormError(null)

    if (!values.first_name.trim() || !values.last_name.trim()) {
      setFormError('First and last name are required.')
      return
    }

    // If Other is picked, use the custom text instead. Empty custom text
    // falls through to null in normalizePayload.
    const relationship =
      values.relationship === 'Other' ? customRelationship : values.relationship
    const payload = { ...values, relationship }

    const result =
      mode === 'edit'
        ? await updateGuardian(guardian.id, payload)
        : await createGuardian(familyId, payload)

    if (result.error) {
      setFormError(result.error)
      return
    }
    onSaved()
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setFormError(null)
    const { error: delErr } = await deleteGuardian(guardian.id)
    if (delErr) {
      setFormError(delErr)
      return
    }
    onSaved()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-md bg-white shadow-2xl flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <header className="px-5 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === 'edit' ? 'Edit guardian' : 'Add guardian'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" required>
              <TextInput
                value={values.first_name}
                onChange={(v) => setValues((s) => ({ ...s, first_name: v }))}
                autoFocus
              />
            </Field>
            <Field label="Last name" required>
              <TextInput
                value={values.last_name}
                onChange={(v) => setValues((s) => ({ ...s, last_name: v }))}
              />
            </Field>
          </div>

          <Field label="Relationship">
            <select
              value={values.relationship || ''}
              onChange={(e) =>
                setValues((s) => ({ ...s, relationship: e.target.value }))
              }
              className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="">—</option>
              {RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {values.relationship === 'Other' && (
              <TextInput
                value={customRelationship}
                onChange={setCustomRelationship}
                placeholder="Specify relationship"
                className="mt-2"
              />
            )}
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Phone">
              <TextInput
                value={values.phone}
                onChange={(v) => setValues((s) => ({ ...s, phone: v }))}
                placeholder="(956) 555-0123"
                inputMode="tel"
              />
            </Field>
            <Field label="Email">
              <TextInput
                value={values.email}
                onChange={(v) => setValues((s) => ({ ...s, email: v }))}
                placeholder="parent@example.com"
                inputMode="email"
                type="email"
              />
            </Field>
          </div>

          <Field
            label="Emergency priority"
            hint="Lower number = called first. Leave blank if not on the emergency list."
          >
            <TextInput
              value={values.emergency_priority}
              onChange={(v) =>
                setValues((s) => ({ ...s, emergency_priority: v.replace(/\D/g, '') }))
              }
              placeholder="1"
              inputMode="numeric"
              className="w-24"
            />
          </Field>

          <div className="space-y-2 rounded-lg bg-gray-50 border border-gray-100 p-3">
            <Toggle
              label="Primary contact"
              hint="One per family. Marking someone primary demotes the current primary."
              checked={values.is_primary}
              onChange={(v) => setValues((s) => ({ ...s, is_primary: v }))}
            />
            <Toggle
              label="Authorized for pickup"
              hint="Uncheck if this guardian cannot pick the child up."
              checked={values.pickup_authorized}
              onChange={(v) => setValues((s) => ({ ...s, pickup_authorized: v }))}
            />
          </div>

          <Field label="Notes">
            <textarea
              value={values.notes}
              onChange={(e) =>
                setValues((s) => ({ ...s, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              placeholder="Anything to remember about this guardian…"
            />
          </Field>

          {formError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{formError}</p>
            </div>
          )}
        </form>

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
          ) : (
            <span />
          )}
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
              type="submit"
              onClick={handleSave}
              disabled={pending}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
            >
              {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {mode === 'edit' ? 'Save changes' : 'Add guardian'}
            </button>
          </div>
        </footer>
      </aside>
    </>
  )
}

const RELATIONSHIPS = [
  'Mother',
  'Father',
  'Step-Mother',
  'Step-Father',
  'Grandmother',
  'Grandfather',
  'Aunt',
  'Uncle',
  'Sibling',
  'Legal Guardian',
  'Family Friend',
  'Other',
]

function emptyValues() {
  return {
    first_name: '',
    last_name: '',
    relationship: '',
    phone: '',
    email: '',
    is_primary: false,
    pickup_authorized: true,
    emergency_priority: '',
    notes: '',
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

function TextInput({ value, onChange, className = '', ...rest }) {
  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none ${className}`}
      {...rest}
    />
  )
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400"
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {hint && <p className="text-[11px] text-gray-500 mt-0.5">{hint}</p>}
      </div>
    </label>
  )
}
