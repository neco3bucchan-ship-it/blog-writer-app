import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, verifyArticleOwnership } from '@/lib/auth-helpers'

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

// セクション更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const { id, sectionId } = params
    const body = await request.json()
    const { content, isCompleted } = body

    const { supabase, user, error: authError } = await getAuthenticatedUser(request)
    if (!user || authError) {
      return unauthorizedResponse(authError || '認証に失敗しました')
    }

    const { isOwner } = await verifyArticleOwnership(supabase, id, user.id)
    if (!isOwner) {
      return notFoundResponse('記事が見つかりません')
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

    const { data: section, error: sectionError } = await supabase
      .from('article_sections')
      .update(updateData)
      .eq('id', sectionId)
      .eq('article_id', id)
      .select()
      .single()

    if (sectionError) {
      if (sectionError.code === 'PGRST116') {
        return notFoundResponse('セクションが見つかりません')
      }
      console.error('Section update error:', sectionError)
      return serverErrorResponse('セクションの更新に失敗しました')
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
    return serverErrorResponse()
  }
}

// セクション削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const { id, sectionId } = params

    const { supabase, user, error: authError } = await getAuthenticatedUser(request)
    if (!user || authError) {
      return unauthorizedResponse(authError || '認証に失敗しました')
    }

    const { isOwner } = await verifyArticleOwnership(supabase, id, user.id)
    if (!isOwner) {
      return notFoundResponse('記事が見つかりません')
    }

    // セクション削除
    const { error } = await supabase
      .from('article_sections')
      .delete()
      .eq('id', sectionId)
      .eq('article_id', id)

    if (error) {
      console.error('Section delete error:', error)
      return serverErrorResponse('セクションの削除に失敗しました')
    }

    return NextResponse.json({
      success: true,
      message: 'セクションが削除されました'
    })

  } catch (error) {
    console.error('API Error:', error)
    return serverErrorResponse()
  }
}
