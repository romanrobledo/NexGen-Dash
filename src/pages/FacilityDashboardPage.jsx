import { useState } from 'react'
import {
  Building2,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Search,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'

// ─── MOCK DATA — replace with real API later ──────────────────────────────────
const ROOMS = [
  {
    id: 'after-school-1',
    name: 'After School 1',
    current: '0:7',
    max: '1:26',
    staff: 0,
    students: 7,
    inRatio: false,
    checkedIn: [
      { name: 'Arilette Alaniz-Mata', initials: 'AA', time: '7:39 AM', color: '#2563EB', scheduled: false },
      { name: 'Jazari Alaniz-Mata', initials: 'JA', time: '7:39 AM', color: '#059669', scheduled: false },
      { name: 'Romel Benitez', initials: 'RB', time: '7:44 AM', color: '#7C3AED', scheduled: false },
      { name: 'Narciso Guzman', initials: 'NG', time: '7:17 AM', color: '#D97706', scheduled: false },
      { name: 'Emma Sanchez', initials: 'ES', time: '8:16 AM', color: '#DC2626', scheduled: false },
      { name: 'Nianah Sanchez', initials: 'NS', time: '7:40 AM', color: '#059669', scheduled: false },
      { name: 'Kaphar Vega', initials: 'KV', time: '7:32 AM', color: '#7C3AED', scheduled: false },
    ],
    scheduledToday: [
      { name: 'Belia Azua', initials: 'BA', time: '7:45 AM - 5:00 PM', color: '#2563EB' },
    ],
  },
  {
    id: 'after-school-2',
    name: 'After School 2',
    current: '0:7',
    max: '1:22',
    staff: 0,
    students: 7,
    inRatio: false,
    checkedIn: [
      { name: 'Araella Barrientos', initials: 'AB', time: '8:15 AM', color: '#DC2626', scheduled: false },
      { name: 'Raelynn Barrientos', initials: 'RB', time: '8:15 AM', color: '#DC2626', scheduled: false },
      { name: 'Alexa Garcia', initials: 'AG', time: '8:17 AM', color: '#059669', scheduled: false },
      { name: 'Natalie Garcia', initials: 'NG', time: '8:17 AM', color: '#D97706', scheduled: false },
      { name: 'Lorenzo Guzman', initials: 'LG', time: '7:17 AM', color: '#2563EB', scheduled: false },
      { name: 'Miracle Rodriguez', initials: 'MR', time: '7:47 AM', color: '#7C3AED', scheduled: false },
      { name: "Go'el Vega", initials: 'GV', time: '8:29 AM', color: '#059669', scheduled: false },
    ],
    scheduledToday: [
      { name: 'Maria Martinez', initials: 'MM', time: '8:15 AM - 5:30 PM', color: '#D97706' },
    ],
  },
  {
    id: 'infant-room',
    name: 'Infant Room',
    current: '0:3',
    max: '1:5',
    staff: 0,
    students: 3,
    inRatio: false,
    checkedIn: [
      { name: 'Carlos Garza', initials: 'CG', time: '5:30 PM', color: '#475569', scheduled: false },
      { name: 'Itzel Ledesma', initials: 'IL', time: '7:38 AM', color: '#D97706', scheduled: false },
      { name: "Jo'Lynn Moreno", initials: 'JM', time: '8:28 AM', color: '#7C3AED', scheduled: false },
    ],
    scheduledToday: [
      { name: 'Ruth Ramirez', initials: 'RR', time: '7:45 AM - 5:00 PM', color: '#DC2626' },
    ],
  },
  {
    id: 'pre-kinder-room',
    name: 'Pre-Kinder Room',
    current: '0:4',
    max: '1:18',
    staff: 0,
    students: 4,
    inRatio: false,
    checkedIn: [
      { name: 'Adelaida Azua', initials: 'AA', time: '8:17 AM', color: '#D97706', scheduled: false },
      { name: 'Raiden Benitez', initials: 'RB', time: '7:44 AM', color: '#DC2626', scheduled: false },
      { name: 'Joaquin Guzman', initials: 'JG', time: '7:17 AM', color: '#059669', scheduled: false },
      { name: 'Carolina Sanchez', initials: 'CS', time: '8:16 AM', color: '#7C3AED', scheduled: false },
    ],
    scheduledToday: [
      { name: 'Sylvia Rivera', initials: 'SR', time: '7:30 AM - 4:45 PM', color: '#DC2626' },
    ],
  },
  {
    id: 'pre-school-room',
    name: 'Pre-School Room',
    current: '0:10',
    max: '1:15',
    staff: 0,
    students: 10,
    inRatio: false,
    checkedIn: [
      { name: 'Reggie Benitez', initials: 'RB', time: '7:44 AM', color: '#DC2626', scheduled: false },
      { name: 'Joziah Garcia', initials: 'JG', time: '8:17 AM', color: '#059669', scheduled: false },
      { name: 'Deonie Glenn', initials: 'DG', time: '7:40 AM', color: '#2563EB', scheduled: false },
      { name: 'Evangeline Guzman', initials: 'EG', time: '7:17 AM', color: '#7C3AED', scheduled: false },
      { name: 'Ariel Mata Alaniz', initials: 'AMA', time: '7:39 AM', color: '#0891B2', scheduled: false },
      { name: 'Christian Osegueda', initials: 'CO', time: '7:22 AM', color: '#D97706', scheduled: false },
      { name: 'Sebastian Osegueda', initials: 'SO', time: '7:22 AM', color: '#059669', scheduled: false },
      { name: 'Virginia Salinas', initials: 'VS', time: '7:39 AM', color: '#2563EB', scheduled: false },
      { name: 'Jason Soto', initials: 'JS', time: '7:03 AM', color: '#7C3AED', scheduled: false },
      { name: 'Jachin Vega', initials: 'JV', time: '7:32 AM', color: '#DC2626', scheduled: false },
    ],
    scheduledToday: [
      { name: 'Joanna Segura', initials: 'JS', time: '8:15 AM - 5:30 PM', color: '#D97706' },
    ],
  },
  {
    id: 'toddler-room',
    name: 'Toddler Room',
    current: '0:7',
    max: '1:11',
    staff: 0,
    students: 7,
    inRatio: false,
    checkedIn: [
      { name: 'Ray Barrientos', initials: 'RB', time: '8:15 AM', color: '#DC2626', scheduled: false },
      { name: 'Nevaeh Gomez', initials: 'NG', time: '8:17 AM', color: '#059669', scheduled: false },
      { name: 'Valentina Guzman', initials: 'VG', time: '7:17 AM', color: '#D97706', scheduled: false },
      { name: 'Daniela Moreno', initials: 'DM', time: '8:17 AM', color: '#7C3AED', scheduled: false },
      { name: 'Violet Rivera', initials: 'VR', time: '8:15 AM', color: '#DC2626', scheduled: false },
      { name: 'Aiyana Sauceda', initials: 'AS', time: '7:02 AM', color: '#059669', scheduled: false },
      { name: 'Camila Velasquez', initials: 'CV', time: '7:24 AM', color: '#475569', scheduled: false },
    ],
    scheduledToday: [
      { name: 'Anjelica Sanchez', initials: 'AS', time: '8:15 AM - 5:30 PM', color: '#DC2626' },
      { name: 'Mary Jane Almanza', initials: 'MJA', time: '7:30 AM - 4:45 PM', color: '#7C3AED' },
    ],
  },
  {
    id: 'young-toddler-room',
    name: 'Young Toddler Room',
    current: '0:4',
    max: '1:9',
    staff: 0,
    students: 4,
    inRatio: false,
    checkedIn: [],
    scheduledToday: [],
  },
]

// ─── STUDENT CHIP ─────────────────────────────────────────────────────────────
function StudentChip({ student }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.5rem 0.75rem',
        background: student.color + '08',
        border: `1px solid ${student.color}20`,
        borderRadius: '10px',
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: student.color,
          color: '#fff',
          fontSize: '0.65rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {student.initials}
      </div>
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#0F172A',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {student.name}
        </p>
        <p
          style={{
            fontSize: '0.68rem',
            color: '#64748B',
            margin: 0,
          }}
        >
          {student.scheduled === false ? 'Unscheduled' : 'Scheduled'} (Checked in at {student.time})
        </p>
      </div>
    </div>
  )
}

// ─── ROOM CARD ────────────────────────────────────────────────────────────────
function RoomCard({ room, mobileMode }) {
  const [open, setOpen] = useState(false)
  const hasDetails = room.checkedIn.length > 0 || room.scheduledToday.length > 0

  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${room.inRatio ? '#E2E8F0' : '#FECACA'}`,
        borderRadius: '14px',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <button
        onClick={() => hasDetails && setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: mobileMode ? '1rem' : '1rem 1.25rem',
          background: 'none',
          border: 'none',
          cursor: hasDetails ? 'pointer' : 'default',
          fontFamily: "'DM Sans', sans-serif",
          textAlign: 'left',
        }}
      >
        {/* Status icon */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: room.inRatio ? '#F0FDF4' : '#FEF2F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {room.inRatio ? (
            <CheckCircle2 size={18} style={{ color: '#059669' }} />
          ) : (
            <AlertTriangle size={18} style={{ color: '#EF4444' }} />
          )}
        </div>

        {/* Room name + chevron */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
          <span
            style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              color: '#0F172A',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {room.name}
          </span>
          {hasDetails && (
            open ? <ChevronUp size={16} style={{ color: '#94A3B8', flexShrink: 0 }} />
                 : <ChevronDown size={16} style={{ color: '#94A3B8', flexShrink: 0 }} />
          )}
        </div>

        {/* Stats */}
        {mobileMode ? (
          <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.55rem', fontWeight: 700, color: '#94A3B8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ratio</p>
              <p style={{ fontSize: '0.88rem', fontWeight: 800, color: room.inRatio ? '#059669' : '#EF4444', margin: 0 }}>{room.current}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.55rem', fontWeight: 700, color: '#94A3B8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Students</p>
              <p style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{room.students}</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1.5rem', flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Current</p>
              <p style={{ fontSize: '0.95rem', fontWeight: 800, color: room.inRatio ? '#059669' : '#EF4444', margin: 0 }}>{room.current}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Max</p>
              <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{room.max}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Staff</p>
              <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{room.staff}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Students</p>
              <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{room.students}</p>
            </div>
          </div>
        )}
      </button>

      {/* Expanded details */}
      {open && hasDetails && (
        <div
          style={{
            padding: mobileMode ? '0 1rem 1rem' : '0 1.25rem 1.25rem',
            borderTop: '1px solid #F1F5F9',
          }}
        >
          {/* Checked in */}
          {room.checkedIn.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <p
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#475569',
                  margin: '0 0 0.6rem',
                }}
              >
                {room.checkedIn.length} student{room.checkedIn.length !== 1 ? 's' : ''} checked in
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: mobileMode
                    ? 'minmax(0, 1fr)'
                    : 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '0.5rem',
                }}
              >
                {room.checkedIn.map((s, i) => (
                  <StudentChip key={i} student={s} />
                ))}
              </div>
            </div>
          )}

          {/* Scheduled today */}
          {room.scheduledToday.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <p
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#475569',
                  margin: '0 0 0.6rem',
                }}
              >
                Scheduled for today
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: mobileMode
                    ? 'minmax(0, 1fr)'
                    : 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '0.5rem',
                }}
              >
                {room.scheduledToday.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.5rem 0.75rem',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: s.color,
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {s.initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        {s.name}
                      </p>
                      <p style={{ fontSize: '0.68rem', color: '#64748B', margin: 0 }}>
                        Scheduled for {s.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function FacilityDashboardPage() {
  const { mobileMode } = useViewMode()
  const [search, setSearch] = useState('')

  const outOfRatio = ROOMS.filter((r) => !r.inRatio)
  const inRatio = ROOMS.filter((r) => r.inRatio)

  const filter = (rooms) => {
    if (!search.trim()) return rooms
    const q = search.toLowerCase()
    return rooms.filter((r) => r.name.toLowerCase().includes(q))
  }

  const totalStudents = ROOMS.reduce((s, r) => s + r.students, 0)
  const totalStaff = ROOMS.reduce((s, r) => s + r.staff, 0)
  const totalOutOfRatio = outOfRatio.length

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-3">
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              background: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#0F172A',
                margin: 0,
                letterSpacing: '-0.03em',
              }}
            >
              Facility Dashboard
            </h2>
            <p
              style={{
                color: '#64748B',
                marginTop: '0.35rem',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              Live classroom ratios, student counts, and staff coverage across the building.
            </p>
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobileMode ? 'repeat(3, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        <div
          style={{
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rooms</p>
          <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '0.15rem 0 0' }}>{ROOMS.length}</p>
        </div>
        <div
          style={{
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Students</p>
          <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '0.15rem 0 0' }}>{totalStudents}</p>
        </div>
        <div
          style={{
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Staff</p>
          <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '0.15rem 0 0' }}>{totalStaff}</p>
        </div>
        {!mobileMode && (
          <div
            style={{
              background: totalOutOfRatio > 0 ? '#FEF2F2' : '#F0FDF4',
              border: `1px solid ${totalOutOfRatio > 0 ? '#FECACA' : '#BBF7D0'}`,
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Out of Ratio</p>
            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: totalOutOfRatio > 0 ? '#EF4444' : '#059669', margin: '0.15rem 0 0' }}>{totalOutOfRatio}</p>
          </div>
        )}
      </div>

      {/* Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '0.55rem 0.85rem',
          marginBottom: '1.25rem',
          maxWidth: 280,
        }}
      >
        <Search size={15} style={{ color: '#94A3B8', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search rooms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            fontSize: '0.82rem',
            color: '#0F172A',
            fontFamily: "'DM Sans', sans-serif",
            width: '100%',
            background: 'transparent',
          }}
        />
      </div>

      {/* Out of Ratio */}
      {filter(outOfRatio).length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#EF4444',
              margin: '0 0 0.6rem',
            }}
          >
            Out of Ratio
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {filter(outOfRatio).map((room) => (
              <RoomCard key={room.id} room={room} mobileMode={mobileMode} />
            ))}
          </div>
        </div>
      )}

      {/* In Ratio */}
      {filter(inRatio).length > 0 && (
        <div>
          <p
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#059669',
              margin: '0 0 0.6rem',
            }}
          >
            In Ratio
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {filter(inRatio).map((room) => (
              <RoomCard key={room.id} room={room} mobileMode={mobileMode} />
            ))}
          </div>
        </div>
      )}

      {/* Footer note */}
      <div
        style={{
          background: '#7C3AED08',
          border: '1px solid #7C3AED25',
          borderLeft: '4px solid #7C3AED',
          borderRadius: '12px',
          padding: '1.1rem 1.4rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start',
          marginTop: '1.5rem',
        }}
      >
        <span style={{ fontSize: '1.1rem', marginTop: '1px' }}>🏫</span>
        <div>
          <p
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#7C3AED',
              margin: '0 0 0.3rem',
            }}
          >
            Facility Status
          </p>
          <p
            style={{
              fontSize: '0.86rem',
              color: '#374151',
              lineHeight: 1.65,
              margin: 0,
              fontStyle: 'italic',
              fontWeight: 500,
            }}
          >
            This dashboard shows static snapshot data. Connect your classroom management system to see
            real-time ratios, check-ins, and staff coverage update automatically throughout the day.
          </p>
        </div>
      </div>
    </div>
  )
}
