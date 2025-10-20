'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
}

export function AuthGuard({ 
  children, 
  redirectTo = '/auth/login', 
  requireAuth = true 
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // ローディング中は何もしない

    if (requireAuth && !user) {
      // 認証が必要だが、ユーザーがログインしていない場合
      router.push(redirectTo)
    } else if (!requireAuth && user) {
      // 認証が不要だが、ユーザーがログインしている場合（ログイン画面など）
      router.push('/')
    }
  }, [user, loading, requireAuth, redirectTo, router])

  // ローディング中はローディング画面を表示
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">認証状態を確認中...</p>
        </div>
      </div>
    )
  }

  // 認証が必要な場合、ユーザーがログインしていない場合は何も表示しない
  if (requireAuth && !user) {
    return null
  }

  // 認証が不要な場合、ユーザーがログインしている場合は何も表示しない
  if (!requireAuth && user) {
    return null
  }

  return <>{children}</>
}
