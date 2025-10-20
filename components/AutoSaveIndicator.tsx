"use client"

import { CheckCircle, Clock, AlertCircle, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AutoSaveIndicatorProps {
  isSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean
  error: string | null
  className?: string
}

export function AutoSaveIndicator({
  isSaving,
  lastSaved,
  hasUnsavedChanges,
  error,
  className
}: AutoSaveIndicatorProps) {
  const formatLastSaved = (date: Date) => {
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

  const getStatusIcon = () => {
    if (error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    if (isSaving) {
      return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
    }
    if (lastSaved && !hasUnsavedChanges) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    if (hasUnsavedChanges) {
      return <Save className="h-4 w-4 text-orange-500" />
    }
    return null
  }

  const getStatusText = () => {
    if (error) {
      return '保存エラー'
    }
    if (isSaving) {
      return '保存中...'
    }
    if (lastSaved && !hasUnsavedChanges) {
      return `保存済み ${formatLastSaved(lastSaved)}`
    }
    if (hasUnsavedChanges) {
      return '未保存の変更'
    }
    return '保存待機中'
  }

  const getStatusColor = () => {
    if (error) return 'text-red-500'
    if (isSaving) return 'text-blue-500'
    if (lastSaved && !hasUnsavedChanges) return 'text-green-500'
    if (hasUnsavedChanges) return 'text-orange-500'
    return 'text-gray-500'
  }

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {getStatusIcon()}
      <span className={cn("font-medium", getStatusColor())}>
        {getStatusText()}
      </span>
      {error && (
        <span className="text-red-500 text-xs">
          ({error})
        </span>
      )}
    </div>
  )
}
