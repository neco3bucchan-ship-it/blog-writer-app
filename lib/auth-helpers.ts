import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import type { Database } from './supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export function createSupabaseRouteClient(request: NextRequest) {
  const authHeader = request.headers.get('authorization') ?? ''

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        Authorization: authHeader
      }
    }
  })
}

/**
 * リクエストから認証されたユーザーとSupabaseクライアントを取得
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const supabase = createSupabaseRouteClient(request)

  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return { supabase, user: null, error: '認証が必要です' }
    }

    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { supabase, user: null, error: '認証に失敗しました' }
    }

    return { supabase, user, error: null }
  } catch (error) {
    console.error('Auth error:', error)
    return { supabase, user: null, error: '認証エラーが発生しました' }
  }
}

/**
 * ユーザープロファイルが存在しない場合は作成
 */
export async function ensureProfileExists(
  supabase: SupabaseClient<Database>,
  user: User
) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      console.warn('Profile check error:', error)
    }

    if (!data) {
      const displayName =
        (user.user_metadata?.display_name as string | undefined) ??
        (user.email?.split('@')[0]) ??
        'ユーザー'

      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          display_name: displayName
        })

      if (insertError) {
        console.warn('Profile creation error:', insertError)
      }
    }
  } catch (error) {
    console.error('ensureProfileExists error:', error)
  }
}

/**
 * 記事の所有権を確認
 */
export async function verifyArticleOwnership(
  supabase: SupabaseClient<Database>,
  articleId: string,
  userId: string
) {
  try {
    const { data: article, error } = await supabase
      .from('articles')
      .select('id')
      .eq('id', articleId)
      .eq('user_id', userId)
      .maybeSingle()

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
