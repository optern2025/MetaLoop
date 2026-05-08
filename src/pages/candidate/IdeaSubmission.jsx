import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getMyTeam, getProblemStatements, createSubmission, updateSubmission, getTeamSubmission } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import DashboardLayout from '../../components/DashboardLayout'
import { Send, FileText, Save, AlertCircle } from 'lucide-react'

export default function IdeaSubmission() {
  const { profile } = useAuth()
  const { addToast } = useToast()
  const [team, setTeam] = useState(null)
  const [problems, setProblems] = useState([])
  const [existing, setExisting] = useState(null)
  const [form, setForm] = useState({ problem_id: '', idea_title: '', idea_description: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (profile) loadData() }, [profile])

  async function loadData() {
    try {
      const t = await getMyTeam(profile.id)
      if (t?.teams) {
        setTeam(t.teams)
        const subs = await getTeamSubmission(t.team_id)
        if (subs && subs.length > 0) {
          setExisting(subs[0])
          setForm({ problem_id: subs[0].problem_id || '', idea_title: subs[0].idea_title, idea_description: subs[0].idea_description })
        }
      }
      const p = await getProblemStatements()
      setProblems(p || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  async function handleSave(status = 'draft') {
    if (!team) { addToast('Join a team first!', 'error'); return }
    if (!form.idea_title.trim() || !form.idea_description.trim()) { addToast('Fill in all fields', 'error'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        status,
        ...(status === 'submitted' ? { submitted_at: new Date().toISOString(), checkpoints: { idea_submitted: true, prototype_uploaded: false, demo_recorded: false, final_submitted: false } } : {}),
      }
      if (existing) {
        await updateSubmission(existing.id, payload)
        addToast(status === 'submitted' ? 'Idea submitted!' : 'Draft saved!', 'success')
      } else {
        await createSubmission({ ...payload, team_id: team.id })
        addToast('Idea created!', 'success')
      }
      await loadData()
    } catch (err) { addToast(err.message, 'error') }
    setSaving(false)
  }

  if (loading) return <DashboardLayout><div className="empty-state pulse">Loading...</div></DashboardLayout>

  if (!team) {
    return (
      <DashboardLayout>
        <div className="dashboard-header"><h1><Send size={28} style={{ marginRight: 10 }} /> Idea Submission</h1></div>
        <div className="glass-card empty-state">
          <AlertCircle size={48} style={{ color: 'var(--warning)', marginBottom: 16 }} />
          <h3>No Team</h3>
          <p>You need to join or create a team before submitting ideas.</p>
          <a href="/candidate/team" className="btn btn-primary" style={{ marginTop: 16 }}>Go to Team Formation</a>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <h1><Send size={28} style={{ marginRight: 10 }} /> Idea Submission</h1>
        {existing && <span className={`badge badge-${existing.status === 'submitted' ? 'green' : 'warning'}`}>{existing.status}</span>}
      </div>

      <div className="glass-card" style={{ maxWidth: 700 }}>
        <div className="form-group">
          <label className="form-label">Problem Statement</label>
          <select className="form-select" value={form.problem_id} onChange={e => setForm({ ...form, problem_id: e.target.value })}>
            <option value="">Select a problem statement</option>
            {problems.map(p => <option key={p.id} value={p.id}>{p.title} ({p.difficulty})</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Idea Title</label>
          <input className="form-input" value={form.idea_title} onChange={e => setForm({ ...form, idea_title: e.target.value })} placeholder="Give your idea a catchy name" />
        </div>

        <div className="form-group">
          <label className="form-label">Idea Description</label>
          <textarea className="form-textarea" value={form.idea_description} onChange={e => setForm({ ...form, idea_description: e.target.value })}
            placeholder="Describe your idea in detail — the problem it solves, your approach, tech stack, and expected impact..." style={{ minHeight: 200 }} />
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => handleSave('draft')} disabled={saving}>
            <Save size={16} /> Save Draft
          </button>
          <button className="btn btn-primary" onClick={() => handleSave('submitted')} disabled={saving}>
            <Send size={16} /> Submit Idea
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
