import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const BUCKET = 'bank-statements'
const MAX_BYTES = 15 * 1024 * 1024 // 15 MB

/**
 * Read bank_statements (newest first) + upload a PDF to the
 * bank-statements bucket + insert a pending row pointing at it.
 *
 * Upload contract:
 *   - PDF only (client-side MIME check)
 *   - Path: `{uploader_staff_id}/{timestamp}-{cleaned_filename}.pdf`
 *   - On storage upload failure → no row inserted
 *   - On storage OK but row insert failure → attempt storage.remove
 *     so we never leave orphan objects behind
 *
 * The RLS predicate current_staff_is_books_admin() gates every write.
 * Non-admin sessions will see [] and hit RLS rejections on insert.
 *
 * @returns {{
 *   statements: Statement[],
 *   loading: boolean, error: string|null,
 *   refetch: () => Promise<void>,
 *   uploadStatement: (file: File, accountId: string) => Promise<{data, error}>,
 *   uploading: boolean, uploadError: string|null,
 * }}
 */
export function useBankStatements() {
  const { staff } = useAuth()
  const [statements, setStatements] = useState(/** @type {Statement[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(/** @type {string|null} */ (null))
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(/** @type {string|null} */ (null))

  const fetchStatements = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }
    try {
      setError(null)
      const { data, error: qErr } = await supabase
        .from('bank_statements')
        .select(`
          id, account_id, period_start, period_end, statement_issued,
          opening_balance, closing_balance,
          total_deposits, total_withdrawals,
          deposit_count, withdrawal_count,
          file_path, file_name, status, reconciliation_delta,
          rejection_reason, uploaded_by, uploaded_at, processed_at,
          account:bank_accounts (
            id, institution, account_label, account_last4
          )
        `)
        .order('uploaded_at', { ascending: false })
      if (qErr) throw qErr
      setStatements((data || []).map(mapRow))
    } catch (err) {
      console.error('[useBankStatements] fetch failed:', err?.message || err)
      setError(err?.message || 'Failed to load statements')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchStatements()
  }, [fetchStatements])

  async function uploadStatement(file, accountId) {
    if (!supabase) return { data: null, error: 'Supabase not configured' }
    if (!file) return { data: null, error: 'No file selected' }
    if (!accountId) return { data: null, error: 'Pick a bank account first' }

    // Client-side validation. Server-side enforcement lives in the
    // storage bucket policy + a future n8n content-type check.
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return { data: null, error: 'PDF only. Convert or export the statement as PDF and try again.' }
    }
    if (file.size > MAX_BYTES) {
      return { data: null, error: `File is too large (max ${MAX_BYTES / (1024 * 1024)} MB).` }
    }
    if (!staff?.id) {
      return { data: null, error: 'No staff session — refresh and try again.' }
    }

    setUploading(true)
    setUploadError(null)
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${staff.id}/${Date.now()}-${cleanName}`

    try {
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf',
        })
      if (upErr) {
        throw new Error(explainStorageError(upErr.message))
      }

      const insertPayload = {
        account_id: accountId,
        file_path: path,
        file_name: file.name,
        status: 'pending',
        uploaded_by: staff.id,
        // period_start / period_end intentionally NULL — parser fills them.
      }
      const { data, error: insErr } = await supabase
        .from('bank_statements')
        .insert(insertPayload)
        .select(`
          id, account_id, period_start, period_end, file_path, file_name,
          status, uploaded_by, uploaded_at,
          account:bank_accounts ( id, institution, account_label, account_last4 )
        `)
        .single()

      if (insErr) {
        // Metadata write failed — try to clean up the storage object so
        // we don't leave orphans. Best-effort; if cleanup errors we
        // surface both problems to the caller for manual triage.
        const { error: cleanupErr } = await supabase.storage
          .from(BUCKET)
          .remove([path])
        if (cleanupErr) {
          console.warn(
            '[useBankStatements] insert failed AND cleanup failed. Orphan object at',
            path,
            'cleanup error:',
            cleanupErr.message
          )
          throw new Error(
            `Insert failed (${insErr.message}) and cleanup of the uploaded file at ${path} also failed. ` +
            'The file will need to be removed manually from Supabase storage.'
          )
        }
        throw new Error(insErr.message)
      }

      await fetchStatements()
      return { data: mapRow(data), error: null }
    } catch (err) {
      const msg = err?.message || 'Upload failed'
      setUploadError(msg)
      console.error('[useBankStatements] uploadStatement failed:', msg)
      return { data: null, error: msg }
    } finally {
      setUploading(false)
    }
  }

  return {
    statements,
    loading,
    error,
    refetch: fetchStatements,
    uploadStatement,
    uploading,
    uploadError,
  }
}

function explainStorageError(msg) {
  const m = String(msg || '').toLowerCase()
  if (m.includes('bucket') && m.includes('not found')) {
    return 'The bank-statements storage bucket is missing. Ask an admin to create it.'
  }
  if (m.includes('row-level security') || m.includes('policy')) {
    return 'Upload blocked by RLS — your session may not have admin permissions.'
  }
  return msg
}

function mapRow(row) {
  return {
    id: row.id,
    accountId: row.account_id,
    account: row.account
      ? {
          id: row.account.id,
          institution: row.account.institution,
          accountLabel: row.account.account_label,
          accountLast4: row.account.account_last4,
        }
      : null,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    statementIssued: row.statement_issued ?? null,
    openingBalance: row.opening_balance,
    closingBalance: row.closing_balance,
    totalDeposits: row.total_deposits,
    totalWithdrawals: row.total_withdrawals,
    depositCount: row.deposit_count,
    withdrawalCount: row.withdrawal_count,
    filePath: row.file_path,
    fileName: row.file_name,
    status: row.status,
    reconciliationDelta: row.reconciliation_delta,
    rejectionReason: row.rejection_reason,
    uploadedBy: row.uploaded_by,
    uploadedAt: row.uploaded_at,
    processedAt: row.processed_at,
  }
}

/**
 * @typedef {Object} Statement
 * @property {string} id
 * @property {string} accountId
 * @property {{id:string, institution:string, accountLabel:string, accountLast4:string|null}|null} account
 * @property {string|null} periodStart   ISO date, null until parser fills
 * @property {string|null} periodEnd     ISO date, null until parser fills
 * @property {string|null} statementIssued
 * @property {number|null} openingBalance
 * @property {number|null} closingBalance
 * @property {number|null} totalDeposits
 * @property {number|null} totalWithdrawals
 * @property {number|null} depositCount
 * @property {number|null} withdrawalCount
 * @property {string}      filePath
 * @property {string|null} fileName
 * @property {'pending'|'processing'|'reconciled'|'rejected'} status
 * @property {number|null} reconciliationDelta
 * @property {string|null} rejectionReason
 * @property {string|null} uploadedBy
 * @property {string}      uploadedAt
 * @property {string|null} processedAt
 */
