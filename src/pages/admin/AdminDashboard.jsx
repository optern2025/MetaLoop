import { useState, useEffect } from 'react'
import { getAllUsers, getAllSubmissionsAdmin, getAllProblems, supabase } from '../../lib/supabase'
import DashboardLayout from '../../components/DashboardLayout'
import { Shield, Users, FileText, ClipboardCheck, Trophy, Settings, Search, Download, Trash2 } from 'lucide-react'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [problems, setProblems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [u, s, p] = await Promise.all([getAllUsers(), getAllSubmissionsAdmin(), getAllProblems()])
      setUsers(u || []); setSubmissions(s || []); setProblems(p || [])
    } catch (err) { console.error(err) }
  }

  // --- NEW: KICK USER FUNCTION ---
  const handleKickUser = async (userId, userName) => {
    if (!window.confirm(`⚠️ Are you sure you want to completely remove ${userName}? This cannot be undone.`)) return;

    const { error } = await supabase.rpc('delete_user', { target_user_id: userId });

    if (error) {
      console.error("Kick error:", error);
      alert("Failed to kick user.");
    } else {
      alert(`${userName} has been permanently removed.`);
      loadData(); // Refresh the table
    }
  }

  // --- NEW: EXPORT CSV FUNCTION ---
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) return;
    const headers = ['Full Name', 'Email', 'Role', 'Status'];
    const csvRows = [
      headers.join(','),
      ...filteredUsers.map(u => `"${u.full_name}","${u.email}","${u.role}","${u.is_active ? 'Active' : 'Inactive'}"`)
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'metaloop_arena_users.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // --- NEW: RECALCULATE LEADERBOARD ---
  const handleRecalculate = async () => {
    const { error } = await supabase.rpc('recalculate_leaderboard');
    if (error) {
      alert("Error updating leaderboard: " + error.message);
    } else {
      alert("Leaderboard successfully recalculated!");
    }
  }

  // --- NEW: SEARCH FILTER ---
  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            {/* NEW BUTTON INSERTED HERE */}
            <button onClick={handleRecalculate} className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}>
              <Trophy size={16} /> Recalculate Leaderboard
            </button>
            <a href="/admin-portal/users" className="btn btn-secondary btn-sm">Manage Users</a>
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

      {/* --- NEW: USER DIRECTORY SECTION --- */}
      <div className="glass-card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <h3 className="section-title" style={{ margin: 0 }}><Users size={18} className="icon" /> User Directory</h3>
          
          <div style={{ display: 'flex', gap: '12px', flex: 1, maxWidth: '500px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
            <button onClick={handleExportCSV} className="btn btn-secondary btn-sm">
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.full_name || 'No Name'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td>
                      <span className={`badge badge-${user.role === 'admin' ? 'gold' : user.role === 'jury' ? 'magenta' : 'cyan'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.role !== 'admin' && (
                        <button onClick={() => handleKickUser(user.id, user.full_name)} className="btn btn-danger btn-sm" style={{ padding: '6px 12px' }}>
                          <Trash2 size={14} /> Kick
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                    No users found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </DashboardLayout>
  )
}