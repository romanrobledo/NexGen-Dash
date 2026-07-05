import {
  Activity,
  Heart,
  Users,
  HelpCircle,
  Calendar,
  MessageSquare,
  Target,
  Briefcase,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'

// ─── DATA ─────────────────────────────────────────────────────────────────────
const howWeHelp =
  'We give every child a safe, nurturing classroom and a trained teacher who guides their growth every day — so working parents have a partner they can trust.'

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

// Project status data (STATUSES + projects array) moved to src/lib/projects.js
// so the /pulse page and this Roadmap section share a single source of truth.
// The tile rendering moved to <ProjectStatusBoard /> for the same reason.

// ─── REUSABLE PIECES ──────────────────────────────────────────────────────────
const SectionCard = ({ label, title, children }) => (
  <div
    style={{
      background: '#fff',
      border: '1px solid #E2E8F0',
      borderRadius: '14px',
      padding: '1.5rem 1.75rem',
      marginBottom: '1rem',
    }}
  >
    <p
      style={{
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#94A3B8',
        margin: '0 0 0.35rem',
      }}
    >
      {label}
    </p>
    <h3
      style={{
        fontSize: '1.05rem',
        fontWeight: 800,
        color: '#0F172A',
        margin: '0 0 1rem',
        letterSpacing: '-0.01em',
      }}
    >
      {title}
    </h3>
    {children}
  </div>
)

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

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function QuickFocusPage() {
  const { mobileMode } = useViewMode()
  const ROSE = '#E11D48'

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
              background: ROSE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity className="w-6 h-6 text-white" />
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
              Heartbeat
            </h2>
            <p
              style={{
                color: '#64748B',
                marginTop: '0.35rem',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              NexGen SELF — our mission, method, and the rhythm we run to every single week.
            </p>
          </div>
        </div>
      </div>

      {/* ── NexGen SELF ──────────────────────────────────────── */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: mobileMode ? '1.25rem' : '1.75rem',
          marginBottom: '1rem',
          borderTop: `4px solid ${ROSE}`,
          minWidth: 0,
        }}
      >
        <p
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: ROSE,
            margin: '0 0 0.35rem',
          }}
        >
          The Identity
        </p>
        <h2
          style={{
            fontSize: '1.3rem',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0 0 1.25rem',
            letterSpacing: '-0.02em',
          }}
        >
          NexGen SELF
        </h2>

        {/* What we do */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.1rem 1.25rem',
            marginBottom: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.45rem' }}>
            <Heart size={16} style={{ color: ROSE }} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              What we do
            </h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#374151', margin: 0, lineHeight: 1.65 }}>
            We provide safe, high-quality child care and early education for working families.
          </p>
        </div>

        {/* Who we help */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.1rem 1.25rem',
            marginBottom: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.45rem' }}>
            <Users size={16} style={{ color: ROSE }} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Who we help
            </h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#374151', margin: 0, lineHeight: 1.65 }}>
            We help hardworking families who need affordable, trustworthy child care.
          </p>
        </div>

        {/* How we help */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.1rem 1.25rem',
            marginBottom: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.45rem' }}>
            <HelpCircle size={16} style={{ color: ROSE }} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              How we help
            </h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#374151', margin: 0, lineHeight: 1.65 }}>
            {howWeHelp}
          </p>
        </div>
      </div>

      {/* ── Productivity & Growth ───────────────────────────── */}
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

      {/* "The Pulse" / "Where are we right now?" project board has been
          moved off this page — it now lives at /tasks exclusively (the
          menu was originally called "Pulse" before being renamed). The
          ProjectStatusBoard component and underlying projects data remain
          in the repo (src/components/ProjectStatusBoard.jsx +
          src/lib/projects.js), they're just no longer mounted here. */}

      {/* The Heartbeat Standard */}
      <div
        style={{
          background: ROSE + '08',
          border: `1px solid ${ROSE}25`,
          borderLeft: `4px solid ${ROSE}`,
          borderRadius: '12px',
          padding: '1.1rem 1.4rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start',
        }}
      >
        <span style={{ fontSize: '1.1rem', marginTop: '1px' }}>❤️‍🔥</span>
        <div>
          <p
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: ROSE,
              margin: '0 0 0.3rem',
            }}
          >
            The Heartbeat
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
            This is the pulse of NexGen. If the identity is clear and the rhythm is kept, the
            business runs. If either one drifts, you feel it everywhere — in the classrooms, on
            the scorecard, and in the parents' trust.
          </p>
        </div>
      </div>
    </div>
  )
}
