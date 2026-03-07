export default function BucketStatusBar({ bucketStats, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-48" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="flex-1 h-3 bg-gray-100 rounded-full" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Content Buckets — This Month
      </h3>
      <div className="space-y-3">
        {bucketStats.map((bucket) => (
          <div key={bucket.key} className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 w-24">
              {bucket.label}
            </span>
            <div className="flex-1 bg-gray-100 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${bucket.percentage}%`,
                  backgroundColor: bucket.color,
                }}
              />
            </div>
            <span className="text-sm text-gray-500 w-24 text-right">
              {bucket.completed}/{bucket.total} ({bucket.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
