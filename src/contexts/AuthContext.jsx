import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, getProfile } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId) => {
    try {
      const p = await getProfile(userId)
      setProfile(p)
    } catch (err) {
      console.error('Failed to load profile:', err)
      // Even if profile load fails, stop loading so the app doesn't hang
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // Safety timeout — never stay loading forever (covers all edge cases)
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth: safety timeout reached, forcing loading=false')
        setLoading(false)
      }
    }, 6000)

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          loadProfile(currentUser.id)
        } else {
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('Auth: getSession failed:', err)
        if (mounted) setLoading(false)
      })

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (event === 'SIGNED_OUT') {
          setProfile(null)
          setLoading(false)
          return
        }

        if (currentUser) {
          // For SIGNED_IN / TOKEN_REFRESHED, reload the profile
          try {
            const p = await getProfile(currentUser.id)
            if (mounted) setProfile(p)
          } catch (err) {
            console.error('Auth state change - profile load failed:', err)
          } finally {
            if (mounted) setLoading(false)
          }
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const currentUser = session?.user
    if (currentUser) {
      setUser(currentUser)
      await loadProfile(currentUser.id)
    }
  }, [loadProfile])

  const value = {
    user,
    profile,
    loading,
    refreshProfile,
    isCandidate: profile?.role === 'candidate',
    isJury: profile?.role === 'jury',
    isAdmin: profile?.role === 'admin',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
