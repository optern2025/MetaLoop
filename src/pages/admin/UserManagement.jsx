import { useState, useEffect } from 'react'
import { getAllUsers, updateUserRole } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import DashboardLayout from '../../components/DashboardLayout'
import { UserCog, Search, Shield, Users as UsersIcon, Gavel } from 'lucide-react'

export default function UserManagement() {
  const { addToast } = useToast()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    try { setUsers(await getAllUsers()) } catch (err) { console.error(err) }
    setLoading(false)
  }

  async function changeRole(userId, newRole) {
    try {
      await updateUserRole(userId, newRole)
      addToast(`Role updated to ${newRole}`, 'success')
      await loadUsers()
    } catch (err) { addToast(err.message, 'error') }
  }

  const filtered = users.filter(u => {
    const matchSearch = u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const roleIcons = { candidate: '🎮', jury: '⚖️', admin: '🛡️' }
  const roleBadges = { candidate: 'badge-cyan', jury: 'badge-magenta', admin: 'badge-gold' }

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <h1><UserCog size={28} style={{ marginRight: 10 }} /> User Management</h1>
        <span className="badge badge-cyan">{users.length} users</span>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tabs" style={{ marginBottom: 0, border: 'none', padding: 0 }}>
          {['all', 'candidate', 'jury', 'admin'].map(r => (
            <button key={r} className={`tab-btn ${roleFilter === r ? 'active' : ''}`} onClick={() => setRoleFilter(r)}>
              {r === 'all' ? 'All' : roleIcons[r]} {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card">
        <table className="data-table">
          <thead>
            <tr><th>User</th><th>Email</th><th>Role</th><th>College</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.full_name || '—'}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.email}</td>
                <td><span className={`badge ${roleBadges[u.role]}`}>{roleIcons[u.role]} {u.role}</span></td>
                <td style={{ color: 'var(--text-muted)' }}>{u.college || '—'}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  <select className="form-select" style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto', minWidth: 100 }}
                    value={u.role} onChange={e => changeRole(u.id, e.target.value)}>
                    <option value="candidate">Candidate</option>
                    <option value="jury">Jury</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}
