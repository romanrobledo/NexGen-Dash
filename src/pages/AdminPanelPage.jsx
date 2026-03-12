import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import {
  Users,
  Shield,
  Settings,
  Plus,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Settings2,
  ToggleLeft,
  ToggleRight,
  Mail,
  KeyRound,
  Send,
} from 'lucide-react'

// ─── Constants ───────────────────────────────────────────────────────────────

const ALL_ROLES = [
  'founder', 'operator', 'executive-assistant', 'director', 'teacher', 'teacher-assistant',
  'front-desk', 'hiring-manager', 'tour-manager', 'lesson-plans',
  'kitchen-manager', 'asst-kitchen', 'bus-driver',
]

const PERMISSION_KEYS = [
  { key: 'dashboard', label: 'S.A.N.D.' },
  { key: 'targets', label: 'Targets' },
  { key: 'compass', label: 'Compass' },
  { key: 'staff_database', label: 'Staff DB' },
  { key: 'library', label: 'Library' },
  { key: 'calendars', label: 'Calendars' },
  { key: 'lesson_plans', label: 'Lessons' },
  { key: 'families', label: 'Families' },
  { key: 'classrooms', label: 'Classrooms' },
  { key: 'books', label: 'Books' },
  { key: 'billing', label: 'Billing' },
  { key: 'admin_panel', label: 'Admin' },
]

function roleBadgeColor(role) {
  const colors = {
    founder: 'bg-purple-100 text-purple-700',
    operator: 'bg-blue-100 text-blue-700',
    'executive-assistant': 'bg-sky-100 text-sky-700',
    director: 'bg-emerald-100 text-emerald-700',
    teacher: 'bg-amber-100 text-amber-700',
    'teacher-assistant': 'bg-yellow-100 text-yellow-700',
    'front-desk': 'bg-pink-100 text-pink-700',
    'hiring-manager': 'bg-cyan-100 text-cyan-700',
    'tour-manager': 'bg-teal-100 text-teal-700',
    'lesson-plans': 'bg-indigo-100 text-indigo-700',
    'kitchen-manager': 'bg-orange-100 text-orange-700',
    'asst-kitchen': 'bg-rose-100 text-rose-700',
    'bus-driver': 'bg-gray-100 text-gray-700',
  }
  return colors[role] || 'bg-gray-100 text-gray-700'
}

function formatRole(role) {
  return role.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// ─── Tab Navigation ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'permissions', label: 'Permissions', icon: Shield },
  { id: 'settings', label: 'System Settings', icon: Settings },
]

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState('users')

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage users, permissions, and system settings
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'permissions' && <PermissionsTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — User Management
// ═══════════════════════════════════════════════════════════════════════════════

function UsersTab() {
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [toast, setToast] = useState(null)

  const fetchStaff = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('full_name')
    if (!error) setStaffList(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchStaff() }, [fetchStaff])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Staff Accounts</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Create User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Login</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Loading staff...</td></tr>
            ) : staffList.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">No staff records found.</td></tr>
            ) : (
              staffList.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: s.avatar_color || '#6b7280' }}
                      >
                        {(s.first_name?.[0] || '') + (s.last_name?.[0] || '')}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{s.full_name || `${s.first_name} ${s.last_name}`}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.email || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${roleBadgeColor(s.role)}`}>
                      {formatRole(s.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {s.status || 'active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${s.auth_user_id ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {s.auth_user_id ? 'Linked' : 'No login'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditingStaff(s)}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                      title="Manage user"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(msg) => { showToast(msg); fetchStaff() }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {/* Edit User Modal */}
      {editingStaff && (
        <EditUserModal
          staff={editingStaff}
          onClose={() => setEditingStaff(null)}
          onSuccess={(msg) => { showToast(msg); fetchStaff() }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}
    </div>
  )
}

// ─── Create User Modal ──────────────────────────────────────────────────────

function CreateUserModal({ onClose, onSuccess, onError }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'teacher',
    phone: '',
  })
  const [saving, setSaving] = useState(false)

  function update(field, val) {
    setForm((prev) => ({ ...prev, [field]: val }))
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!supabase) return
    setSaving(true)

    try {
      // 1. Create auth user via Supabase (using signUp which works with anon key)
      // Note: For production, use an Edge Function with service_role key
      // For now, we use the admin invite approach via direct REST API
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      // Try creating via signUp (user won't need to confirm if email confirm is disabled)
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: `${form.firstName} ${form.lastName}` }
        }
      })

      if (authErr) throw authErr

      const authUserId = authData.user?.id
      if (!authUserId) throw new Error('Failed to create auth user')

      // 2. Generate a random avatar color
      const colors = ['#3b82f6','#ef4444','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316']
      const avatarColor = colors[Math.floor(Math.random() * colors.length)]

      // 3. Create staff record (exclude full_name — it's a generated column)
      const { error: staffErr } = await supabase.from('staff').insert({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone || '',
        role: form.role,
        status: 'active',
        avatar_color: avatarColor,
        auth_user_id: authUserId,
      })

      if (staffErr) throw staffErr

      onSuccess(`User ${form.firstName} ${form.lastName} created successfully`)
      onClose()
    } catch (err) {
      onError(err.message || 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                required value={form.firstName} onChange={(e) => update('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                required value={form.lastName} onChange={(e) => update('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" required value={form.email} onChange={(e) => update('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="user@nexgenschool.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
            <input
              value={form.phone} onChange={(e) => update('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={form.role} onChange={(e) => update('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              {ALL_ROLES.filter(r => r !== 'founder').map((r) => (
                <option key={r} value={r}>{formatRole(r)}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {saving ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Edit User Modal ────────────────────────────────────────────────────────

function EditUserModal({ staff, onClose, onSuccess, onError }) {
  const [role, setRole] = useState(staff.role)
  const [status, setStatus] = useState(staff.status || 'active')
  const [email, setEmail] = useState(staff.email || '')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [sendingInvite, setSendingInvite] = useState(false)
  const [resettingPw, setResettingPw] = useState(false)

  const displayName = staff.full_name || `${staff.first_name} ${staff.last_name}`
  const hasAuth = !!staff.auth_user_id

  async function handleSave(e) {
    e.preventDefault()
    if (!supabase) return
    setSaving(true)

    try {
      // Update staff record (role, status, email)
      const updates = { role, status }
      if (email !== staff.email) updates.email = email

      const { error } = await supabase
        .from('staff')
        .update(updates)
        .eq('id', staff.id)

      if (error) throw error

      // If password provided and user has auth, try to update it
      if (newPassword && hasAuth) {
        const { error: pwErr } = await supabase.auth.admin.updateUserById(
          staff.auth_user_id,
          { password: newPassword }
        )
        if (pwErr) {
          // Admin API may not work with anon key — fall back to sending reset
          onSuccess(`Profile updated. Password change requires admin access — use "Send Password Reset" instead.`)
          onClose()
          return
        }
      }

      onSuccess(`Updated ${displayName}`)
      onClose()
    } catch (err) {
      onError(err.message || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  async function handleSendPasswordReset() {
    if (!supabase || !email) return
    setResettingPw(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })
      if (error) throw error
      onSuccess(`Password reset email sent to ${email}`)
    } catch (err) {
      onError(err.message || 'Failed to send reset email')
    } finally {
      setResettingPw(false)
    }
  }

  async function handleSendInvite() {
    if (!supabase || !email) return
    setSendingInvite(true)
    try {
      if (hasAuth) {
        // User already has auth — send password reset as "invite"
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        })
        if (error) throw error
        onSuccess(`Invite sent to ${email}`)
      } else {
        // No auth account — create one with a temporary password, then send reset
        const tempPassword = crypto.randomUUID().slice(0, 16) + 'Aa1!'
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email,
          password: tempPassword,
          options: { data: { full_name: displayName } },
        })
        if (authErr) throw authErr

        // Link auth user to staff record
        if (authData.user?.id) {
          await supabase
            .from('staff')
            .update({ auth_user_id: authData.user.id })
            .eq('id', staff.id)
        }

        // Send password reset so user can set their own password
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        })

        onSuccess(`Account created & invite sent to ${email}`)
      }
    } catch (err) {
      onError(err.message || 'Failed to send invite')
    } finally {
      setSendingInvite(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header with user info */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: staff.avatar_color || '#6b7280' }}
            >
              {(staff.first_name?.[0] || '') + (staff.last_name?.[0] || '')}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeColor(staff.role)}`}>
                {formatRole(staff.role)}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Account Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Account</h4>
            <div className="space-y-3">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <KeyRound className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Quick Action Buttons */}
              <div className="flex gap-2 pt-1">
                {hasAuth && (
                  <button
                    type="button"
                    onClick={handleSendPasswordReset}
                    disabled={resettingPw}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    {resettingPw ? 'Sending...' : 'Send Password Reset'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSendInvite}
                  disabled={sendingInvite}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sendingInvite ? 'Sending...' : hasAuth ? 'Resend Invite' : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>

          {/* Role & Status Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Role & Status</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>{formatRole(r)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Permissions
// ═══════════════════════════════════════════════════════════════════════════════

function PermissionsTab() {
  const [permData, setPermData] = useState({}) // { role: { key: bool } }
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    fetchPermissions()
  }, [])

  async function fetchPermissions() {
    if (!supabase) return
    setLoading(true)
    const { data, error } = await supabase
      .from('role_permissions')
      .select('role, permission_key, enabled')

    if (!error && data) {
      const map = {}
      data.forEach((row) => {
        if (!map[row.role]) map[row.role] = {}
        map[row.role][row.permission_key] = row.enabled
      })
      setPermData(map)
    }
    setLoading(false)
  }

  function togglePerm(role, key) {
    // Don't allow changing founder permissions
    if (role === 'founder') return
    setPermData((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: !(prev[role]?.[key] ?? false),
      },
    }))
    setDirty(true)
  }

  async function handleSave() {
    if (!supabase) return
    setSaving(true)

    try {
      // Build upsert array from current state
      const rows = []
      Object.entries(permData).forEach(([role, perms]) => {
        Object.entries(perms).forEach(([key, enabled]) => {
          rows.push({ role, permission_key: key, enabled, updated_at: new Date().toISOString() })
        })
      })

      const { error } = await supabase
        .from('role_permissions')
        .upsert(rows, { onConflict: 'role,permission_key' })

      if (error) throw error

      setDirty(false)
      setToast({ msg: 'Permissions saved successfully', type: 'success' })
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      setToast({ msg: err.message || 'Failed to save', type: 'error' })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400 text-sm">Loading permissions...</div>
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Role Permissions</h2>
          <p className="text-xs text-gray-400 mt-0.5">Toggle access for each role across all sections</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            dirty
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Permission Grid */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50/50 min-w-[140px]">
                Role
              </th>
              {PERMISSION_KEYS.map((p) => (
                <th key={p.key} className="px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center min-w-[80px]">
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_ROLES.map((role) => (
              <tr key={role} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 sticky left-0 bg-white">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${roleBadgeColor(role)}`}>
                    {formatRole(role)}
                  </span>
                </td>
                {PERMISSION_KEYS.map((p) => {
                  const enabled = permData[role]?.[p.key] ?? false
                  const isFounder = role === 'founder'
                  return (
                    <td key={p.key} className="px-3 py-3 text-center">
                      <button
                        onClick={() => togglePerm(role, p.key)}
                        disabled={isFounder}
                        className={`transition-colors ${isFounder ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                        title={isFounder ? 'Founder always has full access' : `Toggle ${p.label} for ${formatRole(role)}`}
                      >
                        {enabled ? (
                          <ToggleRight className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-300" />
                        )}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — System Settings
// ═══════════════════════════════════════════════════════════════════════════════

function SettingsTab() {
  const [settings, setSettings] = useState({
    school_name: 'NexGen School',
    timezone: 'America/Chicago',
    branding_primary_color: '#2563eb',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    if (!supabase) return
    setLoading(true)
    const { data, error } = await supabase.from('app_settings').select('*')
    if (!error && data) {
      const map = {}
      data.forEach((row) => {
        map[row.key] = typeof row.value === 'string' ? row.value : row.value
      })
      setSettings((prev) => ({ ...prev, ...map }))
    }
    setLoading(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!supabase) return
    setSaving(true)

    try {
      const rows = Object.entries(settings).map(([key, value]) => ({
        key,
        value: JSON.stringify(value),
        updated_at: new Date().toISOString(),
      }))

      const { error } = await supabase
        .from('app_settings')
        .upsert(rows, { onConflict: 'key' })

      if (error) throw error

      setToast({ msg: 'Settings saved', type: 'success' })
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      setToast({ msg: err.message || 'Failed to save', type: 'error' })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400 text-sm">Loading settings...</div>
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">School Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
              <input
                value={settings.school_name}
                onChange={(e) => setSettings((s) => ({ ...s, school_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings((s) => ({ ...s, timezone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="America/New_York">Eastern (ET)</option>
                <option value="America/Chicago">Central (CT)</option>
                <option value="America/Denver">Mountain (MT)</option>
                <option value="America/Los_Angeles">Pacific (PT)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.branding_primary_color}
                  onChange={(e) => setSettings((s) => ({ ...s, branding_primary_color: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  value={settings.branding_primary_color}
                  onChange={(e) => setSettings((s) => ({ ...s, branding_primary_color: e.target.value }))}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
