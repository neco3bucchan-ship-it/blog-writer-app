"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ChevronLeft, ChevronRight, Save, Sparkles, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { SimpleSupabaseAuthGuard } from "@/components/SimpleSupabaseAuthGuard"
import { SimpleSupabaseHeader } from "@/components/SimpleSupabaseHeader"
import { useAutoSave } from "@/hooks/useAutoSave"
import { AutoSaveIndicator } from "@/components/AutoSaveIndicator"
import { createArticle, updateArticle, getArticle, updateArticleSection } from "@/lib/article-service"

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
  isCompleted?: boolean;
}

// セクションの本文を生成する関数（Gemini AI使用）
async function generateSectionContent(
  sectionTitle: string,
  sectionDescription: string,
  theme: string,
  targetAudience: string,
  heading: string
): Promise<string> {
  try {
    console.log('Generating section content with AI:', { sectionTitle, theme, targetAudience, heading })
    
    const response = await fetch('/api/ai/generate-section-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sectionTitle,
        sectionDescription,
        theme,
        targetAudience,
        heading
      }),
    })

    if (!response.ok) {
      console.error('AI generation failed with status:', response.status)
      throw new Error('コンテンツ生成に失敗しました')
    }

    const data = await response.json()
    console.log('AI content generated successfully')
    return data.content || `# ${sectionTitle}\n\n${sectionDescription}\n\n（AIコンテンツ生成に失敗しました。手動で本文を入力してください）`
  } catch (error) {
    console.error('Generate content error:', error)
    // エラー時のフォールバック
    const audienceLevel = targetAudience === 'beginner' ? '初心者' : targetAudience === 'intermediate' ? '中級者' : '上級者'
    return `# ${sectionTitle}

${sectionDescription}

## 概要

このセクションでは、「${sectionTitle}」について、${audienceLevel}向けに詳しく解説します。${theme}に関する内容を、実践的な例を交えながら説明していきます。

## 詳細説明

（ここに詳しい説明を記入してください）

具体的な手順や例を含めて、読者が理解しやすいように説明します。

## 実践例

実際の使用例やコードサンプルを示すことで、理解を深めます。

## まとめ

このセクションで学んだ内容をまとめます。`
  }
}

function WritingContent() {
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
  const [articleId, setArticleId] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState<Record<string, boolean>>({})
  
  // 記事の基本情報
  const [articleInfo, setArticleInfo] = useState<{
    title: string
    theme: string
    targetAudience: string
  }>({
    title: searchParams.get('heading') || '',
    theme: searchParams.get('theme') || '',
    targetAudience: searchParams.get('targetAudience') || ''
  })

  // URLパラメータから情報を取得（後方互換性のため残す）
  const heading = articleInfo.title || searchParams.get('heading') || ''
  const theme = articleInfo.theme || searchParams.get('theme') || ''
  const targetAudience = articleInfo.targetAudience || searchParams.get('targetAudience') || ''
  const outlineParam = searchParams.get('outline') || ''

  // ハイドレーション問題を防ぐため、クライアントサイドでのみ実行
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 記事の初期化または復元
  useEffect(() => {
    if (!isClient) return

    const initializeOrRestoreArticle = async () => {
      // URLパラメータから記事IDを取得（既存記事の復元）
      const articleIdParam = searchParams.get('id')
      
      if (articleIdParam) {
        // 既存記事の復元
        try {
          setIsLoading(true)
          setError(null)

          const result = await getArticle(articleIdParam)
          if (result.success && result.article) {
            setArticleId(result.article.id)
            
            // 記事の基本情報を復元
            setArticleInfo({
              title: result.article.title || result.article.heading,
              theme: result.article.theme,
              targetAudience: result.article.targetAudience
            })
            
            setOutline(result.article.outline.map(section => ({
              id: section.id,
              section: section.section,
              title: section.title,
              description: section.description
            })))
            
            // 既存のコンテンツを復元
            const existingContent: Record<string, string> = {}
            const existingCompleted: Record<string, boolean> = {}
            
            result.article.outline.forEach(section => {
              existingContent[section.id] = section.content
              existingCompleted[section.id] = section.isCompleted
            })
            
            setContent(existingContent)
            setIsCompleted(existingCompleted)
            setGeneratedContent(result.article.outline.map(section => ({
              id: section.id,
              section: section.section,
              title: section.title,
              content: section.content,
              isCompleted: section.isCompleted
            })))
            
            setSuccess('記事を復元しました')
            // 成功メッセージを3秒後に自動で消す
            setTimeout(() => setSuccess(null), 3000)
          } else {
            setError(result.error || '記事の取得に失敗しました')
          }
        } catch (error) {
          console.error('Article restoration error:', error)
          setError('記事の復元に失敗しました')
        } finally {
          setIsLoading(false)
        }
      } else {
        // 新しい記事の作成
        if (!heading || !theme || !targetAudience || !outlineParam) {
          setError('必要な情報が不足しています')
          setIsLoading(false)
          return
        }

        try {
          setIsLoading(true)
          setError(null)

          // アウトラインをパース
          const parsedOutline = JSON.parse(decodeURIComponent(outlineParam))
          setOutline(parsedOutline)

          // 記事を作成
          const articleResult = await createArticle({
            title: heading,
            theme,
            targetAudience: targetAudience as 'beginner' | 'intermediate' | 'advanced',
            heading,
            outline: parsedOutline.map((section: any) => ({
              id: section.id,
              section: section.section,
              title: section.title,
              description: section.description,
              content: '',
              wordCount: 0,
              isCompleted: false
            }))
          })

          if (articleResult.success && articleResult.article) {
            setArticleId(articleResult.article.id)
            
            // 作成されたセクション情報を取得（実際のIDを含む）
            const createdSections = articleResult.article.outline || []
            
            // パースされたアウトラインを、作成されたセクションIDで更新
            const updatedOutline = parsedOutline.map((section: any, index: number) => ({
              ...section,
              id: createdSections[index]?.id || section.id
            }))
            setOutline(updatedOutline)
            
            // 各セクションの本文を生成
            const generatedSections: ContentSection[] = []
            
            try {
              setIsGenerating(true)
              
              for (let i = 0; i < updatedOutline.length; i++) {
                const section = updatedOutline[i]
                
                console.log(`Generating content for section ${i + 1}/${updatedOutline.length}: ${section.title}`)
                
                try {
                  // セクションの本文を生成
                  const sectionContent = await generateSectionContent(
                    section.title,
                    section.description || '',
                    theme,
                    targetAudience,
                    heading
                  )
                  
                  generatedSections.push({
                    id: section.id,
                    section: section.section,
                    title: section.title,
                    content: sectionContent,
                    isCompleted: false
                  })
                  
                  // 生成されたコンテンツを状態に保存
                  setContent(prev => ({
                    ...prev,
                    [section.id]: sectionContent
                  }))
                  
                  console.log(`Section ${i + 1} generated successfully`)
                } catch (sectionError) {
                  console.error(`Failed to generate section ${i + 1}:`, sectionError)
                  
                  // セクション生成失敗時はテンプレートを使用
                  const fallbackContent = `# ${section.title}

${section.description || ''}

## 概要

このセクションでは、「${section.title}」について詳しく解説します。

（AIコンテンツ生成に失敗しました。手動で本文を入力してください）

## 詳細説明

ここに詳しい説明を記入してください。

## まとめ

このセクションで学んだ内容をまとめます。`
                  
                  generatedSections.push({
                    id: section.id,
                    section: section.section,
                    title: section.title,
                    content: fallbackContent,
                    isCompleted: false
                  })
                  
                  setContent(prev => ({
                    ...prev,
                    [section.id]: fallbackContent
                  }))
                }
              }
              
              setGeneratedContent(generatedSections)
              
              // AI生成されたコンテンツをデータベースに保存
              console.log('Saving generated content to database...')
              try {
                for (const section of generatedSections) {
                  await updateArticleSection(articleResult.article.id, section.id, {
                    content: section.content,
                    isCompleted: false
                  })
                }
                console.log('All generated content saved successfully')
                setSuccess('本文の生成と保存が完了しました')
              } catch (saveError) {
                console.error('Failed to save generated content:', saveError)
                setSuccess('本文の生成が完了しました（一部の保存に失敗した可能性があります）')
              }
              
              // 成功メッセージを3秒後に自動で消す
              setTimeout(() => setSuccess(null), 3000)
              console.log('All sections generated successfully')
            } catch (generationError) {
              console.error('Content generation error:', generationError)
              setError('コンテンツ生成中にエラーが発生しました。一部のセクションは手動で入力してください。')
            } finally {
              setIsGenerating(false)
            }
          } else {
            setError(articleResult.error || '記事の作成に失敗しました')
          }
          
        } catch (error) {
          console.error('Article initialization error:', error)
          setError(`記事の初期化に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
        } finally {
          setIsGenerating(false)
          setIsLoading(false)
        }
      }
    }

    initializeOrRestoreArticle()
  }, [isClient, heading, theme, targetAudience, outlineParam, searchParams])

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

  const handleSave = async () => {
    if (!articleId || !currentOutline?.id) return
    
    setIsSaving(true)
    try {
      await autoSave.saveNow()
      setLastSaved(new Date())
    } catch (error) {
      console.error('Manual save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSectionComplete = (sectionId: string, completed: boolean) => {
    setIsCompleted(prev => ({
      ...prev,
      [sectionId]: completed
    }))
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
      
      // 成功メッセージを3秒後に自動で消す
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error regenerating content:', err)
      setError(err instanceof Error ? err.message : '本文の再生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const currentOutline = outline[currentSection]
  const currentContent = content[currentOutline?.id] || ''
  const currentCompleted = isCompleted[currentOutline?.id] || false

  // 現在のセクションの自動保存
  const autoSave = useAutoSave(currentContent, currentCompleted, {
    articleId: articleId || '',
    sectionId: currentOutline?.id || '',
    delay: 2000,
    enabled: !!articleId && !!currentOutline?.id
  })

  return (
      <SimpleSupabaseAuthGuard>
        <div className="min-h-screen bg-background">
          <SimpleSupabaseHeader />
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

          {/* Article Info */}
          {articleId && !isLoading && (
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <div>
                <h2 className="text-lg font-semibold mb-1">{heading}</h2>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>テーマ: {theme}</span>
                  <span>•</span>
                  <span>対象読者: {targetAudience === 'beginner' ? '初心者' : targetAudience === 'intermediate' ? '中級者' : '上級者'}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">執筆進捗</span>
                  <span className="font-medium">
                    {outline.length > 0 
                      ? Math.round((Object.values(isCompleted).filter(Boolean).length / outline.length) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div 
                    className="h-full bg-primary transition-all" 
                    style={{ 
                      width: `${outline.length > 0 
                        ? Math.round((Object.values(isCompleted).filter(Boolean).length / outline.length) * 100)
                        : 0}%` 
                    }} 
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {Object.values(isCompleted).filter(Boolean).length} / {outline.length} セクション完了
                </p>
              </div>
            </div>
          )}

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
              {/* Auto Save Indicator */}
              {articleId && currentOutline && (
                <div className="flex items-center justify-between">
                  <AutoSaveIndicator
                    status={autoSave.status}
                    lastSaved={autoSave.lastSaved}
                    hasUnsavedChanges={autoSave.hasUnsavedChanges}
                    error={autoSave.error}
                    retryCount={autoSave.retryCount}
                    maxRetries={autoSave.maxRetries}
                    nextRetryAt={autoSave.nextRetryAt}
                    isOffline={autoSave.isOffline}
                    onRetry={autoSave.retry}
                  />
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || autoSave.isSaving}
                    size="sm"
                    variant="outline"
                  >
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    手動保存
                  </Button>
                </div>
              )}

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
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">内容</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`completed-${currentOutline.id}`}
                          checked={currentCompleted}
                          onChange={(e) => handleSectionComplete(currentOutline.id, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`completed-${currentOutline.id}`} className="text-sm text-muted-foreground">
                          完了
                        </label>
                      </div>
                    </div>
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
                      {currentCompleted && (
                        <span className="text-green-600 text-sm font-medium">
                          ✓ 完了済み
                        </span>
                      )}
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
      </SimpleSupabaseAuthGuard>
  )
}

export default function WritingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <SimpleSupabaseHeader />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    }>
      <WritingContent />
    </Suspense>
  )
}