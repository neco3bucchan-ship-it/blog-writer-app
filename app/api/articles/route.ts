import { NextRequest, NextResponse } from 'next/server'
import { ensureProfileExists, getAuthenticatedUser } from '@/lib/auth-helpers'

function unauthorizedResponse(message: string) {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  )
}

function serverErrorResponse(message: string = 'サーバーエラーが発生しました') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 500 }
  )
}

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
    const { supabase, user, error: authError } = await getAuthenticatedUser(request)
    if (!user || authError) {
      return unauthorizedResponse(authError || '認証に失敗しました')
    }

    await ensureProfileExists(supabase, user)

    // 記事作成
    const { data: article, error: articleError } = await supabase
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
      return serverErrorResponse('記事の作成に失敗しました')
    }

    // 記事セクション作成
    let createdSections: any[] = []
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

      const { data: sectionsData, error: sectionsError } = await supabase
        .from('article_sections')
        .insert(sections)
        .select()

      if (sectionsError) {
        console.error('Sections creation error:', sectionsError)
        // 記事は作成されているので、エラーを返さない
      } else {
        createdSections = sectionsData || []
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
        progress: 0,
        createdAt: article.created_at,
        updatedAt: article.updated_at,
        outline: createdSections.map((section: any) => ({
          id: section.id,
          section: section.section_number,
          title: section.title,
          description: section.description,
          content: section.content,
          wordCount: section.word_count,
          isCompleted: section.is_completed
        }))
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return serverErrorResponse()
  }
}

// 記事一覧取得
export async function GET(request: NextRequest) {
  try {
    // 認証確認
    const { supabase, user, error: authError } = await getAuthenticatedUser(request)
    if (!user || authError) {
      return unauthorizedResponse(authError || '認証に失敗しました')
    }

    // ユーザーの記事一覧取得
    const { data: articles, error } = await supabase
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
      return serverErrorResponse('記事の取得に失敗しました')
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
    return serverErrorResponse()
  }
}
