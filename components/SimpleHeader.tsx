'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PenLine, FileText, Home } from 'lucide-react'
import { SimpleAuthNav } from '@/components/SimpleAuthNav'
import { useSimpleAuth } from '@/contexts/SimpleAuthContext'

export function SimpleHeader() {
  const { user } = useSimpleAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* ロゴ */}
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <PenLine className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Blog Writer
            </span>
          </Link>
        </div>

        {/* ナビゲーション */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* 認証済みユーザー向けナビゲーション */}
          {user && (
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  ホーム
                </Button>
              </Link>
              <Link href="/articles">
                <Button variant="ghost" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  記事一覧
                </Button>
              </Link>
              <Link href="/theme-input">
                <Button size="sm">
                  <PenLine className="mr-2 h-4 w-4" />
                  新規作成
                </Button>
              </Link>
            </nav>
          )}

          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* 認証ナビゲーション */}
            <SimpleAuthNav />
          </div>
        </div>
      </div>
    </header>
  )
}
