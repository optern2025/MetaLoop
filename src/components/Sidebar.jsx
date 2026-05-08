import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { signOut } from '../lib/supabase'
import { LogOut, LayoutDashboard, Users, FileText, Send, Trophy, ClipboardCheck, Star, MessageSquare, Settings, UserCog, BookOpen, BarChart3, Shield } from 'lucide-react'

const candidateLinks = [
  { to: '/candidate', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/candidate/team', icon: Users, label: 'My Team' },
  { to: '/candidate/problems', icon: BookOpen, label: 'Problem Statements' },
  { to: '/candidate/submit-idea', icon: Send, label: 'Idea Submission' },
  { to: '/candidate/prototype', icon: FileText, label: 'Prototype Upload' },
  { to: '/candidate/leaderboard', icon: Trophy, label: 'Leaderboard' },
]

const juryLinks = [
  { to: '/jury', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/jury/evaluate', icon: ClipboardCheck, label: 'Evaluate Teams' },
  { to: '/jury/feedback', icon: MessageSquare, label: 'My Feedback' },
  { to: '/jury/leaderboard', icon: Trophy, label: 'Leaderboard' },
]

const adminLinks = [
  { to: '/admin-portal', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin-portal/users', icon: UserCog, label: 'User Management' },
  { to: '/admin-portal/problems', icon: BookOpen, label: 'Problem Statements' },
  { to: '/admin-portal/evaluation', icon: BarChart3, label: 'Internal Evaluation' },
  { to: '/admin-portal/leaderboard', icon: Trophy, label: 'Leaderboard' },
]

export default function Sidebar() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const links = profile?.role === 'admin' ? adminLinks : profile?.role === 'jury' ? juryLinks : candidateLinks

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const initials = profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'

  const roleBadge = {
    candidate: { label: 'Candidate', color: 'var(--cyan)' },
    jury: { label: 'Jury Member', color: 'var(--magenta)' },
    admin: { label: 'Admin', color: 'var(--gold)' },
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">MetaLoop</div>
      <div className="sidebar-subtitle">VR Hackathon</div>

      <nav className="sidebar-nav">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <link.icon size={18} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{profile?.full_name || 'User'}</div>
            <div className="sidebar-user-role" style={{ color: roleBadge[profile?.role]?.color }}>
              {profile?.role === 'admin' && <Shield size={10} style={{ marginRight: 4 }} />}
              {roleBadge[profile?.role]?.label}
            </div>
          </div>
        </div>
        <button className="sidebar-link" onClick={handleSignOut} style={{ marginTop: 8, color: 'var(--danger)' }}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
