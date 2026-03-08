import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Fetches training subjects with aggregated topic/step counts and progress.
 * Works with the new 5-table schema:
 *   training_subjects → training_topics → training_steps → staff_progress
 *
 * @param {string} section - Filter by section: 'general' | 'onboarding' | 'tools' | 'howtos' | null (all)
 */
export function useTrainings(section = null) {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchSubjects() {
      if (!supabase) {
        setError('Supabase not configured')
        setLoading(false)
        return
      }

      try {
        // 1. Fetch subjects (optionally filtered by section)
        let subjectQuery = supabase
          .from('training_subjects')
          .select('*')
          .order('order_index', { ascending: true })

        if (section) {
          subjectQuery = subjectQuery.eq('section', section)
        }

        const { data: subjectsData, error: subjectsError } = await subjectQuery
        if (subjectsError) throw subjectsError

        if (!subjectsData || subjectsData.length === 0) {
          setSubjects([])
          setLoading(false)
          return
        }

        const subjectIds = subjectsData.map((s) => s.id)

        // 2. Fetch topics for these subjects
        const { data: topicsData, error: topicsError } = await supabase
          .from('training_topics')
          .select('id, subject_id, title, order_index')
          .in('subject_id', subjectIds)
          .order('order_index', { ascending: true })

        if (topicsError) throw topicsError

        const topicIds = (topicsData || []).map((t) => t.id)

        // 3. Fetch steps for these topics
        const { data: stepsData, error: stepsError } = await supabase
          .from('training_steps')
          .select('id, topic_id, title, content_html, video_url, pdf_url, estimated_minutes, is_required, order_index')
          .in('topic_id', topicIds)
          .order('order_index', { ascending: true })

        if (stepsError) throw stepsError

        // 4. Fetch staff progress (all completed steps)
        const { data: progressData, error: progressError } = await supabase
          .from('staff_progress')
          .select('step_id, completed_at')

        if (progressError) throw progressError

        // Build lookup maps
        const completedStepIds = new Set((progressData || []).map((p) => p.step_id))

        // Map steps by topic_id
        const stepsByTopic = {}
        for (const step of stepsData || []) {
          if (!stepsByTopic[step.topic_id]) stepsByTopic[step.topic_id] = []
          stepsByTopic[step.topic_id].push(step)
        }

        // Map topics by subject_id
        const topicsBySubject = {}
        for (const topic of topicsData || []) {
          if (!topicsBySubject[topic.subject_id]) topicsBySubject[topic.subject_id] = []
          topicsBySubject[topic.subject_id].push(topic)
        }

        // 5. Assemble enriched subjects
        const enriched = subjectsData.map((subject) => {
          const topics = topicsBySubject[subject.id] || []
          const allSteps = []
          for (const topic of topics) {
            const steps = stepsByTopic[topic.id] || []
            allSteps.push(...steps)
          }

          const totalSteps = allSteps.length
          const completedSteps = allSteps.filter((s) => completedStepIds.has(s.id)).length
          const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

          const totalMinutes = allSteps.reduce((sum, s) => sum + (s.estimated_minutes || 0), 0)
          const remainingMinutes = allSteps
            .filter((s) => !completedStepIds.has(s.id))
            .reduce((sum, s) => sum + (s.estimated_minutes || 0), 0)

          return {
            ...subject,
            topic_count: topics.length,
            step_count: totalSteps,
            completed_steps: completedSteps,
            progress,
            total_minutes: totalMinutes,
            remaining_minutes: remainingMinutes,
            read_time: formatReadTime(totalMinutes),
            topics: topics.map((topic) => ({
              ...topic,
              steps: (stepsByTopic[topic.id] || []).map((step) => ({
                ...step,
                completed: completedStepIds.has(step.id),
              })),
            })),
          }
        })

        setSubjects(enriched)
      } catch (err) {
        console.error('Error fetching training subjects:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSubjects()
  }, [section])

  return { subjects, loading, error }
}

function formatReadTime(minutes) {
  if (minutes < 60) return `~${minutes} min read`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `~${hrs} hr ${mins} min read` : `~${hrs} hr read`
}
