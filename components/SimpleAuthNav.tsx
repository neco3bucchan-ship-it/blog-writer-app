'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LogOut, User, Settings, PenLine } from 'lucide-react'
import { useSimpleAuth } from '@/contexts/SimpleAuthContext'

export function SimpleAuthNav() {
  const { user, signOut, loading } = useSimpleAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    signOut()
    setIsSigningOut(false)
  }

  // ローディング中
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  // 未ログイン状態
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/simple-auth/login">
          <Button variant="ghost" size="sm">
            ログイン
          </Button>
        </Link>
        <Link href="/simple-auth/signup">
          <Button size="sm">
            新規登録
          </Button>
        </Link>
      </div>
    )
  }

  // ログイン状態
  return (
    <div className="flex items-center gap-4">
      {/* 新規記事作成ボタン */}
      <Link href="/theme-input">
        <Button size="sm" className="gap-2">
          <PenLine className="h-4 w-4" />
          新規記事
        </Button>
      </Link>

      {/* ユーザーメニュー */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={user.displayName} />
              <AvatarFallback>
                {user.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">{user.displayName}</p>
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/articles" className="flex items-center">
              <PenLine className="mr-2 h-4 w-4" />
              記事一覧
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              プロファイル
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              設定
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isSigningOut ? 'ログアウト中...' : 'ログアウト'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
