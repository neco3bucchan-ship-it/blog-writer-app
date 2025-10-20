import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// サーバーサイド用のSupabaseクライアント
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
)

// セクション更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const { id, sectionId } = params
    const body = await request.json()
    const { content, isCompleted } = body

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

    // 記事の所有権確認
    const { data: article, error: articleError } = await supabaseServer
      .from('articles')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (articleError || !article) {
      return NextResponse.json(
        { error: '記事が見つかりません' },
        { status: 404 }
      )
    }

    // セクション更新
    const updateData: any = {}
    if (content !== undefined) {
      updateData.content = content
      // 文字数を計算
      updateData.word_count = content.length
    }
    if (isCompleted !== undefined) {
      updateData.is_completed = isCompleted
    }

    const { data: section, error: sectionError } = await supabaseServer
      .from('article_sections')
      .update(updateData)
      .eq('id', sectionId)
      .eq('article_id', id)
      .select()
      .single()

    if (sectionError) {
      if (sectionError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'セクションが見つかりません' },
          { status: 404 }
        )
      }
      console.error('Section update error:', sectionError)
      return NextResponse.json(
        { error: 'セクションの更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      section: {
        id: section.id,
        sectionNumber: section.section_number,
        title: section.title,
        description: section.description,
        content: section.content,
        wordCount: section.word_count,
        isCompleted: section.is_completed
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

// セクション削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const { id, sectionId } = params

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

    // 記事の所有権確認
    const { data: article, error: articleError } = await supabaseServer
      .from('articles')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (articleError || !article) {
      return NextResponse.json(
        { error: '記事が見つかりません' },
        { status: 404 }
      )
    }

    // セクション削除
    const { error } = await supabaseServer
      .from('article_sections')
      .delete()
      .eq('id', sectionId)
      .eq('article_id', id)

    if (error) {
      console.error('Section delete error:', error)
      return NextResponse.json(
        { error: 'セクションの削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'セクションが削除されました'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
