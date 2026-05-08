import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { createTeam, joinTeam, getMyTeam } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import DashboardLayout from '../../components/DashboardLayout'
import { Users, Plus, UserPlus, Copy, Crown, User } from 'lucide-react'

export default function TeamFormation() {
  const { profile } = useAuth()
  const { addToast } = useToast()
  const [team, setTeam] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [mode, setMode] = useState(null) // 'create' | 'join'
  const [teamName, setTeamName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (profile) loadTeam() }, [profile])

  async function loadTeam() {
    try {
      const data = await getMyTeam(profile.id)
      if (data?.teams) {
        setTeam(data.teams)
        setTeamMembers(data.teams.team_members || [])
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!teamName.trim()) return
    setLoading(true)
    try {
      await createTeam(teamName, profile.id)
      addToast('Team created successfully!', 'success')
      await loadTeam()
      setMode(null)
    } catch (err) { addToast(err.message, 'error') }
    setLoading(false)
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!inviteCode.trim()) return
    setLoading(true)
    try {
      await joinTeam(inviteCode, profile.id)
      addToast('Joined team successfully!', 'success')
      await loadTeam()
      setMode(null)
    } catch (err) { addToast(err.message, 'error') }
    setLoading(false)
  }

  function copyCode() {
    navigator.clipboard.writeText(team.invite_code)
    addToast('Invite code copied!', 'info')
  }

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <h1><Users size={28} style={{ marginRight: 10 }} /> My Team</h1>
      </div>

      {!team && !mode && (
        <div className="glass-card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>👥</div>
          <h2 style={{ marginBottom: 8 }}>No Team Yet</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Create a new team or join an existing one</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setMode('create')}><Plus size={18} /> Create Team</button>
            <button className="btn btn-secondary" onClick={() => setMode('join')}><UserPlus size={18} /> Join Team</button>
          </div>
        </div>
      )}

      {mode === 'create' && (
        <div className="glass-card" style={{ maxWidth: 500 }}>
          <h3 className="section-title"><Plus size={18} className="icon" /> Create New Team</h3>
          <form onSubmit={handleCreate} style={{ marginTop: 16 }}>
            <div className="form-group">
              <label className="form-label">Team Name</label>
              <input className="form-input" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Cyber Wolves" required />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>Create Team</button>
              <button type="button" className="btn btn-secondary" onClick={() => setMode(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {mode === 'join' && (
        <div className="glass-card" style={{ maxWidth: 500 }}>
          <h3 className="section-title"><UserPlus size={18} className="icon" /> Join Existing Team</h3>
          <form onSubmit={handleJoin} style={{ marginTop: 16 }}>
            <div className="form-group">
              <label className="form-label">Invite Code</label>
              <input className="form-input" value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="Enter team invite code" required />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>Join Team</button>
              <button type="button" className="btn btn-secondary" onClick={() => setMode(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {team && (
        <div>
          <div className="glass-card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>{team.team_name}</h2>
                <span className={`badge badge-${team.status === 'active' ? 'green' : 'cyan'}`}>{team.status}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Invite Code:</span>
                <code style={{ background: 'rgba(0,245,255,0.1)', padding: '6px 12px', borderRadius: 8, color: 'var(--cyan)', fontFamily: 'JetBrains Mono' }}>
                  {team.invite_code}
                </code>
                <button className="btn btn-secondary btn-sm" onClick={copyCode}><Copy size={14} /></button>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 className="section-title"><Users size={18} className="icon" /> Team Members ({teamMembers.length}/{team.max_members})</h3>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {teamMembers.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--radius)', background: 'var(--bg-glass)', border: '1px solid var(--border-glow)' }}>
                  <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                    {m.profiles?.full_name?.charAt(0) || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{m.profiles?.full_name || 'Member'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.profiles?.email}</div>
                  </div>
                  {m.role === 'leader' ? (
                    <span className="badge badge-gold"><Crown size={12} /> Leader</span>
                  ) : (
                    <span className="badge badge-cyan"><User size={12} /> Member</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
