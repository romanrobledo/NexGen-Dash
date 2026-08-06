import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Fetch the briefing feed for a single officer scope from
 * public.officer_briefings.
 *
 * @param {'ceo'|'ops'|'finance'|'marketing'|'reflection'} officerKey
 * @returns {{
 *   briefings: Briefing[],
 *   latest: Briefing | null,
 *   loading: boolean,
 *   error: string | null,
 *   refetch: () => Promise<void>,
 * }}
 *
 * Graceful fallback: if the table doesn't exist yet (fresh install before
 * the SQL migration is run), we log a warning and return an empty feed
 * instead of blowing up the OfficerPage.
 */
export function useOfficerBriefings(officerKey) {
  const [briefings, setBriefings] = useState(/** @type {Briefing[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(/** @type {string | null} */ (null))

  const fetchBriefings = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }
    if (!officerKey) {
      setBriefings([])
      setLoading(false)
      return
    }
    setError(null)
    try {
      const withTimeout = (p, ms = 8000) =>
        Promise.race([
          p,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('officer-briefings-fetch-timeout')), ms)
          ),
        ])

      const { data, error: qErr } = await withTimeout(
        supabase
          .from('officer_briefings')
          .select(
            'id, officer_key, officer_name, title, summary, body_md, severity, source, entity, sent_at'
          )
          .eq('officer_key', officerKey)
          .order('sent_at', { ascending: false })
          .limit(100)
      )

      if (qErr) {
        // Table missing → treat as empty (fresh Supabase before migration).
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn(
            '[useOfficerBriefings] table missing; treating as empty feed'
          )
          setBriefings([])
          return
        }
        throw qErr
      }
      setBriefings((data || []).map(mapRow))
    } catch (err) {
      console.error(
        '[useOfficerBriefings] fetch failed:',
        err?.message || err
      )
      setError(err?.message || 'Failed to load briefings')
    } finally {
      setLoading(false)
    }
  }, [officerKey])

  useEffect(() => {
    setLoading(true)
    fetchBriefings()
  }, [fetchBriefings])

  return {
    briefings,
    latest: briefings[0] || null,
    loading,
    error,
    refetch: fetchBriefings,
  }
}

// ─── Row → app shape ─────────────────────────────────────────────────────────

function mapRow(row) {
  return {
    id: row.id,
    officerKey: row.officer_key,
    officerName: row.officer_name,
    title: row.title,
    summary: row.summary,
    bodyMd: row.body_md,
    severity: row.severity || 'info',
    source: row.source || 'paperclip',
    entity: row.entity || 'nexgen',
    sentAt: row.sent_at,
  }
}

/**
 * @typedef {Object} Briefing
 * @property {number} id
 * @property {string} officerKey
 * @property {string} officerName
 * @property {string} title
 * @property {string | null} summary
 * @property {string | null} bodyMd
 * @property {'info'|'notice'|'warning'|'critical'} severity
 * @property {string} source          Defaults to "paperclip"
 * @property {string} entity          Defaults to "nexgen" (multi-tenant column)
 * @property {string} sentAt          ISO timestamp
 */
