'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

// ユーザー情報の型定義
interface User {
  id: string
  email: string
  displayName: string
  createdAt: string
}

// 認証状態の型定義
interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// 認証コンテキストの型定義
interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
  clearError: () => void
}

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ローカルストレージのキー
const STORAGE_KEY = 'blog-writer-auth'
const USERS_KEY = 'blog-writer-users'

// 認証プロバイダーコンポーネント
export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 認証状態の初期化
  useEffect(() => {
    try {
      // ローカルストレージから認証情報を取得
      const authData = localStorage.getItem(STORAGE_KEY)
      if (authData) {
        const userData = JSON.parse(authData)
        setUser(userData)
      }
    } catch (err) {
      console.error('認証状態の復元に失敗しました:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // ユーザー登録
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true)
      setError(null)

      // バリデーション
      if (!email || !password || !displayName) {
        return { success: false, error: 'すべての項目を入力してください' }
      }

      if (password.length < 6) {
        return { success: false, error: 'パスワードは6文字以上で入力してください' }
      }

      if (!email.includes('@')) {
        return { success: false, error: '有効なメールアドレスを入力してください' }
      }

      // 既存ユーザーの確認
      const existingUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
      const userExists = existingUsers.find((u: any) => u.email === email)
      
      if (userExists) {
        return { success: false, error: 'このメールアドレスは既に登録されています' }
      }

      // 新しいユーザーを作成
      const newUser: User = {
        id: Date.now().toString(),
        email,
        displayName,
        createdAt: new Date().toISOString()
      }

      // ユーザー情報を保存（実際のアプリではパスワードをハッシュ化）
      const userWithPassword = {
        ...newUser,
        password // 注意: 実際のアプリではパスワードをハッシュ化する必要があります
      }

      // ユーザーリストに追加
      existingUsers.push(userWithPassword)
      localStorage.setItem(USERS_KEY, JSON.stringify(existingUsers))

      // 認証状態を保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
      setUser(newUser)

      return { success: true }
    } catch (err) {
      console.error('SignUp error:', err)
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

      // バリデーション
      if (!email || !password) {
        return { success: false, error: 'メールアドレスとパスワードを入力してください' }
      }

      // ユーザーリストから認証情報を確認
      const existingUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
      const user = existingUsers.find((u: any) => u.email === email && u.password === password)
      
      if (!user) {
        return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' }
      }

      // 認証状態を保存
      const { password: _, ...userWithoutPassword } = user
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword))
      setUser(userWithoutPassword)

      return { success: true }
    } catch (err) {
      console.error('SignIn error:', err)
      return { success: false, error: 'ログインに失敗しました' }
    } finally {
      setLoading(false)
    }
  }

  // ログアウト
  const signOut = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setUser(null)
      setError(null)
    } catch (err) {
      console.error('SignOut error:', err)
    }
  }

  // エラーのクリア
  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
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
export function useSimpleAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider')
  }
  return context
}
