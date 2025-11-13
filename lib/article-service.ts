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

/**
 * 記事一覧を取得
 */
export async function getArticles(): Promise<{ success: boolean; articles?: Article[]; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: '認証が必要です' }
    }

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
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Articles fetch error:', error)
      // テーブルが存在しない場合は空の配列を返す
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return { success: true, articles: [] }
      }
      return { success: false, error: '記事の取得に失敗しました' }
    }
    
    // articlesがnullまたはundefinedの場合は空の配列を返す
    if (!articles) {
      return { success: true, articles: [] }
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

    return { success: true, articles: articlesWithProgress }
  } catch (error) {
    console.error('Get articles error:', error)
    return { success: false, error: '記事の取得に失敗しました' }
  }
}

/**
 * 記事詳細を取得
 */
export async function getArticle(id: string): Promise<{ success: boolean; article?: ArticleDetail; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: '認証が必要です' }
    }

    const { data: article, error } = await supabase
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
      .eq('user_id', session.user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: '記事が見つかりません' }
      }
      console.error('Article fetch error:', error)
      return { success: false, error: '記事の取得に失敗しました' }
    }

    const articleDetail: ArticleDetail = {
      id: article.id,
      title: article.title,
      theme: article.theme,
      targetAudience: article.target_audience,
      heading: article.heading,
      status: article.status,
      progress: 0, // 詳細取得時は進捗計算不要
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

    return { success: true, article: articleDetail }
  } catch (error) {
    console.error('Get article error:', error)
    return { success: false, error: '記事の取得に失敗しました' }
  }
}

/**
 * 記事を作成
 */
export async function createArticle(data: CreateArticleData): Promise<{ success: boolean; article?: Article; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: '認証が必要です' }
    }

    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert({
        user_id: session.user.id,
        title: data.title,
        theme: data.theme,
        target_audience: data.targetAudience,
        heading: data.heading,
        status: 'draft'
      })
      .select()
      .single()

    if (articleError) {
      console.error('Article creation error:', articleError)
      return { success: false, error: '記事の作成に失敗しました' }
    }

    // 記事セクション作成
    if (data.outline && Array.isArray(data.outline)) {
      const sections = data.outline.map((section, index) => ({
        article_id: article.id,
        section_number: index + 1,
        title: section.title,
        description: section.description,
        content: section.content || '',
        word_count: 0,
        is_completed: false
      }))

      const { error: sectionsError } = await supabase
        .from('article_sections')
        .insert(sections)

      if (sectionsError) {
        console.error('Sections creation error:', sectionsError)
        // 記事は作成されているので、エラーを返さない
      }
    }

    return {
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
    }
  } catch (error) {
    console.error('Create article error:', error)
    return { success: false, error: '記事の作成に失敗しました' }
  }
}

/**
 * 記事を更新
 */
export async function updateArticle(id: string, data: UpdateArticleData): Promise<{ success: boolean; article?: Article; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: '認証が必要です' }
    }

    // 記事更新
    const updateData: any = {}
    if (data.title) updateData.title = data.title
    if (data.theme) updateData.theme = data.theme
    if (data.targetAudience) updateData.target_audience = data.targetAudience
    if (data.heading) updateData.heading = data.heading
    if (data.status) updateData.status = data.status

    const { data: article, error: articleError } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (articleError) {
      if (articleError.code === 'PGRST116') {
        return { success: false, error: '記事が見つかりません' }
      }
      console.error('Article update error:', articleError)
      return { success: false, error: '記事の更新に失敗しました' }
    }

    // セクション更新
    if (data.outline && Array.isArray(data.outline)) {
      // 既存のセクションを削除
      await supabase
        .from('article_sections')
        .delete()
        .eq('article_id', id)

      // 新しいセクションを作成
      const sections = data.outline.map((section, index) => ({
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

    return {
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
    }
  } catch (error) {
    console.error('Update article error:', error)
    return { success: false, error: '記事の更新に失敗しました' }
  }
}

/**
 * 記事を削除
 */
export async function deleteArticle(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: '認証が必要です' }
    }

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: '記事が見つかりません' }
      }
      console.error('Article delete error:', error)
      return { success: false, error: '記事の削除に失敗しました' }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete article error:', error)
    return { success: false, error: '記事の削除に失敗しました' }
  }
}

/**
 * 記事セクションを更新
 */
export async function updateArticleSection(
  articleId: string,
  sectionId: string,
  data: UpdateSectionData
): Promise<{ success: boolean; section?: ArticleSection; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: '認証が必要です' }
    }

    // 記事の所有権確認
    const { data: article } = await supabase
      .from('articles')
      .select('id')
      .eq('id', articleId)
      .eq('user_id', session.user.id)
      .single()

    if (!article) {
      return { success: false, error: '記事が見つかりません' }
    }

    // セクション更新
    const updateData: any = {}
    if (data.content !== undefined) {
      updateData.content = data.content
      updateData.word_count = data.content.length
    }
    if (data.isCompleted !== undefined) {
      updateData.is_completed = data.isCompleted
    }

    const { data: section, error: sectionError } = await supabase
      .from('article_sections')
      .update(updateData)
      .eq('id', sectionId)
      .eq('article_id', articleId)
      .select()
      .single()

    if (sectionError) {
      if (sectionError.code === 'PGRST116') {
        return { success: false, error: 'セクションが見つかりません' }
      }
      console.error('Section update error:', sectionError)
      return { success: false, error: 'セクションの更新に失敗しました' }
    }

    return {
      success: true,
      section: {
        id: section.id,
        section: section.section_number,
        title: section.title,
        description: section.description,
        content: section.content,
        wordCount: section.word_count,
        isCompleted: section.is_completed
      }
    }
  } catch (error) {
    console.error('Update section error:', error)
    return { success: false, error: 'セクションの更新に失敗しました' }
  }
}
