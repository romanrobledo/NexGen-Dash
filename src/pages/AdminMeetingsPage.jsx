import {
  Users,
  Calendar,
  MessageSquare,
  Target,
  Briefcase,
  CalendarClock,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'

/**
 * Admin → Meetings — `/admin/meetings`.
 *
 * Holds "The Rhythm" content that used to live on the Pulse page. Same
 * data + same visuals; only the location moved. This is the operational
 * rhythm doc (teams / cadence / agenda / outcomes) — not a today-focus
 * dashboard, so it belongs under Admin, not Pulse.
 */

const teams = [
  'Targets', 'Sales', 'Marketing', 'Support', 'Training', 'Recruiting', 'Fulfillment',
  'Offers', 'Product', 'Customer Satisfaction / Success', 'Finance & Accounting', 'IT', 'HR',
]

const talkAboutLeft = [
  { label: 'Position', desc: 'Where are we currently at?' },
  { label: 'Targets', desc: "Where are we trying to go? KPI's" },
  { label: 'Performance Results', desc: 'Where did we come from?' },
  { label: 'Plan', desc: 'What are we currently doing?' },
  { label: 'Track', desc: 'How are we measuring progress or regression?' },
]

const talkAboutRight = [
  { label: 'Accountability', desc: 'Who is in charge of what?' },
  { label: 'Priorities', desc: 'Next 7 days' },
  { label: 'Problems', desc: 'Any Problems?' },
  { label: 'Issues', desc: 'Any Issues?' },
  { label: 'Concerns', desc: 'Any Concerns?' },
]

const StepBadge = ({ n, color }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 26,
      height: 26,
      borderRadius: '8px',
      background: color + '18',
      color,
      fontSize: '0.75rem',
      fontWeight: 800,
      flexShrink: 0,
    }}
  >
    {n}
  </span>
)

export default function AdminMeetingsPage() {
  const { mobileMode } = useViewMode()
  const INDIGO = '#2563EB'

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
              background: INDIGO,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarClock className="w-6 h-6 text-white" />
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
              Meetings
            </h2>
            <p
              style={{
                color: '#64748B',
                marginTop: '0.35rem',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              The rhythm we run to every single week — teams, cadence, agenda, outcomes.
            </p>
          </div>
        </div>
      </div>

      {/* ── The Rhythm — Productivity & Growth ─────────────── */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: mobileMode ? '1.25rem' : '1.75rem',
          marginBottom: '1rem',
          borderTop: '4px solid #2563EB',
          minWidth: 0,
        }}
      >
        <p
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#2563EB',
            margin: '0 0 0.35rem',
          }}
        >
          The Rhythm
        </p>
        <h2
          style={{
            fontSize: mobileMode ? '1.1rem' : '1.3rem',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0 0 1.25rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
          }}
        >
          How do we ensure productivity and growth?
        </h2>

        {/* Step 1 — Teams */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
            <StepBadge n={1} color="#2563EB" />
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                What are the teams?
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.1rem 0 0' }}>
                Snapshots of the business health in focused groups
              </p>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: mobileMode
                ? 'repeat(2, minmax(0, 1fr))'
                : 'repeat(4, minmax(0, 1fr))',
              gap: '0.5rem',
            }}
          >
            {teams.map((team, i) => (
              <div
                key={i}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '0.55rem 0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#334155',
                  minWidth: 0,
                }}
              >
                <Briefcase size={12} style={{ color: '#2563EB', flexShrink: 0 }} />
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                  }}
                >
                  {team}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: '#E2E8F0', margin: '0 0 1.5rem' }} />

        {/* Step 2 — Meet */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
            <StepBadge n={2} color="#7C3AED" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              When do we meet?
            </h3>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: mobileMode ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderLeft: '4px solid #7C3AED',
                borderRadius: '12px',
                padding: '1rem 1.15rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <Calendar size={15} style={{ color: '#7C3AED' }} />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Integrator &amp; Operator
                </h4>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {['45 Minutes', '1 / Week', 'Every Thursday @ 3:30pm'].map((t, i) => (
                  <li
                    key={i}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#374151' }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#7C3AED' }} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderLeft: '4px solid #2563EB',
                borderRadius: '12px',
                padding: '1rem 1.15rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <Users size={15} style={{ color: '#2563EB' }} />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Full Team
                </h4>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {[
                  '60 Minutes',
                  "1 / Month — Overlaps with Quarterly's",
                  'Every 2nd Monday of Every Month',
                ].map((t, i) => (
                  <li
                    key={i}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#374151' }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2563EB' }} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: '#E2E8F0', margin: '0 0 1.5rem' }} />

        {/* Step 3 — Talk about */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
            <StepBadge n={3} color="#2563EB" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              What do we talk about?
            </h3>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: mobileMode ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {talkAboutLeft.map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '0.7rem 0.9rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.55rem',
                  }}
                >
                  <MessageSquare size={13} style={{ color: '#2563EB', marginTop: '3px', flexShrink: 0 }} />
                  <div style={{ fontSize: '0.82rem', lineHeight: 1.55 }}>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>{item.label}</span>
                    <span style={{ color: '#64748B' }}> — {item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {talkAboutRight.map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '0.7rem 0.9rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.55rem',
                  }}
                >
                  <MessageSquare size={13} style={{ color: '#7C3AED', marginTop: '3px', flexShrink: 0 }} />
                  <div style={{ fontSize: '0.82rem', lineHeight: 1.55 }}>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>{item.label}</span>
                    <span style={{ color: '#64748B' }}> — {item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: '#E2E8F0', margin: '0 0 1.5rem' }} />

        {/* Step 4 — Finish */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
            <StepBadge n={4} color="#059669" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              What do we finish the meeting with?
            </h3>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6rem',
            }}
          >
            {['Target', 'Plan', 'Next meeting booked'].map((item, i) => (
              <div
                key={i}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderLeft: '3px solid #059669',
                  borderRadius: '10px',
                  padding: '0.65rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#0F172A',
                }}
              >
                <Target size={14} style={{ color: '#059669' }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
