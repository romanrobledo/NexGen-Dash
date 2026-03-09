import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useStaff } from '../hooks/useStaff'

export default function StaffResponsesPage() {
  const { staff, loading, error } = useStaff()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-gray-500">Loading staff...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">Failed to load staff</p>
        <p className="text-red-400 text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Quick Overview</h2>
        <p className="text-gray-500 mt-1">Overview of the Entire Staff</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {staff.map((teacher) => (
          <div
            key={teacher.id}
            onClick={() => navigate(`/staff/${teacher.id}`)}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0"
                style={{ backgroundColor: teacher.avatar_color || '#7c3aed' }}
              >
                {teacher.first_name?.[0]}{teacher.last_name?.[0]}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {teacher.full_name}
                </p>
                <p className="text-sm text-gray-500">{teacher.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
