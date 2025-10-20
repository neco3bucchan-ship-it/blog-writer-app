import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// サーバーサイド用のSupabaseクライアント
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
)

// 記事作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, theme, targetAudience, heading, outline } = body

    // バリデーション
    if (!title || !theme || !targetAudience || !heading) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      )
    }

    if (!['beginner', 'intermediate', 'advanced'].includes(targetAudience)) {
      return NextResponse.json(
        { error: '無効なターゲット読者です' },
        { status: 400 }
      )
    }

    // 認証確認
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // JWTトークンの検証
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証に失敗しました' },
        { status: 401 }
      )
    }

    // 記事作成
    const { data: article, error: articleError } = await supabaseServer
      .from('articles')
      .insert({
        user_id: user.id,
        title,
        theme,
        target_audience: targetAudience,
        heading,
        status: 'draft'
      })
      .select()
      .single()

    if (articleError) {
      console.error('Article creation error:', articleError)
      return NextResponse.json(
        { error: '記事の作成に失敗しました' },
        { status: 500 }
      )
    }

    // 記事セクション作成
    if (outline && Array.isArray(outline)) {
      const sections = outline.map((section: any, index: number) => ({
        article_id: article.id,
        section_number: index + 1,
        title: section.title,
        description: section.description,
        content: section.content || '',
        word_count: 0,
        is_completed: false
      }))

      const { error: sectionsError } = await supabaseServer
        .from('article_sections')
        .insert(sections)

      if (sectionsError) {
        console.error('Sections creation error:', sectionsError)
        // 記事は作成されているので、エラーを返さない
      }
    }

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        theme: article.theme,
        targetAudience: article.target_audience,
        heading: article.heading,
        status: article.status,
        createdAt: article.created_at,
        updatedAt: article.updated_at
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 記事一覧取得
export async function GET(request: NextRequest) {
  try {
    // 認証確認
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証に失敗しました' },
        { status: 401 }
      )
    }

    // ユーザーの記事一覧取得
    const { data: articles, error } = await supabaseServer
      .from('articles')
      .select(`
        id,
        title,
        theme,
        target_audience,
        heading,
        status,
        created_at,
        updated_at,
        article_sections (
          id,
          section_number,
          title,
          is_completed
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Articles fetch error:', error)
      return NextResponse.json(
        { error: '記事の取得に失敗しました' },
        { status: 500 }
      )
    }

    // 進捗率の計算
    const articlesWithProgress = articles?.map(article => {
      const sections = article.article_sections || []
      const completedSections = sections.filter((section: any) => section.is_completed).length
      const progress = sections.length > 0 ? Math.round((completedSections / sections.length) * 100) : 0
      
      return {
        id: article.id,
        title: article.title,
        theme: article.theme,
        targetAudience: article.target_audience,
        heading: article.heading,
        status: article.status,
        progress,
        createdAt: article.created_at,
        updatedAt: article.updated_at
      }
    }) || []

    return NextResponse.json({
      success: true,
      articles: articlesWithProgress
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
