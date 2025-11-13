'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { SimpleSupabaseHeader } from '@/components/SimpleSupabaseHeader'

export default function TestAIPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testAIGeneration = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('Starting AI test...')
      
      const response = await fetch('/api/ai/generate-section-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionTitle: 'テストセクション',
          sectionDescription: 'これはテストです',
          theme: 'AIテスト',
          targetAudience: 'beginner',
          heading: 'テスト記事'
        }),
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('Response data:', data)
      
      setResult({
        success: true,
        content: data.content,
        contentLength: data.content?.length || 0
      })
    } catch (err) {
      console.error('Test error:', err)
      setError(err instanceof Error ? err.message : '不明なエラー')
      setResult({
        success: false,
        error: err instanceof Error ? err.message : '不明なエラー'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkEnvironment = () => {
    const hasGeminiKey = typeof window !== 'undefined' && 
      process.env.NEXT_PUBLIC_GEMINI_API_KEY && 
      process.env.NEXT_PUBLIC_GEMINI_API_KEY !== 'your_gemini_api_key_here'
    
    const hasSupabaseUrl = typeof window !== 'undefined' && 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'
    
    return {
      geminiKey: hasGeminiKey ? '設定済み' : '未設定',
      supabaseUrl: hasSupabaseUrl ? '設定済み' : '未設定',
    }
  }

  const env = checkEnvironment()

  return (
    <div className="min-h-screen bg-background">
      <SimpleSupabaseHeader />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">AI生成機能テスト</h1>
          <p className="text-muted-foreground">
            Gemini APIの動作確認とデバッグ用のページです
          </p>
        </div>

        {/* 環境変数チェック */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>環境設定状態</CardTitle>
            <CardDescription>現在の環境変数の設定状態を確認</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              {env.geminiKey === '設定済み' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">Gemini APIキー:</span>
              <span className={env.geminiKey === '設定済み' ? 'text-green-600' : 'text-red-600'}>
                {env.geminiKey}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {env.supabaseUrl === '設定済み' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">Supabase URL:</span>
              <span className={env.supabaseUrl === '設定済み' ? 'text-green-600' : 'text-red-600'}>
                {env.supabaseUrl}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 警告メッセージ */}
        {env.geminiKey === '未設定' && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Gemini APIキーが設定されていません。<br />
              `.env.local`ファイルに`NEXT_PUBLIC_GEMINI_API_KEY`を設定してください。<br />
              詳細は`Docs/09_Gemini_API設定手順書.md`を参照してください。
            </AlertDescription>
          </Alert>
        )}

        {/* テストボタン */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>AI生成テスト</CardTitle>
            <CardDescription>
              簡単なセクションを生成してAPIの動作を確認
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testAIGeneration} 
              disabled={isLoading}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  テスト実行中...
                </>
              ) : (
                'AI生成をテスト'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* テスト結果 */}
        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <CardTitle>
                  {result.success ? 'テスト成功！' : 'テスト失敗'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 font-medium">生成されたコンテンツ:</p>
                    <div className="rounded-md bg-muted p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap">
                        {result.content}
                      </pre>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    コンテンツ長: {result.contentLength} 文字
                  </p>
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      AI生成機能は正常に動作しています！
                      実際の記事作成でも使用できます。
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold mb-2">エラー: {result.error}</p>
                      <p className="text-sm">考えられる原因:</p>
                      <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                        <li>Gemini APIキーが未設定または無効</li>
                        <li>APIの使用制限に達している</li>
                        <li>ネットワーク接続の問題</li>
                        <li>サーバー側のエラー</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                  <div className="text-sm">
                    <p className="font-medium mb-2">解決方法:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>ブラウザのコンソールでエラーの詳細を確認</li>
                      <li>`.env.local`ファイルのAPIキーを確認</li>
                      <li>開発サーバーを再起動（Ctrl+C → npm run dev）</li>
                      <li>`Docs/09_Gemini_API設定手順書.md`を参照</li>
                    </ol>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* デバッグ情報 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>デバッグ情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <p>ブラウザのコンソールを開いて詳細なログを確認してください。</p>
              <p className="text-muted-foreground">
                Windows: F12キーまたはCtrl+Shift+I
              </p>
              <p className="text-muted-foreground">
                Mac: Cmd+Option+I
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

