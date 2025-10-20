"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Loader2, Pencil, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthGuard } from "@/components/AuthGuard"
import { Header } from "@/components/Header"

interface HeadingOption {
  id: string;
  title: string;
  description: string;
}

function HeadingSelectionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedHeading, setSelectedHeading] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editedHeading, setEditedHeading] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [headingOptions, setHeadingOptions] = useState<HeadingOption[]>([])
  const [error, setError] = useState<string | null>(null)

  // URLパラメータからテーマとターゲット読者を取得
  const theme = searchParams.get('theme') || ''
  const targetAudience = searchParams.get('targetAudience') || ''

  // ハイドレーション問題を防ぐため、クライアントサイドでのみ実行
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // コンポーネントマウント時に見出しを生成
  useEffect(() => {
    if (!isClient) return // クライアントサイドでのみ実行
    
    const generateHeadings = async () => {
      if (!theme || !targetAudience) {
        setError('テーマまたはターゲット読者の情報が不足しています')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/ai/generate-headings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            theme,
            targetAudience,
          }),
        })

        if (!response.ok) {
          throw new Error('見出しの生成に失敗しました')
        }

        const data = await response.json()
        setHeadingOptions(data.headings || [])
      } catch (err) {
        console.error('Error generating headings:', err)
        setError(err instanceof Error ? err.message : '見出しの生成に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    generateHeadings()
  }, [isClient, theme, targetAudience])

  const handleGenerate = () => {
    if (!selectedHeading) return

    setIsGenerating(true)
    // 選択された見出しをURLパラメータとして渡す
    const selectedOption = headingOptions.find((h) => h.id === selectedHeading)
    if (selectedOption) {
      router.push(`/outline-editing?heading=${encodeURIComponent(selectedOption.title)}&theme=${encodeURIComponent(theme)}&targetAudience=${encodeURIComponent(targetAudience)}`)
    }
  }

  const handleEdit = () => {
    const selected = headingOptions.find((h) => h.id === selectedHeading)
    if (selected) {
      setEditedHeading(selected.title)
      setIsEditing(true)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/theme-input">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
          </Link>
          <span className="text-sm text-muted-foreground">2/5 見出し選択</span>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <div>
            <h1 className="mb-2 text-balance text-3xl font-bold">テーマに基づいて見出しを選択してください</h1>
            <p className="text-muted-foreground">AIが生成した見出し候補から、最も適切なものを選んでください</p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">AIが見出しを生成中...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {/* Heading Options */}
          {!isLoading && !error && (
            <RadioGroup value={selectedHeading} onValueChange={setSelectedHeading}>
              <div className="space-y-3">
                {headingOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`rounded-lg border p-4 transition-colors ${
                      selectedHeading === option.id ? "border-primary bg-accent" : "border-border hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer space-y-1">
                        <div className="font-medium leading-relaxed">{option.title}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {/* Edit Section */}
          {isEditing && (
            <div className="space-y-2 rounded-lg border border-border bg-muted/50 p-4">
              <Label htmlFor="edit-heading">見出しを編集</Label>
              <Input
                id="edit-heading"
                value={editedHeading}
                onChange={(e) => setEditedHeading(e.target.value)}
                maxLength={30}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{editedHeading.length}/30文字</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    キャンセル
                  </Button>
                  <Button size="sm" onClick={() => setIsEditing(false)}>
                    保存
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button variant="outline" onClick={handleEdit} disabled={!selectedHeading || isEditing}>
              <Pencil className="mr-2 h-4 w-4" />
              編集
            </Button>
            <Button onClick={handleGenerate} disabled={!selectedHeading || isGenerating} size="lg">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                "目次を生成"
              )}
            </Button>
          </div>
        </div>
        </div>
      </div>
    </AuthGuard>
  )
}

export default function HeadingSelectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    }>
      <HeadingSelectionContent />
    </Suspense>
  )
}
