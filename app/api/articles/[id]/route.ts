import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// サーバーサイド用のSupabaseクライアント
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
)

// 記事詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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

    // 記事詳細取得
    const { data: article, error: articleError } = await supabaseServer
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
        return NextResponse.json(
          { error: '記事が見つかりません' },
          { status: 404 }
        )
      }
      console.error('Article fetch error:', articleError)
      return NextResponse.json(
        { error: '記事の取得に失敗しました' },
        { status: 500 }
      )
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
        updatedAt: article.updated_at,
        outline: article.article_sections?.map((section: any) => ({
          id: section.id,
          section: section.section_number,
          title: section.title,
          description: section.description,
          content: section.content,
          wordCount: section.word_count,
          isCompleted: section.is_completed
        })) || []
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

// 記事更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { title, theme, targetAudience, heading, status, outline } = body

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

    // 記事更新
    const updateData: any = {}
    if (title) updateData.title = title
    if (theme) updateData.theme = theme
    if (targetAudience) updateData.target_audience = targetAudience
    if (heading) updateData.heading = heading
    if (status) updateData.status = status

    const { data: article, error: articleError } = await supabaseServer
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (articleError) {
      if (articleError.code === 'PGRST116') {
        return NextResponse.json(
          { error: '記事が見つかりません' },
          { status: 404 }
        )
      }
      console.error('Article update error:', articleError)
      return NextResponse.json(
        { error: '記事の更新に失敗しました' },
        { status: 500 }
      )
    }

    // セクション更新
    if (outline && Array.isArray(outline)) {
      // 既存のセクションを削除
      await supabaseServer
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

      const { error: sectionsError } = await supabaseServer
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

// 記事削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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

    // 記事削除（関連するセクションも自動削除される）
    const { error } = await supabaseServer
      .from('articles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '記事が見つかりません' },
          { status: 404 }
        )
      }
      console.error('Article delete error:', error)
      return NextResponse.json(
        { error: '記事の削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '記事が削除されました'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
