import { useState, useEffect, useCallback, useRef } from 'react'
import { updateArticleSection } from '@/lib/article-service'

interface UseAutoSaveOptions {
  articleId: string
  sectionId: string
  delay?: number // 保存までの遅延時間（ミリ秒）
  enabled?: boolean // 自動保存の有効/無効
}

interface AutoSaveState {
  isSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean
  error: string | null
}

export function useAutoSave(
  content: string,
  isCompleted: boolean,
  options: UseAutoSaveOptions
) {
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastContentRef = useRef<string>(content)
  const lastCompletedRef = useRef<boolean>(isCompleted)

  // 自動保存の実行
  const performSave = useCallback(async () => {
    if (!options.enabled || !options.articleId || !options.sectionId) {
      return
    }

    setState(prev => ({ ...prev, isSaving: true, error: null }))

    try {
      const result = await updateArticleSection(options.articleId, options.sectionId, {
        content,
        isCompleted
      })

      if (result.success) {
        setState(prev => ({
          ...prev,
          isSaving: false,
          lastSaved: new Date(),
          hasUnsavedChanges: false,
          error: null
        }))
        lastContentRef.current = content
        lastCompletedRef.current = isCompleted
      } else {
        setState(prev => ({
          ...prev,
          isSaving: false,
          error: result.error || '保存に失敗しました'
        }))
      }
    } catch (error) {
      console.error('Auto save error:', error)
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: '保存中にエラーが発生しました'
      }))
    }
  }, [content, isCompleted, options.articleId, options.sectionId, options.enabled])

  // 変更の検出と自動保存のスケジューリング
  useEffect(() => {
    const hasContentChanged = content !== lastContentRef.current
    const hasCompletedChanged = isCompleted !== lastCompletedRef.current
    const hasChanges = hasContentChanged || hasCompletedChanged

    if (hasChanges) {
      setState(prev => ({ ...prev, hasUnsavedChanges: true }))

      // 既存のタイムアウトをクリア
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // 新しいタイムアウトを設定
      timeoutRef.current = setTimeout(() => {
        performSave()
      }, options.delay || 2000) // デフォルト2秒
    }

    // クリーンアップ
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [content, isCompleted, performSave, options.delay])

  // 手動保存
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    await performSave()
  }, [performSave])

  // コンポーネントのアンマウント時に保存
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      // 未保存の変更がある場合は保存
      if (state.hasUnsavedChanges && options.enabled) {
        performSave()
      }
    }
  }, [state.hasUnsavedChanges, performSave, options.enabled])

  return {
    ...state,
    saveNow
  }
}
