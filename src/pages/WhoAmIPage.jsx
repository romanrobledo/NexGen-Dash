import { useNavigate } from 'react-router-dom'
import { UserCircle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import { useSelectedRoleId } from '../hooks/useSelectedRole'

/**
 * Master list of roles used across the Compass pages.
 * The `id` values MUST match the ids used in each Compass sub-page's ROLES array
 * (WhatDoIDoPage, HowDoIDoItPage, etc.) so selecting here drives those pages.
 */
const ROLES = [
  { id: 'visionary',        label: 'Visionary',             emoji: '👑', color: '#0F172A', tagline: 'You see the future. Your Integrator builds the road to it.' },
  { id: 'integrator',       label: 'Integrator',            emoji: '⚙️', color: '#1E3A8A', tagline: 'You run the machine. You make the vision real.' },
  { id: 'operator',         label: 'Operator',              emoji: '🏢', color: '#2563EB', tagline: 'You run the business. Everyone else runs their lane.' },
  { id: 'director',         label: 'Director',              emoji: '📋', color: '#7C3AED', tagline: 'You are the bridge between vision and classroom.' },
  { id: 'teacher',          label: 'Teacher',               emoji: '📚', color: '#059669', tagline: "You are the most important person in a child's day." },
  { id: 'teacher-assistant',label: 'Teacher Assistant',     emoji: '🤝', color: '#0891B2', tagline: "You make the teacher's job possible." },
  { id: 'front-desk',       label: 'Front Desk Manager',    emoji: '🖥️', color: '#D97706', tagline: 'You are the first impression families leave with.' },
  { id: 'hiring-manager',   label: 'Hiring Manager',        emoji: '🔍', color: '#DC2626', tagline: 'You build the team that builds the school.' },
  { id: 'tour-manager',     label: 'Tour Manager',          emoji: '🗺️', color: '#7C3AED', tagline: 'You turn curious families into enrolled families.' },
  { id: 'lesson-plans',     label: 'Lesson Plans Manager',  emoji: '📝', color: '#059669', tagline: 'You give teachers the roadmap.' },
  { id: 'kitchen-manager',  label: 'Kitchen Manager',       emoji: '🍽️', color: '#D97706', tagline: "You fuel every child's day." },
  { id: 'asst-kitchen',     label: 'Asst. Kitchen Manager', emoji: '🥄', color: '#0891B2', tagline: 'You keep the kitchen running when it matters most.' },
  { id: 'bus-driver',       label: 'Bus Driver',            emoji: '🚌', color: '#DC2626', tagline: "Every child on your route is someone's whole world." },
]

/**
 * Pages in the Compass "thinking flow" — after picking a role, staff walk through
 * these questions in order. This gives them the option to continue linearly.
 */
const FLOW = [
  { path: '/dashboard/what-do-i-do',         label: 'What Do I Do' },
  { path: '/dashboard/how-do-i-do-it',       label: 'How Do I Do It' },
  { path: '/dashboard/when-do-i-do-it',      label: 'When Do I Do It' },
  { path: '/dashboard/why-is-it-important',  label: 'Why Is It Important' },
  { path: '/dashboard/how-do-i-know',        label: 'How Do I Know I\'m Doing A Good Job' },
]

export default function WhoAmIPage() {
  const navigate = useNavigate()
  const { mobileMode } = useViewMode()
  const [selectedId, setSelectedId] = useSelectedRoleId()

  const selectedRole = ROLES.find((r) => r.id === selectedId) || null

  const handleSelect = (role) => {
    setSelectedId(role.id)
  }

  const handleClear = () => {
    setSelectedId(null)
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 880, margin: '0 auto' }}>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-white" />
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
              Who Am I?
            </h2>
            <p
              style={{
                color: '#64748B',
                marginTop: '0.35rem',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              Choose your role once, then walk through the Compass flow as that role.
            </p>
          </div>
        </div>
      </div>

      {/* Intro / Instructions */}
      <div
        style={{
          background: 'linear-gradient(135deg, #EEF2FF 0%, #EFF6FF 100%)',
          border: '1px solid #C7D2FE',
          borderRadius: 14,
          padding: mobileMode ? '1rem 1.1rem' : '1.15rem 1.5rem',
          marginBottom: '1.25rem',
        }}
      >
        <p
          style={{
            fontSize: '0.85rem',
            color: '#3730A3',
            margin: 0,
            lineHeight: 1.65,
            fontWeight: 500,
          }}
        >
          <strong style={{ fontWeight: 700 }}>Think one role at a time.</strong>{' '}
          Pick the role you're in today, then work through the Compass pages as that person.
          You can always come back here to switch roles and go through the flow again.
        </p>
      </div>

      {/* Role Selector Card */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: mobileMode ? '1.25rem 1rem' : '1.5rem 1.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,.04)',
        }}
      >
        <p
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#94A3B8',
            margin: '0 0 1rem',
          }}
        >
          Select Your Role
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: mobileMode ? '1fr 1fr' : 'repeat(3, 1fr)',
            gap: mobileMode ? 8 : 10,
          }}
        >
          {ROLES.map((role) => {
            const isActive = selectedId === role.id
            return (
              <button
                key={role.id}
                onClick={() => handleSelect(role)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: mobileMode ? '0.65rem 0.75rem' : '0.75rem 0.9rem',
                  borderRadius: 12,
                  border: isActive ? `2px solid ${role.color}` : '1.5px solid #E2E8F0',
                  background: isActive ? role.color + '10' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#F8FAFC'
                    e.currentTarget.style.borderColor = '#CBD5E1'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#fff'
                    e.currentTarget.style.borderColor = '#E2E8F0'
                  }
                }}
              >
                <span style={{ fontSize: '1.2rem', lineHeight: 1, flexShrink: 0 }}>
                  {role.emoji}
                </span>
                <span
                  style={{
                    fontSize: mobileMode ? '0.78rem' : '0.82rem',
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? role.color : '#374151',
                    lineHeight: 1.3,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {role.label}
                </span>
                {isActive && (
                  <CheckCircle2
                    size={16}
                    color={role.color}
                    style={{ flexShrink: 0 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Role Confirmation + Continue */}
      {selectedRole && (
        <div
          style={{
            marginTop: '1.25rem',
            background: '#fff',
            border: `2px solid ${selectedRole.color}25`,
            borderRadius: 16,
            padding: mobileMode ? '1.25rem 1rem' : '1.5rem 1.75rem',
            borderLeft: `4px solid ${selectedRole.color}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{selectedRole.emoji}</span>
            <div>
              <p
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#94A3B8',
                  margin: 0,
                }}
              >
                You selected
              </p>
              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: selectedRole.color,
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {selectedRole.label}
              </h3>
            </div>
          </div>
          <p
            style={{
              fontSize: '0.85rem',
              color: '#64748B',
              margin: '0 0 1rem',
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}
          >
            {selectedRole.tagline}
          </p>

          {/* Flow shortcut buttons */}
          <p
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#94A3B8',
              margin: '0 0 0.5rem',
            }}
          >
            Continue the flow
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            {FLOW.map((step, i) => (
              <button
                key={step.path}
                onClick={() => navigate(step.path)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: i === 0 ? '0.7rem 1.1rem' : '0.55rem 0.9rem',
                  borderRadius: 10,
                  border: i === 0 ? 'none' : `1.5px solid ${selectedRole.color}30`,
                  background: i === 0 ? selectedRole.color : selectedRole.color + '10',
                  color: i === 0 ? '#fff' : selectedRole.color,
                  fontSize: i === 0 ? '0.88rem' : '0.8rem',
                  fontWeight: i === 0 ? 800 : 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all .15s ease',
                  boxShadow: i === 0 ? `0 6px 14px -6px ${selectedRole.color}80` : 'none',
                }}
              >
                {i === 0 ? `Start Here — ${step.label}?` : `${i + 1}. ${step.label}`}
                {i === 0 && <ArrowRight size={15} />}
              </button>
            ))}
          </div>

          <button
            onClick={handleClear}
            style={{
              marginTop: '1rem',
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'inherit',
              textDecoration: 'underline',
            }}
          >
            Clear selection
          </button>
        </div>
      )}
    </div>
  )
}
