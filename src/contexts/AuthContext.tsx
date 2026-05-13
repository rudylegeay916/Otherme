import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// ── Types ─────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null
  session: Session | null
  /** true pendant la vérification initiale de session (évite le flash de redirection) */
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: AuthError | null; requiresConfirmation: boolean }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

// ── Context ───────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restaurer la session depuis localStorage au chargement initial
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    // Écouter tous les changements d'état auth (login, logout, token refresh…)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ── Méthodes ──────────────────────────────────────────────────

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // full_name est passé dans raw_user_meta_data → lu par le trigger handle_new_user
        data: { full_name: fullName },
      },
    })

    // requiresConfirmation = true quand Supabase attend une validation email
    // (session nulle malgré pas d'erreur)
    const requiresConfirmation = !error && !data.session

    return { error, requiresConfirmation }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider')
  return ctx
}
