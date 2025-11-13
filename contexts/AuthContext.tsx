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
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: { display_name?: string; avatar_url?: string }) => Promise<{ error: AuthError | null }>
  clearError: () => void
}

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 認証プロバイダーコンポーネント
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 認証状態の初期化
  useEffect(() => {
    // Supabase設定の確認
    if (!isSupabaseConfigured) {
      setError('🔧 Supabaseの設定が必要です！\n\n📝 設定手順:\n1. Supabaseアカウントを作成\n2. プロジェクトを作成\n3. .env.localファイルに設定を追加\n4. 開発サーバーを再起動\n\n📖 詳細手順: 設定手順_小学生でもわかる.md を参照')
      setLoading(false)
      return
    }

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
        let errorMessage = '認証状態の取得に失敗しました'
        
        if (err instanceof Error) {
          if (err.message.includes('Failed to fetch')) {
            errorMessage = '🔧 設定が必要です！\n\n1. Supabaseアカウントを作成\n2. プロジェクトを作成\n3. .env.localファイルに設定を追加\n\n📖 詳細手順: 設定手順_小学生でもわかる.md を参照'
          } else if (err.message.includes('Supabase環境変数')) {
            errorMessage = '🔧 Supabaseの設定が必要です！\n\n📖 設定手順: 設定手順_小学生でもわかる.md を参照してください'
          } else {
            errorMessage = err.message
          }
        }
        
        setError(errorMessage)
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
        const errorMessage = '🔧 Supabaseの設定が必要です！\n\n📝 設定手順:\n1. Supabaseアカウントを作成\n2. プロジェクトを作成\n3. .env.localファイルに設定を追加\n4. 開発サーバーを再起動\n\n📖 詳細手順: 設定手順_小学生でもわかる.md を参照'
        setError(errorMessage)
        return { error: { message: errorMessage } as AuthError }
      }

      // ネットワーク接続の確認（クライアント側でのみ実行）
      if (typeof window !== 'undefined' && !navigator.onLine) {
        const errorMessage = 'ネットワーク接続を確認してください'
        setError(errorMessage)
        return { error: { message: errorMessage } as AuthError }
      }
      
      // Supabase設定の確認
      console.log('🔧 Supabase設定確認:')
      console.log('isSupabaseConfigured:', isSupabaseConfigured)
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      
      if (!isSupabaseConfigured) {
        const errorMessage = '🔧 Supabaseの設定が正しくありません！\n\n📝 確認事項:\n1. .env.localファイルが存在するか\n2. NEXT_PUBLIC_SUPABASE_URLが正しく設定されているか\n3. 開発サーバーを再起動したか\n\n📖 詳細手順: 設定手順_小学生でもわかる.md を参照'
        setError(errorMessage)
        return { error: { message: errorMessage } as AuthError }
      }

      console.log('🔧 Supabase signUp を実行中...')
      console.log('Email:', email)
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0]
          }
        }
      })
      
      console.log('Supabase signUp 結果:', { data, error })

      if (error) {
        console.error('Supabase signUp error:', error)
        setError(error.message)
        return { error }
      }

      return { error: null }
    } catch (err) {
      console.error('SignUp error:', err)
      let errorMessage = 'ユーザー登録に失敗しました'
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = '🔧 設定が必要です！\n\n1. Supabaseアカウントを作成\n2. プロジェクトを作成\n3. .env.localファイルに設定を追加\n\n📖 詳細手順: SUPABASE_SETUP.md を参照'
        } else if (err.message.includes('Supabase環境変数')) {
          errorMessage = '🔧 Supabaseの設定が必要です！\n\n📖 設定手順: SUPABASE_SETUP.md を参照してください'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      return { error: { message: errorMessage } as AuthError }
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
        const errorMessage = '🔧 Supabaseの設定が必要です！\n\n📝 設定手順:\n1. Supabaseアカウントを作成\n2. プロジェクトを作成\n3. .env.localファイルに設定を追加\n4. 開発サーバーを再起動\n\n📖 詳細手順: 設定手順_小学生でもわかる.md を参照'
        setError(errorMessage)
        return { error: { message: errorMessage } as AuthError }
      }

      // ネットワーク接続の確認（クライアント側でのみ実行）
      if (typeof window !== 'undefined' && !navigator.onLine) {
        const errorMessage = 'ネットワーク接続を確認してください'
        setError(errorMessage)
        return { error: { message: errorMessage } as AuthError }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Supabase signIn error:', error)
        setError(error.message)
        return { error }
      }

      return { error: null }
    } catch (err) {
      console.error('SignIn error:', err)
      let errorMessage = 'ログインに失敗しました'
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = '🔧 設定が必要です！\n\n1. Supabaseアカウントを作成\n2. プロジェクトを作成\n3. .env.localファイルに設定を追加\n\n📖 詳細手順: SUPABASE_SETUP.md を参照'
        } else if (err.message.includes('Supabase環境変数')) {
          errorMessage = '🔧 Supabaseの設定が必要です！\n\n📖 設定手順: SUPABASE_SETUP.md を参照してください'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      return { error: { message: errorMessage } as AuthError }
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
        setError(error.message)
        return { error }
      }

      return { error: null }
    } catch (err) {
      const errorMessage = 'ログアウトに失敗しました'
      setError(errorMessage)
      return { error: { message: errorMessage } as AuthError }
    } finally {
      setLoading(false)
    }
  }

  // プロファイル更新
  const updateProfile = async (updates: { display_name?: string; avatar_url?: string }) => {
    try {
      setLoading(true)
      setError(null)

      if (!user) {
        const errorMessage = 'ログインが必要です'
        setError(errorMessage)
        return { error: { message: errorMessage } as AuthError }
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        setError(error.message)
        return { error: { message: error.message } as AuthError }
      }

      return { error: null }
    } catch (err) {
      const errorMessage = 'プロファイルの更新に失敗しました'
      setError(errorMessage)
      return { error: { message: errorMessage } as AuthError }
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
    updateProfile,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 認証フック
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
