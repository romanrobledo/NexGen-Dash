import { useNavigate } from 'react-router-dom'
import {
  UserPlus,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Target,
  Flame,
  Snowflake,
  Clock,
  ArrowRight,
  Phone,
  Mail,
  Globe,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import { useLeadsData } from '../hooks/useLeadsData'

/**
 * Leads Dashboard — shares data source (`useLeadsData`) with the Marketing
 * Dashboard but presents a lead-centric operational view: where leads are
 * coming from, which ones are hot, and what's scheduled next.
 */

function MetricCard({ label, value, delta, icon: Icon, accent = 'indigo', suffix }) {
  const accents = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600' },
    emerald:{ bg: 'bg-emerald-50',text: 'text-emerald-600' },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-600' },
    rose:   { bg: 'bg-rose-50',   text: 'text-rose-600' },
  }
  const a = accents[accent] || accents.indigo

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${a.bg} flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${a.text}`} />
        </div>
        {delta != null && (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
            delta >= 0 ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">
        {value != null ? value : <span className="text-gray-300">—</span>}
        {suffix && value != null && <span className="text-sm text-gray-400 font-normal ml-1">{suffix}</span>}
      </p>
    </div>
  )
}

const SOURCE_ICONS = {
  web: Globe,
  website: Globe,
  form: Globe,
  phone: Phone,
  call: Phone,
  email: Mail,
  referral: Users,
  walk_in: UserPlus,
  walkin: UserPlus,
}

// Channel the raw source string into a friendly label + icon.
function describeSource(src) {
  const key = (src || '').toLowerCase()
  const Icon = SOURCE_ICONS[key] || Globe
  const label = src
    ? src.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Unknown'
  return { Icon, label }
}

export default function LeadsDashboardPage() {
  const { mobileMode } = useViewMode()
  const navigate = useNavigate()
  const { leads, tours, loading, metrics } = useLeadsData()

  // Most recent 5 leads for the activity list.
  const recentLeads = leads.slice(0, 5)

  // Rough hot/warm/cold split — uses `status` if present, otherwise recency.
  const now = new Date()
  const hotCut = new Date(now)
  hotCut.setDate(now.getDate() - 3)
  const warmCut = new Date(now)
  warmCut.setDate(now.getDate() - 14)

  const classify = (l) => {
    const status = (l.status || '').toLowerCase()
    if (['hot', 'new', 'scheduled'].includes(status)) return 'hot'
    if (['warm', 'contacted', 'following_up'].includes(status)) return 'warm'
    if (['cold', 'lost', 'closed'].includes(status)) return 'cold'
    const created = l.created_at ? new Date(l.created_at) : null
    if (!created) return 'warm'
    if (created >= hotCut) return 'hot'
    if (created >= warmCut) return 'warm'
    return 'cold'
  }

  const pipeline = leads.reduce(
    (acc, l) => {
      acc[classify(l)]++
      return acc
    },
    { hot: 0, warm: 0, cold: 0 }
  )

  // Source breakdown (top 4).
  const sourceCounts = leads.reduce((acc, l) => {
    const key = l.source || 'Unknown'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const topSources = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  // Upcoming tours (next 5 scheduled in the future).
  const upcomingTours = tours
    .filter((t) => {
      const when = t.scheduled_at ? new Date(t.scheduled_at) : null
      return when && when >= now
    })
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    .slice(0, 5)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Leads Dashboard</h2>
            <p className="text-gray-500 mt-0.5 text-sm">
              Intake, follow-up, and tour pipeline — shared with Marketing, run by Enrollment.
            </p>
          </div>
        </div>
      </div>

      {/* Metric strip */}
      <div className={`grid gap-4 mb-6 ${mobileMode ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'}`}>
        <MetricCard label="Leads This Month" value={metrics.leadsThisMonth} icon={UserPlus} accent="indigo" />
        <MetricCard label="Leads This Week"  value={metrics.leadsThisWeek}  icon={Clock}    accent="blue" />
        <MetricCard label="Tours Booked"     value={metrics.toursThisMonth} icon={Calendar} accent="amber" />
        <MetricCard label="Converted"        value={metrics.enrollmentsThisMonth} icon={Target} accent="emerald" />
      </div>

      {/* Two-column body */}
      <div className={`grid gap-4 ${mobileMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
        {/* Recent leads + upcoming tours — primary column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent leads */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4.5 h-4.5 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-900">Recent Leads</h3>
              </div>
              {leads.length > 0 && (
                <span className="text-xs text-gray-400">Last 5</span>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-400 text-sm">Loading leads...</div>
            ) : recentLeads.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <UserPlus className="w-4.5 h-4.5 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-700">No leads yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  New inquiries will appear here once intake is wired up.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentLeads.map((lead) => {
                  const { Icon: SrcIcon, label: srcLabel } = describeSource(lead.source)
                  const name =
                    lead.name ||
                    [lead.first_name, lead.last_name].filter(Boolean).join(' ') ||
                    lead.email ||
                    'Unnamed lead'
                  const bucket = classify(lead)
                  const badge = {
                    hot:  'bg-rose-50 text-rose-600',
                    warm: 'bg-amber-50 text-amber-600',
                    cold: 'bg-gray-100 text-gray-500',
                  }[bucket]
                  return (
                    <div key={lead.id || name} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <SrcIcon className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                          <p className="text-xs text-gray-400 truncate">
                            {srcLabel}
                            {lead.created_at && (
                              <>
                                {' · '}
                                {new Date(lead.created_at).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric',
                                })}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium capitalize shrink-0 ${badge}`}>
                        {bucket}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Upcoming tours */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-900">Upcoming Tours</h3>
              </div>
              <button
                onClick={() => navigate('/leads/tours')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-400 text-sm">Loading tours...</div>
            ) : upcomingTours.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Calendar className="w-4.5 h-4.5 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-700">No tours scheduled</p>
                <p className="text-xs text-gray-400 mt-1">
                  Book a tour from the Tours page to see it here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {upcomingTours.map((t) => {
                  const when = new Date(t.scheduled_at)
                  const name =
                    t.guardian_name ||
                    t.name ||
                    [t.first_name, t.last_name].filter(Boolean).join(' ') ||
                    'Tour'
                  return (
                    <div key={t.id || `${name}-${t.scheduled_at}`} className="flex items-center justify-between py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                        <p className="text-xs text-gray-400">
                          {when.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {' · '}
                          {when.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-600 shrink-0 capitalize">
                        {t.status || 'scheduled'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column — pipeline & sources */}
        <div className="space-y-4">
          {/* Pipeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Pipeline</h3>
            <div className="space-y-3">
              <PipelineRow label="Hot"  value={pipeline.hot}  icon={Flame}     accent="rose" />
              <PipelineRow label="Warm" value={pipeline.warm} icon={Clock}     accent="amber" />
              <PipelineRow label="Cold" value={pipeline.cold} icon={Snowflake} accent="blue" />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">Conversion rate</span>
              <span className="text-sm font-bold text-gray-900">
                {metrics.conversionPct != null ? `${metrics.conversionPct}%` : '—'}
              </span>
            </div>
          </div>

          {/* Sources */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Sources</h3>
            {topSources.length === 0 ? (
              <p className="text-xs text-gray-400">
                Source mix will appear once leads carry a <code className="bg-gray-50 px-1 rounded text-[11px]">source</code> field.
              </p>
            ) : (
              <div className="space-y-3">
                {topSources.map(([src, count]) => {
                  const { Icon, label } = describeSource(src)
                  return (
                    <div key={src} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5 text-gray-600" />
                        </div>
                        <span className="text-sm text-gray-700 truncate">{label}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 shrink-0">{count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info footer */}
      <div className="mt-6 bg-indigo-50/60 border border-indigo-100 border-l-4 border-l-indigo-500 rounded-xl p-4 flex gap-3">
        <UserPlus className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600">
          <p className="font-semibold text-indigo-700 uppercase tracking-wider text-[10px] mb-1">
            Heads up
          </p>
          <p>
            Leads and Marketing read the same <code className="bg-white px-1 rounded text-[11px]">leads</code>,{' '}
            <code className="bg-white px-1 rounded text-[11px]">tours</code>, and{' '}
            <code className="bg-white px-1 rounded text-[11px]">enrollments</code> tables — so funnel numbers stay in sync across both dashboards.
          </p>
        </div>
      </div>
    </div>
  )
}

function PipelineRow({ label, value, icon: Icon, accent = 'rose' }) {
  const accents = {
    rose:  { bg: 'bg-rose-50',  text: 'text-rose-600',  bar: 'bg-rose-500'  },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-500' },
    blue:  { bg: 'bg-blue-50',  text: 'text-blue-600',  bar: 'bg-blue-500'  },
  }
  const a = accents[accent] || accents.rose
  const pct = Math.min(100, Math.max(8, value * 5))

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded ${a.bg} flex items-center justify-center`}>
            <Icon className={`w-3.5 h-3.5 ${a.text}`} />
          </div>
          <span className="text-xs font-medium text-gray-600">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-900">{value}</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${a.bar} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
