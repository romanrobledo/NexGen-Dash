import { useParams, Navigate } from 'react-router-dom'
import {
  Bot,
  Sparkles,
  Info,
  DollarSign,
  Radio,
  AlertTriangle,
  AlertCircle,
  BellRing,
  Loader2,
  Briefcase,
  Search,
  Package,
  TrendingUp,
  Scale,
  MessageCircle,
  Users,
  Cpu,
} from 'lucide-react'
import { useOfficerBriefings } from '../hooks/useOfficerBriefings'

/**
 * Officer page — route: /officers/:officerKey.
 *
 * Live AI-agent feed. Paperclip agents POST briefings to per-officer n8n
 * webhooks; those fan out to Supabase (`officer_briefings`) and Notion
 * (per-officer database + shared COO Reports). This page reads the
 * Supabase feed for `officerKey` chronologically via
 * `useOfficerBriefings`.
 *
 * Replaces the Slack-fed pattern where every automation dumped into a
 * single #alerts channel. Each officer domain has a scoped feed so the
 * team sees, e.g., Revenue signals without scrolling past Ops noise.
 *
 * Ten officers, matching the Paperclip agency exactly. Sidebar order:
 * CEO, Junior COO, then the eight officers alphabetically — mirroring
 * the org where the eight report to Junior COO who reports to CEO.
 */

// Paperclip agency mapping — the 10 officers each get their own OS page
// and their own /webhook/nexgen-officer-<key> path. Order below is the
// sidebar/canonical order: CEO first, Junior COO second (their direct
// executor), then the eight officers alphabetically. Keys match the
// Paperclip agent ids exactly — never rename without coordinating a
// Paperclip release.
const OFFICERS = {
  ceo: {
    label: 'CEO',
    tagline: 'Executive summary — the highest-signal roll-up across the org.',
    icon: Sparkles,
    accent: 'indigo',
    scope:
      'Top-level exec view. Rolls up the highest-signal items from every other officer plus anything that hits founder-tier thresholds (major incidents, staff resignations, large revenue swings, PR/media mentions).',
  },
  'junior-coo': {
    label: 'Junior COO',
    tagline: "CEO's operator — day-to-day execution across the eight officers.",
    icon: Briefcase,
    accent: 'purple',
    scope:
      "The Junior COO synthesizes across all eight officer feeds and flags the items that need CEO attention. Also owns coordination briefings when work spans multiple officers (e.g. a launch that touches Revenue + Fulfillment + Response).",
  },
  detail: {
    label: 'Detail Officer',
    tagline: 'Precision, quality control, and eyes on the small things.',
    icon: Search,
    accent: 'blue',
    scope:
      'Quality assurance across every officer output. Catches copy errors, broken links, missing metadata, brand inconsistencies, and details that would embarrass the business if shipped.',
  },
  fulfillment: {
    label: 'Fulfillment Officer',
    tagline: 'Delivering what was promised — orders, projects, commitments.',
    icon: Package,
    accent: 'emerald',
    scope:
      'Delivery status on active projects, order fulfillment, milestone completion, SLA adherence, client onboarding progress.',
  },
  improvement: {
    label: 'Improvement Officer',
    tagline: 'Continuous improvement — where systems can be sharper.',
    icon: TrendingUp,
    accent: 'amber',
    scope:
      'Process improvements, workflow bottlenecks, tooling gaps, retrospective findings, KPI trends that suggest something needs to change.',
  },
  legal: {
    label: 'Legal Officer',
    tagline: 'Legal, regulatory, and compliance risk signals.',
    icon: Scale,
    accent: 'red',
    scope:
      'Contract deadlines, licensing/compliance events, regulatory filings, IP concerns, dispute resolution, terms/policy updates that need review.',
  },
  response: {
    label: 'Response Officer',
    tagline: 'Customer and stakeholder response — replies, escalations, sentiment.',
    icon: MessageCircle,
    accent: 'orange',
    scope:
      'Inbound support tickets, VIP-client threads, negative-review flags, complaint patterns, response-time SLA on customer-facing channels.',
  },
  revenue: {
    label: 'Revenue Officer',
    tagline: 'The money view — top-line, pipeline, and cash-flow signals.',
    icon: DollarSign,
    accent: 'teal',
    scope:
      'Revenue trends, pipeline movement, forecast variance, unpaid invoices, ARPC changes, churn signals, cash-flow projection updates.',
  },
  teams: {
    label: 'Teams Officer',
    tagline: 'People and team health — hiring, capacity, and morale.',
    icon: Users,
    accent: 'cyan',
    scope:
      'Hiring pipeline, staff attendance, PTO patterns, morale signals, one-on-one summaries, performance flags, team capacity vs demand.',
  },
  tech: {
    label: 'Tech Officer',
    tagline: 'Systems, infrastructure, and platform reliability.',
    icon: Cpu,
    accent: 'slate',
    scope:
      'Platform uptime, deploy events, incident post-mortems, security signals, integration health (n8n, Supabase, GHL, Drive), technical debt priorities.',
  },
}

const ACCENT_CLASSES = {
  indigo:  { icon: 'bg-indigo-500',  chip: 'bg-indigo-50 text-indigo-700 border-indigo-200',    dot: 'bg-indigo-500' },
  purple:  { icon: 'bg-purple-500',  chip: 'bg-purple-50 text-purple-700 border-purple-200',    dot: 'bg-purple-500' },
  blue:    { icon: 'bg-blue-500',    chip: 'bg-blue-50 text-blue-700 border-blue-200',          dot: 'bg-blue-500' },
  emerald: { icon: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  amber:   { icon: 'bg-amber-500',   chip: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
  red:     { icon: 'bg-red-500',     chip: 'bg-red-50 text-red-700 border-red-200',             dot: 'bg-red-500' },
  orange:  { icon: 'bg-orange-500',  chip: 'bg-orange-50 text-orange-700 border-orange-200',    dot: 'bg-orange-500' },
  teal:    { icon: 'bg-teal-500',    chip: 'bg-teal-50 text-teal-700 border-teal-200',          dot: 'bg-teal-500' },
  cyan:    { icon: 'bg-cyan-500',    chip: 'bg-cyan-50 text-cyan-700 border-cyan-200',          dot: 'bg-cyan-500' },
  slate:   { icon: 'bg-slate-500',   chip: 'bg-slate-50 text-slate-700 border-slate-200',       dot: 'bg-slate-500' },
}

export default function OfficerPage() {
  const { officerKey } = useParams()
  const officer = OFFICERS[officerKey]
  const { briefings, latest, loading, error } = useOfficerBriefings(officerKey)
  if (!officer) return <Navigate to="/officers/ceo" replace />

  const accent = ACCENT_CLASSES[officer.accent] || ACCENT_CLASSES.indigo
  const Icon = officer.icon
  const priorBriefings = briefings.slice(1) // everything except the latest

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent.icon}`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                {officer.label}
              </h2>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${accent.chip}`}
              >
                <Bot className="w-3 h-3" />
                AI Officer
              </span>
            </div>
            <p className="text-gray-500 mt-0.5 text-sm">{officer.tagline}</p>
          </div>
        </div>
      </div>

      {/* Scope banner */}
      <div className={`border rounded-2xl p-4 mb-5 flex items-start gap-3 ${accent.chip}`}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <p className="font-semibold mb-1">Scope</p>
          <p>{officer.scope}</p>
        </div>
      </div>

      {/* Latest briefing */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Radio className="w-5 h-5 text-gray-500" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-gray-900">Latest Briefing</h3>
            <p className="text-sm text-gray-500">
              The most recent report from this officer.
            </p>
          </div>
          {briefings.length > 0 && (
            <span className="text-[11px] font-semibold text-gray-400 tabular-nums whitespace-nowrap">
              {briefings.length} total
            </span>
          )}
        </div>

        {loading ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex items-center justify-center gap-3 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            <span className="text-sm">Loading briefings…</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-red-700">
                Couldn't load briefings
              </p>
              <p className="text-xs text-red-500 mt-0.5">{error}</p>
            </div>
          </div>
        ) : !latest ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${accent.icon}`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              No briefings yet
            </p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              First reports land Monday 6 AM.
            </p>
          </div>
        ) : (
          <BriefingCard briefing={latest} highlighted />
        )}
      </section>

      {/* Prior briefings feed (only shown when there's more than just the latest) */}
      {priorBriefings.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Radio className="w-5 h-5 text-gray-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-gray-900">
                Prior Briefings
              </h3>
              <p className="text-sm text-gray-500">
                {priorBriefings.length} earlier briefing
                {priorBriefings.length === 1 ? '' : 's'}, newest first.
              </p>
            </div>
          </div>
          <ul className="space-y-2">
            {priorBriefings.map((b) => (
              <li key={b.id}>
                <BriefingCard briefing={b} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Empty-state hint — only shown when the feed has zero briefings.
          Pipeline is live; this just orients a first-time viewer to why
          the feed is bare and where briefings come from. */}
      {!loading && !error && briefings.length === 0 && (
      <div className="bg-indigo-50/60 border border-indigo-100 border-l-4 border-l-indigo-500 rounded-xl p-4 flex gap-3">
        <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600 leading-relaxed">
          <p className="font-semibold text-indigo-700 uppercase tracking-wider text-[10px] mb-1">
            How briefings arrive
          </p>
          <p>
            Paperclip agents POST to{' '}
            <code className="bg-white px-1 rounded text-[11px]">
              /webhook/nexgen-officer-{officerKey}
            </code>
            , which routes into the shared{' '}
            <code className="bg-white px-1 rounded text-[11px]">
              officer_briefings
            </code>{' '}
            table and archive to Notion in parallel. First reports land
            Monday 6 AM.
          </p>
        </div>
      </div>
      )}
    </div>
  )
}

// ─── Briefing card ───────────────────────────────────────────────────────────

const SEVERITY_META = {
  info:     { label: 'Info',     Icon: Info,          chip: 'bg-gray-50 text-gray-700 border-gray-200',    dot: 'bg-gray-400' },
  notice:   { label: 'Notice',   Icon: BellRing,      chip: 'bg-blue-50 text-blue-700 border-blue-200',    dot: 'bg-blue-500' },
  warning:  { label: 'Warning',  Icon: AlertTriangle, chip: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  critical: { label: 'Critical', Icon: AlertCircle,   chip: 'bg-red-50 text-red-700 border-red-200',       dot: 'bg-red-500' },
}

function BriefingCard({ briefing, highlighted = false }) {
  const sev = SEVERITY_META[briefing.severity] || SEVERITY_META.info
  const SevIcon = sev.Icon
  return (
    <article
      className={`rounded-xl p-4 border ${
        highlighted
          ? 'bg-white border-gray-200 shadow-sm'
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-start gap-2 mb-2 flex-wrap">
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${sev.chip}`}
        >
          <SevIcon className="w-3 h-3" />
          {sev.label}
        </span>
        {briefing.source && (
          <span className="text-[11px] text-gray-400 inline-flex items-center gap-1">
            via <span className="font-semibold text-gray-500">{briefing.source}</span>
          </span>
        )}
        <span className="ml-auto text-[11px] text-gray-400 tabular-nums whitespace-nowrap">
          {formatWhen(briefing.sentAt)}
        </span>
      </div>
      <h4 className="text-sm font-bold text-gray-900 leading-snug mb-1">
        {briefing.title}
      </h4>
      {briefing.summary && (
        <p className="text-xs text-gray-600 leading-relaxed mb-2">
          {briefing.summary}
        </p>
      )}
      {briefing.bodyMd && (
        // Render body as pre-wrap text for now. When we need real markdown
        // rendering (headings, lists, links), swap in a markdown component.
        <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
          {briefing.bodyMd}
        </p>
      )}
    </article>
  )
}

function formatWhen(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffMin = Math.round((now.getTime() - d.getTime()) / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffMin < 60 * 24) return `${Math.round(diffMin / 60)}h ago`
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
