import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useKnowledgeBase({ category, roleId } = {}) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDocs = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      let query = supabase
        .from('knowledge_base')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true })
        .order('sort_order', { ascending: true })

      if (category) {
        query = query.eq('category', category)
      }

      if (roleId) {
        query = query.contains('role_ids', [roleId])
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setDocs(data)
    } catch (err) {
      console.error('Error fetching knowledge base:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [category, roleId])

  useEffect(() => {
    fetchDocs()
  }, [fetchDocs])

  return { docs, loading, error, refetch: fetchDocs }
}
