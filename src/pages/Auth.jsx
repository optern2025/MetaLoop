import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signUp, signIn, getProfile } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { DashboardBg } from '../components/3d/VRArena'
import { Mail, Lock, User, ArrowLeft } from 'lucide-react'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('candidate')
  const [error, setError] = useState('')
  const [toastMsg, setToastMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [debugMsg, setDebugMsg] = useState('Testing database connection...')
  const navigate = useNavigate()

  // Diagnostic network test
  useEffect(() => {
    fetch('https://cnvymzsgujibqsroqusn.supabase.co/auth/v1/health', {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
      }
    })
      .then(res => {
        if (res.ok) setDebugMsg(`Connection OK (${res.status})`)
        else throw new Error('Unauthorized')
      })
      .catch(err => setDebugMsg(`NETWORK BLOCKED by your ISP/Firewall`))
  }, [])
  const { refreshProfile } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Safety timeout — never stay stuck on "Processing..." forever
    const safetyTimer = setTimeout(() => {
      setLoading(false)
      setError('Request timed out. Please check your connection and try again.')
    }, 12000)

    try {
      let authData
      if (isLogin) {
        authData = await signIn({ email, password })
      } else {
        if (!fullName.trim()) { 
          clearTimeout(safetyTimer)
          setError('Full name is required')
          setLoading(false)
          return 
        }
        authData = await signUp({ email, password, fullName, role })
      }
      if (!authData?.session) {
          clearTimeout(safetyTimer)
          
          // Trigger the green toast instead of the red error
          setToastMsg('Confirmation Email sent. Please check your spam folder.')
          setLoading(false)
          
          // Auto-hide the message after 8 seconds
          setTimeout(() => {
            setToastMsg('')
          }, 8000)
          
          return 
        }
      // Fetch the user's profile to determine their actual role
      const userId = authData?.user?.id
      let actualRole = role // fallback for new signups

      if (userId) {
        try {
          // Small delay to let the trigger create the profile
          await new Promise(r => setTimeout(r, 800))
          const profile = await getProfile(userId)
          if (profile?.role) {
            actualRole = profile.role
          }
        } catch (profileErr) {
          console.warn('Could not fetch profile, using default role:', profileErr)
        }
      }

      // Refresh context in the background (don't await — let it happen async)
      refreshProfile().catch(() => {})

      clearTimeout(safetyTimer)

      // Navigate based on actual role from database
      const routes = { candidate: '/candidate', jury: '/jury', admin: '/admin-portal' }
      navigate(routes[actualRole] || '/candidate')
    } catch (err) {
      clearTimeout(safetyTimer)
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <DashboardBg />
      <div className="auth-card glass-card">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')} style={{ marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <h1 style={{ textAlign: 'center', fontSize: '1.6rem', marginBottom: 8 }} className="text-gradient">MetaLoop</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.85rem' }}>
          {isLogin ? 'Welcome back, hacker' : 'Join the arena'}
        </p>

        <div className="auth-tabs">
          <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Sign In</button>
          <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Register</button>
        </div>

        {/* Diagnostic Test Display 
        <div style={{ textAlign: 'center', marginBottom: '15px', padding: '10px', backgroundColor: debugMsg.includes('OK') ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)', color: debugMsg.includes('OK') ? '#4ade80' : '#f87171', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>
          Diagnostic: {debugMsg}
        </div>*/}

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="hacker@arena.io" required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Register as</label>
              <div className="auth-role-select">
                <button type="button" className={`auth-role-btn ${role === 'candidate' ? 'active' : ''}`} onClick={() => setRole('candidate')}>
                  🎮 Candidate
                </button>
                <button type="button" className={`auth-role-btn ${role === 'jury' ? 'active' : ''}`} onClick={() => setRole('jury')}>
                  ⚖️ Jury
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Processing...' : isLogin ? 'Enter Arena' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <span>New here? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(false) }}>Create account</a></span>
          ) : (
            <span>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(true) }}>Sign in</a></span>
          )}
        </div>
      </div>
      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="success-toast">
          {toastMsg}
        </div>
      )}
    </div>
  )
}