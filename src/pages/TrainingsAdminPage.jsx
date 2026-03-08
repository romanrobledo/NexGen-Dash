import { useState, useEffect } from 'react'
import {
  Loader2,
  Shield,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Search,
  ChevronDown,
  BarChart3,
  TrendingUp,
  Award,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

// The 9 staff members
const STAFF_MEMBERS = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Mary Jane Almanza' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Sylvia Rivera' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Raquel Lopez' },
  { id: '00000000-0000-0000-0000-000000000004', name: 'Robyn Hernandez' },
  { id: '00000000-0000-0000-0000-000000000005', name: 'Ruth Ramirez' },
  { id: '00000000-0000-0000-0000-000000000006', name: 'Angelica Ramos' },
  { id: '00000000-0000-0000-0000-000000000007', name: 'Margo Rivas' },
  { id: '00000000-0000-0000-0000-000000000008', name: 'Maria Martinez' },
  { id: '00000000-0000-0000-0000-000000000009', name: 'Joanna Segura' },
]

const TRS_CATEGORIES = [
  { key: 'cat-1', label: 'Cat 1: Staff Quals', color: 'blue' },
  { key: 'cat-2', label: 'Cat 2: Interactions', color: 'green' },
  { key: 'cat-3', label: 'Cat 3: Program Admin', color: 'purple' },
  { key: 'cat-4', label: 'Cat 4: Environments', color: 'orange' },
]

function getStatusBadge(percentage) {
  if (percentage === 100)
    return { label: 'Complete', bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' }
  if (percentage >= 75)
    return { label: 'On Track', bg: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' }
  if (percentage >= 40)
    return { label: 'In Progress', bg: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' }
  if (percentage > 0)
    return { label: 'Behind', bg: 'bg-orange-50 text-orange-700', dot: 'bg-orange-500' }
  return { label: 'Not Started', bg: 'bg-gray-50 text-gray-500', dot: 'bg-gray-300' }
}

export default function TrainingsAdminPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [staffProgress, setStaffProgress] = useState([])
  const [subjects, setSubjects] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')

  useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        setError('Supabase not configured')
        setLoading(false)
        return
      }

      try {
        // Fetch all subjects with their topics and steps
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('training_subjects')
          .select('id, title, trs_category, section')
          .order('order_index')

        if (subjectsError) throw subjectsError

        const subjectIds = subjectsData.map((s) => s.id)

        const { data: topicsData, error: topicsError } = await supabase
          .from('training_topics')
          .select('id, subject_id')
          .in('subject_id', subjectIds)

        if (topicsError) throw topicsError

        const topicIds = topicsData.map((t) => t.id)

        const { data: stepsData, error: stepsError } = await supabase
          .from('training_steps')
          .select('id, topic_id')
          .in('topic_id', topicIds)

        if (stepsError) throw stepsError

        // Fetch all progress records
        const { data: progressData, error: progressError } = await supabase
          .from('staff_progress')
          .select('staff_id, step_id, completed_at')

        if (progressError) throw progressError

        // Build step-to-subject mapping
        const topicToSubject = {}
        for (const topic of topicsData) {
          topicToSubject[topic.id] = topic.subject_id
        }

        const stepToSubject = {}
        for (const step of stepsData) {
          stepToSubject[step.id] = topicToSubject[step.topic_id]
        }

        // Count steps per subject
        const stepsPerSubject = {}
        for (const step of stepsData) {
          const subjId = stepToSubject[step.id]
          stepsPerSubject[subjId] = (stepsPerSubject[subjId] || 0) + 1
        }

        // Count steps per TRS category
        const stepsPerCategory = {}
        for (const subject of subjectsData) {
          if (subject.trs_category) {
            stepsPerCategory[subject.trs_category] =
              (stepsPerCategory[subject.trs_category] || 0) + (stepsPerSubject[subject.id] || 0)
          }
        }

        // Subject to category mapping
        const subjectToCategory = {}
        for (const subject of subjectsData) {
          subjectToCategory[subject.id] = subject.trs_category
        }

        // Build per-staff, per-category progress
        const staffData = STAFF_MEMBERS.map((staff) => {
          const staffCompletedSteps = (progressData || []).filter(
            (p) => p.staff_id === staff.id
          )

          // Completed steps per category
          const completedPerCategory = {}
          for (const p of staffCompletedSteps) {
            const subjId = stepToSubject[p.step_id]
            const cat = subjectToCategory[subjId]
            if (cat) {
              completedPerCategory[cat] = (completedPerCategory[cat] || 0) + 1
            }
          }

          // Category progress
          const categories = {}
          let totalCompleted = 0
          let totalSteps = 0
          for (const cat of TRS_CATEGORIES) {
            const catTotal = stepsPerCategory[cat.key] || 0
            const catCompleted = completedPerCategory[cat.key] || 0
            const pct = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0
            categories[cat.key] = { completed: catCompleted, total: catTotal, percentage: pct }
            totalCompleted += catCompleted
            totalSteps += catTotal
          }

          const overallPct =
            totalSteps > 0 ? Math.round((totalCompleted / totalSteps) * 100) : 0

          return {
            ...staff,
            categories,
            totalCompleted,
            totalSteps,
            overallProgress: overallPct,
            lastActivity: staffCompletedSteps.length > 0
              ? staffCompletedSteps.sort(
                  (a, b) => new Date(b.completed_at) - new Date(a.completed_at)
                )[0].completed_at
              : null,
          }
        })

        setSubjects(subjectsData)
        setStaffProgress(staffData)
      } catch (err) {
        console.error('Error loading admin data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <h3 className="font-semibold mb-1">Error loading admin dashboard</h3>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  // Filter and sort staff
  let filteredStaff = staffProgress
  if (searchQuery) {
    filteredStaff = filteredStaff.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  if (sortBy === 'name') {
    filteredStaff = [...filteredStaff].sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy === 'progress-desc') {
    filteredStaff = [...filteredStaff].sort((a, b) => b.overallProgress - a.overallProgress)
  } else if (sortBy === 'progress-asc') {
    filteredStaff = [...filteredStaff].sort((a, b) => a.overallProgress - b.overallProgress)
  }

  // Compute summary stats
  const totalStaff = STAFF_MEMBERS.length
  const compliantStaff = staffProgress.filter((s) => s.overallProgress === 100).length
  const avgCompletion =
    staffProgress.length > 0
      ? Math.round(
          staffProgress.reduce((sum, s) => sum + s.overallProgress, 0) / staffProgress.length
        )
      : 0
  const behindStaff = staffProgress.filter((s) => s.overallProgress > 0 && s.overallProgress < 40)
    .length
  const notStarted = staffProgress.filter((s) => s.overallProgress === 0).length

  const handleExportCSV = () => {
    const header = [
      'Staff Name',
      ...TRS_CATEGORIES.map((c) => c.label),
      'Overall Progress',
    ].join(',')
    const rows = staffProgress.map((s) =>
      [
        `"${s.name}"`,
        ...TRS_CATEGORIES.map((c) => `${s.categories[c.key].percentage}%`),
        `${s.overallProgress}%`,
      ].join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trs-compliance-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">
            TRS compliance tracking and staff training overview
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Alert banner for non-compliance */}
      {(behindStaff > 0 || notStarted > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {notStarted + behindStaff} staff member{notStarted + behindStaff > 1 ? 's' : ''} need
              attention
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {notStarted > 0 && `${notStarted} haven't started training. `}
              {behindStaff > 0 && `${behindStaff} are behind schedule.`}
            </p>
          </div>
        </div>
      )}

      {/* Summary stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Total Staff</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalStaff}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-gray-500">Fully Compliant</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {compliantStaff}/{totalStaff}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500">Avg Completion</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{avgCompletion}%</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-gray-500">Certifications</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">0</p>
          <p className="text-[10px] text-gray-400">Coming soon</p>
        </div>
      </div>

      {/* TRS Category progress bars */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Company-Wide TRS Category Progress
        </h3>
        <div className="grid grid-cols-4 gap-6">
          {TRS_CATEGORIES.map((cat) => {
            const catAvg =
              staffProgress.length > 0
                ? Math.round(
                    staffProgress.reduce((sum, s) => sum + s.categories[cat.key].percentage, 0) /
                      staffProgress.length
                  )
                : 0

            const colors = {
              blue: { bar: 'bg-blue-500', bg: 'bg-blue-100', text: 'text-blue-600' },
              green: { bar: 'bg-green-500', bg: 'bg-green-100', text: 'text-green-600' },
              purple: { bar: 'bg-purple-500', bg: 'bg-purple-100', text: 'text-purple-600' },
              orange: { bar: 'bg-orange-500', bg: 'bg-orange-100', text: 'text-orange-600' },
            }[cat.color]

            return (
              <div key={cat.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-600">{cat.label}</span>
                  <span className={`text-xs font-bold ${colors.text}`}>{catAvg}%</span>
                </div>
                <div className={`h-2.5 rounded-full ${colors.bg}`}>
                  <div
                    className={`h-2.5 rounded-full ${colors.bar} transition-all duration-500`}
                    style={{ width: `${catAvg}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Staff table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table header controls */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="progress-desc">Progress (High → Low)</option>
              <option value="progress-asc">Progress (Low → High)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                {TRS_CATEGORIES.map((cat) => (
                  <th
                    key={cat.key}
                    className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {cat.label.replace('Cat ', '').replace(': ', '\n')}
                  </th>
                ))}
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Overall
                </th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStaff.map((staff) => {
                const status = getStatusBadge(staff.overallProgress)
                const initials = staff.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)

                return (
                  <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold flex-shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{staff.name}</p>
                          {staff.lastActivity && (
                            <p className="text-[10px] text-gray-400">
                              Last active:{' '}
                              {new Date(staff.lastActivity).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    {TRS_CATEGORIES.map((cat) => {
                      const catData = staff.categories[cat.key]
                      const colors = {
                        blue: 'text-blue-600',
                        green: 'text-green-600',
                        purple: 'text-purple-600',
                        orange: 'text-orange-600',
                      }[cat.color]

                      return (
                        <td key={cat.key} className="px-3 py-3.5 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`text-sm font-semibold ${
                                catData.percentage === 100 ? 'text-emerald-600' : colors
                              }`}
                            >
                              {catData.percentage}%
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {catData.completed}/{catData.total}
                            </span>
                          </div>
                        </td>
                      )
                    })}
                    <td className="px-3 py-3.5 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              staff.overallProgress === 100
                                ? 'bg-emerald-500'
                                : staff.overallProgress >= 50
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${staff.overallProgress}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {staff.overallProgress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
          Showing {filteredStaff.length} of {STAFF_MEMBERS.length} staff members
        </div>
      </div>
    </div>
  )
}
