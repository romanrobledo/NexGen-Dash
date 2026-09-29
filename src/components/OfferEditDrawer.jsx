import { useState } from 'react'
import {
  X, Loader2, Save, Plus, Trash2, ChevronUp, ChevronDown, ChevronRight,
} from 'lucide-react'
import { slugify } from '../hooks/useOffers'
import {
  SECTION_TYPES, defaultSectionOfType, labelForType,
} from '../lib/offerSections'

/**
 * Full offer editor.
 *
 * Top: header fields (name/slug/subtitle/summary/price/position/active)
 * Middle: ordered section list, each collapsible. Per-section editor is
 *         dispatched by `type` inside SectionEditor.
 * Bottom: Save / Delete.
 */
export default function OfferEditDrawer({ mode, offer, onClose, onSave, onDelete }) {
  const isCreate = mode === 'create'
  const [name,      setName]      = useState(offer?.name || '')
  const [slug,      setSlug]      = useState(offer?.slug || '')
  const [slugDirty, setSlugDirty] = useState(!isCreate)
  const [subtitle,  setSubtitle]  = useState(offer?.subtitle || '')
  const [summary,   setSummary]   = useState(offer?.summary  || '')
  const [priceHeadline, setPriceHeadline] = useState(offer?.priceHeadline || '')
  const [priceNote,     setPriceNote]     = useState(offer?.priceNote     || '')
  const [sections, setSections] = useState(offer?.sections || [])
  const [position, setPosition] = useState(String(offer?.position ?? 0))
  const [active,   setActive]   = useState(offer ? !!offer.active : true)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [err, setErr] = useState(null)
  const [openIdx, setOpenIdx] = useState(0)

  function onNameChange(v) {
    setName(v)
    if (!slugDirty) setSlug(slugify(v))
  }

  function addSection(typeKey) {
    setSections([...sections, defaultSectionOfType(typeKey)])
    setOpenIdx(sections.length)
  }

  function updateSection(i, next) {
    const copy = sections.slice()
    copy[i] = next
    setSections(copy)
  }

  function removeSection(i) {
    setSections(sections.filter((_, j) => j !== i))
    if (openIdx === i) setOpenIdx(-1)
  }

  function moveSection(i, dir) {
    const j = i + dir
    if (j < 0 || j >= sections.length) return
    const copy = sections.slice()
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
    setSections(copy)
    setOpenIdx(j)
  }

  async function save() {
    if (!name.trim()) { setErr('Give the offer a name.'); return }
    setSaving(true); setErr(null)
    const eErr = await onSave({
      name: name.trim(),
      slug: slug.trim(),
      subtitle: subtitle.trim(),
      summary: summary.trim(),
      priceHeadline: priceHeadline.trim(),
      priceNote: priceNote.trim(),
      sections,
      position: Number(position) || 0,
      active,
    })
    setSaving(false)
    if (eErr) { setErr(eErr); return }
    onClose()
  }

  async function del() {
    if (!onDelete) return
    if (!window.confirm(`Delete offer "${offer.name}"? This cannot be undone.`)) return
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
        className="w-full sm:max-w-3xl bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white px-5 py-3 border-b border-gray-100 flex items-center justify-between z-10">
          <h2 className="text-base font-bold text-gray-900">
            {isCreate ? 'New offer' : `Edit ${offer.name}`}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* ── header fields ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Name">
              <input
                value={name} onChange={e => onNameChange(e.target.value)}
                placeholder="3 Month Scholarship"
                className={inputCls}
              />
            </Field>
            <Field label="Slug (URL)">
              <input
                value={slug} onChange={e => { setSlugDirty(true); setSlug(e.target.value) }}
                placeholder="3-month-scholarship"
                className={`${inputCls} font-mono`}
              />
            </Field>
          </div>

          <Field label="Subtitle">
            <input
              value={subtitle} onChange={e => setSubtitle(e.target.value)}
              placeholder="Short pitch shown under the name"
              className={inputCls}
            />
          </Field>

          <Field label="Summary paragraph (renders under header)">
            <textarea
              value={summary} onChange={e => setSummary(e.target.value)}
              rows={3}
              placeholder="One paragraph that frames the offer."
              className={textareaCls}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Price headline">
              <input
                value={priceHeadline} onChange={e => setPriceHeadline(e.target.value)}
                placeholder="$4,000"
                className={inputCls}
              />
            </Field>
            <Field label="Price note">
              <input
                value={priceNote} onChange={e => setPriceNote(e.target.value)}
                placeholder="per month, flat, all clubs · $0 setup"
                className={inputCls}
              />
            </Field>
          </div>

          {/* ── sections list ─────────────────────────────────────────── */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">
              Sections ({sections.length})
            </div>
            <div className="space-y-2">
              {sections.map((s, i) => (
                <SectionCard
                  key={i}
                  index={i}
                  section={s}
                  open={openIdx === i}
                  canMoveUp={i > 0}
                  canMoveDown={i < sections.length - 1}
                  onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
                  onChange={(next) => updateSection(i, next)}
                  onRemove={() => removeSection(i)}
                  onMoveUp={() => moveSection(i, -1)}
                  onMoveDown={() => moveSection(i, 1)}
                />
              ))}
              {sections.length === 0 && (
                <div className="text-sm text-gray-500 italic bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4 text-center">
                  No sections yet. Add one below.
                </div>
              )}
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-dashed border-gray-300 text-xs text-gray-700 hover:border-gray-400">
                <Plus className="w-3.5 h-3.5" /> Add section
              </summary>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-gray-50 border border-gray-100 rounded-lg p-2">
                {SECTION_TYPES.map(t => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => addSection(t.key)}
                    className="text-left px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 text-sm"
                  >
                    <div className="font-semibold text-gray-900">{t.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t.description}</div>
                  </button>
                ))}
              </div>
            </details>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Sort position">
              <input
                type="number" value={position} onChange={e => setPosition(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Active">
              <label className="inline-flex items-center gap-2 h-10">
                <input
                  type="checkbox" checked={active} onChange={e => setActive(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm text-gray-700">Show in lists</span>
              </label>
            </Field>
          </div>

          {err && <div className="text-sm text-rose-700">{err}</div>}
        </div>

        <div className="sticky bottom-0 bg-white px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            {!isCreate && onDelete && (
              <button onClick={del} disabled={deleting || saving}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="h-9 px-3 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Cancel</button>
            <button onClick={save} disabled={saving}
              className="h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── SectionCard: collapsible container per section ──────────────────────────

function SectionCard({ index, section, open, canMoveUp, canMoveDown, onToggle, onChange, onRemove, onMoveUp, onMoveDown }) {
  const title =
    section.heading ||
    section.text?.slice(0, 60) ||
    `Section ${index + 1}`
  return (
    <div className="border border-gray-200 rounded-xl bg-white">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-gray-100"
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          {open ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
        </button>
        <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
          {labelForType(section.type)}
        </span>
        <div className="text-sm text-gray-900 truncate flex-1">{title}</div>
        <button onClick={onMoveUp} disabled={!canMoveUp}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30" aria-label="Move up">
          <ChevronUp className="w-4 h-4 text-gray-600" />
        </button>
        <button onClick={onMoveDown} disabled={!canMoveDown}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30" aria-label="Move down">
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </button>
        <button onClick={onRemove}
          className="p-1 rounded hover:bg-rose-50 text-rose-600" aria-label="Remove section">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {open && (
        <div className="border-t border-gray-100 p-3 space-y-3">
          <SectionEditor section={section} onChange={onChange} />
        </div>
      )}
    </div>
  )
}

// ── SectionEditor: type-dispatching editor ──────────────────────────────────

function SectionEditor({ section, onChange }) {
  const set = (patch) => onChange({ ...section, ...patch })
  switch (section.type) {
    case 'stance':
      return (
        <>
          <SubField label="Heading">
            <input value={section.heading || ''} onChange={e => set({ heading: e.target.value })} className={inputCls} />
          </SubField>
          <StringListEditor label="Paragraphs" items={section.paragraphs || []}
            setItems={items => set({ paragraphs: items })} placeholder="One paragraph" multiline />
          <KvListEditor label="Facts (right column)" items={section.facts || []}
            setItems={items => set({ facts: items })} labelPh="Cohort size" valuePh="6 seats / quarter" />
        </>
      )
    case 'bullets':
      return (
        <>
          <SubField label="Heading">
            <input value={section.heading || ''} onChange={e => set({ heading: e.target.value })} className={inputCls} />
          </SubField>
          <SubField label="Intro (optional)">
            <input value={section.intro || ''} onChange={e => set({ intro: e.target.value })} className={inputCls} />
          </SubField>
          <StringListEditor label="Bullets" items={section.items || []}
            setItems={items => set({ items })} placeholder="One deliverable" />
        </>
      )
    case 'chapters':
      return (
        <>
          <SubField label="Heading">
            <input value={section.heading || ''} onChange={e => set({ heading: e.target.value })} className={inputCls} />
          </SubField>
          <SubField label="Intro (optional)">
            <input value={section.intro || ''} onChange={e => set({ intro: e.target.value })} className={inputCls} />
          </SubField>
          <RepeaterEditor
            label="Chapters"
            items={section.items || []}
            setItems={items => set({ items })}
            blank={() => ({ number: '', title: '', poweredBy: '', tagline: '', bullets: [''] })}
            renderItem={(it, upd) => (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <input value={it.number} onChange={e => upd({ ...it, number: e.target.value })} placeholder="01" className={`${inputCls} font-mono`} />
                  <input value={it.title} onChange={e => upd({ ...it, title: e.target.value })} placeholder="Chapter title" className={`${inputCls} col-span-2`} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={it.poweredBy || ''} onChange={e => upd({ ...it, poweredBy: e.target.value })} placeholder="Powered by (Bizsync / Sterling / …)" className={inputCls} />
                  <input value={it.tagline || ''} onChange={e => upd({ ...it, tagline: e.target.value })} placeholder="One-line tagline" className={inputCls} />
                </div>
                <StringListEditor label="Bullets" items={it.bullets || []}
                  setItems={next => upd({ ...it, bullets: next })} placeholder="One deliverable" />
                <input value={it.footer || ''} onChange={e => upd({ ...it, footer: e.target.value })} placeholder="Footer note (optional)" className={inputCls} />
              </>
            )}
          />
        </>
      )
    case 'streams':
      return (
        <>
          <SubField label="Heading">
            <input value={section.heading || ''} onChange={e => set({ heading: e.target.value })} className={inputCls} />
          </SubField>
          <SubField label="Intro (optional)">
            <input value={section.intro || ''} onChange={e => set({ intro: e.target.value })} className={inputCls} />
          </SubField>
          <RepeaterEditor
            label="Streams"
            items={section.items || []}
            setItems={items => set({ items })}
            blank={() => ({ name: '', style: '', bullets: [''] })}
            renderItem={(it, upd) => (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <input value={it.name} onChange={e => upd({ ...it, name: e.target.value })} placeholder="Stream name" className={inputCls} />
                  <input value={it.style || ''} onChange={e => upd({ ...it, style: e.target.value })} placeholder="Style / subtitle" className={inputCls} />
                </div>
                <StringListEditor label="Bullets" items={it.bullets || []}
                  setItems={next => upd({ ...it, bullets: next })} placeholder="One point" />
              </>
            )}
          />
        </>
      )
    case 'terms':
      return (
        <>
          <SubField label="Heading">
            <input value={section.heading || ''} onChange={e => set({ heading: e.target.value })} className={inputCls} />
          </SubField>
          <SubField label="Intro (optional)">
            <input value={section.intro || ''} onChange={e => set({ intro: e.target.value })} className={inputCls} />
          </SubField>
          <RepeaterEditor
            label="Term blocks"
            items={section.blocks || []}
            setItems={blocks => set({ blocks })}
            blank={() => ({ headline: '', amount: '', unitNote: '', bullets: [''] })}
            renderItem={(b, upd) => (
              <>
                <input value={b.headline} onChange={e => upd({ ...b, headline: e.target.value })} placeholder="Fee / Commissions / …" className={inputCls} />
                <div className="grid grid-cols-2 gap-2">
                  <input value={b.amount || ''} onChange={e => upd({ ...b, amount: e.target.value })} placeholder="$4,000" className={inputCls} />
                  <input value={b.unitNote || ''} onChange={e => upd({ ...b, unitNote: e.target.value })} placeholder="per month, flat" className={inputCls} />
                </div>
                <StringListEditor label="Details" items={b.bullets || []}
                  setItems={next => upd({ ...b, bullets: next })} placeholder="One term detail" />
              </>
            )}
          />
        </>
      )
    case 'table':
      return (
        <>
          <SubField label="Heading">
            <input value={section.heading || ''} onChange={e => set({ heading: e.target.value })} className={inputCls} />
          </SubField>
          <SubField label="Intro (optional)">
            <input value={section.intro || ''} onChange={e => set({ intro: e.target.value })} className={inputCls} />
          </SubField>
          <TableEditor section={section} onChange={onChange} />
          <SubField label="Footer (optional)">
            <input value={section.footer || ''} onChange={e => set({ footer: e.target.value })} className={inputCls} />
          </SubField>
        </>
      )
    case 'playbook':
      return (
        <>
          <SubField label="Heading">
            <input value={section.heading || ''} onChange={e => set({ heading: e.target.value })} className={inputCls} />
          </SubField>
          <SubField label="Intro (optional)">
            <input value={section.intro || ''} onChange={e => set({ intro: e.target.value })} className={inputCls} />
          </SubField>
          <RepeaterEditor
            label="Rows"
            items={section.rows || []}
            setItems={rows => set({ rows })}
            blank={() => ({ moment: '', say: '' })}
            renderItem={(r, upd) => (
              <>
                <input value={r.moment} onChange={e => upd({ ...r, moment: e.target.value })} placeholder="Moment (Opening / …)" className={inputCls} />
                <textarea value={r.say} onChange={e => upd({ ...r, say: e.target.value })} rows={2} placeholder="What to say in that moment" className={textareaCls} />
              </>
            )}
          />
        </>
      )
    case 'notes':
      return (
        <>
          <SubField label="Heading">
            <input value={section.heading || ''} onChange={e => set({ heading: e.target.value })} className={inputCls} />
          </SubField>
          <StringListEditor label="Notes" items={section.items || []}
            setItems={items => set({ items })} placeholder="One note or guardrail" multiline />
        </>
      )
    case 'provenance':
      return (
        <SubField label="Provenance text">
          <textarea value={section.text || ''} onChange={e => set({ text: e.target.value })}
            rows={3} placeholder="Source, date, caveats." className={textareaCls} />
        </SubField>
      )
    default:
      return (
        <div className="text-xs text-gray-500 italic">
          No editor available for section type <code>{section.type}</code>.
        </div>
      )
  }
}

// ── small primitives ────────────────────────────────────────────────────────

const inputCls    = 'w-full h-9 rounded-lg border border-gray-200 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
const textareaCls = 'w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

function Field({ label, children }) {
  return (
    <div>
      <div className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">{label}</div>
      {children}
    </div>
  )
}

function SubField({ label, children }) {
  return (
    <div>
      <div className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">{label}</div>
      {children}
    </div>
  )
}

function StringListEditor({ label, items, setItems, placeholder, multiline }) {
  function upd(i, v) { const c = items.slice(); c[i] = v; setItems(c) }
  function rm(i) { setItems(items.filter((_, j) => j !== i)) }
  return (
    <SubField label={label}>
      <div className="space-y-1.5">
        {items.map((v, i) => (
          <div key={i} className="flex items-start gap-1.5">
            {multiline ? (
              <textarea value={v} onChange={e => upd(i, e.target.value)} rows={2}
                placeholder={placeholder}
                className={textareaCls} />
            ) : (
              <input value={v} onChange={e => upd(i, e.target.value)} placeholder={placeholder} className={inputCls} />
            )}
            <button onClick={() => rm(i)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 shrink-0" aria-label="Remove">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={() => setItems([...items, ''])}
          className="inline-flex items-center gap-1 h-7 px-2 rounded-lg border border-dashed border-gray-300 text-xs text-gray-700 hover:border-gray-400">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
    </SubField>
  )
}

function KvListEditor({ label, items, setItems, labelPh, valuePh }) {
  function upd(i, next) { const c = items.slice(); c[i] = next; setItems(c) }
  function rm(i) { setItems(items.filter((_, j) => j !== i)) }
  return (
    <SubField label={label}>
      <div className="space-y-1.5">
        {items.map((r, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <input value={r.label} onChange={e => upd(i, { ...r, label: e.target.value })}
              placeholder={labelPh} className={`${inputCls} w-40`} />
            <input value={r.value} onChange={e => upd(i, { ...r, value: e.target.value })}
              placeholder={valuePh} className={`${inputCls} flex-1`} />
            <button onClick={() => rm(i)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50" aria-label="Remove">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={() => setItems([...items, { label: '', value: '' }])}
          className="inline-flex items-center gap-1 h-7 px-2 rounded-lg border border-dashed border-gray-300 text-xs text-gray-700 hover:border-gray-400">
          <Plus className="w-3 h-3" /> Add row
        </button>
      </div>
    </SubField>
  )
}

function RepeaterEditor({ label, items, setItems, blank, renderItem }) {
  function upd(i, next) { const c = items.slice(); c[i] = next; setItems(c) }
  function rm(i) { setItems(items.filter((_, j) => j !== i)) }
  function move(i, dir) {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const c = items.slice();[c[i], c[j]] = [c[j], c[i]]; setItems(c)
  }
  return (
    <SubField label={label}>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-2 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Item {i + 1}</div>
              <div className="flex items-center gap-0.5">
                <button onClick={() => move(i, -1)} disabled={i === 0}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30" aria-label="Move up">
                  <ChevronUp className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === items.length - 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30" aria-label="Move down">
                  <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <button onClick={() => rm(i)} className="p-1 rounded hover:bg-rose-50 text-rose-600" aria-label="Remove">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {renderItem(it, next => upd(i, next))}
          </div>
        ))}
        <button onClick={() => setItems([...items, blank()])}
          className="inline-flex items-center gap-1 h-7 px-2 rounded-lg border border-dashed border-gray-300 text-xs text-gray-700 hover:border-gray-400">
          <Plus className="w-3 h-3" /> Add item
        </button>
      </div>
    </SubField>
  )
}

function TableEditor({ section, onChange }) {
  const cols = section.columns || []
  const rows = section.rows || []
  function setCols(next) { onChange({ ...section, columns: next }) }
  function setRows(next) { onChange({ ...section, rows: next }) }
  function updCol(i, v) { const c = cols.slice(); c[i] = v; setCols(c) }
  function rmCol(i) {
    setCols(cols.filter((_, j) => j !== i))
    setRows(rows.map(r => r.filter((_, j) => j !== i)))
  }
  function addCol() {
    setCols([...cols, ''])
    setRows(rows.map(r => [...r, '']))
  }
  function updCell(r, c, v) {
    const copy = rows.map(row => row.slice())
    copy[r][c] = v
    setRows(copy)
  }
  function addRow() { setRows([...rows, cols.map(() => '')]) }
  function rmRow(i) { setRows(rows.filter((_, j) => j !== i)) }
  return (
    <SubField label="Table">
      <div className="space-y-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {cols.map((col, i) => (
            <div key={i} className="flex items-center gap-1">
              <input value={col} onChange={e => updCol(i, e.target.value)} placeholder={`Col ${i + 1}`}
                className={`${inputCls} w-32 text-xs`} />
              <button onClick={() => rmCol(i)} className="p-1 rounded text-rose-600 hover:bg-rose-50" aria-label="Remove column">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button onClick={addCol} className="inline-flex items-center gap-1 h-7 px-2 rounded-lg border border-dashed border-gray-300 text-xs text-gray-700 hover:border-gray-400">
            <Plus className="w-3 h-3" /> Col
          </button>
        </div>
        {rows.map((row, r) => (
          <div key={r} className="flex items-center gap-1.5">
            {row.map((cell, c) => (
              <input key={c} value={cell} onChange={e => updCell(r, c, e.target.value)}
                placeholder={cols[c] || `Col ${c + 1}`}
                className={`${inputCls} w-32 text-xs`} />
            ))}
            <button onClick={() => rmRow(r)} className="p-1 rounded text-rose-600 hover:bg-rose-50" aria-label="Remove row">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button onClick={addRow} className="inline-flex items-center gap-1 h-7 px-2 rounded-lg border border-dashed border-gray-300 text-xs text-gray-700 hover:border-gray-400">
          <Plus className="w-3 h-3" /> Row
        </button>
      </div>
    </SubField>
  )
}
