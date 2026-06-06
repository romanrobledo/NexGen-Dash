import { useState } from 'react'
import {
  Building2,
  ChevronDown,
  FileImage,
  Users,
  AlertTriangle,
  TrendingUp,
  Minus,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

const CLASSROOMS = [
  {
    name: 'After School 1',
    students: [
      { name: 'Arilette Alaniz-Mata', initials: 'AA', color: '#DC2626', posts: 0 },
      { name: 'Jazari Alaniz-Mata', initials: 'JA', color: '#D97706', posts: 0 },
      { name: 'Romel Benitez', initials: 'RB', color: '#059669', posts: 0 },
      { name: 'Narciso Guzman', initials: 'NG', color: '#D97706', posts: 0 },
      { name: 'Emma Sanchez', initials: 'ES', color: '#DC2626', posts: 0 },
      { name: 'Nianah Sanchez', initials: 'NS', color: '#059669', posts: 0 },
      { name: 'Kaphar Vega', initials: 'KV', color: '#7C3AED', posts: 0 },
    ],
  },
  {
    name: 'After School 2',
    students: [
      { name: 'Araella Barrientos', initials: 'AB', color: '#DC2626', posts: 0 },
      { name: 'Raelynn Barrientos', initials: 'RB', color: '#DC2626', posts: 0 },
      { name: 'Alexa Garcia', initials: 'AG', color: '#059669', posts: 0 },
      { name: 'Natalie Garcia', initials: 'NG', color: '#D97706', posts: 0 },
      { name: 'Lorenzo Guzman', initials: 'LG', color: '#2563EB', posts: 0 },
      { name: 'Miracle Rodriguez', initials: 'MR', color: '#7C3AED', posts: 0 },
      { name: "Go'el Vega", initials: 'GV', color: '#059669', posts: 0 },
    ],
  },
  {
    name: 'Infant Room',
    students: [
      { name: 'Amara Hernandez', initials: 'AH', color: '#2563EB', posts: 0 },
      { name: 'Sofia Lopez', initials: 'SL', color: '#7C3AED', posts: 0 },
      { name: 'Elias Martinez', initials: 'EM', color: '#059669', posts: 0 },
    ],
  },
  {
    name: 'Pre-Kinder Room',
    students: [
      { name: 'Isabella Reyes', initials: 'IR', color: '#DC2626', posts: 0 },
      { name: 'Mateo Cruz', initials: 'MC', color: '#2563EB', posts: 0 },
      { name: 'Luna Flores', initials: 'LF', color: '#D97706', posts: 0 },
      { name: 'Diego Santos', initials: 'DS', color: '#059669', posts: 0 },
    ],
  },
  {
    name: 'Pre-School Room',
    students: [
      { name: 'Valentina Morales', initials: 'VM', color: '#7C3AED', posts: 0 },
      { name: 'Sebastian Ruiz', initials: 'SR', color: '#2563EB', posts: 0 },
      { name: 'Camila Torres', initials: 'CT', color: '#DC2626', posts: 0 },
      { name: 'Andres Mendoza', initials: 'AM', color: '#059669', posts: 0 },
      { name: 'Mia Castillo', initials: 'MC', color: '#D97706', posts: 0 },
      { name: 'Julian Herrera', initials: 'JH', color: '#7C3AED', posts: 0 },
      { name: 'Sofia Delgado', initials: 'SD', color: '#2563EB', posts: 0 },
      { name: 'Nicolas Vargas', initials: 'NV', color: '#DC2626', posts: 0 },
      { name: 'Lucia Paredes', initials: 'LP', color: '#059669', posts: 0 },
      { name: 'Emiliano Rios', initials: 'ER', color: '#D97706', posts: 0 },
    ],
  },
  {
    name: 'Toddler Room',
    students: [
      { name: 'Elena Fuentes', initials: 'EF', color: '#DC2626', posts: 0 },
      { name: 'Gabriel Ochoa', initials: 'GO', color: '#2563EB', posts: 0 },
      { name: 'Renata Salazar', initials: 'RS', color: '#7C3AED', posts: 0 },
      { name: 'Thiago Medina', initials: 'TM', color: '#059669', posts: 0 },
      { name: 'Abril Navarro', initials: 'AN', color: '#D97706', posts: 0 },
      { name: 'Leo Espinoza', initials: 'LE', color: '#DC2626', posts: 0 },
      { name: 'Alma Guerrero', initials: 'AG', color: '#2563EB', posts: 0 },
    ],
  },
]

const STAFF_MEMBERS = [
  { name: 'iPad 1', initials: 'I1', color: '#059669', posts: 0 },
  { name: 'Cristela Aguirre de Rodriguez', initials: 'CAD', color: '#7C3AED', posts: 0 },
  { name: 'Mary Jane Almanza', initials: 'MJA', color: '#059669', posts: 0 },
  { name: 'Belia Azua', initials: 'BA', color: '#059669', posts: 0 },
  { name: 'Edzson Bague', initials: 'EB', color: '#059669', posts: 0 },
  { name: 'Robyn Hernandez', initials: 'RH', color: '#059669', posts: 0 },
  { name: 'Raquel Lopez', initials: 'RL', color: '#059669', posts: 0 },
  { name: 'Leticia Martinez', initials: 'LM', color: '#059669', posts: 0 },
  { name: 'Maria Martinez', initials: 'MM', color: '#DC2626', posts: 0 },
  { name: 'Ruth Ramirez', initials: 'RR', color: '#DC2626', posts: 0 },
]

// ─── Computed stats ──────────────────────────────────────────────────────────

const totalStudents = CLASSROOMS.reduce((sum, c) => sum + c.students.length, 0)
const studentsWithPost = CLASSROOMS.reduce(
  (sum, c) => sum + c.students.filter((s) => s.posts >= 1).length,
  0
)
const studentsWith3Posts = CLASSROOMS.reduce(
  (sum, c) => sum + c.students.filter((s) => s.posts >= 3).length,
  0
)
const avgPostsPerStudent =
  totalStudents > 0
    ? (
        CLASSROOMS.reduce((sum, c) => sum + c.students.reduce((s2, st) => s2 + st.posts, 0), 0) /
        totalStudents
      ).toFixed(2)
    : '0.00'
const classroomsNotEnough = CLASSROOMS.filter(
  (c) => c.students.some((s) => s.posts < 1)
).length
const totalClassrooms = CLASSROOMS.length

// ─── Components ──────────────────────────────────────────────────────────────

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color, minWidth: pct > 0 ? '8px' : '0' }}
      />
    </div>
  )
}

function StudentPostBar({ posts, maxPosts = 3 }) {
  const pct = Math.min((posts / maxPosts) * 100, 100)
  return (
    <div className="flex-1 h-2 bg-red-100 rounded-full overflow-hidden mx-3">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: posts > 0 ? `${pct}%` : '100%',
          backgroundColor: posts >= 3 ? '#059669' : posts >= 1 ? '#D97706' : '#FECACA',
        }}
      />
    </div>
  )
}

function AvatarChip({ initials, color, size = 'md' }) {
  const sizes = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
  }
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}

function SummaryCard({ title, value, subtitle, barValue, barMax, barColor }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
      <p className="text-sm text-gray-500 font-medium leading-snug">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      <ProgressBar value={barValue} max={barMax} color={barColor} />
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function FacilityEngagementPage() {
  const [selectedRoom, setSelectedRoom] = useState(CLASSROOMS[0].name)
  const [showAllStaff, setShowAllStaff] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { mobileMode } = useViewMode()

  const classroom = CLASSROOMS.find((c) => c.name === selectedRoom) || CLASSROOMS[0]
  const classroomAvg =
    classroom.students.length > 0
      ? (classroom.students.reduce((s, st) => s + st.posts, 0) / classroom.students.length).toFixed(2)
      : '0.00'
  const siteAvgNum = parseFloat(avgPostsPerStudent)
  const classroomAvgNum = parseFloat(classroomAvg)
  const vsSite =
    siteAvgNum > 0 ? (((classroomAvgNum - siteAvgNum) / siteAvgNum) * 100).toFixed(2) : '0.00'

  const visibleStaff = showAllStaff ? STAFF_MEMBERS : STAFF_MEMBERS.slice(0, 10)

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: '#EDE9FE' }}
        >
          <FileImage className="w-6 h-6" style={{ color: '#7C3AED' }} />
        </div>
        <div>
          <h1 className={`font-bold text-gray-900 ${mobileMode ? 'text-xl' : 'text-2xl'}`}>
            Engagement
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Daily posting activity across classrooms and staff members.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={`grid gap-4 mb-6 ${mobileMode ? 'grid-cols-1' : 'grid-cols-3'}`}>
        <SummaryCard
          title="Average # posts per student today"
          value={avgPostsPerStudent}
          subtitle={`${((studentsWithPost / totalStudents) * 100).toFixed(0)}% (${studentsWithPost}/${totalStudents} have at least one post)`}
          barValue={studentsWithPost}
          barMax={totalStudents}
          barColor="#059669"
        />
        <SummaryCard
          title="Students with 3 posts"
          value={studentsWith3Posts}
          subtitle={`${((studentsWith3Posts / totalStudents) * 100).toFixed(0)}% (${studentsWith3Posts}/${totalStudents} have at least 3 posts)`}
          barValue={studentsWith3Posts}
          barMax={totalStudents}
          barColor="#2563EB"
        />
        <SummaryCard
          title="Classrooms that haven't posted enough"
          value={classroomsNotEnough}
          subtitle={`${totalClassrooms - classroomsNotEnough}/${totalClassrooms} have enough posts for all students`}
          barValue={totalClassrooms - classroomsNotEnough}
          barMax={totalClassrooms}
          barColor="#DC2626"
        />
      </div>

      {/* Per Classroom Breakdown */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 mb-6">
        <div className={`flex items-center justify-between mb-5 ${mobileMode ? 'flex-col gap-3 items-start' : ''}`}>
          <h2 className="text-base font-semibold text-gray-900">Per classroom breakdown</h2>

          {/* Custom dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-w-[200px] justify-between"
            >
              {selectedRoom}
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-1 w-full bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                  {CLASSROOMS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setSelectedRoom(c.name)
                        setDropdownOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        c.name === selectedRoom
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-[#E2E8F0]" />

        <div className={`mt-4 ${mobileMode ? '' : 'flex gap-6'}`}>
          {/* Student list */}
          <div className={`${mobileMode ? '' : 'flex-1'}`}>
            <div className="space-y-0">
              {classroom.students.map((student, i) => (
                <div
                  key={student.name}
                  className={`flex items-center py-3 ${
                    i < classroom.students.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <AvatarChip initials={student.initials} color={student.color} />
                  <span className="text-sm font-medium text-blue-600 ml-3 min-w-[140px] truncate">
                    {student.name}
                  </span>
                  <StudentPostBar posts={student.posts} />
                  <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                    {student.posts} post{student.posts !== 1 ? 's' : ''} today
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Room average sidebar */}
          <div
            className={`${
              mobileMode
                ? 'mt-5 pt-5 border-t border-[#E2E8F0]'
                : 'w-56 shrink-0 border-l border-[#E2E8F0] pl-6'
            }`}
          >
            <p className="text-sm text-gray-500">Average # posts per student</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{classroomAvg}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg">
              <Minus className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-medium text-amber-700">
                {vsSite}% vs. site average
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts by Staff Member */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Posts by staff member</h2>
        <div className="border-t border-[#E2E8F0] mt-3" />

        <div className="space-y-0">
          {visibleStaff.map((member, i) => (
            <div
              key={member.name}
              className={`flex items-center py-3 ${
                i < visibleStaff.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <AvatarChip initials={member.initials} color={member.color} />
              <span className="text-sm font-medium text-gray-700 ml-3 flex-1 truncate">
                {member.name}
              </span>
              <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                {member.posts} post{member.posts !== 1 ? 's' : ''} today
              </span>
            </div>
          ))}
        </div>

        {STAFF_MEMBERS.length > 10 && (
          <button
            onClick={() => setShowAllStaff(!showAllStaff)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-3 transition-colors"
          >
            {showAllStaff ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-400 text-center mt-6">
        Data shown is static for demo purposes. Will connect to live engagement tracking.
      </p>
    </div>
  )
}
