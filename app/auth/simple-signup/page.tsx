'use client'

export const dynamic = 'force-dynamic'
export const dynamicParams = false
export const revalidate = 0

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, Mail, Lock, User, CheckCircle } from 'lucide-react'
import { useSimpleSupabaseAuth } from '@/contexts/SimpleSupabaseAuthContext'
import { SimpleSupabaseAuthGuard } from '@/components/SimpleSupabaseAuthGuard'

export default function SimpleSignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { signUp, user, loading } = useSimpleSupabaseAuth()
  const router = useRouter()

  // 既にログインしている場合はリダイレクト（useEffectで処理）
  useEffect(() => {
    if (!loading && user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // 簡単なバリデーション
    if (!email || !password || !confirmPassword || !displayName) {
      setError('すべての項目を入力してください')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      setIsLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError('有効なメールアドレスを入力してください')
      setIsLoading(false)
      return
    }

    const result = await signUp(email, password, displayName)
    
    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || 'ユーザー登録に失敗しました')
    }
    
    setIsLoading(false)
  }

  if (success) {
    return (
      <SimpleSupabaseAuthGuard requireAuth={false}>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  <h2 className="text-2xl font-bold">登録完了</h2>
                  <p className="text-muted-foreground">
                    確認メールを送信しました。<br />
                    メール内のリンクをクリックしてアカウントを有効化してください。
                  </p>
                  <Link href="/auth/simple-login">
                    <Button className="w-full">
                      ログインページへ
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SimpleSupabaseAuthGuard>
    )
  }

  return (
    <SimpleSupabaseAuthGuard requireAuth={false}>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* ヘッダー */}
          <div className="mb-8 text-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                ホームに戻る
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">新規登録</h1>
            <p className="text-muted-foreground mt-2">
              Blog Writerでアカウントを作成しましょう
            </p>
          </div>

          {/* サインアップフォーム */}
          <Card>
            <CardHeader>
              <CardTitle>アカウントを作成</CardTitle>
              <CardDescription>
                新しいアカウントの情報を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* エラー表示 */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* 表示名 */}
                <div className="space-y-2">
                  <Label htmlFor="displayName">表示名</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="表示名を入力"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* メールアドレス */}
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* パスワード */}
                <div className="space-y-2">
                  <Label htmlFor="password">パスワード</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="6文字以上のパスワード"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* パスワード確認 */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">パスワード確認</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="パスワードを再入力"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* サインアップボタン */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      登録中...
                    </>
                  ) : (
                    'アカウントを作成'
                  )}
                </Button>
              </form>

              {/* ログインリンク */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  既にアカウントをお持ちの方は{' '}
                  <Link href="/auth/simple-login" className="text-primary hover:underline">
                    ログイン
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SimpleSupabaseAuthGuard>
  )
}
