import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCheckinResponses } from '../hooks/useCheckinResponses'
import { ArrowLeft, Phone, Mail, Loader2 } from 'lucide-react'

function RatingBadge({ value }) {
  const color =
    value >= 8
      ? 'bg-green-100 text-green-700'
      : value >= 5
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-700'

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}
    >
      {value}/10
    </span>
  )
}

export default function StaffProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { responses, loading: responsesLoading } = useCheckinResponses(id)

  useEffect(() => {
    async function fetchTeacher() {
      if (!supabase) {
        setError('Supabase not configured')
        setLoading(false)
        return
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('staff')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError
        setTeacher(data)
      } catch (err) {
        console.error('Error fetching teacher:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTeacher()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-gray-500">Loading profile...</span>
      </div>
    )
  }

  if (error || !teacher) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">Failed to load profile</p>
        <p className="text-red-400 text-sm mt-1">{error || 'Teacher not found'}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Profile header card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0"
            style={{ backgroundColor: teacher.avatar_color || '#7c3aed' }}
          >
            {teacher.first_name?.[0]}{teacher.last_name?.[0]}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{teacher.full_name}</h2>
            <p className="text-gray-500">{teacher.role}</p>
            <div className="flex items-center gap-5 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-gray-400" />
                {teacher.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-400" />
                {teacher.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Check-in & Out Responses */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Daily Check-in & Out Responses
        </h3>

        {responsesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="ml-2 text-gray-500 text-sm">Loading responses...</span>
          </div>
        ) : responses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No responses yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Responses will appear here once the daily check-in form is submitted.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Rating</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Activities</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">
                    Could Improve
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">
                    Tomorrow's Plan
                  </th>
                </tr>
              </thead>
              <tbody>
                {responses.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-900 whitespace-nowrap">
                      {new Date(r.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <RatingBadge value={r.rating} />
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs">
                      <p className="line-clamp-2">{r.activities}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs">
                      <p className="line-clamp-2">{r.improvements}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs">
                      <p className="line-clamp-2">{r.tomorrow_plan}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
