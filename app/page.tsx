"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PenLine, Clock } from "lucide-react"
import Link from "next/link"

// Dummy data for recent articles
const recentArticles = [
  {
    id: "1",
    title: "React.jsの基礎を学ぶ方法",
    createdAt: "3日前",
    updatedAt: "3日前",
  },
  {
    id: "2",
    title: "Next.jsでWebアプリケーションを構築する",
    createdAt: "1週間前",
    updatedAt: "5日前",
  },
  {
    id: "3",
    title: "TypeScriptの型システムを理解する",
    createdAt: "2週間前",
    updatedAt: "2週間前",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
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
          <Link href="/theme-input">
            <Button size="lg" className="h-12 px-8 text-base">
              新しい記事を始める
            </Button>
          </Link>
        </div>

        {/* Recent Articles */}
        {recentArticles.length > 0 && (
          <div>
            <h2 className="mb-6 text-xl font-semibold">最近の記事</h2>
            <div className="space-y-3">
              {recentArticles.map((article) => (
                <Link key={article.id} href={`/articles/${article.id}`}>
                  <Card className="p-4 transition-colors hover:bg-accent">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="mb-1 font-medium">{article.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {article.updatedAt}
                          </span>
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
          </div>
        )}
      </div>
    </div>
  )
}
