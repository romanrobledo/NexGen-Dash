import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Payments log. Fetches with joined family display name and, when
 * available, the invoice number the payment was applied to.
 *
 * When a payment is linked to an invoice, the DB trigger
 * payments_after_write recomputes the invoice's paid/partial/overdue
 * status — no client-side follow-up needed.
 *
 * @typedef {Object} Payment
 * @property {string} id
 * @property {string} familyId
 * @property {string} familyName
 * @property {string|null} invoiceId
 * @property {number|null} invoiceNumber
 * @property {number} amountCents
 * @property {'cash'|'check'|'card'|'ach'|'ccms'|'other'} paymentMethod
 * @property {string} paymentDate
 * @property {string|null} referenceNumber
 * @property {string|null} notes
 * @property {string|null} externalRef
 * @property {string} createdAt
 */
export function usePayments({ familyId } = {}) {
  const [rows, setRows] = useState(/** @type {Payment[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(/** @type {string|null} */ (null))

  const fetchRows = useCallback(async () => {
    if (!supabase) { setError('Supabase not configured'); setLoading(false); return }
    try {
      setError(null)
      let q = supabase.from('payments').select(`
        *,
        family:families ( family_name ),
        invoice:invoices ( invoice_number )
      `).order('payment_date', { ascending: false })
      if (familyId) q = q.eq('family_id', familyId)
      const { data, error: qErr } = await q
      if (qErr) {
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn('[usePayments] table missing; treating as empty')
          setRows([]); return
        }
        throw qErr
      }
      setRows((data || []).map(mapRow))
    } catch (err) {
      setError(err?.message || 'Failed to load payments')
    } finally { setLoading(false) }
  }, [familyId])

  useEffect(() => { setLoading(true); fetchRows() }, [fetchRows])

  async function createPayment(values) {
    const { data, error: iErr } = await supabase.from('payments').insert(normalizePayload(values)).select().single()
    if (iErr) return { data: null, error: iErr.message }
    await fetchRows()
    return { data, error: null }
  }
  async function updatePayment(id, patch) {
    const { error: uErr } = await supabase.from('payments').update(normalizePayload(patch)).eq('id', id)
    if (uErr) return { error: uErr.message }
    await fetchRows()
    return { error: null }
  }
  async function deletePayment(id) {
    const { error: dErr } = await supabase.from('payments').delete().eq('id', id)
    if (dErr) return { error: dErr.message }
    await fetchRows()
    return { error: null }
  }

  return { rows, loading, error, refetch: fetchRows, createPayment, updatePayment, deletePayment }
}

function normalizePayload(v) {
  return {
    family_id: v.familyId,
    invoice_id: v.invoiceId || null,
    amount_cents: Math.round(Number(v.amountCents || 0)),
    payment_method: v.paymentMethod || 'other',
    payment_date: v.paymentDate || new Date().toISOString().slice(0, 10),
    reference_number: v.referenceNumber?.trim() || null,
    notes: v.notes?.trim() || null,
  }
}

function mapRow(row) {
  return {
    id: row.id,
    familyId: row.family_id,
    familyName: row.family?.family_name || '',
    invoiceId: row.invoice_id,
    invoiceNumber: row.invoice?.invoice_number ?? null,
    amountCents: row.amount_cents,
    paymentMethod: row.payment_method,
    paymentDate: row.payment_date,
    referenceNumber: row.reference_number,
    notes: row.notes,
    externalRef: row.external_ref,
    createdAt: row.created_at,
  }
}
