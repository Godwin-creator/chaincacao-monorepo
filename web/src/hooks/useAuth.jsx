import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [session, setSession] = useState(null)
  const [role, setRole]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchRole = useCallback(async (currentUser) => {
    if (!currentUser) { setRole(null); return }

    const metaRole = currentUser.user_metadata?.role
    if (metaRole) { setRole(metaRole); return }

    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', currentUser.id)
      .single()
    setRole(data?.role ?? null)
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data: { session: initial }, error: sessionError }) => {
      if (!mounted) return
      if (sessionError) { setError(sessionError); setLoading(false); return }

      const currentUser = initial?.user ?? null
      setSession(initial)
      setUser(currentUser)
      await fetchRole(currentUser)
      if (mounted) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return
        const currentUser = newSession?.user ?? null
        setSession(newSession)
        setUser(currentUser)
        await fetchRole(currentUser)
        if (mounted) setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchRole])

  async function signIn(email, password) {
    setError(null)
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) return { data: null, error: signInError, role: null }

    let resolvedRole = data.user?.user_metadata?.role ?? null
    if (!resolvedRole) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single()
      resolvedRole = profile?.role ?? null
    }

    return { data, error: null, role: resolvedRole }
  }

  async function signUp(email, password, { role: userRole, fullName, organization }) {
    setError(null)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: userRole, full_name: fullName, organization },
      },
    })
    if (signUpError) setError(signUpError)
    return { data, error: signUpError }
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.replace('/')
  }

  async function refreshRole() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (currentUser) await fetchRole(currentUser)
  }

  return (
    <AuthContext.Provider value={{ user, session, role, loading, error, signIn, signUp, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider')
  return context
}
