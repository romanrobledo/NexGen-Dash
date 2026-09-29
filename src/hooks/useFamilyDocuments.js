import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const BUCKET = 'family-documents'
const MAX_BYTES = 15 * 1024 * 1024 // 15 MB — same cap as bank statements
const SIGNED_URL_TTL = 60 * 60      // 1 hour

/**
 * Load documents for one family, with mutations for upload / delete /
 * update. Modeled on useBankStatements.
 *
 * Return shape:
 *   docs, loading, error, refetch,
 *   uploadDocument(file, opts), updateDocument(id, patch),
 *   deleteDocument(doc), getSignedUrl(doc),
 *   uploading, uploadError
 *
 * uploadDocument contract:
 *   opts = { doc_type, child_id?, expires_at?, notes? }
 *   returns { data, error }
 *   • If a doc of the same (family, doc_type) or (child, doc_type) scope
 *     already exists, this REPLACES it: uploads the new file, updates
 *     the DB row, and removes the OLD storage object. If either the
 *     upload or the DB write fails, no changes stick.
 *   • PDF only (MIME + extension check).
 *   • 15 MB cap.
 *
 * File path convention:
 *   {family_id}/{child_id || 'family'}/{doc_type}/{timestamp}-{cleanName}.pdf
 */
export function useFamilyDocuments(familyId) {
  const [docs, setDocs] = useState(/** @type {FamilyDocument[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(/** @type {string|null} */ (null))
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(/** @type {string|null} */ (null))

  const fetchDocs = useCallback(async () => {
    if (!supabase || !familyId) {
      setDocs([])
      setLoading(false)
      return
    }
    try {
      setError(null)
      const { data, error: qErr } = await supabase
        .from('family_documents')
        .select('id, family_id, child_id, doc_type, file_path, file_name, expires_at, notes, uploaded_by, uploaded_at')
        .eq('family_id', familyId)
        .order('doc_type', { ascending: true })
      if (qErr) {
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn('[useFamilyDocuments] family_documents missing; treating as empty')
          setDocs([])
          return
        }
        throw qErr
      }
      setDocs((data || []).map(mapRow))
    } catch (err) {
      console.error('[useFamilyDocuments] fetch failed:', err?.message || err)
      setError(err?.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [familyId])

  useEffect(() => {
    setLoading(true)
    fetchDocs()
  }, [fetchDocs])

  async function uploadDocument(file, opts) {
    if (!supabase) return { data: null, error: 'Supabase not configured' }
    if (!familyId) return { data: null, error: 'Missing family id' }
    if (!file) return { data: null, error: 'No file selected' }
    if (!opts?.doc_type) return { data: null, error: 'Missing doc type' }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return { data: null, error: 'PDF only. Export or scan as PDF and try again.' }
    }
    if (file.size > MAX_BYTES) {
      return { data: null, error: `File is too large (max ${MAX_BYTES / (1024 * 1024)} MB).` }
    }

    setUploading(true)
    setUploadError(null)

    const scopeDir = opts.child_id || 'family'
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${familyId}/${scopeDir}/${opts.doc_type}/${Date.now()}-${cleanName}`

    // If there's an existing doc for the same scope, remember its path so
    // we can clean the OLD file from storage after a successful swap.
    const existing = docs.find((d) =>
      d.docType === opts.doc_type &&
      (opts.child_id
        ? d.childId === opts.child_id
        : d.childId == null)
    )

    try {
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf',
        })
      if (upErr) throw new Error(explainStorageError(upErr.message))

      // Upsert the DB row. Partial unique indexes on (family_id,doc_type)
      // WHERE child_id IS NULL and (child_id,doc_type) WHERE child_id IS
      // NOT NULL enforce one-per-scope, so this is the write that swaps
      // out the old row.
      const payload = {
        family_id: familyId,
        child_id: opts.child_id || null,
        doc_type: opts.doc_type,
        file_path: path,
        file_name: file.name,
        expires_at: opts.expires_at || null,
        notes: opts.notes || null,
      }

      const upsertConflict = opts.child_id
        ? 'child_id,doc_type'
        : 'family_id,doc_type'

      const { data, error: insErr } = await supabase
        .from('family_documents')
        .upsert(payload, { onConflict: upsertConflict })
        .select()
        .single()

      if (insErr) {
        // Roll back the storage upload so we don't leave an orphan.
        await supabase.storage.from(BUCKET).remove([path]).catch(() => {})
        throw new Error(insErr.message)
      }

      // Clean the OLD storage object after the DB has committed.
      if (existing && existing.filePath && existing.filePath !== path) {
        await supabase.storage.from(BUCKET).remove([existing.filePath]).catch((e) => {
          console.warn('[useFamilyDocuments] old file cleanup failed (orphan left):', e?.message || e)
        })
      }

      await fetchDocs()
      return { data: mapRow(data), error: null }
    } catch (err) {
      const msg = err?.message || 'Upload failed'
      setUploadError(msg)
      return { data: null, error: msg }
    } finally {
      setUploading(false)
    }
  }

  async function updateDocument(id, patch) {
    if (!supabase) return { data: null, error: 'Supabase not configured' }
    const { data, error: uErr } = await supabase
      .from('family_documents')
      .update({
        expires_at: patch.expires_at ?? null,
        notes: patch.notes ?? null,
      })
      .eq('id', id)
      .select()
      .single()
    if (uErr) return { data: null, error: uErr.message }
    await fetchDocs()
    return { data: mapRow(data), error: null }
  }

  async function deleteDocument(doc) {
    if (!supabase) return { error: 'Supabase not configured' }
    if (!doc?.id) return { error: 'Missing document id' }
    try {
      // Storage first so an orphan can't outlive the DB row.
      if (doc.filePath) {
        const { error: sErr } = await supabase.storage.from(BUCKET).remove([doc.filePath])
        if (sErr) console.warn('[useFamilyDocuments] storage remove warn:', sErr.message)
      }
      const { error: dErr } = await supabase
        .from('family_documents')
        .delete()
        .eq('id', doc.id)
      if (dErr) return { error: dErr.message }
      await fetchDocs()
      return { error: null }
    } catch (err) {
      return { error: err?.message || 'Delete failed' }
    }
  }

  async function getSignedUrl(doc) {
    if (!supabase || !doc?.filePath) return { url: null, error: 'Missing path' }
    const { data, error: sErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(doc.filePath, SIGNED_URL_TTL)
    if (sErr) return { url: null, error: sErr.message }
    return { url: data.signedUrl, error: null }
  }

  return {
    docs,
    loading,
    error,
    refetch: fetchDocs,
    uploadDocument,
    updateDocument,
    deleteDocument,
    getSignedUrl,
    uploading,
    uploadError,
  }
}

function explainStorageError(msg) {
  const m = String(msg || '').toLowerCase()
  if (m.includes('bucket') && m.includes('not found')) {
    return 'The family-documents storage bucket is missing. Run sql/family-documents-schema.sql to create it.'
  }
  if (m.includes('row-level security') || m.includes('policy')) {
    return 'Upload blocked by RLS — your session may not have admin permissions.'
  }
  return msg
}

function mapRow(row) {
  return {
    id: row.id,
    familyId: row.family_id,
    childId: row.child_id,
    docType: row.doc_type,
    filePath: row.file_path,
    fileName: row.file_name,
    expiresAt: row.expires_at,
    notes: row.notes,
    uploadedBy: row.uploaded_by,
    uploadedAt: row.uploaded_at,
  }
}

/**
 * @typedef {Object} FamilyDocument
 * @property {string}      id
 * @property {string}      familyId
 * @property {string|null} childId
 * @property {string}      docType
 * @property {string}      filePath
 * @property {string}      fileName
 * @property {string|null} expiresAt
 * @property {string|null} notes
 * @property {string|null} uploadedBy
 * @property {string}      uploadedAt
 */
