import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getAllProblems, createProblemStatement, updateProblemStatement } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import DashboardLayout from '../../components/DashboardLayout'
import { BookOpen, Plus, Edit, Save, X, ExternalLink, Trash2 } from 'lucide-react'

const emptyForm = { title: '', description: '', difficulty: 'medium', category: 'general', bootcamp_links: [], material_links: [], is_active: true }

export default function ProblemStatementManager() {
  const { profile } = useAuth()
  const { addToast } = useToast()
  const [problems, setProblems] = useState([])
  const [editing, setEditing] = useState(null) // null = list, 'new' = new form, or problem obj
  const [form, setForm] = useState({ ...emptyForm })
  const [newLink, setNewLink] = useState({ label: '', url: '' })
  const [linkType, setLinkType] = useState('bootcamp')
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadProblems() }, [])

  async function loadProblems() {
    try { setProblems(await getAllProblems()) } catch (err) { console.error(err) }
  }

  function startEdit(problem) {
    setForm({ title: problem.title, description: problem.description, difficulty: problem.difficulty, category: problem.category,
      bootcamp_links: problem.bootcamp_links || [], material_links: problem.material_links || [], is_active: problem.is_active })
    setEditing(problem)
  }

  function startNew() { setForm({ ...emptyForm }); setEditing('new') }

  function addLink() {
    if (!newLink.label || !newLink.url) return
    const key = linkType === 'bootcamp' ? 'bootcamp_links' : 'material_links'
    setForm({ ...form, [key]: [...form[key], { ...newLink }] })
    setNewLink({ label: '', url: '' })
  }

  function removeLink(type, index) {
    const key = type === 'bootcamp' ? 'bootcamp_links' : 'material_links'
    setForm({ ...form, [key]: form[key].filter((_, i) => i !== index) })
  }

  async function handleSave() {
    if (!form.title || !form.description) { addToast('Title and description required', 'error'); return }
    setSaving(true)
    try {
      if (editing === 'new') {
        await createProblemStatement({ ...form, created_by: profile.id })
        addToast('Problem statement created!', 'success')
      } else {
        await updateProblemStatement(editing.id, form)
        addToast('Problem statement updated!', 'success')
      }
      setEditing(null)
      await loadProblems()
    } catch (err) { addToast(err.message, 'error') }
    setSaving(false)
  }

  const diffBadge = { easy: 'badge-green', medium: 'badge-warning', hard: 'badge-danger' }

  if (editing) {
    return (
      <DashboardLayout>
        <div className="dashboard-header">
          <h1>{editing === 'new' ? 'New Problem Statement' : 'Edit Problem Statement'}</h1>
          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}><X size={14} /> Cancel</button>
        </div>
        <div className="glass-card" style={{ maxWidth: 700 }}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Problem statement title" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detailed problem description..." style={{ minHeight: 150 }} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select className="form-select" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g., AI/ML, Web3" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Active</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
              <span style={{ fontSize: '0.9rem' }}>Visible to candidates</span>
            </label>
          </div>

          {/* Links Manager */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--cyan)', marginBottom: 12 }}>Add Links</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <select className="form-select" style={{ width: 'auto' }} value={linkType} onChange={e => setLinkType(e.target.value)}>
                <option value="bootcamp">Bootcamp</option><option value="material">Material</option>
              </select>
              <input className="form-input" style={{ flex: 1, minWidth: 120 }} placeholder="Label" value={newLink.label} onChange={e => setNewLink({ ...newLink, label: e.target.value })} />
              <input className="form-input" style={{ flex: 2, minWidth: 200 }} placeholder="URL" value={newLink.url} onChange={e => setNewLink({ ...newLink, url: e.target.value })} />
              <button type="button" className="btn btn-secondary btn-sm" onClick={addLink}><Plus size={14} /></button>
            </div>

            {form.bootcamp_links.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--cyan)', textTransform: 'uppercase' }}>Bootcamp Links:</span>
                {form.bootcamp_links.map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                    <ExternalLink size={12} style={{ color: 'var(--cyan)' }} />
                    <span style={{ fontSize: '0.85rem', flex: 1 }}>{l.label} — <span style={{ color: 'var(--text-muted)' }}>{l.url}</span></span>
                    <button onClick={() => removeLink('bootcamp', i)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
            {form.material_links.length > 0 && (
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--magenta)', textTransform: 'uppercase' }}>Material Links:</span>
                {form.material_links.map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                    <ExternalLink size={12} style={{ color: 'var(--magenta)' }} />
                    <span style={{ fontSize: '0.85rem', flex: 1 }}>{l.label} — <span style={{ color: 'var(--text-muted)' }}>{l.url}</span></span>
                    <button onClick={() => removeLink('material', i)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Problem Statement'}
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <h1><BookOpen size={28} style={{ marginRight: 10 }} /> Problem Statements</h1>
        <button className="btn btn-primary btn-sm" onClick={startNew}><Plus size={16} /> Add New</button>
      </div>

      {problems.length === 0 ? (
        <div className="glass-card empty-state"><h3>No problem statements</h3><p>Create the first one!</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {problems.map(p => (
            <div key={p.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ marginBottom: 4 }}>{p.title}</h4>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`badge ${diffBadge[p.difficulty]}`}>{p.difficulty}</span>
                  <span className="badge badge-purple">{p.category}</span>
                  {!p.is_active && <span className="badge badge-danger">Inactive</span>}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {(p.bootcamp_links?.length || 0) + (p.material_links?.length || 0)} links
                  </span>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => startEdit(p)}><Edit size={14} /> Edit</button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
