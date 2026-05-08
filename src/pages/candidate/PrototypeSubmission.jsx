import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getMyTeam, getTeamSubmission, updateSubmission } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import DashboardLayout from '../../components/DashboardLayout'
import { FileText, Upload, Link, Video, Save, Send, AlertCircle } from 'lucide-react'

export default function PrototypeSubmission() {
  const { profile } = useAuth()
  const { addToast } = useToast()
  const [team, setTeam] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [form, setForm] = useState({ prototype_url: '', demo_video_url: '', detailed_description: '' })
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
          setSubmission(subs[0])
          setForm({
            prototype_url: subs[0].prototype_url || '',
            demo_video_url: subs[0].demo_video_url || '',
            detailed_description: subs[0].detailed_description || '',
          })
        }
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  async function handleSave() {
    if (!submission) { addToast('Submit your idea first!', 'error'); return }
    setSaving(true)
    try {
      const checkpoints = { ...submission.checkpoints, prototype_uploaded: !!form.prototype_url, demo_recorded: !!form.demo_video_url, final_submitted: true }
      await updateSubmission(submission.id, { ...form, checkpoints })
      addToast('Prototype details saved!', 'success')
      await loadData()
    } catch (err) { addToast(err.message, 'error') }
    setSaving(false)
  }

  if (loading) return <DashboardLayout><div className="empty-state pulse">Loading...</div></DashboardLayout>

  if (!team || !submission) {
    return (
      <DashboardLayout>
        <div className="dashboard-header"><h1><FileText size={28} style={{ marginRight: 10 }} /> Prototype Submission</h1></div>
        <div className="glass-card empty-state">
          <AlertCircle size={48} style={{ color: 'var(--warning)', marginBottom: 16 }} />
          <h3>{!team ? 'No Team' : 'No Idea Submitted'}</h3>
          <p>{!team ? 'Join a team first.' : 'Submit your idea before uploading a prototype.'}</p>
          <a href={!team ? '/candidate/team' : '/candidate/submit-idea'} className="btn btn-primary" style={{ marginTop: 16 }}>
            {!team ? 'Go to Teams' : 'Submit Idea'}
          </a>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <h1><FileText size={28} style={{ marginRight: 10 }} /> Prototype Submission</h1>
      </div>

      <div className="glass-card" style={{ marginBottom: 20 }}>
        <h3 style={{ color: 'var(--cyan)', marginBottom: 4 }}>{submission.idea_title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Submission Status: <span className={`badge badge-${submission.status === 'evaluated' ? 'green' : 'cyan'}`}>{submission.status}</span></p>
      </div>

      <div className="glass-card" style={{ maxWidth: 700 }}>
        <div className="form-group">
          <label className="form-label"><Link size={14} /> Prototype URL (GitHub, Figma, etc.)</label>
          <input className="form-input" value={form.prototype_url} onChange={e => setForm({ ...form, prototype_url: e.target.value })} placeholder="https://github.com/your-team/project" />
        </div>

        <div className="form-group">
          <label className="form-label"><Video size={14} /> Demo Video URL</label>
          <input className="form-input" value={form.demo_video_url} onChange={e => setForm({ ...form, demo_video_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
        </div>

        <div className="form-group">
          <label className="form-label"><FileText size={14} /> Detailed Description / Documentation</label>
          <textarea className="form-textarea" value={form.detailed_description} onChange={e => setForm({ ...form, detailed_description: e.target.value })}
            placeholder="Describe your prototype, architecture, technologies used, challenges faced, and future scope..." style={{ minHeight: 200 }} />
        </div>

        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Prototype Details'}
        </button>
      </div>

      <div className="glass-card" style={{ marginTop: 20 }}>
        <h3 className="section-title">📋 Submission Checkpoints</h3>
        <div className="checkpoint-list" style={{ marginTop: 12 }}>
          {[
            { key: 'idea_submitted', label: 'Idea Submitted' },
            { key: 'prototype_uploaded', label: 'Prototype URL Added' },
            { key: 'demo_recorded', label: 'Demo Video Added' },
            { key: 'final_submitted', label: 'Final Submission Complete' },
          ].map(cp => (
            <div key={cp.key} className="checkpoint-item">
              <div className={`checkpoint-dot ${submission.checkpoints?.[cp.key] ? 'done' : ''}`} />
              <span className="checkpoint-label">{cp.label}</span>
              <span className="checkpoint-time">{submission.checkpoints?.[cp.key] ? '✓' : '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
