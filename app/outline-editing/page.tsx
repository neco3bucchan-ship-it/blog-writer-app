"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Pencil, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Dummy outline data
const initialOutline = [
  {
    id: "1",
    section: 1,
    title: "React.jsとは何か？",
    description: "基本的な概念と特徴を解説し、なぜReact.jsが人気なのかを説明します",
  },
  {
    id: "2",
    section: 2,
    title: "環境構築の手順",
    description: "開発環境の準備から始めよう。Node.jsのインストールから始めます",
  },
  {
    id: "3",
    section: 3,
    title: "初めてのコンポーネント",
    description: "実際にコードを書いてみよう。シンプルなコンポーネントを作成します",
  },
  {
    id: "4",
    section: 4,
    title: "Hooksの基礎",
    description: "useStateとuseEffectを使った状態管理を学びます",
  },
  {
    id: "5",
    section: 5,
    title: "実践的なアプリケーション",
    description: "実際のプロジェクトで学ぶ。Todoアプリを作成してみましょう",
  },
]

export default function OutlineEditingPage() {
  const router = useRouter()
  const [outline, setOutline] = useState(initialOutline)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)

  const handleEdit = (id: string) => {
    setEditingId(id)
  }

  const handleSave = () => {
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (outline.length <= 3) {
      alert("最低3つのセクションが必要です")
      return
    }
    setOutline(outline.filter((item) => item.id !== id))
  }

  const handleStart = () => {
    setIsStarting(true)
    // Simulate navigation
    setTimeout(() => {
      router.push("/writing")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/heading-selection">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
          </Link>
          <span className="text-sm text-muted-foreground">3/5 目次編集</span>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <div>
            <h1 className="mb-2 text-balance text-3xl font-bold">記事の目次を確認・編集してください</h1>
            <p className="text-muted-foreground">各セクションの内容を確認し、必要に応じて編集や削除ができます</p>
          </div>

          {/* Outline Items */}
          <div className="space-y-4">
            {outline.map((item) => (
              <div key={item.id} className="rounded-lg border border-border p-4">
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">タイトル</label>
                      <Input defaultValue={item.title} maxLength={30} className="font-medium" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">説明</label>
                      <Textarea defaultValue={item.description} maxLength={100} className="min-h-[80px] resize-none" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave}>
                        保存
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                        キャンセル
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <h3 className="font-medium leading-relaxed">
                          {item.section}. {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item.id)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button variant="outline">目次を再生成</Button>
            <Button onClick={handleStart} disabled={isStarting} size="lg">
              {isStarting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  準備中...
                </>
              ) : (
                "執筆を開始"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
