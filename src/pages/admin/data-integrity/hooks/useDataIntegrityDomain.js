import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useAuth } from '../../../../contexts/AuthContext'
import { fireFieldUpdated } from '../utils/webhookClient'
import { rollUpDomainStatus } from '../utils/cycleMath'

/**
 * useDataIntegrityDomain — one-stop hook for a single domain (table).
 *
 * Handles:
 *   • Reading rows
 *   • verify(rowId)            → writes last_verified_at/by + status='verified' + log + webhook
 *   • correct(rowId, newValue) → updates editable field + verifies + log + webhook
 *   • flag(rowId, notes)       → status='flagged' + log + webhook
 *   • Rolled-up status across all rows in the domain
 *
 * @param {object} config
 * @param {string} config.tableName     — Supabase table name
 * @param {string} config.domainKey     — key for verification_log.domain
 * @param {string} config.editableField — which column "Needs Correction" edits
 * @param {Function} config.rowLabel    — fn(row) returning a human-friendly identifier
 *                                        for the webhook/log "field" descriptor
 */
export function useDataIntegrityDomain({
  tableName,
  domainKey,
  editableField,
  rowLabel,
}) {
  const { staff } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actioningId, setActioningId] = useState(null) // rowId currently being written

  const fetchRows = useCallback(async () => {
    if (!supabase) return
    setError(null)
    const { data, error: err } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: true })
    if (err) {
      console.error(`[DataIntegrity:${domainKey}] fetch failed:`, err.message)
      setError(err.message)
      setLoading(false)
      return
    }
    setRows(data || [])
    setLoading(false)
  }, [tableName, domainKey])

  useEffect(() => {
    setLoading(true)
    fetchRows()
  }, [fetchRows])

  /** Insert a row in verification_log. Swallows errors — non-fatal. */
  async function logAction({ action, rowId, oldValue, newValue, notes }) {
    try {
      await supabase.from('data_integrity_verification_log').insert({
        domain: domainKey,
        action,
        field_changed: editableField || null,
        old_value: oldValue != null ? String(oldValue) : null,
        new_value: newValue != null ? String(newValue) : null,
        verified_by: staff?.id || null,
        notes: notes || null,
      })
    } catch (err) {
      console.warn(`[DataIntegrity:${domainKey}] log insert failed (non-fatal):`, err.message)
    }
  }

  async function fireWebhook({ row, action, oldValue, newValue, notes }) {
    const staffName = staff ? `${staff.first_name} ${staff.last_name}`.trim() : 'Unknown'
    await fireFieldUpdated({
      domain: domainKey,
      action,
      field: rowLabel ? rowLabel(row) : editableField,
      old_value: oldValue != null ? String(oldValue) : null,
      new_value: newValue != null ? String(newValue) : null,
      verified_by_name: staffName,
      timestamp: new Date().toISOString(),
      notes: notes || null,
    })
  }

  /** Ed clicks "Accurate" — stamp verified, log, webhook. */
  async function verify(rowId) {
    if (!staff?.id || actioningId) return
    setActioningId(rowId)
    try {
      const row = rows.find((r) => r.id === rowId)
      if (!row) throw new Error('Row not found')

      const { error: upErr } = await supabase
        .from(tableName)
        .update({
          last_verified_at: new Date().toISOString(),
          last_verified_by: staff.id,
          verification_status: 'verified',
          updated_at: new Date().toISOString(),
        })
        .eq('id', rowId)

      if (upErr) throw upErr

      await logAction({ action: 'verified', rowId })
      await fireWebhook({ row, action: 'verified' })
      await fetchRows()
    } catch (err) {
      console.error(`[DataIntegrity:${domainKey}] verify failed:`, err.message)
      setError(err.message)
    } finally {
      setActioningId(null)
    }
  }

  /** Ed submits a corrected value — update field, stamp verified, log, webhook. */
  async function correct(rowId, newValue) {
    if (!staff?.id || actioningId || !editableField) return
    setActioningId(rowId)
    try {
      const row = rows.find((r) => r.id === rowId)
      if (!row) throw new Error('Row not found')
      const oldValue = row[editableField]

      const { error: upErr } = await supabase
        .from(tableName)
        .update({
          [editableField]: newValue,
          last_verified_at: new Date().toISOString(),
          last_verified_by: staff.id,
          verification_status: 'verified',
          updated_at: new Date().toISOString(),
        })
        .eq('id', rowId)

      if (upErr) throw upErr

      await logAction({ action: 'corrected', rowId, oldValue, newValue })
      await fireWebhook({ row, action: 'corrected', oldValue, newValue })
      await fetchRows()
    } catch (err) {
      console.error(`[DataIntegrity:${domainKey}] correct failed:`, err.message)
      setError(err.message)
    } finally {
      setActioningId(null)
    }
  }

  /** Ed flags a row — mark flagged, log, webhook. Doesn't stamp verified. */
  async function flag(rowId, notes = null) {
    if (!staff?.id || actioningId) return
    setActioningId(rowId)
    try {
      const row = rows.find((r) => r.id === rowId)
      if (!row) throw new Error('Row not found')

      const { error: upErr } = await supabase
        .from(tableName)
        .update({
          verification_status: 'flagged',
          updated_at: new Date().toISOString(),
        })
        .eq('id', rowId)

      if (upErr) throw upErr

      await logAction({ action: 'flagged', rowId, notes })
      await fireWebhook({ row, action: 'flagged', notes })
      await fetchRows()
    } catch (err) {
      console.error(`[DataIntegrity:${domainKey}] flag failed:`, err.message)
      setError(err.message)
    } finally {
      setActioningId(null)
    }
  }

  const domainStatus = rollUpDomainStatus(rows)
  const latestVerifiedAt = rows.reduce((latest, r) => {
    if (!r.last_verified_at) return latest
    const t = new Date(r.last_verified_at).getTime()
    return t > latest ? t : latest
  }, 0)

  return {
    rows,
    loading,
    error,
    actioningId,
    domainStatus,
    latestVerifiedAt: latestVerifiedAt ? new Date(latestVerifiedAt).toISOString() : null,
    verify,
    correct,
    flag,
    refetch: fetchRows,
  }
}
