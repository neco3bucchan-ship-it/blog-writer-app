"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

interface OutlineSection {
  id: string;
  section: number;
  title: string;
  description: string;
}

export default function OutlineEditingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [outline, setOutline] = useState<OutlineSection[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // URLパラメータから見出し、テーマ、ターゲット読者を取得
  const heading = searchParams.get('heading') || ''
  const theme = searchParams.get('theme') || ''
  const targetAudience = searchParams.get('targetAudience') || ''

  // ハイドレーション問題を防ぐため、クライアントサイドでのみ実行
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // コンポーネントマウント時にアウトラインを生成
  useEffect(() => {
    if (!isClient) return // クライアントサイドでのみ実行
    
    const generateOutline = async () => {
      if (!heading || !targetAudience) {
        setError('見出しまたはターゲット読者の情報が不足しています')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/ai/generate-outline', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            heading,
            targetAudience,
          }),
        })

        if (!response.ok) {
          throw new Error('アウトラインの生成に失敗しました')
        }

        const data = await response.json()
        setOutline(data.outline || [])
      } catch (err) {
        console.error('Error generating outline:', err)
        setError(err instanceof Error ? err.message : 'アウトラインの生成に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    generateOutline()
  }, [isClient, heading, targetAudience])

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
    // アウトライン情報をURLパラメータとして渡す
    setTimeout(() => {
      const outlineData = encodeURIComponent(JSON.stringify(outline))
      router.push(`/writing?heading=${encodeURIComponent(heading)}&theme=${encodeURIComponent(theme)}&targetAudience=${encodeURIComponent(targetAudience)}&outline=${outlineData}`)
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

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">AIがアウトラインを生成中...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {/* Outline Items */}
          {!isLoading && !error && (
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
          )}

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
