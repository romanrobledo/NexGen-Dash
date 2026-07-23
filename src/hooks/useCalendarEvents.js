import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Fetch + create + delete calendar events for a single calendar
 * (`school` | `staff` | `events`). All three tabs share one table
 * (`public.calendar_events`) with a `calendar` column separating them.
 *
 * Graceful fallback: if the `calendar_events` table doesn't exist yet
 * (user hasn't run the migration), we treat that as an empty calendar so
 * the page still renders. Same pattern as useChildren.
 *
 * Returns:
 *   events       — array of events for this calendar, sorted by starts_at
 *   loading, error, refetch
 *   addEvent(evt)  — create a new event, returns the inserted row
 *   deleteEvent(id) — delete by id
 *
 * @param {'school' | 'staff' | 'events'} calendar
 */
export function useCalendarEvents(calendar) {
  const [events, setEvents] = useState(/** @type {Event[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(/** @type {string | null} */ (null))

  const fetchEvents = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }
    setError(null)
    try {
      const { data, error: qErr } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('calendar', calendar)
        .order('starts_at', { ascending: true })

      if (qErr) {
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn('[useCalendarEvents] calendar_events table missing; treating as empty')
          setEvents([])
          return
        }
        throw qErr
      }
      setEvents((data || []).map(mapRow))
    } catch (err) {
      console.error('[useCalendarEvents] fetch failed:', err?.message || err)
      setError(err?.message || 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [calendar])

  useEffect(() => {
    setLoading(true)
    fetchEvents()
  }, [fetchEvents])

  /**
   * @param {{
   *   title: string,
   *   description?: string,
   *   location?: string,
   *   startsAt: string,   // ISO string
   *   endsAt?: string,    // ISO string
   *   allDay?: boolean,
   *   createdBy?: string,
   * }} evt
   */
  const addEvent = useCallback(async (evt) => {
    if (!supabase) throw new Error('Supabase not configured')
    const row = {
      calendar,
      title: evt.title,
      description: evt.description || null,
      location: evt.location || null,
      starts_at: evt.startsAt,
      ends_at: evt.endsAt || null,
      all_day: !!evt.allDay,
      created_by: evt.createdBy || null,
    }
    const { data, error: qErr } = await supabase
      .from('calendar_events')
      .insert(row)
      .select()
      .single()
    if (qErr) throw qErr
    const mapped = mapRow(data)
    setEvents((prev) => [...prev, mapped].sort(byStartAsc))
    return mapped
  }, [calendar])

  const deleteEvent = useCallback(async (id) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { error: qErr } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)
    if (qErr) throw qErr
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    addEvent,
    deleteEvent,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function byStartAsc(a, b) {
  return new Date(a.startsAt) - new Date(b.startsAt)
}

function mapRow(row) {
  return {
    id: row.id,
    calendar: row.calendar,
    title: row.title,
    description: row.description,
    location: row.location,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    allDay: !!row.all_day,
    createdBy: row.created_by,
    createdAt: row.created_at,
  }
}

/**
 * @typedef {Object} Event
 * @property {string} id
 * @property {'school'|'staff'|'events'} calendar
 * @property {string} title
 * @property {string|null} description
 * @property {string|null} location
 * @property {string} startsAt   ISO
 * @property {string|null} endsAt   ISO
 * @property {boolean} allDay
 * @property {string|null} createdBy
 * @property {string} createdAt
 */
