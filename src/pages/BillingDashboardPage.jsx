import { useState, useEffect } from 'react'
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  Receipt,
  AlertCircle,
  Clock,
  DollarSign,
  FileText,
  CheckCircle2,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import { supabase } from '../lib/supabase'

function formatCurrency(n) {
  if (n == null) return '—'
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function MetricCard({ label, value, delta, icon: Icon, accent = 'blue', suffix }) {
  const accents = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    red: { bg: 'bg-red-50', text: 'text-red-600' },
  }
  const a = accents[accent] || accents.blue

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
        {value}
        {suffix && <span className="text-sm text-gray-400 font-normal ml-1">{suffix}</span>}
      </p>
    </div>
  )
}

export default function BillingDashboardPage() {
  const { mobileMode } = useViewMode()
  const [metrics, setMetrics] = useState({
    mrr: null,
    outstanding: null,
    collected: null,
    overdue: null,
  })
  const [recentInvoices, setRecentInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBilling() {
      if (!supabase) {
        setLoading(false)
        return
      }
      try {
        const safe = async (q) => {
          const res = await q
          if (res.error) {
            console.warn('Billing query skipped:', res.error.message)
            return { data: [] }
          }
          return res
        }

        const [invoicesRes] = await Promise.all([
          safe(
            supabase
              .from('invoices')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(50)
          ),
        ])

        const invoices = invoicesRes.data || []
        setRecentInvoices(invoices.slice(0, 5))

        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        let outstanding = 0
        let collected = 0
        let overdue = 0
        for (const inv of invoices) {
          const amt = Number(inv.amount) || 0
          if (inv.status === 'paid') {
            const paidAt = inv.paid_at ? new Date(inv.paid_at) : null
            if (paidAt && paidAt >= monthStart) collected += amt
          } else {
            outstanding += amt
            const due = inv.due_date ? new Date(inv.due_date) : null
            if (due && due < now) overdue += amt
          }
        }

        setMetrics({
          mrr: null, // requires subscription data — leave as placeholder
          outstanding: outstanding || null,
          collected: collected || null,
          overdue: overdue || null,
        })
      } catch (err) {
        console.error('Billing dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBilling()
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Billing Dashboard</h2>
            <p className="text-gray-500 mt-0.5 text-sm">
              Monthly revenue, outstanding balances, and invoice activity at a glance.
            </p>
          </div>
        </div>
      </div>

      {/* Metric strip */}
      <div className={`grid gap-4 mb-6 ${mobileMode ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'}`}>
        <MetricCard
          label="Monthly Recurring"
          value={formatCurrency(metrics.mrr)}
          icon={DollarSign}
          accent="blue"
        />
        <MetricCard
          label="Collected This Month"
          value={formatCurrency(metrics.collected)}
          icon={CheckCircle2}
          accent="emerald"
        />
        <MetricCard
          label="Outstanding"
          value={formatCurrency(metrics.outstanding)}
          icon={Clock}
          accent="amber"
        />
        <MetricCard
          label="Overdue"
          value={formatCurrency(metrics.overdue)}
          icon={AlertCircle}
          accent="red"
        />
      </div>

      {/* Two-column section */}
      <div className={`grid gap-4 ${mobileMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
        {/* Recent Invoices */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-4.5 h-4.5 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-900">Recent Invoices</h3>
            </div>
            {recentInvoices.length > 0 && (
              <span className="text-xs text-gray-400">Last 5</span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading invoices...</div>
          ) : recentInvoices.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-200 rounded-lg">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <FileText className="w-4.5 h-4.5 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-700">No invoices yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Invoice activity will appear here once billing is wired up.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {inv.description || inv.invoice_number || `Invoice #${inv.id.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {inv.due_date
                        ? `Due ${new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(Number(inv.amount) || 0)}
                    </span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                      inv.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-600'
                        : inv.status === 'overdue'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-amber-50 text-amber-600'
                    }`}>
                      {inv.status || 'open'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">Create Invoice</p>
                <p className="text-xs text-gray-400">Bill a family or business</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">Record Payment</p>
                <p className="text-xs text-gray-400">Log a received payment</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">Manage Plans</p>
                <p className="text-xs text-gray-400">Edit pricing & subscriptions</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Info footer */}
      <div className="mt-6 bg-blue-50/60 border border-blue-100 border-l-4 border-l-blue-500 rounded-xl p-4 flex gap-3">
        <CreditCard className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600">
          <p className="font-semibold text-blue-700 uppercase tracking-wider text-[10px] mb-1">
            Heads up
          </p>
          <p>
            This dashboard reads from an <code className="bg-white px-1 rounded text-[11px]">invoices</code> table when present.
            Connect Stripe from <span className="font-medium text-gray-800">Admin → Platform Settings → Integrations</span> to start collecting payments automatically.
          </p>
        </div>
      </div>
    </div>
  )
}
