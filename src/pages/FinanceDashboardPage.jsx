import { useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  PiggyBank,
  BarChart3,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'

// ─── MOCK DATA — replace with real API later ──────────────────────────────────
const FINANCE = {
  collections: {
    gross: 10847.86,
    net: 10589.57,
    trend: [320, 280, 410, 390, 520, 480, 600, 550, 470, 620, 580, 490, 710, 650, 530, 420, 380, 560, 640, 720, 690, 580, 510, 460, 530, 610, 99],
  },
  billed: {
    total: 10903.20,
    trend: [800, 750, 900, 2800, 1200, 850, 950, 1100, 2600, 1000, 900, 800, 750, 850, 2900, 1100, 950, 800, 750, 900, 1200, 2700, 1000, 850, 800, 750, 900],
  },
  aging: {
    total: 9762.91,
    buckets: [
      { label: 'Current', amount: 2100 },
      { label: '1-30', amount: 2200 },
      { label: '31-60', amount: 1800 },
      { label: '61-90', amount: 1500 },
      { label: '91+', amount: 5100 },
    ],
  },
  subsidies: {
    expected: 0.0,
    received: 0.0,
  },
  subsidiesByAgency: {
    total: 0.0,
  },
  paymentsReceived: {
    count: 156,
    trend: [5, 7, 6, 8, 10, 7, 6, 5, 9, 8, 7, 10, 12, 8, 7, 6, 9, 11, 8, 7, 6, 10, 9, 8, 15, 18, 12],
  },
  revenueBySrc: {
    total: 10847.86,
    trend: [200, 180, 250, 350, 280, 220, 300, 400, 320, 250, 200, 180, 250, 600, 350, 280, 220, 200, 180, 280, 350, 700, 400, 300, 250, 200, 180],
  },
  forecast: {
    date: '05/08/2026',
    total: 10992.0,
    trend: [700, 800, 750, 2800, 1200, 900, 800, 750, 900, 2600, 1100, 950, 800, 750, 850, 2700, 1000, 900, 800, 750, 900, 2900, 1100, 950, 800, 0, 0, 0],
  },
  expenses: {
    total: 0.0,
    byUser: 0.0,
    byCategory: 0.0,
  },
}

// ─── SPARKLINE ────────────────────────────────────────────────────────────────
function Sparkline({ data, color = '#2563EB', fill = true, height = 48 }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data, 1)
  const w = 200
  const h = height
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - (v / max) * h * 0.85 - h * 0.05
    return `${x},${y}`
  })
  const line = pts.join(' ')
  const fillPath = `M0,${h} L${pts.join(' L')} L${w},${h} Z`

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      style={{ width: '100%', height, display: 'block' }}
      preserveAspectRatio="none"
    >
      {fill && (
        <path d={fillPath} fill={color + '18'} />
      )}
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── BAR CHART (for aging) ────────────────────────────────────────────────────
function AgingBars({ buckets }) {
  const max = Math.max(...buckets.map((b) => b.amount), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 48, marginTop: 'auto' }}>
      {buckets.map((b, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div
            style={{
              width: '100%',
              height: Math.max((b.amount / max) * 48, 4),
              borderRadius: '4px 4px 0 0',
              background: i < 2 ? '#2563EB' : i < 4 ? '#F59E0B' : '#EF4444',
            }}
          />
          <span style={{ fontSize: '0.55rem', color: '#94A3B8', fontWeight: 600 }}>{b.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── METRIC CARD ──────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, iconBg, iconColor, title, value, subtitle, children, span = 1 }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: '14px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        gridColumn: span > 1 ? `span ${span}` : undefined,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              background: iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={17} style={{ color: iconColor }} />
          </div>
          <p
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#475569',
              margin: 0,
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            {title}
          </p>
        </div>
        <p
          style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            color: '#0F172A',
            margin: 0,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {value}
        </p>
      </div>
      {subtitle && (
        <p style={{ fontSize: '0.7rem', color: '#94A3B8', margin: 0, fontWeight: 600 }}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  )
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
function SectionHeader({ label, title }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <p
        style={{
          fontSize: '0.62rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#94A3B8',
          margin: 0,
        }}
      >
        {label}
      </p>
      <h3
        style={{
          fontSize: '1.05rem',
          fontWeight: 800,
          color: '#0F172A',
          margin: '0.15rem 0 0',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h3>
    </div>
  )
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return '$' + n.toFixed(2)
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function FinanceDashboardPage() {
  const { mobileMode } = useViewMode()
  const d = FINANCE

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
              background: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DollarSign className="w-6 h-6 text-white" />
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
              Finance Dashboard
            </h2>
            <p
              style={{
                color: '#64748B',
                marginTop: '0.35rem',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              Revenue, billing, expenses, and financial health at a glance.
            </p>
          </div>
        </div>
      </div>

      {/* ── Revenue & Collections ────────────────────────────── */}
      <SectionHeader label="Revenue" title="Collections & Billing" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobileMode ? '1fr' : 'repeat(3, minmax(0, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.5rem',
        }}
      >
        <MetricCard
          icon={TrendingUp}
          iconBg="#ECFDF5"
          iconColor="#059669"
          title="Total Collections"
          value={fmt(d.collections.gross)}
          subtitle={`${fmt(d.collections.gross)} Gross · ${fmt(d.collections.net)} Net`}
        >
          <Sparkline data={d.collections.trend} color="#059669" />
        </MetricCard>

        <MetricCard
          icon={CreditCard}
          iconBg="#EFF6FF"
          iconColor="#2563EB"
          title="Total Billed"
          value={fmt(d.billed.total)}
        >
          <Sparkline data={d.billed.trend} color="#2563EB" />
        </MetricCard>

        <MetricCard
          icon={Clock}
          iconBg="#FFF7ED"
          iconColor="#D97706"
          title="Aging Balance"
          value={fmt(d.aging.total)}
          subtitle="As of 04/10/2026"
        >
          <AgingBars buckets={d.aging.buckets} />
        </MetricCard>
      </div>

      {/* ── Subsidies & Payments ─────────────────────────────── */}
      <SectionHeader label="Subsidies & Payments" title="Government Funding & Payment Activity" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobileMode ? '1fr' : 'repeat(3, minmax(0, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.5rem',
        }}
      >
        <MetricCard
          icon={PiggyBank}
          iconBg="#F5F3FF"
          iconColor="#7C3AED"
          title="Total Subsidies"
          value={fmt(d.subsidies.expected)}
          subtitle={`${fmt(d.subsidies.expected)} Expected · ${fmt(d.subsidies.received)} Received`}
        >
          <Sparkline data={[0, 0, 0, 0, 0]} color="#7C3AED" />
        </MetricCard>

        <MetricCard
          icon={Receipt}
          iconBg="#F5F3FF"
          iconColor="#7C3AED"
          title="Subsidies by Agencies"
          value={fmt(d.subsidiesByAgency.total)}
        >
          <div
            style={{
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.72rem',
              color: '#CBD5E1',
              fontWeight: 600,
            }}
          >
            No agency data this period
          </div>
        </MetricCard>

        <MetricCard
          icon={BarChart3}
          iconBg="#EFF6FF"
          iconColor="#2563EB"
          title="Payments Received"
          value={d.paymentsReceived.count.toString()}
          subtitle="Total payment transactions"
        >
          <Sparkline data={d.paymentsReceived.trend} color="#2563EB" />
        </MetricCard>
      </div>

      {/* ── Revenue Breakdown & Forecast ─────────────────────── */}
      <SectionHeader label="Projections" title="Revenue Sources & Forecast" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobileMode ? '1fr' : 'repeat(2, minmax(0, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.5rem',
        }}
      >
        <MetricCard
          icon={TrendingUp}
          iconBg="#ECFDF5"
          iconColor="#059669"
          title="Revenue by Source"
          value={fmt(d.revenueBySrc.total)}
        >
          <Sparkline data={d.revenueBySrc.trend} color="#059669" />
        </MetricCard>

        <MetricCard
          icon={TrendingUp}
          iconBg="#EFF6FF"
          iconColor="#2563EB"
          title={`Forecasted Revenue (${d.forecast.date})`}
          value={fmt(d.forecast.total)}
        >
          <Sparkline data={d.forecast.trend} color="#2563EB" />
        </MetricCard>
      </div>

      {/* ── Expenses ─────────────────────────────────────────── */}
      <SectionHeader label="Expenses" title="Spending Overview" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobileMode ? '1fr' : 'repeat(3, minmax(0, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.5rem',
        }}
      >
        <MetricCard
          icon={TrendingDown}
          iconBg="#FEF2F2"
          iconColor="#EF4444"
          title="Total Expenses"
          value={fmt(d.expenses.total)}
        >
          <Sparkline data={[0, 0, 0, 0, 0]} color="#EF4444" />
        </MetricCard>

        <MetricCard
          icon={TrendingDown}
          iconBg="#FEF2F2"
          iconColor="#EF4444"
          title="Expenses by User"
          value={fmt(d.expenses.byUser)}
        >
          <div
            style={{
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.72rem',
              color: '#CBD5E1',
              fontWeight: 600,
            }}
          >
            No expense data this period
          </div>
        </MetricCard>

        <MetricCard
          icon={TrendingDown}
          iconBg="#FEF2F2"
          iconColor="#EF4444"
          title="Expenses by Category"
          value={fmt(d.expenses.byCategory)}
        >
          <div
            style={{
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.72rem',
              color: '#CBD5E1',
              fontWeight: 600,
            }}
          >
            No expense data this period
          </div>
        </MetricCard>
      </div>

      {/* Footer note */}
      <div
        style={{
          background: '#059669' + '08',
          border: '1px solid #05966925',
          borderLeft: '4px solid #059669',
          borderRadius: '12px',
          padding: '1.1rem 1.4rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start',
        }}
      >
        <span style={{ fontSize: '1.1rem', marginTop: '1px' }}>💰</span>
        <div>
          <p
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#059669',
              margin: '0 0 0.3rem',
            }}
          >
            Financial Health
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
            This dashboard shows static snapshot data. Connect your billing system to see real-time
            collections, aging, and forecasting data flow into these cards automatically.
          </p>
        </div>
      </div>
    </div>
  )
}
