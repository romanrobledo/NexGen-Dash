import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useChatSessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSessions = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false })

      if (fetchError) throw fetchError
      setSessions(data)
    } catch (err) {
      console.error('Error fetching chat sessions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return { sessions, loading, error, refetch: fetchSessions }
}
