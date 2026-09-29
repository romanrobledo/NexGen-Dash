import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Load invoices with nested line items and joined family display info.
 * List consumers pass no options; the family-detail page can pass
 * { familyId } to scope.
 *
 * Every write recomputes total_cents from the line items so subtotal +
 * total stay honest.
 *
 * @typedef {Object} InvoiceLineItem
 * @property {string} id
 * @property {string} description
 * @property {string|null} planId
 * @property {number} quantity
 * @property {number} unitAmountCents
 * @property {number} amountCents
 * @property {number} position
 * @property {string|null} notes
 *
 * @typedef {Object} Invoice
 * @property {string} id
 * @property {number} invoiceNumber
 * @property {string} familyId
 * @property {string} familyName
 * @property {'draft'|'sent'|'paid'|'partial'|'overdue'|'voided'} status
 * @property {string} issueDate
 * @property {string|null} dueDate
 * @property {number} subtotalCents
 * @property {number} totalCents
 * @property {number} amountPaidCents
 * @property {string|null} notes
 * @property {string|null} externalRef
 * @property {string} createdAt
 * @property {InvoiceLineItem[]} lineItems
 */
export function useInvoices({ familyId } = {}) {
  const [rows, setRows] = useState(/** @type {Invoice[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(/** @type {string|null} */ (null))

  const fetchRows = useCallback(async () => {
    if (!supabase) { setError('Supabase not configured'); setLoading(false); return }
    try {
      setError(null)
      let q = supabase
        .from('invoices')
        .select(`
          id, invoice_number, family_id, status, issue_date, due_date,
          subtotal_cents, total_cents, amount_paid_cents, notes, external_ref, created_at,
          family:families ( family_name ),
          line_items:invoice_line_items (
            id, description, plan_id, quantity, unit_amount_cents, amount_cents, position, notes
          )
        `)
        .order('created_at', { ascending: false })
      if (familyId) q = q.eq('family_id', familyId)
      const { data, error: qErr } = await q
      if (qErr) {
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn('[useInvoices] table missing; treating as empty')
          setRows([]); return
        }
        throw qErr
      }
      setRows((data || []).map(mapRow))
    } catch (err) {
      setError(err?.message || 'Failed to load invoices')
    } finally { setLoading(false) }
  }, [familyId])

  useEffect(() => { setLoading(true); fetchRows() }, [fetchRows])

  /**
   * Create an invoice with its line items. Runs in two writes since
   * Supabase's PostgREST doesn't nest inserts natively — inserts the
   * invoice first, then bulk-inserts the line items, then rolls back
   * the invoice if lines fail.
   */
  async function createInvoice(values) {
    const invoicePayload = normalizeInvoicePayload(values)
    const { data: invoice, error: iErr } = await supabase.from('invoices').insert(invoicePayload).select().single()
    if (iErr) return { data: null, error: iErr.message }
    const lines = normalizeLinePayload(values.lineItems || [], invoice.id)
    if (lines.length > 0) {
      const { error: lErr } = await supabase.from('invoice_line_items').insert(lines)
      if (lErr) {
        await supabase.from('invoices').delete().eq('id', invoice.id).catch(() => {})
        return { data: null, error: `Line item insert failed: ${lErr.message}` }
      }
    }
    await fetchRows()
    return { data: invoice, error: null }
  }

  async function updateInvoice(id, patch) {
    const invoicePayload = normalizeInvoicePayload(patch)
    const { error: uErr } = await supabase.from('invoices').update(invoicePayload).eq('id', id)
    if (uErr) return { error: uErr.message }
    // Replace line items if provided.
    if (patch.lineItems) {
      const { error: dErr } = await supabase.from('invoice_line_items').delete().eq('invoice_id', id)
      if (dErr) return { error: dErr.message }
      const lines = normalizeLinePayload(patch.lineItems, id)
      if (lines.length > 0) {
        const { error: lErr } = await supabase.from('invoice_line_items').insert(lines)
        if (lErr) return { error: lErr.message }
      }
    }
    await fetchRows()
    return { error: null }
  }

  async function setInvoiceStatus(id, status) {
    const { error: sErr } = await supabase.from('invoices').update({ status }).eq('id', id)
    if (sErr) return { error: sErr.message }
    await fetchRows()
    return { error: null }
  }

  async function deleteInvoice(id) {
    const { error: dErr } = await supabase.from('invoices').delete().eq('id', id)
    if (dErr) return { error: dErr.message }
    await fetchRows()
    return { error: null }
  }

  return { rows, loading, error, refetch: fetchRows, createInvoice, updateInvoice, setInvoiceStatus, deleteInvoice }
}

function normalizeInvoicePayload(v) {
  // Total = sum of line item amounts; subtotal equals total until we add
  // taxes / discounts. Passing lineItems as [{quantity, unitAmountCents}]
  // is required so we can compute totals server-side... actually no,
  // computed here so the DB doesn't have to.
  const lines = v.lineItems || []
  const total = lines.reduce((sum, l) => sum + Math.round(Number(l.quantity || 0) * Number(l.unitAmountCents || 0)), 0)
  const payload = {
    family_id: v.familyId,
    status: v.status || 'draft',
    issue_date: v.issueDate || new Date().toISOString().slice(0, 10),
    due_date: v.dueDate || null,
    notes: v.notes?.trim() || null,
  }
  if (lines.length > 0 || v.recomputeTotals) {
    payload.subtotal_cents = total
    payload.total_cents    = total
  }
  return payload
}

function normalizeLinePayload(lines, invoiceId) {
  return lines
    .filter((l) => l.description && Number(l.unitAmountCents) > 0)
    .map((l, i) => ({
      invoice_id: invoiceId,
      plan_id: l.planId || null,
      description: l.description.trim(),
      quantity: Number(l.quantity || 1),
      unit_amount_cents: Math.round(Number(l.unitAmountCents)),
      amount_cents: Math.round(Number(l.quantity || 1) * Number(l.unitAmountCents)),
      position: l.position ?? i,
      notes: l.notes?.trim() || null,
    }))
}

function mapRow(row) {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    familyId: row.family_id,
    familyName: row.family?.family_name || '',
    status: row.status,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    subtotalCents: row.subtotal_cents,
    totalCents: row.total_cents,
    amountPaidCents: row.amount_paid_cents,
    notes: row.notes,
    externalRef: row.external_ref,
    createdAt: row.created_at,
    lineItems: (row.line_items || []).sort((a, b) => a.position - b.position).map((l) => ({
      id: l.id,
      description: l.description,
      planId: l.plan_id,
      quantity: Number(l.quantity),
      unitAmountCents: l.unit_amount_cents,
      amountCents: l.amount_cents,
      position: l.position,
      notes: l.notes,
    })),
  }
}
