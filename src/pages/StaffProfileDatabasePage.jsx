import { useNavigate } from 'react-router-dom'
import { Loader2, Phone, Mail, ChevronRight } from 'lucide-react'
import { useStaff } from '../hooks/useStaff'
import { useViewMode } from '../contexts/ViewModeContext'

function formatRole(role) {
  if (!role) return ''
  return role.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function StaffProfileDatabasePage() {
  const { staff, loading, error } = useStaff()
  const navigate = useNavigate()
  const { mobileMode } = useViewMode()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-gray-500">Loading staff database...</span>
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
      <div className={mobileMode ? 'mb-5' : 'mb-8'}>
        <h2 className={`font-bold text-gray-900 ${mobileMode ? 'text-xl' : 'text-2xl'}`}>
          Staff Profile Database
        </h2>
        <p className={`text-gray-500 mt-1 ${mobileMode ? 'text-sm' : ''}`}>
          Complete directory of all staff members
        </p>
      </div>

      {/* Mobile: stacked cards */}
      {mobileMode ? (
        <div className="space-y-3">
          {staff.map((teacher) => (
            <button
              key={teacher.id}
              onClick={() => navigate(`/staff/${teacher.id}`)}
              className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-blue-200 hover:bg-blue-50/40 active:scale-[0.99] transition-all"
            >
              {/* Top row: avatar + name + chevron */}
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                  style={{ backgroundColor: teacher.avatar_color || '#7c3aed' }}
                >
                  {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{teacher.full_name}</div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {formatRole(teacher.role)}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </div>

              {/* Contact row */}
              <div className="mt-3 space-y-1.5">
                {teacher.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{teacher.phone}</span>
                  </div>
                )}
                {teacher.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                )}
              </div>

              {/* Status pill */}
              <div className="mt-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">
                  {teacher.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3.5 px-5 font-semibold text-gray-600">Name</th>
              <th className="text-left py-3.5 px-5 font-semibold text-gray-600">Phone</th>
              <th className="text-left py-3.5 px-5 font-semibold text-gray-600">Email</th>
              <th className="text-left py-3.5 px-5 font-semibold text-gray-600">Role</th>
              <th className="text-left py-3.5 px-5 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((teacher) => (
              <tr
                key={teacher.id}
                onClick={() => navigate(`/staff/${teacher.id}`)}
                className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                      style={{ backgroundColor: teacher.avatar_color || '#7c3aed' }}
                    >
                      {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                    </div>
                    <span className="font-medium text-gray-900">{teacher.full_name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-5 text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {teacher.phone}
                  </div>
                </td>
                <td className="py-3.5 px-5 text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {teacher.email}
                  </div>
                </td>
                <td className="py-3.5 px-5 text-gray-600">{teacher.role}</td>
                <td className="py-3.5 px-5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    {teacher.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}
