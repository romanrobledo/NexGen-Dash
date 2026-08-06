import { useState, useRef } from 'react'
import {
  Upload,
  Image as ImageIcon,
  Video,
  X,
  Info,
  CheckCircle2,
} from 'lucide-react'
import { useCampaigns } from '../hooks/useCampaigns'
import { useCalendarEvents } from '../hooks/useCalendarEvents'

/**
 * Marketing → Upload — route: /marketing/upload.
 *
 * The landing pad content creators drop shot files onto after a shoot.
 * Files fan out to Google Drive (and any other targets) via a n8n
 * webhook so we don't own storage in Supabase.
 *
 * Two-phase build:
 *   Phase 1 (this file) — full UI: drag/drop, preview strip, metadata
 *     fields, submit button. The submit is a stub that POSTs the file
 *     list + metadata to `VITE_CONTENT_UPLOAD_WEBHOOK` if set, and
 *     otherwise logs to the console for local inspection.
 *   Phase 2 — build the n8n workflow that receives the payload, writes
 *     each file to a dated Drive folder (Campaign/YYYY-MM-DD/), and
 *     writes a row to a `content_uploads` audit table in Supabase.
 */

const UPLOAD_WEBHOOK =
  import.meta.env.VITE_CONTENT_UPLOAD_WEBHOOK || ''

export default function UploadPage() {
  const [files, setFiles] = useState(/** @type {File[]} */ ([]))
  const [campaignId, setCampaignId] = useState('')
  const [eventId, setEventId] = useState('')
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState(/** @type {null | {tone: 'success'|'error', text: string}} */ (null))
  const inputRef = useRef(null)

  // Both dropdowns read directly from Supabase — no hardcoded lists. If
  // either table is empty the select shows just the "None" default and
  // creators upload untagged (still safe; n8n falls back to an "Untagged"
  // folder in Drive).
  const { campaigns } = useCampaigns()
  const { events } = useCalendarEvents('events')

  function handleFiles(fileList) {
    if (!fileList) return
    const arr = Array.from(fileList).filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
    )
    setFiles((prev) => [...prev, ...arr])
  }

  function removeFile(idx) {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit() {
    if (files.length === 0) {
      setStatus({ tone: 'error', text: 'Pick at least one photo or video first.' })
      return
    }
    setUploading(true)
    setStatus(null)

    const metadata = {
      submittedAt: new Date().toISOString(),
      campaignId: campaignId || null,
      eventId: eventId || null,
      notes: notes || '',
      fileCount: files.length,
      totalBytes: files.reduce((sum, f) => sum + f.size, 0),
      fileNames: files.map((f) => f.name),
    }

    if (!UPLOAD_WEBHOOK) {
      // eslint-disable-next-line no-console
      console.log('[Upload] payload (webhook not set):', { metadata, files })
      await new Promise((r) => setTimeout(r, 500))
      setUploading(false)
      setStatus({
        tone: 'success',
        text:
          'Simulated upload — set VITE_CONTENT_UPLOAD_WEBHOOK in Vercel to actually send to Drive.',
      })
      setFiles([])
      return
    }

    try {
      const body = new FormData()
      files.forEach((f, i) => body.append(`file_${i}`, f, f.name))
      body.append('metadata', JSON.stringify(metadata))
      const res = await fetch(UPLOAD_WEBHOOK, { method: 'POST', body })
      if (!res.ok) throw new Error(`Webhook returned ${res.status}`)
      setStatus({
        tone: 'success',
        text: `${files.length} file${files.length === 1 ? '' : 's'} sent to Drive.`,
      })
      setFiles([])
      setNotes('')
    } catch (err) {
      setStatus({
        tone: 'error',
        text: err?.message?.includes('Failed to fetch')
          ? "Couldn't reach the upload webhook. Check n8n workflow + env var."
          : `Upload failed: ${err?.message || 'unknown error'}`,
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Upload Content
            </h2>
            <p className="text-gray-500 mt-0.5 text-sm">
              Drop photos and videos here after a shoot. They route to Google
              Drive automatically via the content upload webhook.
            </p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-emerald-800 leading-relaxed">
          <strong className="font-semibold">Files land in Google Drive</strong>{' '}
          via a n8n webhook. Tag each upload with the campaign or event it
          belongs to so the file gets sorted into the right dated folder
          automatically.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-emerald-400 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
          <Upload className="w-7 h-7 text-emerald-500" />
        </div>
        <p className="text-sm font-semibold text-gray-900 mb-1">
          Drag &amp; drop photos or videos here
        </p>
        <p className="text-xs text-gray-500 mb-4">
          or click to pick files from this device
        </p>
        <button
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Upload className="w-4 h-4" />
          Choose files
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Preview strip */}
      {files.length > 0 && (
        <div className="mt-5 bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-3">
            Queued files ({files.length})
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {files.map((f, i) => (
              <FileTile key={`${f.name}-${i}`} file={f} onRemove={() => removeFile(i)} />
            ))}
          </ul>
        </div>
      )}

      {/* Metadata form */}
      <div className="mt-5 bg-white border border-gray-200 rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-3">
          Tag this upload
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Campaign (optional)
            </label>
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
            >
              <option value="">— None —</option>
              {campaigns.length === 0 && (
                <option value="" disabled>
                  No campaigns yet
                </option>
              )}
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Event (optional)
            </label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
            >
              <option value="">— None —</option>
              {events.length === 0 && (
                <option value="" disabled>
                  No events yet
                </option>
              )}
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Anything the marketing team should know about these shots — angles, lighting notes, follow-up needed, etc."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none resize-none"
        />
      </div>

      {/* Submit */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-end gap-3">
        {status && (
          <p
            className={`text-xs flex items-center gap-1.5 ${
              status.tone === 'error' ? 'text-red-600' : 'text-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {status.text}
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={uploading || files.length === 0}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading…' : `Upload ${files.length || ''}`.trim()}
        </button>
      </div>
    </div>
  )
}

// ─── File tile ───────────────────────────────────────────────────────────────

function FileTile({ file, onRemove }) {
  const isImage = file.type.startsWith('image/')
  const Icon = isImage ? ImageIcon : Video
  return (
    <li className="relative bg-gray-50 border border-gray-200 rounded-lg p-3 group">
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 p-1 rounded bg-white/80 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove"
      >
        <X className="w-3 h-3" />
      </button>
      <div className="flex items-center gap-2 mb-1">
        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
            isImage ? 'bg-purple-100' : 'bg-orange-100'
          }`}
        >
          <Icon
            className={`w-3.5 h-3.5 ${
              isImage ? 'text-purple-600' : 'text-orange-600'
            }`}
          />
        </div>
        <p className="text-[11px] font-semibold text-gray-900 truncate flex-1">
          {file.name}
        </p>
      </div>
      <p className="text-[10px] text-gray-500 tabular-nums">
        {formatBytes(file.size)}
      </p>
    </li>
  )
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
