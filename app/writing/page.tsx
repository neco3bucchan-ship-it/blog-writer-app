"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ChevronLeft, ChevronRight, Save, Sparkles } from "lucide-react"
import Link from "next/link"

// Dummy outline data
const outline = [
  {
    id: "1",
    section: 1,
    title: "React.jsとは何か？",
    description: "基本的な概念と特徴を解説",
    content: "",
  },
  {
    id: "2",
    section: 2,
    title: "環境構築の手順",
    description: "開発環境の準備から始めよう",
    content: "",
  },
  {
    id: "3",
    section: 3,
    title: "初めてのコンポーネント",
    description: "実際にコードを書いてみよう",
    content: "",
  },
  {
    id: "4",
    section: 4,
    title: "Hooksの基礎",
    description: "useStateとuseEffectを使った状態管理",
    content: "",
  },
  {
    id: "5",
    section: 5,
    title: "実践的なアプリケーション",
    description: "実際のプロジェクトで学ぶ",
    content: "",
  },
]

const dummyGeneratedContent: Record<string, string> = {
  "1": `React.jsは、Facebookが開発したJavaScriptライブラリで、ユーザーインターフェースを構築するために使用されます。コンポーネントベースのアーキテクチャを採用しており、再利用可能なUIパーツを作成できることが大きな特徴です。

仮想DOM（Virtual DOM）という技術を使用することで、効率的な画面更新を実現しています。実際のDOMを直接操作するのではなく、メモリ上に仮想的なDOMツリーを保持し、変更があった部分だけを効率的に更新します。

また、宣言的なプログラミングスタイルを採用しているため、UIの状態管理が直感的で分かりやすくなっています。これにより、複雑なアプリケーションでも保守性の高いコードを書くことができます。`,

  "2": `React.jsの開発環境を構築するには、まずNode.jsとnpmをインストールする必要があります。Node.jsの公式サイトから最新のLTS版をダウンロードし、インストールしましょう。

次に、Create React Appというツールを使用して、新しいReactプロジェクトを作成します。ターミナルで「npx create-react-app my-app」というコマンドを実行すると、必要なファイルやディレクトリが自動的に生成されます。

プロジェクトが作成されたら、「cd my-app」でディレクトリに移動し、「npm start」コマンドで開発サーバーを起動します。ブラウザで「http://localhost:3000」にアクセスすると、Reactアプリケーションが表示されます。`,

  "3": `Reactのコンポーネントは、関数コンポーネントとクラスコンポーネントの2種類がありますが、現在は関数コンポーネントが主流です。最初のコンポーネントとして、シンプルな挨拶メッセージを表示するコンポーネントを作成してみましょう。

「src」フォルダ内に「Greeting.jsx」というファイルを作成し、関数コンポーネントを定義します。JSXという構文を使用して、HTMLのような記述でUIを表現できます。

作成したコンポーネントは、App.jsでインポートして使用します。コンポーネントの再利用性を活かして、同じコンポーネントを複数回使用したり、propsを使って異なるデータを渡したりすることができます。`,

  "4": `Hooksは、React 16.8で導入された機能で、関数コンポーネントで状態管理や副作用を扱えるようにします。最も基本的なHookであるuseStateを使用すると、コンポーネント内で状態を保持できます。

useStateは、現在の状態値と、その状態を更新する関数のペアを返します。例えば、カウンターアプリを作る場合、「const [count, setCount] = useState(0)」のように記述します。

useEffectは、コンポーネントのレンダリング後に実行される副作用を定義するためのHookです。データの取得、購読の設定、DOMの手動変更など、様々な用途に使用できます。依存配列を適切に設定することで、効率的な処理を実現できます。`,

  "5": `実践的なアプリケーションとして、ToDoリストアプリを作成してみましょう。このアプリでは、これまで学んだコンポーネント、useState、useEffectなどの知識を総合的に活用します。

まず、タスクの追加、削除、完了状態の切り替えといった基本機能を実装します。状態管理にはuseStateを使用し、タスクのリストを配列として保持します。

さらに、localStorageを使用してタスクを永続化したり、フィルタリング機能を追加したりすることで、より実用的なアプリケーションに仕上げることができます。このような実践を通じて、Reactの理解を深めていきましょう。`,
}

export default function WritingPage() {
  const [currentSection, setCurrentSection] = useState(0)
  const [content, setContent] = useState("")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      setContent("")
    }
  }

  const handleNext = () => {
    if (currentSection < outline.length - 1) {
      setCurrentSection(currentSection + 1)
      setContent("")
    }
  }

  const handleSave = () => {
    setLastSaved(new Date())
  }

  const handleGenerateContent = async () => {
    setIsGenerating(true)
    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const generatedContent = dummyGeneratedContent[currentItem.id] || "生成されたコンテンツがここに表示されます。"
    setContent(generatedContent)
    setIsGenerating(false)
    setLastSaved(new Date())
  }

  const currentItem = outline[currentSection]
  const progress = ((currentSection + 1) / outline.length) * 100

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Outline */}
      <aside className="hidden w-64 border-r border-border bg-muted/30 lg:block">
        <div className="sticky top-0 p-6">
          <div className="mb-6">
            <Link href="/outline-editing">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                戻る
              </Button>
            </Link>
            <h2 className="text-lg font-semibold">目次</h2>
            <div className="mt-2 text-sm text-muted-foreground">進捗: {Math.round(progress)}%</div>
          </div>
          <nav className="space-y-2">
            {outline.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentSection(index)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  currentSection === index ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                <div className="font-medium">
                  {item.section}. {item.title}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content - Writing Area */}
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Mobile Header */}
          <div className="mb-6 lg:hidden">
            <Link href="/outline-editing">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                戻る
              </Button>
            </Link>
          </div>

          {/* Section Info */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                4/5 記事執筆 • セクション {currentSection + 1}/{outline.length}
              </span>
              {lastSaved && (
                <span className="text-sm text-muted-foreground">保存済み: {lastSaved.toLocaleTimeString("ja-JP")}</span>
              )}
            </div>
            <h1 className="mb-2 text-balance text-3xl font-bold">{currentItem.title}</h1>
            <p className="text-muted-foreground">{currentItem.description}</p>
          </div>

          <div className="mb-4">
            <Button
              onClick={handleGenerateContent}
              disabled={isGenerating}
              className="w-full sm:w-auto"
              variant="default"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? "生成中..." : "AIで本文を自動生成"}
            </Button>
          </div>

          {/* Writing Area */}
          <div className="mb-6 space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="「AIで本文を自動生成」ボタンをクリックするか、ここに直接記事を書いてください..."
              className="min-h-[400px] resize-none text-base leading-relaxed"
              disabled={isGenerating}
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{content.length}文字</span>
              <Button variant="outline" size="sm" onClick={handleSave} disabled={isGenerating}>
                <Save className="mr-2 h-4 w-4" />
                保存
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between border-t border-border pt-6">
            <Button variant="outline" onClick={handlePrevious} disabled={currentSection === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              前のセクション
            </Button>
            {currentSection === outline.length - 1 ? (
              <Link href="/articles">
                <Button>完了</Button>
              </Link>
            ) : (
              <Button onClick={handleNext}>
                次のセクション
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
