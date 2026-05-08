import { useState, useEffect } from 'react'
import { getAllUsers, getAllSubmissionsAdmin, getAllProblems } from '../../lib/supabase'
import DashboardLayout from '../../components/DashboardLayout'
import { Shield, Users, FileText, ClipboardCheck, Trophy, Settings } from 'lucide-react'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [problems, setProblems] = useState([])

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [u, s, p] = await Promise.all([getAllUsers(), getAllSubmissionsAdmin(), getAllProblems()])
      setUsers(u || []); setSubmissions(s || []); setProblems(p || [])
    } catch (err) { console.error(err) }
  }

  const candidates = users.filter(u => u.role === 'candidate').length
  const jurors = users.filter(u => u.role === 'jury').length
  const evaluated = submissions.filter(s => s.status === 'evaluated').length

  const stats = [
    { icon: <Users size={22} />, value: users.length, label: 'Total Users', cls: 'cyan' },
    { icon: <Shield size={22} />, value: `${candidates}C / ${jurors}J`, label: 'Candidates / Jury', cls: 'magenta' },
    { icon: <FileText size={22} />, value: submissions.length, label: 'Submissions', cls: 'purple' },
    { icon: <ClipboardCheck size={22} />, value: `${evaluated}/${submissions.length}`, label: 'Evaluated', cls: 'green' },
  ]

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <div>
          <h1><Shield size={28} style={{ marginRight: 10 }} /> Admin Control Center</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Full hackathon management</p>
        </div>
        <span className="badge badge-gold"><Shield size={14} /> Admin</span>
      </div>

      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="glass-card">
          <h3 className="section-title"><Settings size={18} className="icon" /> Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            <a href="/admin-portal/users" className="btn btn-primary btn-sm">Manage Users</a>
            <a href="/admin-portal/problems" className="btn btn-secondary btn-sm">Manage Problem Statements</a>
            <a href="/admin-portal/evaluation" className="btn btn-secondary btn-sm">Internal Evaluation</a>
            <a href="/admin-portal/leaderboard" className="btn btn-secondary btn-sm">View Leaderboard</a>
          </div>
        </div>

        <div className="glass-card">
          <h3 className="section-title"><FileText size={18} className="icon" /> Recent Submissions</h3>
          {submissions.slice(0, 5).map(sub => (
            <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-glow)' }}>
              <span style={{ fontSize: '0.9rem' }}>{sub.idea_title || 'Untitled'} — <span style={{ color: 'var(--text-muted)' }}>{sub.teams?.team_name}</span></span>
              <span className={`badge badge-${sub.status === 'evaluated' ? 'green' : 'warning'}`}>{sub.status}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
