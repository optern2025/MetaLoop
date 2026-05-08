import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getJuryEvaluations, getAllSubmissionsForJury } from '../../lib/supabase'
import DashboardLayout from '../../components/DashboardLayout'
import { ClipboardCheck, CheckCircle, Clock, BarChart3, Zap } from 'lucide-react'

export default function JuryDashboard() {
  const { profile } = useAuth()
  const [evaluations, setEvaluations] = useState([])
  const [submissions, setSubmissions] = useState([])

  useEffect(() => { if (profile) loadData() }, [profile])

  async function loadData() {
    try {
      const [evals, subs] = await Promise.all([
        getJuryEvaluations(profile.id),
        getAllSubmissionsForJury()
      ])
      setEvaluations(evals || [])
      setSubmissions(subs || [])
    } catch (err) { console.error(err) }
  }

  const pending = submissions.filter(s => !evaluations.find(e => e.submission_id === s.id)).length
  const avgScore = evaluations.length ? Math.round(evaluations.reduce((s, e) => s + e.total_score, 0) / evaluations.length) : 0

  const stats = [
    { icon: <ClipboardCheck size={22} />, value: submissions.length, label: 'Total Submissions', cls: 'cyan' },
    { icon: <Clock size={22} />, value: pending, label: 'Pending Review', cls: 'magenta' },
    { icon: <CheckCircle size={22} />, value: evaluations.length, label: 'Evaluated', cls: 'green' },
    { icon: <BarChart3 size={22} />, value: avgScore, label: 'Avg Score Given', cls: 'purple' },
  ]

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <div>
          <h1>Jury Panel ⚖️</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Evaluate and score team submissions</p>
        </div>
        <span className="badge badge-magenta"><Zap size={14} /> Jury</span>
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

      <div className="glass-card">
        <h3 className="section-title"><Clock size={18} className="icon" /> Recent Evaluations</h3>
        {evaluations.length === 0 ? (
          <div className="empty-state" style={{ padding: 20 }}>
            <p style={{ color: 'var(--text-muted)' }}>No evaluations yet. Start reviewing submissions!</p>
          </div>
        ) : (
          <table className="data-table" style={{ marginTop: 12 }}>
            <thead><tr><th>Team</th><th>Idea</th><th>Score</th><th>Date</th></tr></thead>
            <tbody>
              {evaluations.slice(0, 10).map(e => (
                <tr key={e.id}>
                  <td>{e.submissions?.teams?.team_name || '—'}</td>
                  <td>{e.submissions?.idea_title || '—'}</td>
                  <td><span className="badge badge-cyan">{e.total_score}/50</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(e.evaluated_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  )
}
