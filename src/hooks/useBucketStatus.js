import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { BUCKETS } from '../lib/contentCalendarConstants'

export function useBucketStatus(year, month) {
  const [bucketStats, setBucketStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBucketStats = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

      const { data, error: fetchError } = await supabase
        .from('content_missions')
        .select('bucket, status')
        .gte('date', startDate)
        .lte('date', endDate)

      if (fetchError) throw fetchError

      const stats = BUCKETS.map((bucket) => {
        const bucketMissions = data.filter((m) => m.bucket === bucket.key)
        const completed = bucketMissions.filter((m) => m.status === 'completed').length
        return {
          ...bucket,
          total: bucketMissions.length,
          completed,
          percentage: bucketMissions.length > 0
            ? Math.round((completed / bucketMissions.length) * 100)
            : 0,
        }
      })

      setBucketStats(stats)
    } catch (err) {
      console.error('Error fetching bucket stats:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    fetchBucketStats()
  }, [fetchBucketStats])

  return { bucketStats, loading, error, refetch: fetchBucketStats }
}
