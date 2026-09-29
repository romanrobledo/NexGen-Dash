import { useEffect, useRef, useState } from 'react'
import {
  X,
  Loader2,
  Trash2,
  AlertCircle,
  Upload,
  FileText,
  ExternalLink,
} from 'lucide-react'
import { DOC_TYPES_BY_KEY } from '../lib/familyDocumentTypes'

/**
 * Add / replace / edit / delete one family_document row.
 *
 * Modes:
 *   * 'upload' — no doc exists yet. Requires file, may set expires_at + notes.
 *                Uploads to Supabase Storage and inserts the DB row.
 *   * 'edit'   — a doc already exists. File can be replaced (optional);
 *                expires_at + notes are always editable; can delete.
 *
 * Parent owns close + refetch. onSaved fires after any successful write
 * so the paperwork tab can refetch and close the drawer.
 *
 * @param {{
 *   open: boolean,
 *   docType: string,             // the key from familyDocumentTypes.js
 *   childId?: string | null,     // null = family-scoped doc
 *   childLabel?: string,         // for the drawer header when child-scoped
 *   existing?: import('../hooks/useFamilyDocuments').FamilyDocument | null,
 *   onClose: () => void,
 *   onSaved: () => void,
 *   uploader: {
 *     uploadDocument: (file: File, opts: any) => Promise<{data, error}>,
 *     updateDocument: (id: string, patch: any) => Promise<{data, error}>,
 *     deleteDocument: (doc: any) => Promise<{error}>,
 *     getSignedUrl: (doc: any) => Promise<{url, error}>,
 *     uploading: boolean,
 *   }
 * }} props
 */
export default function PaperworkUploadDrawer({
  open,
  docType,
  childId = null,
  childLabel,
  existing,
  onClose,
  onSaved,
  uploader,
}) {
  const type = DOC_TYPES_BY_KEY[docType]
  const inputRef = useRef(null)
  const [file, setFile] = useState(/** @type {File|null} */ (null))
  const [expiresAt, setExpiresAt] = useState('')
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState(/** @type {string|null} */ (null))
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!open) return
    setFile(null)
    setFormError(null)
    setConfirmDelete(false)
    if (existing) {
      setExpiresAt(existing.expiresAt ? existing.expiresAt.slice(0, 10) : '')
      setNotes(existing.notes || '')
    } else {
      setExpiresAt('')
      setNotes('')
    }
  }, [open, existing])

  if (!open || !type) return null

  const mode = existing ? 'edit' : 'upload'

  async function handleSave() {
    setFormError(null)
    setPending(true)
    try {
      if (mode === 'upload') {
        if (!file) {
          setFormError('Pick a PDF to upload.')
          return
        }
        const { error: upErr } = await uploader.uploadDocument(file, {
          doc_type: docType,
          child_id: childId,
          expires_at: expiresAt || null,
          notes: notes || null,
        })
        if (upErr) { setFormError(upErr); return }
        onSaved()
        return
      }

      // Edit mode:
      // 1. If a new file was picked, re-upload — that replaces both the
      //    storage object and the DB row (uploadDocument handles the swap).
      // 2. Otherwise just update expires_at + notes.
      if (file) {
        const { error: upErr } = await uploader.uploadDocument(file, {
          doc_type: docType,
          child_id: childId,
          expires_at: expiresAt || null,
          notes: notes || null,
        })
        if (upErr) { setFormError(upErr); return }
      } else {
        const { error: uErr } = await uploader.updateDocument(existing.id, {
          expires_at: expiresAt || null,
          notes: notes || null,
        })
        if (uErr) { setFormError(uErr); return }
      }
      onSaved()
    } finally {
      setPending(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setPending(true)
    setFormError(null)
    try {
      const { error: dErr } = await uploader.deleteDocument(existing)
      if (dErr) { setFormError(dErr); return }
      onSaved()
    } finally {
      setPending(false)
    }
  }

  async function handleView() {
    if (!existing) return
    const { url, error: sErr } = await uploader.getSignedUrl(existing)
    if (sErr) { setFormError(sErr); return }
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <aside
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-md bg-white shadow-2xl flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <header className="px-5 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-gray-900">
              {mode === 'edit' ? 'Update' : 'Upload'} {type.label}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500">
            {childLabel ? `For ${childLabel} — ` : 'Family-scoped — '}
            {type.description}
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {existing && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{existing.fileName}</p>
                <p className="text-[11px] text-gray-500">
                  Uploaded {fmtDateTime(existing.uploadedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleView}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-xs font-semibold text-blue-700 hover:bg-white border border-gray-200"
              >
                View
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          <Field label={mode === 'edit' ? 'Replace file (optional)' : 'PDF file'} required={mode === 'upload'}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full flex items-center gap-3 h-12 px-3 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/30 text-sm text-gray-600 transition"
            >
              <Upload className="w-4 h-4 text-gray-400" />
              <span className="truncate">
                {file ? file.name : mode === 'edit' ? 'Pick a new PDF to replace the current one' : 'Choose a PDF (max 15 MB)'}
              </span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </Field>

          {type.expires && (
            <Field label="Expires on" hint="Leave blank if this doc doesn't expire.">
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </Field>
          )}

          <Field label="Notes">
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              placeholder="Anything to remember about this doc…"
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
              disabled={pending || uploader.uploading}
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
              disabled={pending || uploader.uploading}
              className="h-10 px-4 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={pending || uploader.uploading}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
            >
              {(pending || uploader.uploading) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {mode === 'edit' ? 'Save changes' : 'Upload'}
            </button>
          </div>
        </footer>
      </aside>
    </>
  )
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

function fmtDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    })
  } catch { return iso }
}
