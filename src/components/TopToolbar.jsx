import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
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

function formatRole(role) {
  if (!role) return ''
  return role.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function TopToolbar() {
  const [time, setTime] = useState(formatTime())
  const greeting = getGreeting()
  const GreetingIcon = greeting.icon
  const navigate = useNavigate()
  const { staff, signOut, session } = useAuth()

  // Update clock every minute
  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime()), 60000)
    return () => clearInterval(interval)
  }, [])

  async function handleLogout() {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left — Greeting + Date */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
            <GreetingIcon className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {greeting.text}{staff ? `, ${staff.first_name}` : ''}
            </p>
            <p className="text-xs text-gray-400">{formatDate()}</p>
          </div>
        </div>

        {/* Center — Quick Actions */}
        <div className="flex items-center gap-2">
          <ToolbarButton icon={MessageCircle} label="Chat" color="blue" />
          <ToolbarButton icon={Search} label="Search" color="gray" />
        </div>

        {/* Right — User info + Clock + Notifications */}
        <div className="flex items-center gap-3">
          {/* Clock */}
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium tabular-nums">{time}</span>
          </div>

          <div className="w-px h-8 bg-gray-200" />

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
          </button>

          <div className="w-px h-8 bg-gray-200" />

          {/* User avatar + logout */}
          {session && staff ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: staff.avatar_color || '#6b7280' }}
                >
                  {(staff.first_name?.[0] || '') + (staff.last_name?.[0] || '')}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    {staff.first_name} {staff.last_name}
                  </p>
                  <p className="text-xs text-gray-400 leading-tight">{formatRole(staff.role)}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign in
            </button>
          )}
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
