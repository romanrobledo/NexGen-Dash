import { useEffect } from 'react'
import {
  X,
  Mail,
  Phone,
  UserRound,
  Briefcase,
  Compass,
  Wrench,
  Clock,
  Sparkles,
  Trophy,
  Info,
} from 'lucide-react'
import {
  getRoleContent,
  hasAnyContent,
  ROLE_CONTACTS,
  ROLE_META,
  TONE_CLASSES,
} from '../lib/roleContent'

/**
 * Right-side slide-in for the Org Chart. Same visual pattern as the
 * Facility RoomDetailDrawer — dark backdrop, panel from the right, ESC
 * to close.
 *
 * Content flow:
 *   1. Header — emoji + name + title (from ROLE_CONTACTS)
 *   2. Contact strip — email, phone (or "Not set" placeholders)
 *   3. Five stacked sections — What / How / When / Why / How Do I Know —
 *      populated from getRoleContent(roleId). Each section shape-detects
 *      what the Compass page shipped and renders best-effort.
 *
 * Design intent per user ask: one drawer, everything visible. Do NOT
 * paginate or hide — this replaces the click-through Compass flow with
 * a single scrollable page per role.
 */
export default function OrgRoleDrawer({ roleId, onClose }) {
  // ESC closes — mirrors the Facility drawer's affordance.
  useEffect(() => {
    if (!roleId) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [roleId, onClose])

  if (!roleId) return null

  const contact = ROLE_CONTACTS[roleId] || {
    name: roleId,
    title: '',
    email: '',
    phone: '',
  }
  const meta = ROLE_META[roleId] || { emoji: '🧭', tagline: '', tone: 'indigo' }
  const tone = TONE_CLASSES[meta.tone] || TONE_CLASSES.indigo
  const content = getRoleContent(roleId)
  const anyContent = hasAnyContent(roleId)

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed right-0 top-0 h-full w-full sm:w-[640px] bg-white z-50 shadow-2xl flex flex-col"
        role="dialog"
        aria-label={`${contact.name} role details`}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-200">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${tone.iconBg}`}
          >
            {meta.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
              {contact.focusArea
                ? 'Focus Area'
                : contact.class
                  ? 'Role Class'
                  : 'Role'}
            </p>
            <h2 className="text-lg font-bold text-gray-900 leading-tight truncate">
              {contact.name}
              {contact.vacant && (
                <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 align-middle">
                  Vacant
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500 truncate">{contact.title}</p>
            {meta.tagline && (
              <p className="text-[11px] text-gray-400 italic mt-0.5 truncate">
                {meta.tagline}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex-shrink-0"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contact strip */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <ContactCell
            icon={UserRound}
            label="Point of contact"
            value={contact.name || '—'}
          />
          <ContactCell
            icon={Mail}
            label="Email"
            value={contact.email || 'Not set'}
            href={contact.email ? `mailto:${contact.email}` : null}
            muted={!contact.email}
          />
          <ContactCell
            icon={Phone}
            label="Phone"
            value={contact.phone || 'Not set'}
            href={contact.phone ? `tel:${contact.phone}` : null}
            muted={!contact.phone}
          />
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {!anyContent && (
            <div className="p-5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong className="font-semibold">
                    No role clarity content on file yet for this tile.
                  </strong>{' '}
                  Add an entry with{' '}
                  <code className="text-[10px] bg-amber-100 rounded px-1">
                    id: '{roleId}'
                  </code>{' '}
                  to the ROLES array in each of the Compass pages
                  (WhatDoIDoPage.jsx, HowDoIDoItPage.jsx,
                  WhenDoIDoItPage.jsx, WhyIsItImportantPage.jsx,
                  HowDoIKnowPage.jsx) and it'll show here automatically.
                </p>
              </div>
            </div>
          )}

          {anyContent && (
            <>
              <RoleSection
                icon={Briefcase}
                title="What Do I Do"
                subtitle="Role, ownership, responsibilities"
                content={content.whatDoIDo}
              />
              <RoleSection
                icon={Wrench}
                title="How Do I Do It"
                subtitle="Systems, cadence, tools"
                content={content.howDoIDoIt}
              />
              <RoleSection
                icon={Clock}
                title="When Do I Do It"
                subtitle="Rhythm, schedule, timing"
                content={content.whenDoIDoIt}
              />
              <RoleSection
                icon={Sparkles}
                title="Why Is It Important"
                subtitle="Impact on the business & the child"
                content={content.whyIsItImportant}
              />
              <RoleSection
                icon={Trophy}
                title="How Do I Know I'm Doing A Good Job"
                subtitle="KPIs, signals, feedback"
                content={content.howDoIKnow}
              />
            </>
          )}
        </div>
      </aside>
    </>
  )
}

// ─── Contact cell ─────────────────────────────────────────────────────────

function ContactCell({ icon: Icon, label, value, href, muted }) {
  const inner = (
    <div className="flex items-start gap-2 min-w-0">
      <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400 leading-none">
          {label}
        </p>
        <p
          className={`text-xs font-semibold mt-0.5 truncate ${
            muted ? 'text-gray-400 italic font-normal' : 'text-gray-900'
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  )
  if (href) {
    return (
      <a
        href={href}
        className="bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-indigo-300 transition-colors"
      >
        {inner}
      </a>
    )
  }
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
      {inner}
    </div>
  )
}

// ─── Section renderer ─────────────────────────────────────────────────────
//
// Each of the 5 Compass pages ships a slightly different content shape.
// Rather than build a formal renderer per shape, this component
// shape-detects the known top-level keys (overview, sections, focusAreas,
// responsibilities, categories, kpis, note, toolStack, why, impact, etc.)
// and renders each one in a sensible way. Unknown extra keys are ignored
// — safe by default, and easy to extend when we add more shapes.

function RoleSection({ icon: Icon, title, subtitle, content }) {
  const isEmpty = !content

  return (
    <section className="px-5 py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-gray-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {title}
        </h3>
      </div>
      {subtitle && (
        <p className="text-[10px] text-gray-400 italic mb-3 ml-6">
          {subtitle}
        </p>
      )}
      {isEmpty ? (
        <p className="text-xs text-gray-400 italic ml-6">
          Content coming for this section.
        </p>
      ) : (
        <div className="space-y-3">
          {content.overview && (
            <p className="text-sm text-gray-700 leading-relaxed">
              {content.overview}
            </p>
          )}

          {Array.isArray(content.focusAreas) &&
            content.focusAreas.length > 0 && (
              <FocusAreasBlock focusAreas={content.focusAreas} />
            )}

          {Array.isArray(content.responsibilities) &&
            content.responsibilities.length > 0 && (
              <ChecklistBlock
                title="Responsibilities"
                items={content.responsibilities}
              />
            )}

          {Array.isArray(content.sections) && content.sections.length > 0 && (
            <SectionsBlock sections={content.sections} />
          )}

          {content.toolStack && <ToolStackBlock toolStack={content.toolStack} />}

          {Array.isArray(content.categories) &&
            content.categories.length > 0 && (
              <SectionsBlock sections={content.categories} />
            )}

          {Array.isArray(content.kpis) && content.kpis.length > 0 && (
            <KPIsBlock kpis={content.kpis} />
          )}

          {content.why && (
            <p className="text-sm text-gray-700 leading-relaxed italic">
              {content.why}
            </p>
          )}

          {content.impact && (
            <p className="text-sm text-gray-700 leading-relaxed">
              {content.impact}
            </p>
          )}

          {content.note && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
              <p className="text-xs text-indigo-800 leading-relaxed">
                <span className="font-bold">Note · </span>
                {content.note}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function FocusAreasBlock({ focusAreas }) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {focusAreas.map((fa, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-lg p-3 border-l-4"
          style={{ borderLeftColor: fa.color || '#6366F1' }}
        >
          <p className="text-sm font-bold text-gray-900">{fa.pillar}</p>
          {fa.subtitle && (
            <p className="text-[11px] text-gray-500 italic mb-2">
              {fa.subtitle}
            </p>
          )}
          {Array.isArray(fa.items) && (
            <ul className="space-y-1">
              {fa.items.map((it, j) => (
                <li key={j} className="text-xs text-gray-700">
                  <span className="font-semibold text-gray-900">
                    {it.label}:
                  </span>{' '}
                  {it.detail}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

function ChecklistBlock({ title, items }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
        {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
            <span className="text-xs text-gray-700 leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SectionsBlock({ sections }) {
  return (
    <div className="space-y-2">
      {sections.map((s, i) => (
        <div
          key={i}
          className="bg-gray-50 border border-gray-200 rounded-lg p-3"
        >
          <p className="text-sm font-bold text-gray-900 mb-1">
            {s.title || s.name}
          </p>
          {s.description && (
            <p className="text-xs text-gray-700 leading-relaxed">
              {s.description}
            </p>
          )}
          {Array.isArray(s.items) && (
            <ul className="space-y-1 mt-2">
              {s.items.map((it, j) => (
                <li key={j} className="text-xs text-gray-700">
                  <span className="font-semibold text-gray-900">
                    {it.label}:
                  </span>{' '}
                  {it.detail}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

function ToolStackBlock({ toolStack }) {
  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 mb-1.5">
        Tool Stack
      </p>
      {toolStack.note && (
        <p className="text-xs text-indigo-800 italic mb-2 leading-relaxed">
          {toolStack.note}
        </p>
      )}
      {Array.isArray(toolStack.functions) && (
        <ul className="space-y-1.5">
          {toolStack.functions.map((f, i) => (
            <li key={i} className="text-xs text-indigo-900">
              <span className="mr-1">{f.emoji}</span>
              <span className="font-semibold">{f.name}:</span>{' '}
              {Array.isArray(f.tools) ? f.tools.join(', ') : f.tools}
              {f.owner && (
                <span className="text-indigo-600"> · {f.owner}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function KPIsBlock({ kpis }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
        Key Signals
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {kpis.map((k, i) => (
          <li
            key={i}
            className="bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5"
          >
            <p className="text-xs font-semibold text-emerald-900">
              {k.name || k.label || k}
            </p>
            {k.target && (
              <p className="text-[10px] text-emerald-700">
                Target: {k.target}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
