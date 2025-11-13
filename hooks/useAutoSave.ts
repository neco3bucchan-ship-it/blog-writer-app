import { useState, useEffect, useCallback, useRef } from 'react'
import { updateArticleSection } from '@/lib/article-service'

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'retrying' | 'error' | 'offline'

interface UseAutoSaveOptions {
  articleId: string
  sectionId: string
  delay?: number // 保存までの遅延時間（ミリ秒）
  enabled?: boolean // 自動保存の有効/無効
  maxRetries?: number // 最大リトライ回数
  retryDelay?: number // リトライ間隔（ミリ秒）
}

interface AutoSaveState {
  status: AutoSaveStatus
  isSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean
  error: string | null
  retryCount: number
  nextRetryAt: Date | null
  isOffline: boolean
}

export function useAutoSave(
  content: string,
  isCompleted: boolean,
  options: UseAutoSaveOptions
) {
  const initialOffline =
    typeof navigator !== 'undefined' ? navigator.onLine === false : false

  const [state, setState] = useState<AutoSaveState>({
    status: initialOffline ? 'offline' : 'idle',
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    error: initialOffline ? 'オフラインのため保存できません' : null,
    retryCount: 0,
    nextRetryAt: null,
    isOffline: initialOffline
  })

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastContentRef = useRef<string>(content)
  const lastCompletedRef = useRef<boolean>(isCompleted)
  const hasUnsavedChangesRef = useRef<boolean>(false)
  const maxRetriesRef = useRef<number>(options.maxRetries ?? 3)
  const retryDelayRef = useRef<number>(options.retryDelay ?? 3000)

  useEffect(() => {
    maxRetriesRef.current = options.maxRetries ?? 3
  }, [options.maxRetries])

  useEffect(() => {
    retryDelayRef.current = options.retryDelay ?? 3000
  }, [options.retryDelay])

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [])

  const updateStatus = useCallback((updater: (prev: AutoSaveState) => AutoSaveState) => {
    setState(prev => {
      const nextState = updater(prev)
      hasUnsavedChangesRef.current = nextState.hasUnsavedChanges
      return nextState
    })
  }, [])

  const performSave = useCallback(
    async (trigger: 'auto' | 'manual' | 'retry' = 'auto') => {
      if (!options.enabled || !options.articleId || !options.sectionId) {
        return
      }

      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        updateStatus(prev => ({
          ...prev,
          status: 'offline',
          isSaving: false,
          error: 'オフラインのため保存できません',
          isOffline: true
        }))
        return
      }

      clearRetryTimeout()

      updateStatus(prev => ({
        ...prev,
        status: trigger === 'retry' ? 'retrying' : 'saving',
        isSaving: true,
        error: null,
        isOffline: false,
        nextRetryAt: null
      }))

      try {
        const result = await updateArticleSection(options.articleId, options.sectionId, {
          content,
          isCompleted
        })

        if (result.success) {
          updateStatus(prev => ({
            ...prev,
            status: 'saved',
            isSaving: false,
            lastSaved: new Date(),
            hasUnsavedChanges: false,
            error: null,
            retryCount: 0,
            nextRetryAt: null
          }))
          lastContentRef.current = content
          lastCompletedRef.current = isCompleted
        } else {
          const errorMessage = result.error || '保存に失敗しました'
          console.warn('Auto save failed:', errorMessage)
          updateStatus(prev => {
            const nextRetryCount = prev.retryCount + 1
            const maxRetries = maxRetriesRef.current
            const shouldRetry = nextRetryCount <= maxRetries
            let nextRetryAt: Date | null = null

            if (shouldRetry) {
              const delay = retryDelayRef.current * nextRetryCount
              nextRetryAt = new Date(Date.now() + delay)
              retryTimeoutRef.current = setTimeout(() => {
                performSave('retry')
              }, delay)
            }

            return {
              ...prev,
              status: shouldRetry ? 'retrying' : 'error',
              isSaving: false,
              error: errorMessage,
              retryCount: Math.min(nextRetryCount, maxRetries),
              nextRetryAt
            }
          })
        }
      } catch (error) {
        console.error('Auto save error:', error)
        updateStatus(prev => {
          const nextRetryCount = prev.retryCount + 1
          const maxRetries = maxRetriesRef.current
          const shouldRetry = nextRetryCount <= maxRetries
          let nextRetryAt: Date | null = null

          if (shouldRetry) {
            const delay = retryDelayRef.current * nextRetryCount
            nextRetryAt = new Date(Date.now() + delay)
            retryTimeoutRef.current = setTimeout(() => {
              performSave('retry')
            }, delay)
          }

          return {
            ...prev,
            status: shouldRetry ? 'retrying' : 'error',
            isSaving: false,
            error: '保存中にエラーが発生しました',
            retryCount: Math.min(nextRetryCount, maxRetries),
            nextRetryAt
          }
        })
      }
    },
    [clearRetryTimeout, content, isCompleted, options.articleId, options.enabled, options.sectionId, updateStatus]
  )

  // 変更の検出と自動保存のスケジューリング
  useEffect(() => {
    const hasContentChanged = content !== lastContentRef.current
    const hasCompletedChanged = isCompleted !== lastCompletedRef.current
    const hasChanges = hasContentChanged || hasCompletedChanged

    if (hasChanges) {
      updateStatus(prev => ({
        ...prev,
        status: prev.isOffline ? 'offline' : 'idle',
        hasUnsavedChanges: true,
        retryCount: 0,
        error: prev.isOffline ? 'オフラインのため保存できません' : null,
        nextRetryAt: null
      }))

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      clearRetryTimeout()

      saveTimeoutRef.current = setTimeout(() => {
        performSave('auto')
      }, options.delay ?? 2000)
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [clearRetryTimeout, content, isCompleted, options.delay, performSave, updateStatus])

  // オンライン/オフライン検知
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      updateStatus(prev => ({
        ...prev,
        isOffline: false,
        status: prev.hasUnsavedChanges ? 'idle' : 'saved',
        error: prev.hasUnsavedChanges ? null : prev.error
      }))

      if (hasUnsavedChangesRef.current) {
        performSave('retry')
      }
    }

    const handleOffline = () => {
      updateStatus(prev => ({
        ...prev,
        isOffline: true,
        status: 'offline',
        error: 'オフラインのため保存できません'
      }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [performSave, updateStatus])

  // コンポーネントのアンマウント時に保存
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      clearRetryTimeout()
      if (hasUnsavedChangesRef.current && options.enabled) {
        performSave('retry')
      }
    }
  }, [clearRetryTimeout, options.enabled, performSave])

  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    await performSave('manual')
  }, [performSave])

  const retry = useCallback(async () => {
    await performSave('retry')
  }, [performSave])

  return {
    ...state,
    isSaving: state.isSaving,
    status: state.status,
    lastSaved: state.lastSaved,
    hasUnsavedChanges: state.hasUnsavedChanges,
    error: state.error,
    retryCount: state.retryCount,
    maxRetries: maxRetriesRef.current,
    nextRetryAt: state.nextRetryAt,
    isOffline: state.isOffline,
    saveNow,
    retry
  }
}

