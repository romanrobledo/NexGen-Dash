export default function ChecklistBlock({ block, checklist, onToggle }) {
  return (
    <div className="border border-gray-100 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900">{block.label}</h4>
        <span className="text-xs text-gray-400">{block.time}</span>
      </div>
      <div className="space-y-2">
        {block.items.map((item) => (
          <label
            key={item.key}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={checklist[item.key] || false}
              onChange={() => onToggle(block.key, item.key)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span
              className={`text-sm ${
                checklist[item.key]
                  ? 'text-gray-400 line-through'
                  : 'text-gray-700 group-hover:text-gray-900'
              }`}
            >
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
