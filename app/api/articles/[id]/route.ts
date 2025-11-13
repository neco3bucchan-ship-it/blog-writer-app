import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'

function unauthorizedResponse(message: string) {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  )
}

function notFoundResponse(message: string) {
  return NextResponse.json(
    { success: false, error: message },
    { status: 404 }
  )
}

function serverErrorResponse(message: string = 'サーバーエラーが発生しました') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 500 }
  )
}

// 記事詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { supabase, user, error: authError } = await getAuthenticatedUser(request)
    if (!user || authError) {
      return unauthorizedResponse(authError || '認証に失敗しました')
    }

    // 記事詳細取得
    const { data: article, error: articleError } = await supabase
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
          description,
          content,
          word_count,
          is_completed
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (articleError) {
      if (articleError.code === 'PGRST116') {
        return notFoundResponse('記事が見つかりません')
      }
      console.error('Article fetch error:', articleError)
      return serverErrorResponse(articleError.message || '記事の取得に失敗しました')
    }

    // セクションをsection_numberでソート
    const sortedSections = article.article_sections
      ? [...article.article_sections].sort((a: any, b: any) => a.section_number - b.section_number)
      : []

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
        outline: sortedSections.map((section: any) => ({
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

// 記事更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { title, theme, targetAudience, heading, status, outline } = body

    const { supabase, user, error: authError } = await getAuthenticatedUser(request)
    if (!user || authError) {
      return unauthorizedResponse(authError || '認証に失敗しました')
    }

    // 記事更新
    const updateData: any = {}
    if (title) updateData.title = title
    if (theme) updateData.theme = theme
    if (targetAudience) updateData.target_audience = targetAudience
    if (heading) updateData.heading = heading
    if (status) updateData.status = status

    const { data: article, error: articleError } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (articleError) {
      if (articleError.code === 'PGRST116') {
        return notFoundResponse('記事が見つかりません')
      }
      console.error('Article update error:', articleError)
      return serverErrorResponse(articleError.message || '記事の更新に失敗しました')
    }

    // セクション更新
    if (outline && Array.isArray(outline)) {
      // 既存のセクションを削除
      await supabase
        .from('article_sections')
        .delete()
        .eq('article_id', id)

      // 新しいセクションを作成
      const sections = outline.map((section: any, index: number) => ({
        article_id: id,
        section_number: index + 1,
        title: section.title,
        description: section.description,
        content: section.content || '',
        word_count: section.wordCount || 0,
        is_completed: section.isCompleted || false
      }))

      const { error: sectionsError } = await supabase
        .from('article_sections')
        .insert(sections)

      if (sectionsError) {
        console.error('Sections update error:', sectionsError)
        // 記事は更新されているので、エラーを返さない
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
        updatedAt: article.updated_at
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return serverErrorResponse()
  }
}

// 記事削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { supabase, user, error: authError } = await getAuthenticatedUser(request)
    if (!user || authError) {
      return unauthorizedResponse(authError || '認証に失敗しました')
    }

    // 記事削除（関連するセクションも自動削除される）
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return notFoundResponse('記事が見つかりません')
      }
      console.error('Article delete error:', error)
      return serverErrorResponse(error.message || '記事の削除に失敗しました')
    }

    return NextResponse.json({
      success: true,
      message: '記事が削除されました'
    })

  } catch (error) {
    console.error('API Error:', error)
    return serverErrorResponse()
  }
}
