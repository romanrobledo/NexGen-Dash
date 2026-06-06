import { useNavigate } from 'react-router-dom'
import {
  Megaphone,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Calendar,
  Gift,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import { useLeadsData } from '../hooks/useLeadsData'

function MetricCard({ label, value, delta, icon: Icon, accent = 'pink', suffix }) {
  const accents = {
    pink: { bg: 'bg-pink-50', text: 'text-pink-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  }
  const a = accents[accent] || accents.pink

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

// Placeholder offer shelf that mirrors the Marketing → Offers sidebar.
const OFFER_SHELF = [
  { label: 'Giveaways',              path: '/marketing/offers/giveaways', blurb: 'Bags, Kits, Baskets' },
  { label: 'Decoy',                  path: '/marketing/offers/decoy', blurb: 'Anchor pricing' },
  { label: 'Buy X, Get Y',           path: '/marketing/offers/buy-x-get-y', blurb: 'Bundle & save' },
  { label: 'Pay Less Now',           path: '/marketing/offers/pay-less-now', blurb: 'Front-loaded discount' },
  { label: 'Free Goodwill',          path: '/marketing/offers/free-goodwill', blurb: '3-month scholarship' },
]

export default function MarketingDashboardPage() {
  const { mobileMode } = useViewMode()
  const navigate = useNavigate()
  const { loading, metrics: shared } = useLeadsData()

  // Local shape — mirrors what the rest of the component expects.
  const metrics = {
    leads: shared.leadsThisMonth,
    tours: shared.toursThisMonth,
    enrollments: shared.enrollmentsThisMonth,
    conversion: shared.conversionPct,
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-pink-600 flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Marketing Dashboard</h2>
            <p className="text-gray-500 mt-0.5 text-sm">
              Lead flow, tour bookings, and offer performance across the funnel.
            </p>
          </div>
        </div>
      </div>

      {/* Metric strip */}
      <div className={`grid gap-4 mb-6 ${mobileMode ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'}`}>
        <MetricCard label="Leads This Month"  value={metrics.leads}       icon={Users}   accent="pink" />
        <MetricCard label="Tours Booked"      value={metrics.tours}       icon={Calendar} accent="blue" />
        <MetricCard label="Enrollments"       value={metrics.enrollments} icon={Target}  accent="emerald" />
        <MetricCard label="Conversion"        value={metrics.conversion}  icon={Sparkles} accent="purple" suffix="%" />
      </div>

      {/* Two-column section */}
      <div className={`grid gap-4 ${mobileMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
        {/* Offers shelf */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gift className="w-4.5 h-4.5 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-900">Active Offers</h3>
            </div>
            <button
              onClick={() => navigate('/marketing/offers')}
              className="text-xs font-medium text-pink-600 hover:text-pink-700 flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {OFFER_SHELF.map((o) => (
              <button
                key={o.label}
                onClick={() => navigate(o.path)}
                className="flex items-center justify-between gap-3 px-3 py-3 rounded-lg border border-gray-100 hover:border-pink-200 hover:bg-pink-50/40 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center shrink-0">
                    <Gift className="w-4 h-4 text-pink-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{o.label}</p>
                    <p className="text-xs text-gray-400 truncate">{o.blurb}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Funnel */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4.5 h-4.5 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">This Month's Funnel</h3>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
          ) : (
            <div className="space-y-3">
              <FunnelStep label="Leads"       value={metrics.leads}       accent="pink" />
              <FunnelStep label="Tours"       value={metrics.tours}       accent="blue" />
              <FunnelStep label="Enrollments" value={metrics.enrollments} accent="emerald" />
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Conversion rate</span>
            <span className="text-sm font-bold text-gray-900">
              {metrics.conversion != null ? `${metrics.conversion}%` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Info footer */}
      <div className="mt-6 bg-pink-50/60 border border-pink-100 border-l-4 border-l-pink-500 rounded-xl p-4 flex gap-3">
        <Megaphone className="w-4.5 h-4.5 text-pink-500 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600">
          <p className="font-semibold text-pink-700 uppercase tracking-wider text-[10px] mb-1">
            Heads up
          </p>
          <p>
            Metrics read from <code className="bg-white px-1 rounded text-[11px]">leads</code>,{' '}
            <code className="bg-white px-1 rounded text-[11px]">tours</code>, and{' '}
            <code className="bg-white px-1 rounded text-[11px]">enrollments</code> tables when present.
            Plug in Google Analytics or a form endpoint to start populating live numbers.
          </p>
        </div>
      </div>
    </div>
  )
}

function FunnelStep({ label, value, accent = 'pink' }) {
  const bars = {
    pink: 'bg-pink-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
  }
  const v = value ?? 0
  // Scale bar width relative to a soft cap so it reads visually even with small numbers.
  const pct = Math.min(100, Math.max(8, v * 5))

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-sm font-bold text-gray-900">
          {value != null ? value : <span className="text-gray-300">—</span>}
        </span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${bars[accent] || bars.pink} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
