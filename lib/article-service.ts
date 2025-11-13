import { supabase } from './supabase'

export interface Article {
  id: string
  title: string
  theme: string
  targetAudience: 'beginner' | 'intermediate' | 'advanced'
  heading: string
  status: 'draft' | 'writing' | 'completed'
  progress: number
  createdAt: string
  updatedAt: string
}

export interface ArticleDetail extends Article {
  outline: ArticleSection[]
}

export interface ArticleSection {
  id: string
  section: number
  title: string
  description: string
  content: string
  wordCount: number
  isCompleted: boolean
}

export interface CreateArticleData {
  title: string
  theme: string
  targetAudience: 'beginner' | 'intermediate' | 'advanced'
  heading: string
  outline?: ArticleSection[]
}

export interface UpdateArticleData {
  title?: string
  theme?: string
  targetAudience?: 'beginner' | 'intermediate' | 'advanced'
  heading?: string
  status?: 'draft' | 'writing' | 'completed'
  outline?: ArticleSection[]
}

export interface UpdateSectionData {
  content?: string
  isCompleted?: boolean
}

type ApiSuccess<T> = { success: true } & T
type ApiFailure = { success: false; error: string }
type ApiResponse<T> = ApiSuccess<T> | ApiFailure

function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    return ''
  }

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL
  if (envUrl) {
    const normalized = envUrl.startsWith('http') ? envUrl : `https://${envUrl}`
    return normalized.replace(/\/$/, '')
  }

  return 'http://localhost:3000'
}

const API_BASE_URL = getApiBaseUrl()

async function callApi<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { success: false, error: '認証が必要です' }
  }

  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  headers.set('Authorization', `Bearer ${session.access_token}`)

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      cache: 'no-store'
    })

    const json = await response.json().catch(() => ({}))

    if (!response.ok) {
      const errorMessage = (json as { error?: string })?.error || 'リクエストに失敗しました'
      return { success: false, error: errorMessage }
    }

    return json as ApiResponse<T>
  } catch (error) {
    console.error('API request error:', error)
    return { success: false, error: 'ネットワークエラーが発生しました' }
  }
}

/**
 * 記事一覧を取得
 */
export async function getArticles(): Promise<{ success: boolean; articles?: Article[]; error?: string }> {
  const response = await callApi<{ articles: Article[] }>('/api/articles')

  if (!response.success) {
    return { success: false, error: response.error }
  }

  return {
    success: true,
    articles: response.articles ?? []
  }
}

/**
 * 記事詳細を取得
 */
export async function getArticle(id: string): Promise<{ success: boolean; article?: ArticleDetail; error?: string }> {
  const response = await callApi<{ article: ArticleDetail }>(`/api/articles/${id}`)

  if (!response.success) {
    return { success: false, error: response.error }
  }

  return {
    success: true,
    article: response.article
  }
}

/**
 * 記事を作成
 */
export async function createArticle(data: CreateArticleData): Promise<{ success: boolean; article?: ArticleDetail; error?: string }> {
  const payload = {
    title: data.title,
    theme: data.theme,
    targetAudience: data.targetAudience,
    heading: data.heading,
    outline: data.outline?.map(section => ({
      title: section.title,
      description: section.description,
      content: section.content,
      isCompleted: section.isCompleted ?? false,
      wordCount: section.wordCount ?? 0
    }))
  }

  const response = await callApi<{ article: ArticleDetail }>('/api/articles', {
    method: 'POST',
    body: JSON.stringify(payload)
  })

  if (!response.success) {
    return { success: false, error: response.error }
  }

  return {
    success: true,
    article: response.article
  }
}

/**
 * 記事を更新
 */
export async function updateArticle(id: string, data: UpdateArticleData): Promise<{ success: boolean; article?: Article; error?: string }> {
  const payload: Record<string, unknown> = {
    title: data.title,
    theme: data.theme,
    targetAudience: data.targetAudience,
    heading: data.heading,
    status: data.status
  }

  if (data.outline) {
    payload.outline = data.outline.map(section => ({
      title: section.title,
      description: section.description,
      content: section.content,
      wordCount: section.wordCount ?? 0,
      isCompleted: section.isCompleted ?? false
    }))
  }

  const response = await callApi<{ article: Article }>(`/api/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })

  if (!response.success) {
    return { success: false, error: response.error }
  }

  return {
    success: true,
    article: response.article
  }
}

/**
 * 記事を削除
 */
export async function deleteArticle(id: string): Promise<{ success: boolean; error?: string }> {
  const response = await callApi<{ message: string }>(`/api/articles/${id}`, {
    method: 'DELETE'
  })

  if (!response.success) {
    return { success: false, error: response.error }
  }

  return { success: true }
}

/**
 * 記事セクションを更新
 */
export async function updateArticleSection(
  articleId: string,
  sectionId: string,
  data: UpdateSectionData
): Promise<{ success: boolean; section?: ArticleSection; error?: string }> {
  const payload: Record<string, unknown> = {}
  if (data.content !== undefined) {
    payload.content = data.content
  }
  if (data.isCompleted !== undefined) {
    payload.isCompleted = data.isCompleted
  }

  const response = await callApi<{
    section: {
      id: string
      sectionNumber: number
      title: string
      description: string
      content: string
      wordCount: number
      isCompleted: boolean
    }
  }>(`/api/articles/${articleId}/sections/${sectionId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })

  if (!response.success) {
    return { success: false, error: response.error }
  }

  const section = response.section

  return {
    success: true,
    section: {
      id: section.id,
      section: section.sectionNumber,
      title: section.title,
      description: section.description,
      content: section.content,
      wordCount: section.wordCount,
      isCompleted: section.isCompleted
    }
  }
}
