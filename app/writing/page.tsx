"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ChevronLeft, ChevronRight, Save, Sparkles, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface OutlineSection {
  id: string;
  section: number;
  title: string;
  description: string;
}

interface ContentSection {
  id: string;
  section: number;
  title: string;
  content: string;
}

export default function WritingPage() {
  const searchParams = useSearchParams()
  const [currentSection, setCurrentSection] = useState(0)
  const [content, setContent] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [outline, setOutline] = useState<OutlineSection[]>([])
  const [generatedContent, setGeneratedContent] = useState<ContentSection[]>([])
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // URLパラメータから情報を取得
  const heading = searchParams.get('heading') || ''
  const theme = searchParams.get('theme') || ''
  const targetAudience = searchParams.get('targetAudience') || ''
  const outlineParam = searchParams.get('outline') || ''

  // ハイドレーション問題を防ぐため、クライアントサイドでのみ実行
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // コンポーネントマウント時に本文を生成
  useEffect(() => {
    if (!isClient) return // クライアントサイドでのみ実行
    
    const generateContent = async () => {
      if (!heading || !targetAudience || !outlineParam) {
        setError('見出し、ターゲット読者、または目次の情報が不足しています')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        // 目次データをパース
        const parsedOutline = JSON.parse(decodeURIComponent(outlineParam))
        setOutline(parsedOutline)
        
        const response = await fetch('/api/ai/generate-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            heading,
            targetAudience,
            outline: parsedOutline,
          }),
        })

        if (!response.ok) {
          throw new Error('本文の生成に失敗しました')
        }

        const data = await response.json()
        setGeneratedContent(data.content || [])
        
        // 生成されたコンテンツを初期状態として設定
        const initialContent: Record<string, string> = {}
        data.content.forEach((section: ContentSection) => {
          initialContent[section.id] = section.content
        })
        setContent(initialContent)
      } catch (err) {
        console.error('Error generating content:', err)
        setError(err instanceof Error ? err.message : '本文の生成に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    generateContent()
  }, [isClient, heading, targetAudience, outlineParam])

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleNext = () => {
    if (currentSection < outline.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const handleSave = () => {
    setIsSaving(true)
    // 実際の保存処理をここに実装
    setTimeout(() => {
      setLastSaved(new Date())
      setIsSaving(false)
    }, 1000)
  }

  const handleGenerate = async () => {
    if (!heading || !targetAudience || outline.length === 0) {
      setError('再生成に必要な情報が不足しています')
      return
    }

    try {
      setIsGenerating(true)
      setError(null)
      
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          heading,
          targetAudience,
          outline,
        }),
      })

      if (!response.ok) {
        throw new Error('本文の再生成に失敗しました')
      }

      const data = await response.json()
      setGeneratedContent(data.content || [])
      
      // 生成されたコンテンツを更新
      const updatedContent: Record<string, string> = {}
      data.content.forEach((section: ContentSection) => {
        updatedContent[section.id] = section.content
      })
      setContent(updatedContent)
      setSuccess('本文が正常に再生成されました')
      
      // 成功メッセージを3秒後に消去
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err) {
      console.error('Error regenerating content:', err)
      setError(err instanceof Error ? err.message : '本文の再生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const currentOutline = outline[currentSection]
  const currentContent = content[currentOutline?.id] || ''

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/outline-editing">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
          </Link>
          <span className="text-sm text-muted-foreground">5/5 執筆</span>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <div>
            <h1 className="mb-2 text-balance text-3xl font-bold">記事を執筆してください</h1>
            <p className="text-muted-foreground">
              AIが生成した内容を参考に、各セクションの内容を編集・執筆してください
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">AIが本文を生成中...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {/* Success State */}
          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <p className="text-green-700">{success}</p>
            </div>
          )}

          {/* Writing Interface */}
          {!isLoading && !error && (
            <>
              {/* Section Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentSection === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    前のセクション
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentSection + 1} / {outline.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentSection === outline.length - 1}
                  >
                    次のセクション
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {lastSaved && (
                    <span className="text-sm text-muted-foreground">
                      最終保存: {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Current Section */}
              {currentOutline && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {currentOutline.section}. {currentOutline.title}
                    </h2>
                    <p className="text-muted-foreground">{currentOutline.description}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">内容</label>
                    <Textarea
                      value={currentContent}
                      onChange={(e) => {
                        setContent(prev => ({
                          ...prev,
                          [currentOutline.id]: e.target.value
                        }))
                      }}
                      className="min-h-[400px] resize-none"
                      placeholder="ここに内容を入力してください..."
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {currentContent.length}文字
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      再生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      全体を再生成
                    </>
                  )}
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      保存
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}