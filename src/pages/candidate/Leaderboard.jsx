import { useState, useEffect } from 'react'
import { getLeaderboard } from '../../lib/supabase'
import DashboardLayout from '../../components/DashboardLayout'
import { Trophy, Medal, Crown, Star } from 'lucide-react'

export default function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadLeaderboard() }, [])

  async function loadLeaderboard() {
    try {
      const data = await getLeaderboard()
      setEntries(data || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const badgeColors = { gold: 'var(--gold)', silver: 'var(--silver)', bronze: 'var(--bronze)' }
  const badgeIcons = { gold: '🥇', silver: '🥈', bronze: '🥉' }

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <h1><Trophy size={28} style={{ marginRight: 10 }} /> Leaderboard</h1>
      </div>

      {loading ? (
        <div className="empty-state pulse">Loading leaderboard...</div>
      ) : entries.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">🏆</div>
          <h3>No Rankings Yet</h3>
          <p>The leaderboard will populate once evaluations begin.</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {entries.length >= 3 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
              {[entries[1], entries[0], entries[2]].map((entry, i) => {
                const podiumOrder = [2, 1, 3]
                const heights = ['140px', '180px', '120px']
                const badge = entry?.badge || ''
                return entry ? (
                  <div key={entry.id} className="glass-card" style={{
                    textAlign: 'center', padding: '24px 32px', minWidth: 180,
                    borderColor: badgeColors[badge] || 'var(--border-glow)',
                    alignSelf: 'flex-end', minHeight: heights[i],
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>{badgeIcons[badge] || `#${podiumOrder[i]}`}</div>
                    <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{entry.teams?.team_name}</h3>
                    <div style={{ fontFamily: 'Orbitron', fontSize: '1.5rem', fontWeight: 800, color: badgeColors[badge] || 'var(--cyan)' }}>
                      {entry.avg_score}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>points</div>
                  </div>
                ) : null
              })}
            </div>
          )}

          {/* Full List */}
          <div className="glass-card">
            <h3 className="section-title"><Star size={18} className="icon" /> Full Rankings</h3>
            <div style={{ marginTop: 16 }}>
              {entries.map(entry => (
                <div key={entry.id} className={`leaderboard-item ${entry.badge || ''}`}>
                  <div className={`leaderboard-rank ${entry.badge || 'default'}`}>
                    {entry.badge ? badgeIcons[entry.badge] || entry.rank : entry.rank}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{entry.teams?.team_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {entry.teams?.team_members?.map(m => m.profiles?.full_name).filter(Boolean).join(', ')}
                    </div>
                  </div>
                  {entry.is_winner && <span className="badge badge-gold"><Crown size={12} /> Winner</span>}
                  <div className="leaderboard-score" style={{ color: badgeColors[entry.badge] || 'var(--cyan)' }}>
                    {entry.avg_score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
