import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getAllSubmissionsForJury, getJuryEvaluations, createEvaluation, updateEvaluation } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import DashboardLayout from '../../components/DashboardLayout'
import { ClipboardCheck, Eye, Save, X, Star } from 'lucide-react'

export default function EvaluationList() {
  const { profile } = useAuth()
  const { addToast } = useToast()
  const [submissions, setSubmissions] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [selected, setSelected] = useState(null)
  const [scores, setScores] = useState({ innovation_score: 5, feasibility_score: 5, presentation_score: 5, technical_score: 5, impact_score: 5, remarks: '', feedback: '' })
  const [filter, setFilter] = useState('all')
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (profile) loadData() }, [profile])

  async function loadData() {
    try {
      const [subs, evals] = await Promise.all([getAllSubmissionsForJury(), getJuryEvaluations(profile.id)])
      setSubmissions(subs || [])
      setEvaluations(evals || [])
    } catch (err) { console.error(err) }
  }

  function openEval(sub) {
    const existing = evaluations.find(e => e.submission_id === sub.id)
    if (existing) {
      setScores({ innovation_score: existing.innovation_score, feasibility_score: existing.feasibility_score, presentation_score: existing.presentation_score, technical_score: existing.technical_score, impact_score: existing.impact_score, remarks: existing.remarks, feedback: existing.feedback })
    } else {
      setScores({ innovation_score: 5, feasibility_score: 5, presentation_score: 5, technical_score: 5, impact_score: 5, remarks: '', feedback: '' })
    }
    setSelected({ ...sub, existingEval: existing })
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (selected.existingEval) {
        await updateEvaluation(selected.existingEval.id, scores)
        addToast('Evaluation updated!', 'success')
      } else {
        await createEvaluation({ ...scores, submission_id: selected.id, jury_id: profile.id })
        addToast('Evaluation submitted!', 'success')
      }
      setSelected(null)
      await loadData()
    } catch (err) { addToast(err.message, 'error') }
    setSaving(false)
  }

  const evaluated = new Set(evaluations.map(e => e.submission_id))
  const filtered = filter === 'pending' ? submissions.filter(s => !evaluated.has(s.id))
    : filter === 'evaluated' ? submissions.filter(s => evaluated.has(s.id)) : submissions

  const total = scores.innovation_score + scores.feasibility_score + scores.presentation_score + scores.technical_score + scores.impact_score

  const metrics = [
    { key: 'innovation_score', label: 'Innovation', emoji: '💡' },
    { key: 'feasibility_score', label: 'Feasibility', emoji: '⚙️' },
    { key: 'presentation_score', label: 'Presentation', emoji: '🎯' },
    { key: 'technical_score', label: 'Technical', emoji: '🔧' },
    { key: 'impact_score', label: 'Impact', emoji: '🌍' },
  ]

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <h1><ClipboardCheck size={28} style={{ marginRight: 10 }} /> Evaluate Teams</h1>
      </div>

      <div className="tabs">
        {['all', 'pending', 'evaluated'].map(f => (
          <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'pending' ? submissions.length - evaluated.size : f === 'evaluated' ? evaluated.size : submissions.length})
          </button>
        ))}
      </div>

      {/* Submission List */}
      {!selected && (
        filtered.length === 0 ? (
          <div className="glass-card empty-state"><h3>No submissions found</h3></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(sub => (
              <div key={sub.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => openEval(sub)}>
                <div>
                  <h4 style={{ marginBottom: 4 }}>{sub.idea_title || 'Untitled'}</h4>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Team: {sub.teams?.team_name}</span>
                    <span className="badge badge-purple">{sub.problem_statements?.title || 'N/A'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {evaluated.has(sub.id) ? (
                    <span className="badge badge-green">✓ Evaluated</span>
                  ) : (
                    <span className="badge badge-warning">Pending</span>
                  )}
                  <Eye size={18} style={{ color: 'var(--cyan)' }} />
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Evaluation Form */}
      {selected && (
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)} style={{ marginBottom: 16 }}>
            <X size={14} /> Back to List
          </button>

          <div className="glass-card" style={{ marginBottom: 20 }}>
            <h3 style={{ color: 'var(--cyan)', marginBottom: 4 }}>{selected.idea_title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>Team: {selected.teams?.team_name}</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selected.idea_description}</p>
            {selected.prototype_url && (
              <a href={selected.prototype_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}>
                View Prototype
              </a>
            )}
          </div>

          <div className="glass-card">
            <h3 className="section-title"><Star size={18} className="icon" /> Score Evaluation</h3>
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <div className="score-display" style={{ fontSize: '2.5rem' }}>{total}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/50</span></div>
            </div>

            {metrics.map(m => (
              <div key={m.key} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label className="form-label" style={{ margin: 0 }}>{m.emoji} {m.label}</label>
                  <span style={{ fontFamily: 'Orbitron', color: 'var(--cyan)' }}>{scores[m.key]}/10</span>
                </div>
                <div className="score-slider">
                  <input type="range" min="0" max="10" value={scores[m.key]} onChange={e => setScores({ ...scores, [m.key]: parseInt(e.target.value) })} />
                </div>
              </div>
            ))}

            <div className="form-group">
              <label className="form-label">Remarks (Internal)</label>
              <textarea className="form-textarea" value={scores.remarks} onChange={e => setScores({ ...scores, remarks: e.target.value })} placeholder="Internal remarks for admin..." />
            </div>

            <div className="form-group">
              <label className="form-label">Feedback (For Team)</label>
              <textarea className="form-textarea" value={scores.feedback} onChange={e => setScores({ ...scores, feedback: e.target.value })} placeholder="Constructive feedback for the team..." />
            </div>

            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              <Save size={16} /> {saving ? 'Saving...' : selected.existingEval ? 'Update Evaluation' : 'Submit Evaluation'}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
