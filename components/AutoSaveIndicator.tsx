"use client"

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, Clock, AlertCircle, Save, WifiOff, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AutoSaveStatus } from '@/hooks/useAutoSave'

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus
  lastSaved: Date | null
  hasUnsavedChanges: boolean
  error: string | null
  retryCount: number
  maxRetries: number
  nextRetryAt: Date | null
  isOffline: boolean
  onRetry?: () => void
  className?: string
}

export function AutoSaveIndicator({
  status,
  lastSaved,
  hasUnsavedChanges,
  error,
  retryCount,
  maxRetries,
  nextRetryAt,
  isOffline,
  onRetry,
  className
}: AutoSaveIndicatorProps) {
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null)

  useEffect(() => {
    if (!nextRetryAt) {
      setRetryCountdown(null)
      return
    }

    const updateCountdown = () => {
      const diff = Math.ceil((nextRetryAt.getTime() - Date.now()) / 1000)
      setRetryCountdown(diff > 0 ? diff : 0)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [nextRetryAt])

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 60) {
      return 'たった今'
    } else if (minutes < 60) {
      return `${minutes}分前`
    } else if (hours < 24) {
      return `${hours}時間前`
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const statusInfo = useMemo(() => {
    switch (status) {
      case 'saving':
        return {
          icon: <Clock className="h-4 w-4 text-blue-500 animate-spin" />,
          text: '保存中…',
          color: 'text-blue-500'
        }
      case 'retrying':
        return {
          icon: <RotateCcw className="h-4 w-4 text-orange-500 animate-spin" />,
          text: retryCountdown !== null
            ? `保存に失敗しました。${retryCount}/${maxRetries}回目の再試行中（${retryCountdown}秒後）`
            : `保存に失敗しました。${retryCount}/${maxRetries}回目の再試行を準備中`,
          color: 'text-orange-500'
        }
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          text: '保存に失敗しました。再試行してください。',
          color: 'text-red-500'
        }
      case 'offline':
        return {
          icon: <WifiOff className="h-4 w-4 text-yellow-500" />,
          text: 'オフラインです。接続後に自動保存します。',
          color: 'text-yellow-500'
        }
      case 'saved':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: lastSaved ? `保存済み ${formatRelativeTime(lastSaved)}` : '保存済み',
          color: 'text-green-500'
        }
      case 'idle':
      default:
        if (hasUnsavedChanges) {
          return {
            icon: <Save className="h-4 w-4 text-orange-500" />,
            text: '未保存の変更があります',
            color: 'text-orange-500'
          }
        }
        return {
          icon: <Save className="h-4 w-4 text-gray-400" />,
          text: '保存待機中',
          color: 'text-gray-500'
        }
    }
  }, [hasUnsavedChanges, lastSaved, maxRetries, retryCount, retryCountdown, status])

  const showRetryButton =
    (status === 'error' || (status === 'retrying' && retryCount >= maxRetries)) &&
    typeof onRetry === 'function'

  return (
    <div className={cn('flex flex-col gap-1 text-sm', className)}>
      <div className="flex items-center gap-2">
        {statusInfo.icon}
        <span className={cn('font-medium', statusInfo.color)}>
          {statusInfo.text}
        </span>
      </div>
      {(error || isOffline) && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-red-500">
          {error && <span>{error}</span>}
          {isOffline && !error && <span>接続が復帰すると自動で保存します。</span>}
          {showRetryButton && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded border border-red-400 px-2 py-0.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              再試行する
            </button>
          )}
        </div>
      )}
      {status === 'retrying' && retryCountdown !== null && retryCount < maxRetries && (
        <span className="text-xs text-orange-500">
          自動的に再試行されます…
        </span>
      )}
    </div>
  )
}
