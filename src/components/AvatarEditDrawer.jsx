import { useState } from 'react'
import { X, Loader2, Save, Plus, Trash2, GripVertical } from 'lucide-react'
import { slugify } from '../hooks/useAvatars'

/**
 * Edit / create an avatar persona.
 *
 * Handles the four dynamic sections:
 *   - Identity: rows of { label, value }
 *   - Pains / Goals / Objections: list of strings
 *
 * Add/remove/reorder for each. Slug auto-fills from name on Create but
 * becomes editable if the user wants to override it.
 */
export default function AvatarEditDrawer({ mode, avatar, onClose, onSave, onDelete }) {
  const isCreate = mode === 'create'
  const [name,     setName]     = useState(avatar?.name || '')
  const [slug,     setSlug]     = useState(avatar?.slug || '')
  const [slugDirty, setSlugDirty] = useState(!isCreate)
  const [subtitle, setSubtitle] = useState(avatar?.subtitle || '')
  const [summary,  setSummary]  = useState(avatar?.summary || '')
  const [identity, setIdentity] = useState(avatar?.identity?.length ? avatar.identity : [{ label: '', value: '' }])
  const [pains,      setPains]      = useState(avatar?.pains       || [])
  const [goals,      setGoals]      = useState(avatar?.goals       || [])
  const [objections, setObjections] = useState(avatar?.objections  || [])
  const [position,   setPosition]   = useState(String(avatar?.position ?? 0))
  const [active,     setActive]     = useState(avatar ? !!avatar.active : true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [err, setErr] = useState(null)

  function onNameChange(v) {
    setName(v)
    if (!slugDirty) setSlug(slugify(v))
  }

  async function save() {
    if (!name.trim()) { setErr('Give the avatar a name.'); return }
    setSaving(true); setErr(null)
    const eErr = await onSave({
      name: name.trim(),
      slug: slug.trim(),
      subtitle: subtitle.trim(),
      summary:  summary.trim(),
      identity: identity.filter(r => r.label || r.value),
      pains, goals, objections,
      position: Number(position) || 0,
      active,
    })
    setSaving(false)
    if (eErr) { setErr(eErr); return }
    onClose()
  }

  async function del() {
    if (!onDelete) return
    if (!window.confirm(`Delete avatar "${avatar.name}"? This cannot be undone.`)) return
    setDeleting(true); setErr(null)
    const eErr = await onDelete()
    setDeleting(false)
    if (eErr) { setErr(eErr); return }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="w-full sm:max-w-2xl bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white px-5 py-3 border-b border-gray-100 flex items-center justify-between z-10">
          <h2 className="text-base font-bold text-gray-900">
            {isCreate ? 'New avatar' : `Edit ${avatar.name}`}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Name">
              <input
                value={name}
                onChange={e => onNameChange(e.target.value)}
                placeholder="CCMS Cassandra"
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </Field>
            <Field label="Slug (URL)">
              <input
                value={slug}
                onChange={e => { setSlugDirty(true); setSlug(e.target.value) }}
                placeholder="ccms-cassandra"
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </Field>
          </div>

          <Field label="Subtitle (one line)">
            <input
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              placeholder="Subsidized-enrollment parent qualifying through CCMS"
              className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </Field>

          <Field label="Avatar Profile (summary paragraph)">
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              rows={4}
              placeholder="Who they are, what they need, how they're shopping."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </Field>

          <section>
            <SectionLabel>Identity (key / value)</SectionLabel>
            <div className="space-y-2">
              {identity.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <GripVertical className="w-4 h-4 text-gray-300 mt-2 shrink-0" />
                  <input
                    value={r.label}
                    onChange={e => setIdentity(mut(identity, i, { ...r, label: e.target.value }))}
                    placeholder="Household"
                    className="w-40 h-9 rounded-lg border border-gray-200 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    value={r.value}
                    onChange={e => setIdentity(mut(identity, i, { ...r, value: e.target.value }))}
                    placeholder="Single parent or dual-income household"
                    className="flex-1 h-9 rounded-lg border border-gray-200 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => setIdentity(removeAt(identity, i))}
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"
                    aria-label="Remove row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setIdentity([...identity, { label: '', value: '' }])}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-dashed border-gray-300 text-xs text-gray-700 hover:border-gray-400"
              >
                <Plus className="w-3.5 h-3.5" /> Add row
              </button>
            </div>
          </section>

          <StringListEditor label="Pain Points"    items={pains}      setItems={setPains}      placeholder="Paperwork deadlines she didn't know about" />
          <StringListEditor label="Goals"          items={goals}      setItems={setGoals}      placeholder="A center that reminds her before deadlines" />
          <StringListEditor label="Objections"     items={objections} setItems={setObjections} placeholder="&quot;Are you actually taking CCMS right now?&quot;" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Sort position">
              <input
                type="number"
                value={position}
                onChange={e => setPosition(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </Field>
            <Field label="Active">
              <label className="inline-flex items-center gap-2 h-10">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={e => setActive(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm text-gray-700">Show this avatar in lists</span>
              </label>
            </Field>
          </div>

          {err && <div className="text-sm text-rose-700">{err}</div>}
        </div>

        <div className="sticky bottom-0 bg-white px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            {!isCreate && onDelete && (
              <button
                onClick={del}
                disabled={deleting || saving}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm text-rose-700 hover:bg-rose-50 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="h-9 px-3 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Cancel</button>
            <button
              onClick={save}
              disabled={saving}
              className="h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <div className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">{label}</div>
      {children}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">{children}</div>
  )
}

function StringListEditor({ label, items, setItems, placeholder }) {
  return (
    <section>
      <SectionLabel>{label}</SectionLabel>
      <div className="space-y-2">
        {items.map((v, i) => (
          <div key={i} className="flex items-start gap-2">
            <GripVertical className="w-4 h-4 text-gray-300 mt-2 shrink-0" />
            <textarea
              value={v}
              onChange={e => setItems(mut(items, i, e.target.value))}
              rows={1}
              placeholder={placeholder}
              className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y min-h-[36px]"
            />
            <button
              onClick={() => setItems(removeAt(items, i))}
              className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"
              aria-label="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() => setItems([...items, ''])}
          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-dashed border-gray-300 text-xs text-gray-700 hover:border-gray-400"
        >
          <Plus className="w-3.5 h-3.5" /> Add item
        </button>
      </div>
    </section>
  )
}

function mut(arr, i, next) {
  const copy = arr.slice()
  copy[i] = next
  return copy
}

function removeAt(arr, i) {
  const copy = arr.slice()
  copy.splice(i, 1)
  return copy
}
