import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/stores/useAppStore'
import { UserProfile } from '@/types'

// module-level singleton — the listener is created once for the app's
// lifetime and only torn down when the last useAuth() consumer unmounts,
// so screens mounting/unmounting (login, register, tabs, ...) don't
// repeatedly recreate the subscription and refire INITIAL_SESSION.
let authListenerCount = 0
let authSubscription: { unsubscribe: () => void } | null = null

export function useAuth() {
  const { user, isLoading, setUser, setLoading, setOnboarded, reset } =
    useAppStore()

  useEffect(() => {
    authListenerCount++

    if (authListenerCount === 1) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setLoading(false)
        }
      }).catch((error) => {
        console.error('Error getting session:', error)
        setLoading(false)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('authStateChange event:', event, session?.user?.email)
          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            reset()
          }
        }
      )
      authSubscription = subscription
    }

    return () => {
      authListenerCount--
      if (authListenerCount === 0 && authSubscription) {
        authSubscription.unsubscribe()
        authSubscription = null
      }
    }
  }, [])

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      const profile = snakeToCamel(data) as UserProfile
      setUser(profile)
      setOnboarded(data.onboarding_completed ?? false)
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      if (error?.message?.includes('JWT')) {
        await supabase.auth.signOut()
      }
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (error) throw error
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ name })
        .eq('id', data.user.id)
    }
    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    reset()
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  async function resendConfirmation(email: string) {
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) throw error
  }

  return {
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendConfirmation,
    isAuthenticated: !!user,
  }
}

function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(snakeToCamel)
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      )
      acc[camelKey] = snakeToCamel(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}
