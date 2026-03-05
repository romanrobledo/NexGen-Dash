import {
  Users,
  UserPlus,
  TrendingUp,
  CalendarPlus,
  Award,
  DollarSign,
  Banknote,
  BarChart3,
  UserX,
} from 'lucide-react'

const weeklyMetrics = [
  {
    title: 'Occupancy Rate',
    value: '42',
    change: '+5% from last week',
    changeType: 'positive',
    description: 'Enrolled kids ÷ 175 licensed spots',
    icon: Users,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    title: 'New Leads',
    value: '3',
    change: '+1 from last week',
    changeType: 'positive',
    description: 'Count of new inquiries (calls, form fills, walk-ins) from Meta + word-of-mouth',
    icon: UserPlus,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Tours Held',
    value: '28',
    change: '+12% from last week',
    changeType: 'positive',
    description: 'Tours held ÷ Leads — Tour conversion %',
    icon: TrendingUp,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    title: 'New Enrollments & Withdrawals',
    value: '7',
    change: '-2 from last week',
    changeType: 'negative',
    description: 'Net change = Enrollments – Withdrawals',
    icon: CalendarPlus,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
  },
  {
    title: 'Average TRS Room Score',
    value: '320',
    change: 'Same as last week',
    changeType: 'neutral',
    description: "Rachel's 30-min assessments → 1–5 (or 1–10) score per classroom",
    icon: Award,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
]

const monthlyMetrics = [
  {
    title: 'Total Revenue & Net Profit',
    value: '48',
    change: '+6% from last month',
    changeType: 'positive',
    description: 'Goal: Net margin ≥ 20% as you grow',
    icon: Users,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Average Revenue per Child (ARPC)',
    value: '$24,500',
    change: '+8% from last month',
    changeType: 'positive',
    description: 'Total monthly revenue ÷ # of enrolled kids',
    icon: DollarSign,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    title: 'Monthly Churn % (Families Leaving)',
    value: '96%',
    change: '+2% from last month',
    changeType: 'positive',
    description: '# families who leave ÷ # families at start of month',
    icon: TrendingUp,
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
  },
  {
    title: 'Lifetime Gross Profit per Family (LTGP)',
    value: '4.8',
    change: 'Same as last month',
    changeType: 'neutral',
    description: 'Step 1: Gross profit per family/month = Revenue – direct care costs. Step 2: LTGP = Monthly gross profit ÷ Monthly churn %',
    icon: UserX,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
]

function MetricCard({ metric }) {
  const changeColor =
    metric.changeType === 'positive'
      ? 'text-green-600'
      : metric.changeType === 'negative'
        ? 'text-red-500'
        : 'text-gray-500'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500 leading-snug pr-2">{metric.title}</h3>
        <div
          className={`w-10 h-10 ${metric.iconBg} rounded-xl flex items-center justify-center shrink-0`}
        >
          <metric.icon className={`w-5 h-5 ${metric.iconColor}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</p>
      <p className={`text-sm font-medium ${changeColor} mb-2`}>{metric.change}</p>
      <p className="text-xs text-gray-400 leading-relaxed">{metric.description}</p>
    </div>
  )
}

export default function MetricsDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Metrics Dashboard</h2>
        <p className="text-gray-500 mt-1">Track your center's key performance metrics</p>
      </div>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {weeklyMetrics.map((metric) => (
            <MetricCard key={metric.title} metric={metric} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {monthlyMetrics.map((metric) => (
            <MetricCard key={metric.title} metric={metric} />
          ))}
        </div>
      </section>
    </div>
  )
}
