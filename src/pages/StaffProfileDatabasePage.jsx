import { useNavigate } from 'react-router-dom'
import { Loader2, Phone, Mail } from 'lucide-react'
import { useStaff } from '../hooks/useStaff'

export default function StaffProfileDatabasePage() {
  const { staff, loading, error } = useStaff()
  const navigate = useNavigate()

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
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Staff Profile Database</h2>
        <p className="text-gray-500 mt-1">Complete directory of all staff members</p>
      </div>

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
    </div>
  )
}
