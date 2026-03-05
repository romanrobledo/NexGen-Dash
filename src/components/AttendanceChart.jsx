import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const data = [
  { day: 'Mon', present: 75, total: 84 },
  { day: 'Tue', present: 80, total: 84 },
  { day: 'Wed', present: 78, total: 84 },
  { day: 'Thu', present: 82, total: 84 },
  { day: 'Fri', present: 76, total: 84 },
]

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900 mb-1">{label}</p>
        <p className="text-sm text-primary">Present : {payload[0].value}</p>
        <p className="text-sm text-gray-500">Total : {data.find(d => d.day === label)?.total}</p>
      </div>
    )
  }
  return null
}

export default function AttendanceChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex-1">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Weekly Attendance</h3>
        <p className="text-sm text-gray-500">Daily attendance for the current week</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 13, fill: '#94a3b8' }}
          />
          <YAxis
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 13, fill: '#94a3b8' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="present"
            stroke="#7c3aed"
            strokeWidth={2}
            dot={{ r: 5, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 7, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
