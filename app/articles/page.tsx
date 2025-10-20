"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PenLine, Trash2, Clock, Calendar, Loader2 } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/AuthGuard"
import { Header } from "@/components/Header"
import { getArticles, deleteArticle, type Article } from "@/lib/article-service"

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 記事一覧を取得
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true)
        const result = await getArticles()
        
        if (result.success && result.articles) {
          setArticles(result.articles)
        } else {
          setError(result.error || '記事の取得に失敗しました')
        }
      } catch (err) {
        console.error('Fetch articles error:', err)
        setError('記事の取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('この記事を削除しますか？この操作は元に戻せません。')) {
      return
    }

    try {
      const result = await deleteArticle(id)
      
      if (result.success) {
        setArticles(prev => prev.filter(article => article.id !== id))
      } else {
        setError(result.error || '記事の削除に失敗しました')
      }
    } catch (err) {
      console.error('Delete article error:', err)
      setError('記事の削除に失敗しました')
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">記事一覧</h1>
            <p className="text-muted-foreground">保存された記事を管理できます</p>
          </div>
          <Link href="/theme-input">
            <Button>
              <PenLine className="mr-2 h-4 w-4" />
              新規作成
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">記事を読み込み中...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              再読み込み
            </Button>
          </div>
        )}

        {/* Articles List */}
        {!isLoading && !error && (
          <>
            {articles.length > 0 ? (
              <div className="space-y-4">
                {articles.map((article) => (
                  <Card key={article.id} className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h2 className="mb-2 text-xl font-semibold">{article.title}</h2>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            作成日: {new Date(article.createdAt).toLocaleDateString('ja-JP')}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            最終更新: {new Date(article.updatedAt).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">執筆進捗</span>
                          <span className="font-medium">{article.progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full bg-primary transition-all" style={{ width: `${article.progress}%` }} />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/writing?id=${article.id}`}>
                          <Button>続きから執筆</Button>
                        </Link>
                        <Button variant="outline" onClick={() => handleDelete(article.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          削除
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <PenLine className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">記事がありません</h3>
                <p className="mb-6 text-muted-foreground">新しい記事を作成して、執筆を始めましょう</p>
                <Link href="/theme-input">
                  <Button>新しい記事を始める</Button>
                </Link>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </AuthGuard>
  )
}
