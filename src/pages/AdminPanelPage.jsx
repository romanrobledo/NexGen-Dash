import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useViewMode } from '../contexts/ViewModeContext'
import { NAV_PERMISSIONS } from '../lib/navPermissions'
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
  Palette,
  Plug,
  Webhook,
  Trash2,
  Copy,
  Check,
  Calendar,
  MessageSquare,
  CreditCard,
  Database,
  MailPlus,
} from 'lucide-react'

// ─── Constants ───────────────────────────────────────────────────────────────

const ALL_ROLES = [
  'founder', 'operator', 'executive-assistant', 'director', 'teacher', 'teacher-assistant',
  'front-desk', 'hiring-manager', 'tour-manager', 'lesson-plans',
  'kitchen-manager', 'asst-kitchen', 'bus-driver',
]

// Permissions grid columns come straight from the shared nav-permissions list,
// so adding a new top-level menu in the sidebar automatically adds a column here.
const PERMISSION_KEYS = NAV_PERMISSIONS

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
  { id: 'users', label: 'Staff Accounts', icon: Users },
  { id: 'permissions', label: 'Permissions', icon: Shield },
  { id: 'settings', label: 'System Settings', icon: Settings },
]

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminPanelPage() {
  const { mobileMode } = useViewMode()
  const location = useLocation()

  // Derive active view from URL path
  const path = location.pathname
  const activeTab =
    path === '/admin/permissions' ? 'permissions' :
    path === '/admin/settings/integrations' ? 'integrations' :
    path === '/admin/settings/webhooks' ? 'webhooks' :
    path === '/admin/settings/theme' || path === '/admin/settings' ? 'theme' :
    'users'

  // Dynamic page titles
  const pageInfo = {
    users: { title: 'Staff Management', subtitle: 'Manage staff accounts and profiles' },
    permissions: { title: 'Permissions', subtitle: 'Manage role-based access controls' },
    theme: { title: 'Theme & Appearance', subtitle: 'Customize how the dashboard looks and feels' },
    integrations: { title: 'Integrations', subtitle: 'Connect external services and tools' },
    webhooks: { title: 'Webhooks', subtitle: 'Send platform events to external endpoints' },
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{pageInfo[activeTab].title}</h1>
        <p className="text-sm text-gray-400 mt-1">
          {pageInfo[activeTab].subtitle}
        </p>
      </div>

      {/* Tab content */}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'permissions' && <PermissionsTab />}
      {activeTab === 'theme' && <SettingsTab />}
      {activeTab === 'integrations' && <IntegrationsTab />}
      {activeTab === 'webhooks' && <WebhooksTab />}
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
  const { mobileMode } = useViewMode()
  const navigate = useNavigate()

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
      <div className={`mb-4 ${mobileMode ? 'flex flex-col gap-3' : 'flex items-center justify-between'}`}>
        <h2 className="text-lg font-semibold text-gray-900">Staff Accounts</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className={`flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mobileMode ? 'w-full' : ''}`}
        >
          <UserPlus className="w-4 h-4" />
          Create User
        </button>
      </div>

      {/* Mobile: stacked cards */}
      {mobileMode ? (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading staff...</div>
          ) : staffList.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No staff records found.</div>
          ) : (
            staffList.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/staff/${s.id}`)}
                className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
              >
                {/* Top row: avatar + name + edit */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: s.avatar_color || '#6b7280' }}
                  >
                    {(s.first_name?.[0] || '') + (s.last_name?.[0] || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {s.full_name || `${s.first_name} ${s.last_name}`}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">{s.email || '—'}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingStaff(s) }}
                    className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100 shrink-0"
                    title="Manage user"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom row: role + status + login */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${roleBadgeColor(s.role)}`}>
                    {formatRole(s.role)}
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    s.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {s.status || 'active'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    s.auth_user_id
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {s.auth_user_id ? 'Linked' : 'No login'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
      /* Desktop: Table */
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
                <tr key={s.id} onClick={() => navigate(`/staff/${s.id}`)} className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors cursor-pointer">
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
                      onClick={(e) => { e.stopPropagation(); setEditingStaff(s) }}
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
      )}

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
      // IMPORTANT: Save the current founder session BEFORE signUp,
      // because signUp will replace it with the new user's session
      const { data: { session: founderSession } } = await supabase.auth.getSession()

      // 1. Create auth user via signUp (works with anon key)
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

      // 2. IMMEDIATELY restore the founder's session so we don't get logged out
      if (founderSession) {
        await supabase.auth.setSession({
          access_token: founderSession.access_token,
          refresh_token: founderSession.refresh_token,
        })
      }

      // 3. Generate a random avatar color
      const colors = ['#3b82f6','#ef4444','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316']
      const avatarColor = colors[Math.floor(Math.random() * colors.length)]

      // 4. Create staff record (exclude full_name — it's a generated column)
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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-auto max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      // Password changes and auth-email changes require service_role access.
      // With the anon key we can only update the staff table record.
      // Use "Send Password Reset" to let the user set a new password via email.
      if (newPassword) {
        onSuccess(`Profile updated. To change the login password, use "Send Password Reset" — the user will receive an email to set a new password.`)
        onClose()
        return
      }

      let msg = `Updated ${displayName}`
      if (email !== staff.email) {
        msg += `. Note: the display email was updated, but the login email can only be changed via password reset.`
      }
      onSuccess(msg)
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
        // IMPORTANT: Save the current founder session BEFORE signUp,
        // because signUp will replace it with the new user's session
        const { data: { session: founderSession } } = await supabase.auth.getSession()

        // No auth account — create one with a temporary password, then send reset
        const tempPassword = crypto.randomUUID().slice(0, 16) + 'Aa1!'
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email,
          password: tempPassword,
          options: { data: { full_name: displayName } },
        })
        if (authErr) throw authErr

        // IMMEDIATELY restore the founder's session so we don't get logged out
        if (founderSession) {
          await supabase.auth.setSession({
            access_token: founderSession.access_token,
            refresh_token: founderSession.refresh_token,
          })
        }

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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-auto max-h-[calc(100vh-2rem)] overflow-y-auto">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
  const { mobileMode } = useViewMode()

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
      <div className={`mb-4 ${mobileMode ? 'flex flex-col gap-3' : 'flex items-center justify-between'}`}>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Role Permissions</h2>
          <p className="text-xs text-gray-400 mt-0.5">Toggle access for each role across all sections</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            dirty
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          } ${mobileMode ? 'w-full' : ''}`}
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Mobile: per-role cards */}
      {mobileMode ? (
        <div className="space-y-3">
          {ALL_ROLES.map((role) => {
            const isFounder = role === 'founder'
            return (
              <div
                key={role}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${roleBadgeColor(role)}`}>
                    {formatRole(role)}
                  </span>
                  {isFounder && (
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                      Full Access
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PERMISSION_KEYS.map((p) => {
                    const enabled = isFounder ? true : (permData[role]?.[p.key] ?? false)
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => togglePerm(role, p.key)}
                        disabled={isFounder}
                        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-colors ${
                          isFounder
                            ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-70'
                            : enabled
                              ? 'border-emerald-200 bg-emerald-50'
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-xs font-medium text-gray-700 truncate text-left">
                          {p.label}
                        </span>
                        {enabled ? (
                          <ToggleRight className="w-5 h-5 text-emerald-500 shrink-0" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-300 shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
      /* Desktop: Permission Grid */
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
      )}
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

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 — Integrations
// ═══════════════════════════════════════════════════════════════════════════════

// Static catalog of integrations the platform supports. Flip `connected` to
// true for any that are actually wired up — Supabase is the one live one today.
const INTEGRATION_CATALOG = [
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Database, authentication, and realtime subscriptions.',
    icon: Database,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    connected: true,
    note: 'Core backend — always on.',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync school events, staff anniversaries, and training schedules.',
    icon: Calendar,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    connected: false,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Push alerts for compliance issues, check-ins, and daily digests.',
    icon: MessageSquare,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    connected: false,
  },
  {
    id: 'smtp',
    name: 'Email (SMTP)',
    description: 'Send transactional emails — invoices, invites, password resets.',
    icon: MailPlus,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    connected: false,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Tuition billing, subscription plans, and automatic receipts.',
    icon: CreditCard,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    connected: false,
  },
]

function IntegrationsTab() {
  const { mobileMode } = useViewMode()
  const [toast, setToast] = useState(null)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Connected Services</h2>
        <p className="text-xs text-gray-400 mt-0.5">Tap an integration to connect or manage.</p>
      </div>

      <div className={`grid gap-3 ${mobileMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
        {INTEGRATION_CATALOG.map((it) => {
          const Icon = it.icon
          return (
            <div
              key={it.id}
              className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg ${it.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${it.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{it.name}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      it.connected
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {it.connected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{it.description}</p>
                </div>
              </div>

              {it.note && (
                <p className="text-[11px] text-gray-400 italic mb-3">{it.note}</p>
              )}

              <div className="mt-auto pt-2">
                <button
                  onClick={() => showToast(
                    it.connected
                      ? `${it.name} management coming soon.`
                      : `${it.name} setup coming soon.`,
                    'success'
                  )}
                  disabled={it.id === 'supabase'}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    it.id === 'supabase'
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      : it.connected
                        ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {it.id === 'supabase' ? 'Managed' : it.connected ? 'Manage' : 'Connect'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 mt-5">
        Need something else? Let us know and we'll add it to the roadmap.
      </p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5 — Webhooks
// ═══════════════════════════════════════════════════════════════════════════════

// Events the platform can emit. Kept in sync with what the app actually publishes.
const WEBHOOK_EVENTS = [
  { key: 'staff.checkin',         label: 'Staff check-in'        },
  { key: 'staff.checkout',        label: 'Staff check-out'       },
  { key: 'compliance.expiring',   label: 'Compliance expiring'   },
  { key: 'compliance.expired',    label: 'Compliance expired'    },
  { key: 'target.completed',      label: 'Target completed'      },
  { key: 'task.completed',        label: 'Task completed'        },
  { key: 'billing.invoice.paid',  label: 'Invoice paid'          },
]

function WebhooksTab() {
  const { mobileMode } = useViewMode()
  const [hooks, setHooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  const fetchHooks = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      // Table might not exist yet — show empty state rather than erroring
      console.warn('webhooks table unavailable:', error.message)
      setHooks([])
    } else {
      setHooks(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchHooks() }, [fetchHooks])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleDelete(id) {
    if (!supabase) return
    if (!confirm('Delete this webhook? External services will stop receiving events.')) return
    const { error } = await supabase.from('webhooks').delete().eq('id', id)
    if (error) {
      showToast(error.message, 'error')
      return
    }
    showToast('Webhook removed')
    fetchHooks()
  }

  function handleCopy(id, url) {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    })
  }

  return (
    <div>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className={`mb-4 ${mobileMode ? 'flex flex-col gap-3' : 'flex items-center justify-between'}`}>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Outgoing Webhooks</h2>
          <p className="text-xs text-gray-400 mt-0.5">Forward platform events to an external URL as HTTP POST.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className={`flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mobileMode ? 'w-full' : ''}`}
        >
          <Plus className="w-4 h-4" />
          Add Webhook
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading webhooks...</div>
      ) : hooks.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Webhook className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">No webhooks configured</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Add a webhook to receive real-time notifications when staff check in, compliance
            items expire, invoices are paid, and more.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add your first webhook
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">URL</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Events</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hooks.map((w) => (
                <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">{w.name || 'Unnamed'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded truncate max-w-[260px]">{w.url}</code>
                      <button
                        onClick={() => handleCopy(w.id, w.url)}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-gray-100"
                        title="Copy URL"
                      >
                        {copiedId === w.id
                          ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                          : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">
                      {Array.isArray(w.events) ? `${w.events.length} event${w.events.length === 1 ? '' : 's'}` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      w.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {w.enabled ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(w.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                      title="Delete webhook"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <AddWebhookModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(msg) => { showToast(msg); fetchHooks() }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}
    </div>
  )
}

function AddWebhookModal({ onClose, onSuccess, onError }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [events, setEvents] = useState([])
  const [saving, setSaving] = useState(false)

  function toggleEvent(key) {
    setEvents((prev) => prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!supabase) return
    if (events.length === 0) {
      onError('Pick at least one event to subscribe to.')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase.from('webhooks').insert({
        name,
        url,
        events,
        enabled: true,
      })
      if (error) throw error
      onSuccess(`Webhook "${name}" created`)
      onClose()
    } catch (err) {
      onError(err.message || 'Failed to create webhook')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-auto max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Add Webhook</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Slack alerts, Zapier pipeline"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="url" required value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://hooks.example.com/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
            />
            <p className="text-[11px] text-gray-400 mt-1">Must be HTTPS. Payloads sent as JSON POST.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Events</label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto border border-gray-200 rounded-xl p-3">
              {WEBHOOK_EVENTS.map((ev) => (
                <label key={ev.key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900">
                  <input
                    type="checkbox"
                    checked={events.includes(ev.key)}
                    onChange={() => toggleEvent(ev.key)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{ev.label}</span>
                  <code className="ml-auto text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{ev.key}</code>
                </label>
              ))}
            </div>
          </div>
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
                <Plus className="w-4 h-4" />
              )}
              {saving ? 'Creating...' : 'Create Webhook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
