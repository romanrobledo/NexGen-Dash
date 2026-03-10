import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  Users,
  UserPlus,
  TrendingUp,
  CalendarPlus,
  Award,
  DollarSign,
  UserX,
  Loader2,
} from 'lucide-react'

const iconMap = {
  Users,
  UserPlus,
  TrendingUp,
  CalendarPlus,
  Award,
  DollarSign,
  UserX,
}

function MetricCard({ metric }) {
  const changeColor =
    metric.change_type === 'positive'
      ? 'text-green-600'
      : metric.change_type === 'negative'
        ? 'text-red-500'
        : 'text-gray-500'

  const IconComponent = iconMap[metric.icon] || Users

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500 leading-snug pr-2">{metric.title}</h3>
        <div
          className={`w-10 h-10 ${metric.icon_bg} rounded-xl flex items-center justify-center shrink-0`}
        >
          <IconComponent className={`w-5 h-5 ${metric.icon_color}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</p>
      <p className={`text-sm font-medium ${changeColor} mb-2`}>{metric.change}</p>
      <p className="text-xs text-gray-400 leading-relaxed">{metric.description}</p>
    </div>
  )
}

export default function MetricsDashboard() {
  const [weeklyMetrics, setWeeklyMetrics] = useState([])
  const [monthlyMetrics, setMonthlyMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchMetrics() {
      if (!supabase) {
        setError('Supabase not configured')
        setLoading(false)
        return
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('metrics')
          .select('*')
          .order('sort_order', { ascending: true })

        if (fetchError) throw fetchError

        setWeeklyMetrics(data.filter((m) => m.category === 'weekly'))
        setMonthlyMetrics(data.filter((m) => m.category === 'monthly'))
      } catch (err) {
        console.error('Error fetching metrics:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-gray-500">Loading metrics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">Failed to load metrics</p>
        <p className="text-red-400 text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">S.A.N.D.</h2>
        <p className="text-gray-500 mt-1">Sleep At Night Dashboard — Track your center's key performance metrics</p>
      </div>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {weeklyMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {monthlyMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>
    </div>
  )
}
