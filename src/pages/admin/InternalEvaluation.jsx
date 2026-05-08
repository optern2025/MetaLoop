import { useState, useEffect } from 'react'
import { getAllSubmissionsAdmin, supabase } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import DashboardLayout from '../../components/DashboardLayout'
import { BarChart3, Clock, CheckCircle, AlertTriangle, Trophy, Crown, RefreshCw } from 'lucide-react'

export default function InternalEvaluation() {
  const { addToast } = useToast()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try { setSubmissions(await getAllSubmissionsAdmin()) } catch (err) { console.error(err) }
    setLoading(false)
  }

  async function recalcLeaderboard() {
    try {
      const { error } = await supabase.rpc('recalculate_leaderboard')
      if (error) throw error
      addToast('Leaderboard recalculated!', 'success')
    } catch (err) { addToast(err.message || 'Failed to recalculate', 'error') }
  }

  async function declareWinner(teamId, badge) {
    try {
      // Check if leaderboard entry exists
      const { data: existing } = await supabase.from('leaderboard').select('*').eq('team_id', teamId).single()
      if (existing) {
        await supabase.from('leaderboard').update({ is_winner: true, badge }).eq('team_id', teamId)
      } else {
        await supabase.from('leaderboard').insert({ team_id: teamId, is_winner: true, badge, avg_score: 0, rank: 0 })
      }
      addToast(`Winner declared! (${badge})`, 'success')
      await loadData()
    } catch (err) { addToast(err.message, 'error') }
  }

  const byStatus = { draft: 0, submitted: 0, under_review: 0, evaluated: 0 }
  submissions.forEach(s => { byStatus[s.status] = (byStatus[s.status] || 0) + 1 })

  const statusColors = { draft: 'var(--text-muted)', submitted: 'var(--cyan)', under_review: 'var(--warning)', evaluated: 'var(--success)' }

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <h1><BarChart3 size={28} style={{ marginRight: 10 }} /> Internal Evaluation</h1>
        <button className="btn btn-primary btn-sm" onClick={recalcLeaderboard}><RefreshCw size={14} /> Recalc Leaderboard</button>
      </div>

      <div className="tabs">
        {['overview', 'timeline', 'winners'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="stats-grid">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} className="stat-card">
                <div className="stat-value" style={{ color: statusColors[status] }}>{count}</div>
                <div className="stat-label">{status.replace('_', ' ')}</div>
              </div>
            ))}
          </div>

          <div className="glass-card">
            <h3 className="section-title">All Submissions & Evaluations</h3>
            <table className="data-table" style={{ marginTop: 12 }}>
              <thead><tr><th>Team</th><th>Idea</th><th>Problem</th><th>Status</th><th>Evals</th><th>Avg Score</th></tr></thead>
              <tbody>
                {submissions.map(s => {
                  const evals = s.evaluations || []
                  const avg = evals.length ? Math.round(evals.reduce((sum, e) => sum + (e.total_score || 0), 0) / evals.length) : '—'
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.teams?.team_name}</td>
                      <td>{s.idea_title || '—'}</td>
                      <td><span className="badge badge-purple">{s.problem_statements?.title || '—'}</span></td>
                      <td><span className={`badge badge-${s.status === 'evaluated' ? 'green' : s.status === 'submitted' ? 'cyan' : 'warning'}`}>{s.status}</span></td>
                      <td>{evals.length}</td>
                      <td style={{ fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--cyan)' }}>{avg}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'timeline' && (
        <div className="glass-card">
          <h3 className="section-title"><Clock size={18} className="icon" /> Submission Timeline & Checkpoints</h3>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {submissions.map(s => (
              <div key={s.id} style={{ padding: 16, border: '1px solid var(--border-glow)', borderRadius: 'var(--radius)', background: 'var(--bg-glass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{s.teams?.team_name}</span> — {s.idea_title}
                  </div>
                  <span className={`badge badge-${s.status === 'evaluated' ? 'green' : 'cyan'}`}>{s.status}</span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'JetBrains Mono' }}>
                  <span>Created: {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}</span>
                  <span>Submitted: {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : '—'}</span>
                  <span>Updated: {s.last_updated ? new Date(s.last_updated).toLocaleString() : '—'}</span>
                </div>
                <div className="checkpoint-list" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {s.checkpoints && Object.entries(s.checkpoints).map(([key, val]) => (
                    <div key={key} className="checkpoint-item" style={{ padding: '6px 10px', flex: 'none' }}>
                      <div className={`checkpoint-dot ${val ? 'done' : ''}`} style={{ width: 8, height: 8 }} />
                      <span style={{ fontSize: '0.75rem' }}>{key.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'winners' && (
        <div className="glass-card">
          <h3 className="section-title"><Trophy size={18} className="icon" /> Declare Winners</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.9rem' }}>
            Select teams to award gold, silver, and bronze medals. Use "Recalc Leaderboard" to auto-rank first.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            {submissions.filter(s => s.status === 'evaluated').map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius)', background: 'var(--bg-glass)' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{s.teams?.team_name}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: '0.85rem' }}>— {s.idea_title}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm" onClick={() => declareWinner(s.team_id, 'gold')} style={{ background: 'rgba(255,215,0,0.2)', color: 'var(--gold)', border: '1px solid var(--gold)' }}>🥇 Gold</button>
                  <button className="btn btn-sm" onClick={() => declareWinner(s.team_id, 'silver')} style={{ background: 'rgba(192,192,192,0.2)', color: 'var(--silver)', border: '1px solid var(--silver)' }}>🥈 Silver</button>
                  <button className="btn btn-sm" onClick={() => declareWinner(s.team_id, 'bronze')} style={{ background: 'rgba(205,127,50,0.2)', color: 'var(--bronze)', border: '1px solid var(--bronze)' }}>🥉 Bronze</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
