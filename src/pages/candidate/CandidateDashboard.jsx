import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getMyTeam, getTeamSubmission } from '../../lib/supabase'
import DashboardLayout from '../../components/DashboardLayout'
import { Users, Send, Trophy, Clock, Zap, Target } from 'lucide-react'

export default function CandidateDashboard() {
  const { profile } = useAuth()
  const [team, setTeam] = useState(null)
  const [submissions, setSubmissions] = useState([])

  useEffect(() => {
    if (profile) loadData()
  }, [profile])

  async function loadData() {
    try {
      const t = await getMyTeam(profile.id)
      setTeam(t)
      if (t?.teams) {
        const subs = await getTeamSubmission(t.teams.id || t.team_id)
        setSubmissions(subs || [])
      }
    } catch (err) { console.error(err) }
  }

  const stats = [
    { icon: <Users size={22} />, value: team ? '✓' : '—', label: 'Team Status', cls: 'cyan' },
    { icon: <Send size={22} />, value: submissions.length, label: 'Submissions', cls: 'magenta' },
    { icon: <Target size={22} />, value: submissions.filter(s => s.status === 'evaluated').length, label: 'Evaluated', cls: 'purple' },
    { icon: <Trophy size={22} />, value: '🔥', label: 'Hackathon Live', cls: 'green' },
  ]

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {profile?.full_name || 'Hacker'} 🎮</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Your hackathon command center</p>
        </div>
        <span className="badge badge-cyan"><Zap size={14} /> Candidate</span>
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
          <h3 className="section-title"><Clock size={18} className="icon" /> Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            {!team && <a href="/candidate/team" className="btn btn-primary btn-sm">Create or Join Team</a>}
            {team && <a href="/candidate/submit-idea" className="btn btn-primary btn-sm">Submit Idea</a>}
            <a href="/candidate/problems" className="btn btn-secondary btn-sm">View Problem Statements</a>
            <a href="/candidate/leaderboard" className="btn btn-secondary btn-sm">View Leaderboard</a>
          </div>
        </div>

        <div className="glass-card">
          <h3 className="section-title"><Target size={18} className="icon" /> Submission Status</h3>
          {submissions.length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}>
              <p style={{ color: 'var(--text-muted)' }}>No submissions yet. Start by submitting your idea!</p>
            </div>
          ) : (
            <div style={{ marginTop: 16 }}>
              {submissions.map(sub => (
                <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-glow)' }}>
                  <span>{sub.idea_title || 'Untitled'}</span>
                  <span className={`badge badge-${sub.status === 'evaluated' ? 'green' : sub.status === 'submitted' ? 'cyan' : 'warning'}`}>
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
