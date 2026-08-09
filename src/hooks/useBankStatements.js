import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const BUCKET = 'bank-statements'
const MAX_BYTES = 15 * 1024 * 1024 // 15 MB

// n8n parse-trigger webhook. Env vars come from Vite (VITE_ prefix
// exposes them to the browser bundle — acceptable because n8n's Header
// Auth node validates the secret server-side; a leaked value from the
// bundle would let a stranger POST parse jobs against Roman's own
// statements, no wider blast radius. Set both in Vercel; if the URL
// is unset the app skips the POST silently and the statement stays
// `pending` — Roman triggers manually.
const PARSE_WEBHOOK_URL = import.meta.env.VITE_STATEMENT_PARSE_WEBHOOK
const PARSE_WEBHOOK_SECRET = import.meta.env.VITE_STATEMENT_PARSE_SECRET
// Cap the parse-trigger wait so a slow/hung webhook can't hold the
// upload feedback hostage. 8 s is well above n8n's typical webhook
// ack; anything slower is a red flag worth surfacing as a warning.
const PARSE_WEBHOOK_TIMEOUT_MS = 8000

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
 *   uploadStatement: (file: File, accountId: string) => Promise<{data, error, warning?}>,
 *   uploading: boolean, uploadError: string|null,
 * }}
 *
 * uploadStatement return contract:
 *   error   — hard failure (upload or insert failed). data is null.
 *   warning — soft failure. Row inserted successfully as `pending`
 *             but the parse-trigger webhook didn't fire (URL not
 *             configured, network error, non-2xx, or timeout).
 *             Roman can trigger parse manually. data is populated.
 *   neither — success. Row inserted, webhook fired, parser will pick up.
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

      // ── Fire the parse-trigger webhook AFTER both storage + insert
      //    succeed. Not awaited-inside-try because a webhook failure
      //    must NOT roll back the upload — the row lands as `pending`
      //    either way and Roman can trigger parse manually. Bounded
      //    by PARSE_WEBHOOK_TIMEOUT_MS so a hung webhook can't hold
      //    the upload feedback hostage. NO automatic retry per spec:
      //    a duplicate POST means a duplicate parse.
      const parse = await triggerParse(data.id, path)
      return {
        data: mapRow(data),
        error: null,
        warning: parse.ok
          ? null
          : `Uploaded. Parse not started (${parse.reason}) — trigger manually from n8n.`,
      }
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

// POST { statement_id, file_path, bucket } to the n8n parse webhook.
// Returns { ok, reason }. Never throws — every failure mode collapses
// to `{ ok: false, reason: string }` so the caller's happy path stays
// linear. If the URL isn't configured, treat as "webhook not
// configured" and let the caller surface a warning; the row is
// already inserted so nothing hangs.
async function triggerParse(statementId, filePath) {
  // Diagnostic logging block — prove which branch we take on production.
  // Log booleans + URL origin only (never the secret value), so we can
  // spot missing/mistyped env vars without leaking auth. Remove when
  // the auto-parse pipeline is verified working end-to-end.
  // (Vercel deploy probe: 2026-08-08 — nudging Git integration to react.)
  console.info('[parseWebhook] env check', {
    url_defined: !!PARSE_WEBHOOK_URL,
    url_origin: PARSE_WEBHOOK_URL
      ? (() => { try { return new URL(PARSE_WEBHOOK_URL).origin + new URL(PARSE_WEBHOOK_URL).pathname } catch { return 'unparseable' } })()
      : null,
    secret_defined: !!PARSE_WEBHOOK_SECRET,
    secret_len: PARSE_WEBHOOK_SECRET ? PARSE_WEBHOOK_SECRET.length : 0,
  })

  if (!PARSE_WEBHOOK_URL) {
    console.info(
      '[useBankStatements] VITE_STATEMENT_PARSE_WEBHOOK not set — statement stays pending, no auto-parse.'
    )
    return { ok: false, reason: 'webhook not configured' }
  }
  // The secret guard is explicit rather than a bare `...(secret ? ... : {})`
  // because missing-secret + n8n Header Auth = a 403 with no clue in the
  // response body. Better to surface "secret not configured" than to
  // guess at a 403 later. If Roman intentionally runs without auth in
  // dev, flip the header off by leaving VITE_STATEMENT_PARSE_SECRET
  // unset — but n8n will reject the call.
  if (!PARSE_WEBHOOK_SECRET) {
    console.info(
      '[useBankStatements] VITE_STATEMENT_PARSE_SECRET not set — n8n Header Auth will reject the POST.'
    )
    return { ok: false, reason: 'secret not configured' }
  }
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), PARSE_WEBHOOK_TIMEOUT_MS)
    console.info('[parseWebhook] POSTing', { statement_id: statementId, file_path: filePath })
    const res = await fetch(PARSE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': PARSE_WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        statement_id: statementId,
        file_path: filePath,
        bucket: BUCKET,
      }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    const bodyText = await res.text().catch(() => '')
    console.info('[parseWebhook] response', {
      status: res.status,
      statusText: res.statusText,
      body_preview: bodyText.slice(0, 300),
    })
    if (!res.ok) {
      console.warn(
        '[useBankStatements] Parse webhook returned',
        res.status,
        bodyText.slice(0, 200)
      )
      return { ok: false, reason: `HTTP ${res.status}` }
    }
    return { ok: true }
  } catch (err) {
    const reason =
      err?.name === 'AbortError'
        ? `no response within ${PARSE_WEBHOOK_TIMEOUT_MS / 1000}s`
        : err?.message || 'network error'
    console.warn('[parseWebhook] caught', { name: err?.name, message: err?.message })
    console.warn('[useBankStatements] Parse webhook failed:', reason)
    return { ok: false, reason }
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
