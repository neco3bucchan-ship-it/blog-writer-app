"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/AuthGuard"
import { Header } from "@/components/Header"

export default function ThemeInputPage() {
  const router = useRouter()
  const [theme, setTheme] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [errors, setErrors] = useState<{ theme?: string; audience?: string }>({})

  const handleGenerate = () => {
    console.log('handleGenerate called with:', { theme, targetAudience })
    
    const newErrors: { theme?: string; audience?: string } = {}

    if (!theme) {
      newErrors.theme = "テーマを入力してください"
    } else if (theme.length < 5) {
      newErrors.theme = "5文字以上入力してください"
    } else if (theme.length > 500) {
      newErrors.theme = "500文字以内で入力してください"
    }

    if (!targetAudience) {
      newErrors.audience = "ターゲット読者を選択してください"
    }

    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors)
      setErrors(newErrors)
      return
    }

    console.log('Validation passed, navigating to heading-selection')
    setIsGenerating(true)
    // テーマとターゲット読者をURLパラメータとして渡す
    setTimeout(() => {
      const url = `/heading-selection?theme=${encodeURIComponent(theme)}&targetAudience=${encodeURIComponent(targetAudience)}`
      console.log('Navigating to:', url)
      router.push(url)
    }, 1500)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
          </Link>
          <span className="text-sm text-muted-foreground">1/5 テーマ入力</span>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <div>
            <h1 className="mb-2 text-balance text-3xl font-bold">あなたの記事のテーマを教えてください</h1>
            <p className="text-muted-foreground">
              記事の内容やターゲット読者を明確にすることで、より良い見出しを生成できます
            </p>
          </div>

          {/* Theme Input */}
          <div className="space-y-2">
            <Label htmlFor="theme">テーマ</Label>
            <Textarea
              id="theme"
              placeholder="例：React.jsの基礎を学ぶ方法について、初心者向けに環境構築から実際のコンポーネント作成まで、段階的に解説する記事を書きたい"
              value={theme}
              onChange={(e) => {
                setTheme(e.target.value)
                setErrors((prev) => ({ ...prev, theme: undefined }))
              }}
              className="min-h-[150px] resize-none"
            />
            <div className="flex items-center justify-between text-sm">
              <span className={errors.theme ? "text-destructive" : "text-muted-foreground"}>
                {errors.theme || `${theme.length}/500文字`}
              </span>
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-3">
            <Label htmlFor="target-audience">ターゲット読者</Label>
            <RadioGroup
              value={targetAudience}
              onValueChange={(value) => {
                setTargetAudience(value)
                setErrors((prev) => ({ ...prev, audience: undefined }))
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id="beginner" />
                <Label htmlFor="beginner" className="cursor-pointer font-normal">
                  初心者
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="intermediate" />
                <Label htmlFor="intermediate" className="cursor-pointer font-normal">
                  中級者
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id="advanced" />
                <Label htmlFor="advanced" className="cursor-pointer font-normal">
                  上級者
                </Label>
              </div>
            </RadioGroup>
            {errors.audience && <p className="text-sm text-destructive">{errors.audience}</p>}
          </div>

          {/* Generate Button */}
          <div className="pt-4">
            <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="w-full sm:w-auto">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                "見出しを生成"
              )}
            </Button>
          </div>
        </div>
        </div>
      </div>
    </AuthGuard>
  )
}
