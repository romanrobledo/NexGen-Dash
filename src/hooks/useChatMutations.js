import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useChatMutations() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function createSession({ staffId, roleId, title }) {
    if (!supabase) {
      setError('Supabase not configured')
      return { data: null, error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('chat_sessions')
        .insert({
          staff_id: staffId || null,
          role_id: roleId || null,
          title: title || 'New Conversation',
        })
        .select()
        .single()

      if (insertError) throw insertError
      return { data, error: null }
    } catch (err) {
      console.error('Error creating chat session:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  async function sendMessage({ sessionId, role, content, tokenCount, model, contextRefs }) {
    if (!supabase) {
      setError('Supabase not configured')
      return { data: null, error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          role,
          content,
          token_count: tokenCount || null,
          model: model || null,
          context_refs: contextRefs || [],
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Update session's updated_at timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId)

      return { data, error: null }
    } catch (err) {
      console.error('Error sending chat message:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  async function archiveSession(sessionId) {
    if (!supabase) {
      setError('Supabase not configured')
      return { data: null, error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('chat_sessions')
        .update({ status: 'archived' })
        .eq('id', sessionId)
        .select()
        .single()

      if (updateError) throw updateError
      return { data, error: null }
    } catch (err) {
      console.error('Error archiving chat session:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  async function updateSessionTitle(sessionId, title) {
    if (!supabase) {
      setError('Supabase not configured')
      return { data: null, error: 'Supabase not configured' }
    }

    try {
      setSaving(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', sessionId)
        .select()
        .single()

      if (updateError) throw updateError
      return { data, error: null }
    } catch (err) {
      console.error('Error updating session title:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  return {
    createSession,
    sendMessage,
    archiveSession,
    updateSessionTitle,
    saving,
    error,
  }
}
