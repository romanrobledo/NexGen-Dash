import { useState, useRef, useEffect } from 'react'
import { Check, X, Loader2 } from 'lucide-react'

/**
 * InlineEditField — shows a value; clicking Save submits a correction.
 *
 * Controlled by the parent (DomainRow) through an `editing` flag. When the
 * parent flips editing on, we render an input pre-filled with the current
 * value. Save calls onSave(newValue) → parent runs correct(rowId, newValue).
 */
export default function InlineEditField({
  value,
  type = 'text',
  placeholder = '',
  editing,
  saving,
  onSave,
  onCancel,
}) {
  const [draft, setDraft] = useState(value ?? '')
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) {
      setDraft(value ?? '')
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [editing, value])

  if (!editing) {
    return (
      <span className="text-base font-semibold text-[#1B4332] tabular-nums">
        {value != null && value !== '' ? String(value) : <span className="text-gray-300 italic font-normal">not set yet</span>}
      </span>
    )
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); onSave(draft) }
    if (e.key === 'Escape') { e.preventDefault(); onCancel() }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={saving}
        className="flex-1 min-w-0 max-w-[180px] px-3 py-1.5 text-sm bg-white border-2 border-[#52B788] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52B788]/40 focus:border-[#1B4332] transition-colors disabled:bg-gray-50 tabular-nums"
      />
      <button
        onClick={() => onSave(draft)}
        disabled={saving}
        className="shrink-0 p-1.5 rounded-lg bg-[#1B4332] text-white hover:bg-[#081C15] disabled:opacity-50 transition-colors"
        title="Save the new value"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
      </button>
      <button
        onClick={onCancel}
        disabled={saving}
        className="shrink-0 p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50 transition-colors"
        title="Cancel"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
