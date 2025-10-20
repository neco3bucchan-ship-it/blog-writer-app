"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PenLine, Clock, FileText, Sparkles, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/Header"
import { useAuth } from "@/contexts/AuthContext"
import { getArticles, type Article } from "@/lib/article-service"

export default function LandingPage() {
  const { user } = useAuth()
  const [recentArticles, setRecentArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 認証済みユーザーの最近の記事を取得
  useEffect(() => {
    if (user) {
      const fetchRecentArticles = async () => {
        setIsLoading(true)
        try {
          const result = await getArticles()
          if (result.success && result.articles) {
            // 最新の3件を取得
            setRecentArticles(result.articles.slice(0, 3))
          }
        } catch (error) {
          console.error('Failed to fetch recent articles:', error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchRecentArticles()
    }
  }, [user])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <PenLine className="h-8 w-8" />
            <h1 className="text-4xl font-bold tracking-tight">Blog Writer</h1>
          </div>
          <p className="text-balance text-lg text-muted-foreground">AIを活用して、段階的にブログ記事を執筆</p>
        </div>

        {/* Main CTA */}
        <div className="mb-16 text-center">
          {user ? (
            <Link href="/theme-input">
              <Button size="lg" className="h-12 px-8 text-base">
                新しい記事を始める
              </Button>
            </Link>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground mb-4">
                ログインして記事を執筆しましょう
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                    ログイン
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg" className="h-12 px-8 text-base">
                    新規登録
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recent Articles - 認証済みユーザーのみ表示 */}
        {user && (
          <div>
            <h2 className="mb-6 text-xl font-semibold">最近の記事</h2>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">記事を読み込み中...</p>
              </div>
            ) : recentArticles.length > 0 ? (
              <>
                <div className="space-y-3">
                  {recentArticles.map((article) => (
                    <Link key={article.id} href={`/writing?id=${article.id}`}>
                      <Card className="p-4 transition-colors hover:bg-accent">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="mb-1 font-medium">{article.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {new Date(article.updatedAt).toLocaleDateString('ja-JP')}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5" />
                                {article.progress}% 完了
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${article.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Link href="/articles">
                    <Button variant="outline">すべての記事を見る</Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">まだ記事がありません</p>
                <Link href="/theme-input">
                  <Button>
                    <PenLine className="mr-2 h-4 w-4" />
                    最初の記事を作成
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 機能紹介セクション */}
        <div className="mt-16">
          <h2 className="mb-8 text-center text-2xl font-bold">Blog Writerの特徴</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6 text-center">
              <Sparkles className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">AI支援執筆</h3>
              <p className="text-muted-foreground">
                AIが記事の構成を提案し、執筆をサポートします
              </p>
            </Card>
            <Card className="p-6 text-center">
              <CheckCircle className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">自動保存</h3>
              <p className="text-muted-foreground">
                執筆内容は自動的に保存され、安心して執筆できます
              </p>
            </Card>
            <Card className="p-6 text-center">
              <FileText className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">進捗管理</h3>
              <p className="text-muted-foreground">
                記事の進捗を視覚的に確認し、効率的に執筆できます
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
