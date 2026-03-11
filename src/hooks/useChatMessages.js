import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useChatMessages(sessionId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMessages = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }

    if (!sessionId) {
      setMessages([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      setMessages(data)
    } catch (err) {
      console.error('Error fetching chat messages:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  return { messages, loading, error, refetch: fetchMessages }
}
