import Link from 'next/link'
import { PenLine, Github, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* ブランド */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <PenLine className="h-6 w-6" />
              <span className="font-bold">Blog Writer</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AIを活用した効率的なブログ執筆ツール
            </p>
          </div>

          {/* 機能 */}
          <div className="space-y-4">
            <h3 className="font-semibold">機能</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/theme-input" className="text-muted-foreground hover:text-foreground">
                  AI支援執筆
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-muted-foreground hover:text-foreground">
                  記事管理
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground">自動保存</span>
              </li>
              <li>
                <span className="text-muted-foreground">進捗管理</span>
              </li>
            </ul>
          </div>

          {/* サポート */}
          <div className="space-y-4">
            <h3 className="font-semibold">サポート</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-muted-foreground">ヘルプセンター</span>
              </li>
              <li>
                <span className="text-muted-foreground">利用ガイド</span>
              </li>
              <li>
                <span className="text-muted-foreground">よくある質問</span>
              </li>
              <li>
                <span className="text-muted-foreground">お問い合わせ</span>
              </li>
            </ul>
          </div>

          {/* リンク */}
          <div className="space-y-4">
            <h3 className="font-semibold">リンク</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:support@blogwriter.com"
                className="text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Blog Writer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
