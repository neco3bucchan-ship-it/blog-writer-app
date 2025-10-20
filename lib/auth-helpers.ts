import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

// サーバーサイド用のSupabaseクライアント
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
)

/**
 * リクエストから認証されたユーザーを取得
 */
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return { user: null, error: '認証が必要です' }
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabaseServer.auth.getUser(token)
    
    if (error || !user) {
      return { user: null, error: '認証に失敗しました' }
    }

    return { user, error: null }
  } catch (error) {
    console.error('Auth error:', error)
    return { user: null, error: '認証エラーが発生しました' }
  }
}

/**
 * 記事の所有権を確認
 */
export async function verifyArticleOwnership(articleId: string, userId: string) {
  try {
    const { data: article, error } = await supabaseServer
      .from('articles')
      .select('id')
      .eq('id', articleId)
      .eq('user_id', userId)
      .single()

    if (error || !article) {
      return { isOwner: false, error: '記事が見つかりません' }
    }

    return { isOwner: true, error: null }
  } catch (error) {
    console.error('Ownership verification error:', error)
    return { isOwner: false, error: '所有権確認エラーが発生しました' }
  }
}

/**
 * 認証エラーレスポンスを生成
 */
export function createAuthErrorResponse(message: string, status: number = 401) {
  return {
    success: false,
    error: message,
    status
  }
}

/**
 * サーバーエラーレスポンスを生成
 */
export function createServerErrorResponse(message: string = 'サーバーエラーが発生しました', status: number = 500) {
  return {
    success: false,
    error: message,
    status
  }
}
