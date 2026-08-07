import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * List bank_accounts + create new ones. Reads/writes are gated by the
 * `current_staff_is_books_admin()` predicate at the RLS layer, so a
 * non-admin session will silently see [] — that's the correct behavior
 * (they shouldn't know accounts exist).
 *
 * Returns:
 *   accounts       — Account[]
 *   loading, error
 *   refetch()      — Promise<void>
 *   createAccount(input) — Promise<{ data, error }>
 */
export function useBankAccounts() {
  const [accounts, setAccounts] = useState(/** @type {Account[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(/** @type {string|null} */ (null))

  const fetchAccounts = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }
    try {
      setError(null)
      const { data, error: qErr } = await supabase
        .from('bank_accounts')
        .select('id, institution, account_label, account_last4, currency, active, created_at')
        .eq('active', true)
        .order('created_at', { ascending: true })
      if (qErr) throw qErr
      setAccounts((data || []).map(mapRow))
    } catch (err) {
      console.error('[useBankAccounts] fetch failed:', err?.message || err)
      setError(err?.message || 'Failed to load bank accounts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchAccounts()
  }, [fetchAccounts])

  async function createAccount({ institution, accountLabel, accountLast4 }) {
    if (!supabase) return { data: null, error: 'Supabase not configured' }
    try {
      const { data, error: qErr } = await supabase
        .from('bank_accounts')
        .insert({
          institution: institution.trim(),
          account_label: accountLabel.trim(),
          account_last4: accountLast4?.trim() || null,
        })
        .select()
        .single()
      if (qErr) throw qErr
      await fetchAccounts()
      return { data: mapRow(data), error: null }
    } catch (err) {
      const msg = err?.message || 'Failed to create bank account'
      console.error('[useBankAccounts] create failed:', msg)
      return { data: null, error: msg }
    }
  }

  return { accounts, loading, error, refetch: fetchAccounts, createAccount }
}

function mapRow(row) {
  return {
    id: row.id,
    institution: row.institution,
    accountLabel: row.account_label,
    accountLast4: row.account_last4,
    currency: row.currency,
    active: row.active,
    createdAt: row.created_at,
  }
}

/**
 * @typedef {Object} Account
 * @property {string} id
 * @property {string} institution
 * @property {string} accountLabel
 * @property {string|null} accountLast4
 * @property {string} currency
 * @property {boolean} active
 * @property {string} createdAt
 */
