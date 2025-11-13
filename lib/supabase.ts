import { createClient } from '@supabase/supabase-js'

// 環境変数の取得（開発環境ではデフォルト値を設定）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Supabase設定が正しく行われているかの確認
export const isSupabaseConfigured = 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseAnonKey !== 'placeholder-key' &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20

// 開発環境での警告
if (process.env.NODE_ENV === 'development' && !isSupabaseConfigured) {
  console.warn('Supabase environment variables are not set. Please configure .env.local file.')
}

// クライアントサイド用のSupabaseクライアント
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 型定義
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      articles: {
        Row: {
          id: string
          user_id: string
          title: string
          theme: string
          target_audience: 'beginner' | 'intermediate' | 'advanced'
          heading: string
          status: 'draft' | 'published' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          theme: string
          target_audience: 'beginner' | 'intermediate' | 'advanced'
          heading: string
          status?: 'draft' | 'published' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          theme?: string
          target_audience?: 'beginner' | 'intermediate' | 'advanced'
          heading?: string
          status?: 'draft' | 'published' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
      article_sections: {
        Row: {
          id: string
          article_id: string
          section_number: number
          title: string
          description: string | null
          content: string | null
          word_count: number
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          article_id: string
          section_number: number
          title: string
          description?: string | null
          content?: string | null
          word_count?: number
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          article_id?: string
          section_number?: number
          title?: string
          description?: string | null
          content?: string | null
          word_count?: number
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// 型付きクライアント
export const supabaseTyped = createClient<Database>(supabaseUrl, supabaseAnonKey)
