'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// 認証状態の型定義
interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

// 認証コンテキストの型定義
interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  clearError: () => void
}

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 認証プロバイダーコンポーネント
export function SimpleSupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 認証状態の初期化
  useEffect(() => {
    // 現在のセッションを取得
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          setError(error.message)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err)
        setError('認証状態の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.id)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        setError(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ユーザー登録
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true)
      setError(null)

      // Supabase設定の確認
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabaseの設定が必要です。.env.localファイルにNEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEYを設定してください。' 
        }
      }

      // 簡単なバリデーション
      if (!email || !password) {
        return { success: false, error: 'メールアドレスとパスワードを入力してください' }
      }

      if (password.length < 6) {
        return { success: false, error: 'パスワードは6文字以上で入力してください' }
      }

      if (!email.includes('@')) {
        return { success: false, error: '有効なメールアドレスを入力してください' }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0]
          }
        }
      })

      if (error) {
        console.error('Supabase signUp error:', error)
        // より分かりやすいエラーメッセージ
        if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
          return { 
            success: false, 
            error: 'Supabaseへの接続に失敗しました。.env.localファイルの設定を確認してください。' 
          }
        }
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      console.error('SignUp error:', err)
      const errorMessage = err instanceof Error ? err.message : 'ユーザー登録に失敗しました'
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch')) {
        return { 
          success: false, 
          error: 'Supabaseへの接続に失敗しました。.env.localファイルの設定を確認してください。' 
        }
      }
      return { success: false, error: 'ユーザー登録に失敗しました' }
    } finally {
      setLoading(false)
    }
  }

  // ログイン
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      // Supabase設定の確認
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabaseの設定が必要です。.env.localファイルにNEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEYを設定してください。' 
        }
      }

      // 簡単なバリデーション
      if (!email || !password) {
        return { success: false, error: 'メールアドレスとパスワードを入力してください' }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Supabase signIn error:', error)
        // より分かりやすいエラーメッセージ
        if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
          return { 
            success: false, 
            error: 'Supabaseへの接続に失敗しました。.env.localファイルの設定を確認してください。' 
          }
        }
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      console.error('SignIn error:', err)
      const errorMessage = err instanceof Error ? err.message : 'ログインに失敗しました'
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch')) {
        return { 
          success: false, 
          error: 'Supabaseへの接続に失敗しました。.env.localファイルの設定を確認してください。' 
        }
      }
      return { success: false, error: 'ログインに失敗しました' }
    } finally {
      setLoading(false)
    }
  }

  // ログアウト
  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Supabase signOut error:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      console.error('SignOut error:', err)
      return { success: false, error: 'ログアウトに失敗しました' }
    } finally {
      setLoading(false)
    }
  }

  // エラーのクリア
  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 認証フック
export function useSimpleSupabaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSimpleSupabaseAuth must be used within a SimpleSupabaseAuthProvider')
  }
  return context
}
