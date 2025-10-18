"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PenLine, Trash2, Clock, Calendar } from "lucide-react"
import Link from "next/link"

// Dummy articles data
const articles = [
  {
    id: "1",
    title: "React.jsの基礎を学ぶ方法",
    createdAt: "2024/01/15",
    updatedAt: "2024/01/15 14:30",
    progress: 100,
  },
  {
    id: "2",
    title: "Next.jsでWebアプリケーションを構築する",
    createdAt: "2024/01/10",
    updatedAt: "2024/01/12 09:15",
    progress: 60,
  },
  {
    id: "3",
    title: "TypeScriptの型システムを理解する",
    createdAt: "2024/01/05",
    updatedAt: "2024/01/05 16:45",
    progress: 40,
  },
  {
    id: "4",
    title: "Tailwind CSSでモダンなUIを作る",
    createdAt: "2024/01/01",
    updatedAt: "2024/01/03 11:20",
    progress: 80,
  },
]

export default function ArticlesPage() {
  const handleDelete = (id: string) => {
    if (confirm("この記事を削除してもよろしいですか？")) {
      // Handle delete
      console.log("Delete article:", id)
    }
  }

  return (
    <div className="min-h-screen bg-background">
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

        {/* Articles List */}
        <div className="space-y-4">
          {articles.map((article) => (
            <Card key={article.id} className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="mb-2 text-xl font-semibold">{article.title}</h2>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      作成日: {article.createdAt}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      最終更新: {article.updatedAt}
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

        {/* Empty State */}
        {articles.length === 0 && (
          <div className="py-16 text-center">
            <PenLine className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">記事がありません</h3>
            <p className="mb-6 text-muted-foreground">新しい記事を作成して、執筆を始めましょう</p>
            <Link href="/theme-input">
              <Button>新しい記事を始める</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
