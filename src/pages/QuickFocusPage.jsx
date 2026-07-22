import {
  Activity,
  Heart,
  Users,
  HelpCircle,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import WhoAreWePage from './WhoAreWePage'

// ─── DATA ─────────────────────────────────────────────────────────────────────
const howWeHelp =
  'We give every child a safe, nurturing classroom and a trained teacher who guides their growth every day — so working parents have a partner they can trust.'

// "The Rhythm" block (teams / cadence / agenda / outcomes) moved to
// /admin/meetings — this page now shows Who Are We content in its place.

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


      {/* ── Who Are We — replaces the previous "Rhythm" section ─────────
          The Rhythm (teams / cadence / agenda / outcomes) moved to
          /admin/meetings. In its place we render the Who Are We content
          so the Pulse page still reads as NexGen's identity + operating
          brief in one scroll. WhoAreWePage owns its own outer container,
          so we just drop it in. */}
      <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <WhoAreWePage />
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
