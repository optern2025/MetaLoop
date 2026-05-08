import { useState, useEffect } from 'react'
import { getProblemStatements } from '../../lib/supabase'
import DashboardLayout from '../../components/DashboardLayout'
import { BookOpen, ExternalLink, Filter, Zap, AlertTriangle, Star } from 'lucide-react'

export default function ProblemStatements() {
  const [problems, setProblems] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadProblems() }, [])

  async function loadProblems() {
    try {
      const data = await getProblemStatements()
      setProblems(data || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const filtered = filter === 'all' ? problems : problems.filter(p => p.difficulty === filter)

  const diffIcon = { easy: <Zap size={14} />, medium: <Star size={14} />, hard: <AlertTriangle size={14} /> }
  const diffBadge = { easy: 'badge-green', medium: 'badge-warning', hard: 'badge-danger' }

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <h1><BookOpen size={28} style={{ marginRight: 10 }} /> Problem Statements</h1>
      </div>

      <div className="tabs">
        {['all', 'easy', 'medium', 'hard'].map(f => (
          <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state"><div className="pulse">Loading...</div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No Problem Statements</h3>
          <p>Problem statements will appear here once posted by the organizers.</p>
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map(problem => (
            <div key={problem.id} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h3 style={{ fontSize: '1.1rem', flex: 1 }}>{problem.title}</h3>
                <span className={`badge ${diffBadge[problem.difficulty]}`}>
                  {diffIcon[problem.difficulty]} {problem.difficulty}
                </span>
              </div>
              <span className="badge badge-purple" style={{ marginBottom: 12, display: 'inline-flex' }}>{problem.category}</span>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 16 }}>
                {problem.description}
              </p>

              {problem.bootcamp_links && problem.bootcamp_links.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--cyan)', marginBottom: 8, fontFamily: 'Orbitron', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Bootcamp Resources
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {problem.bootcamp_links.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--cyan)' }}>
                        <ExternalLink size={14} /> {link.label || link.url}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {problem.material_links && problem.material_links.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--magenta)', marginBottom: 8, fontFamily: 'Orbitron', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Materials
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {problem.material_links.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--magenta)' }}>
                        <ExternalLink size={14} /> {link.label || link.url}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
