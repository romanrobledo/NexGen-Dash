const classes = [
  { name: 'Infants (0-1)', enrolled: 12, capacity: 15, color: 'bg-purple-500' },
  { name: 'Toddlers (1-2)', enrolled: 18, capacity: 20, color: 'bg-blue-500' },
  { name: 'Pre-K (2-3)', enrolled: 22, capacity: 25, color: 'bg-green-500' },
  { name: 'Kindergarten (3-4)', enrolled: 16, capacity: 20, color: 'bg-orange-500' },
  { name: 'School Age (4-5)', enrolled: 16, capacity: 20, color: 'bg-pink-500' },
]

export default function ClassOverview() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex-1">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Class Overview</h3>
        <p className="text-sm text-gray-500">Current enrollment by age group</p>
      </div>
      <div className="space-y-4">
        {classes.map((cls) => {
          const pct = Math.round((cls.enrolled / cls.capacity) * 100)
          return (
            <div key={cls.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">{cls.name}</span>
                <span className="text-sm text-gray-500">
                  {cls.enrolled}/{cls.capacity}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${cls.color} transition-all`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
