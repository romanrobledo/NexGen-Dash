import { useNavigate } from 'react-router-dom'
import { User, Clock3 } from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import { PROJECTS, PROJECT_STATUSES } from '../lib/projects'

/**
 * Renders the status legend + tile grid for the project list defined in
 * `src/lib/projects.js`.
 *
 * Deliberately NOT wrapped in a "THE PULSE" / "Where are we right now?"
 * card here — the card chrome lives on the Roadmap page (where this is a
 * section), while the dedicated /pulse page uses its own page-level header.
 * Keeping the wrapper out of this component lets both surfaces have their
 * own framing without forking the tile code.
 *
 * Tiles with a `link` field render as a clickable <button> that navigates
 * via React Router; tiles without a link stay as plain <div> info cards.
 * The two render paths are intentionally inline rather than split into
 * sub-components — there's only enough divergence in props (onClick,
 * hover effects, aria-label) to make a split heavier than helpful.
 */
export default function ProjectStatusBoard() {
  const navigate = useNavigate()
  const { mobileMode } = useViewMode()

  return (
    <>
      {/* Status legend — "Done" hidden until at least one project reaches it. */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.45rem',
          marginBottom: '1rem',
        }}
      >
        {Object.entries(PROJECT_STATUSES)
          .filter(([key]) => key !== 'done')
          .map(([key, s]) => (
            <span
              key={key}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.55rem',
                borderRadius: '999px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                fontSize: '0.68rem',
                fontWeight: 600,
                color: '#475569',
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: s.color,
                }}
              />
              {s.label}
            </span>
          ))}
      </div>

      {/* Project grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobileMode
            ? 'minmax(0, 1fr)'
            : 'repeat(2, minmax(0, 1fr))',
          gap: '0.75rem',
        }}
      >
        {PROJECTS.map((p, i) => {
          const status = PROJECT_STATUSES[p.status] || PROJECT_STATUSES.planning
          const isClickable = typeof p.link === 'string' && p.link.length > 0
          const TileTag = isClickable ? 'button' : 'div'
          const clickableStyle = isClickable
            ? {
                cursor: 'pointer',
                textAlign: 'left',
                font: 'inherit',
                color: 'inherit',
                transition:
                  'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
              }
            : {}
          const onClick = isClickable ? () => navigate(p.link) : undefined
          const onKeyDown = isClickable
            ? (e) => {
                // Enter/Space activate <button> natively — harmless redundancy
                // but matches what a11y reviewers expect to see.
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate(p.link)
                }
              }
            : undefined
          return (
            <TileTag
              key={i}
              type={isClickable ? 'button' : undefined}
              onClick={onClick}
              onKeyDown={onKeyDown}
              aria-label={isClickable ? `Open ${p.name}` : undefined}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderLeft: `4px solid ${status.color}`,
                borderRadius: '12px',
                padding: '1rem 1.15rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                minWidth: 0,
                width: '100%',
                ...clickableStyle,
              }}
              onMouseEnter={(e) => {
                if (!isClickable) return
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(15, 23, 42, 0.08)'
                e.currentTarget.style.borderColor = status.color + '80'
              }}
              onMouseLeave={(e) => {
                if (!isClickable) return
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = '#E2E8F0'
              }}
            >
              {/* Top row — name + status chip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '0.65rem',
                }}
              >
                <h4
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    margin: 0,
                    lineHeight: 1.35,
                    minWidth: 0,
                  }}
                >
                  {p.name}
                </h4>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.18rem 0.5rem',
                    borderRadius: '999px',
                    background: status.color + '15',
                    color: status.color,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: status.color,
                    }}
                  />
                  {status.label}
                </span>
              </div>

              {/* Progress bar */}
              {typeof p.progress === 'number' && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.7rem',
                      color: '#64748B',
                      marginBottom: '0.3rem',
                      fontWeight: 600,
                    }}
                  >
                    <span>Progress</span>
                    <span
                      style={{
                        color: status.color,
                        fontWeight: 800,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {p.progress}%
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: 6,
                      borderRadius: '999px',
                      background: '#E2E8F0',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.max(0, Math.min(100, p.progress))}%`,
                        height: '100%',
                        background: status.color,
                        borderRadius: '999px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Update note */}
              {p.update && (
                <p
                  style={{
                    fontSize: '0.78rem',
                    color: '#475569',
                    margin: 0,
                    lineHeight: 1.55,
                  }}
                >
                  {p.update}
                </p>
              )}

              {/* Owner footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.55rem',
                  borderTop: '1px dashed #E2E8F0',
                  fontSize: '0.72rem',
                  color: '#64748B',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontWeight: 600,
                  }}
                >
                  <User size={12} style={{ color: '#94A3B8' }} />
                  {p.owner}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Clock3 size={12} style={{ color: '#94A3B8' }} />
                  Updated recently
                </span>
              </div>
            </TileTag>
          )
        })}
      </div>
    </>
  )
}
