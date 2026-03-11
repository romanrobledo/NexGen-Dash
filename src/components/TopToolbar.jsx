import { useState, useEffect } from 'react'
import {
  MessageCircle,
  LogIn,
  LogOut,
  Bell,
  Search,
  Clock,
  Sun,
  Moon,
  CloudSun,
} from 'lucide-react'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good Morning', icon: Sun }
  if (hour < 17) return { text: 'Good Afternoon', icon: CloudSun }
  return { text: 'Good Evening', icon: Moon }
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime() {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default function TopToolbar() {
  const [time, setTime] = useState(formatTime())
  const greeting = getGreeting()
  const GreetingIcon = greeting.icon

  // Update clock every minute
  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime()), 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left — Greeting + Date */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
            <GreetingIcon className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{greeting.text}</p>
            <p className="text-xs text-gray-400">{formatDate()}</p>
          </div>
        </div>

        {/* Center — Quick Actions */}
        <div className="flex items-center gap-2">
          <ToolbarButton icon={LogIn} label="Check-in" color="green" />
          <ToolbarButton icon={LogOut} label="Check-out" color="red" />
          <div className="w-px h-8 bg-gray-200 mx-1" />
          <ToolbarButton icon={MessageCircle} label="Chat" color="blue" />
          <ToolbarButton icon={Search} label="Search" color="gray" />
        </div>

        {/* Right — Clock + Notifications */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium tabular-nums">{time}</span>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ToolbarButton({ icon: Icon, label, color }) {
  const colorClasses = {
    green: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    red: 'bg-red-50 text-red-500 hover:bg-red-100',
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    gray: 'bg-gray-50 text-gray-500 hover:bg-gray-100',
  }

  return (
    <button
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${colorClasses[color] || colorClasses.gray}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}
