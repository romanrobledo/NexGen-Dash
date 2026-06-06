import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import {
  FileText,
  Upload,
  Loader2,
  Download,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

/**
 * Staff Documents — uploaded training certificates, credentials, diplomas.
 *
 * Storage strategy:
 *   - Files live in the Supabase Storage bucket `staff-documents`
 *     under the path `<staff_id>/<timestamp>-<filename>`.
 *   - Metadata lives in the `staff_documents` table (staff_id, doc_type,
 *     title, issued_date, expires_date, file_path, file_name, mime_type,
 *     uploaded_by, created_at).
 *
 * Permissions:
 *   - Anyone viewing a profile sees the document list.
 *   - The profile's owner OR any admin (admin_panel perm) can upload
 *     or delete.
 *
 * Degrades gracefully: if the bucket / table aren't set up yet, renders
 * an empty state instead of erroring out.
 */

const DOC_TYPES = [
  { value: 'training',       label: 'Training Hours Certificate' },
  { value: 'cpr',            label: 'CPR Certification' },
  { value: 'first_aid',      label: 'First Aid Certification' },
  { value: 'food_handler',   label: 'Food Handler' },
  { value: 'mandated_reporter', label: 'Mandated Reporter' },
  { value: 'cda',            label: 'CDA Credential' },
  { value: 'background',     label: 'Background Check' },
  { value: 'other',          label: 'Other' },
]

const LABEL_FOR = Object.fromEntries(DOC_TYPES.map((t) => [t.value, t.label]))

const BUCKET = 'staff-documents'

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function statusForExpiry(expires) {
  if (!expires) return null
  const days = Math.floor((new Date(expires) - new Date()) / (1000 * 60 * 60 * 24))
  if (days < 0) return { label: 'Expired', color: 'text-red-600 bg-red-50', icon: AlertCircle }
  if (days <= 30) return { label: `${days}d left`, color: 'text-yellow-700 bg-yellow-50', icon: AlertCircle }
  return { label: 'Current', color: 'text-green-700 bg-green-50', icon: CheckCircle2 }
}

function UploadModal({ staffId, onClose, onUploaded }) {
  const [docType, setDocType] = useState('training')
  const [title, setTitle] = useState('')
  const [issuedDate, setIssuedDate] = useState('')
  const [expiresDate, setExpiresDate] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const { staff: currentUser } = useAuth()
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    // 15 MB cap — matches most cert PDFs with margin to spare.
    if (f.size > 15 * 1024 * 1024) {
      setErrorMsg('File is too large (max 15 MB).')
      return
    }
    setErrorMsg(null)
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!supabase || !file || !staffId) return
    setUploading(true)
    setErrorMsg(null)

    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${staffId}/${Date.now()}-${cleanName}`

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'application/octet-stream',
        })
      if (upErr) throw upErr

      const { error: insertErr } = await supabase
        .from('staff_documents')
        .insert({
          staff_id: staffId,
          doc_type: docType,
          title: title || file.name,
          issued_date: issuedDate || null,
          expires_date: expiresDate || null,
          file_path: path,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type || null,
          uploaded_by: currentUser?.id || null,
        })
      if (insertErr) throw insertErr

      onUploaded?.()
      onClose()
    } catch (err) {
      console.error('Upload failed:', err)
      setErrorMsg(
        err?.message?.includes('bucket')
          ? 'Storage bucket not set up yet. Ask an admin to create the "staff-documents" bucket.'
          : err?.message?.includes('staff_documents')
            ? 'The staff_documents table is missing. Run the provided migration to enable uploads.'
            : err?.message || 'Upload failed.'
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Upload Certificate</h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 block">
              Document Type
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
            >
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 block">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CPR Spring 2026"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 block">
                Issued
              </label>
              <input
                type="date"
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 block">
                Expires
              </label>
              <input
                type="date"
                value={expiresDate}
                onChange={(e) => setExpiresDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 block">
              File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.heic,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left min-w-0">
                {file ? (
                  <>
                    <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-800">Choose a file</p>
                    <p className="text-xs text-gray-400">PDF, image, or document — up to 15 MB</p>
                  </>
                )}
              </div>
            </button>
          </div>

          {errorMsg && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file || !title}
              className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DocRow({ doc, onOpen, onDelete, canManage }) {
  const expiryStatus = statusForExpiry(doc.expires_date)

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
        <FileText className="w-4 h-4 text-blue-600" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-800 truncate">{doc.title}</p>
          {expiryStatus && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${expiryStatus.color}`}>
              <expiryStatus.icon className="w-3 h-3" />
              {expiryStatus.label}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate">
          {LABEL_FOR[doc.doc_type] || doc.doc_type}
          {doc.issued_date && ` · Issued ${new Date(doc.issued_date).toLocaleDateString()}`}
          {doc.expires_date && ` · Expires ${new Date(doc.expires_date).toLocaleDateString()}`}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onOpen(doc)}
          className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Download / view"
        >
          <Download className="w-4 h-4" />
        </button>
        {canManage && (
          <button
            onClick={() => onDelete(doc)}
            className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function StaffDocumentsPanel({ staffId }) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [tableMissing, setTableMissing] = useState(false)

  const { staff: currentUser, hasPermission } = useAuth()
  const isOwner = currentUser?.id && staffId && currentUser.id === staffId
  const canManage = hasPermission?.('admin_panel') || isOwner

  const fetchDocs = async () => {
    if (!supabase || !staffId) {
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('staff_documents')
        .select('*')
        .eq('staff_id', staffId)
        .order('created_at', { ascending: false })
      if (error) {
        // Table not set up yet — show an inline hint instead of erroring.
        if (/relation|does not exist|schema cache/i.test(error.message)) {
          setTableMissing(true)
          setDocs([])
          return
        }
        throw error
      }
      setTableMissing(false)
      setDocs(data || [])
    } catch (err) {
      console.warn('Documents fetch failed:', err.message)
      setDocs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId])

  const openDoc = async (doc) => {
    if (!supabase) return
    try {
      // Signed URL valid for 5 minutes — enough to view / download.
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(doc.file_path, 300)
      if (error) throw error
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.warn('Open document failed:', err.message)
      alert('Could not open this document. It may have been moved or deleted.')
    }
  }

  const deleteDoc = async (doc) => {
    if (!supabase) return
    if (!window.confirm(`Delete "${doc.title}"? This can't be undone.`)) return
    try {
      await supabase.storage.from(BUCKET).remove([doc.file_path])
      const { error } = await supabase.from('staff_documents').delete().eq('id', doc.id)
      if (error) throw error
      fetchDocs()
    } catch (err) {
      console.warn('Delete failed:', err.message)
      alert('Delete failed. Please try again.')
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Documents & Certificates</h3>
        </div>
        {canManage && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="ml-2 text-gray-500 text-sm">Loading documents...</span>
        </div>
      ) : tableMissing ? (
        <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg px-4">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <FileText className="w-4.5 h-4.5 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-gray-700">Document uploads aren't set up yet</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Run the provided SQL migration to create the{' '}
            <code className="bg-gray-50 px-1 rounded text-[11px]">staff_documents</code> table and{' '}
            <code className="bg-gray-50 px-1 rounded text-[11px]">staff-documents</code> storage bucket.
          </p>
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-gray-200 rounded-lg">
          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <FileText className="w-4.5 h-4.5 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-700">No documents uploaded yet</p>
          {canManage && (
            <p className="text-xs text-gray-400 mt-1">
              Click <span className="font-medium text-blue-600">Upload</span> to add a certificate.
            </p>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {docs.map((d) => (
            <DocRow
              key={d.id}
              doc={d}
              onOpen={openDoc}
              onDelete={deleteDoc}
              canManage={canManage}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <UploadModal
          staffId={staffId}
          onClose={() => setModalOpen(false)}
          onUploaded={fetchDocs}
        />
      )}
    </div>
  )
}
