import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getJuryEvaluations } from '../../lib/supabase'
import DashboardLayout from '../../components/DashboardLayout'
import { MessageSquare, Star } from 'lucide-react'

export default function FeedbackView() {
  const { profile } = useAuth()
  const [evaluations, setEvaluations] = useState([])

  useEffect(() => { if (profile) loadData() }, [profile])

  async function loadData() {
    try {
      const data = await getJuryEvaluations(profile.id)
      setEvaluations(data || [])
    } catch (err) { console.error(err) }
  }

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <h1><MessageSquare size={28} style={{ marginRight: 10 }} /> My Feedback</h1>
      </div>

      {evaluations.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">📝</div>
          <h3>No Feedback Given</h3>
          <p>Your evaluation feedback will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {evaluations.map(e => (
            <div key={e.id} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{e.submissions?.idea_title || 'Untitled'}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Team: {e.submissions?.teams?.team_name}</span>
                </div>
                <span className="badge badge-cyan"><Star size={12} /> {e.total_score}/50</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 12 }}>
                {[
                  { label: 'Innovation', val: e.innovation_score },
                  { label: 'Feasibility', val: e.feasibility_score },
                  { label: 'Presentation', val: e.presentation_score },
                  { label: 'Technical', val: e.technical_score },
                  { label: 'Impact', val: e.impact_score },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center', padding: 8, background: 'var(--bg-glass)', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--cyan)' }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {e.remarks && (
                <div style={{ padding: 10, background: 'rgba(255,170,0,0.05)', borderRadius: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--warning)', marginBottom: 4, fontFamily: 'Orbitron', textTransform: 'uppercase' }}>Remarks</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{e.remarks}</p>
                </div>
              )}

              {e.feedback && (
                <div style={{ padding: 10, background: 'rgba(0,245,255,0.05)', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--cyan)', marginBottom: 4, fontFamily: 'Orbitron', textTransform: 'uppercase' }}>Feedback for Team</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{e.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
