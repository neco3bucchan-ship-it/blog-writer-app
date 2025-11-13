-- ============================================
-- Blog Writer App - データベーススキーマ作成
-- ============================================
-- このファイルはSupabase DashboardのSQL Editorで実行してください
-- 実行順序: 1. プロファイルテーブル → 2. 記事テーブル → 3. 記事セクションテーブル → 4. RLS設定

-- ============================================
-- 1. プロファイルテーブルの作成
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- プロファイル作成時のトリガー（ユーザー登録時に自動的にプロファイルを作成）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーの作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. updated_atを自動更新する関数
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. 記事テーブルの作成
-- ============================================
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('beginner', 'intermediate', 'advanced')),
  heading TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 記事テーブルのupdated_atトリガー
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. 記事セクションテーブルの作成
-- ============================================
CREATE TABLE IF NOT EXISTS article_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  section_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  word_count INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, section_number)
);

-- 記事セクションテーブルのupdated_atトリガー
DROP TRIGGER IF EXISTS update_article_sections_updated_at ON article_sections;
CREATE TRIGGER update_article_sections_updated_at
  BEFORE UPDATE ON article_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- プロファイルテーブルのupdated_atトリガー
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 5. RLS（Row Level Security）の設定
-- ============================================

-- プロファイルテーブルのRLS設定
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- ユーザーは自分のプロファイルのみ閲覧可能
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- ユーザーは自分のプロファイルのみ更新可能
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ユーザーは自分のプロファイルのみ作成可能
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 記事テーブルのRLS設定
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Users can view own articles" ON articles;
DROP POLICY IF EXISTS "Users can insert own articles" ON articles;
DROP POLICY IF EXISTS "Users can update own articles" ON articles;
DROP POLICY IF EXISTS "Users can delete own articles" ON articles;

-- ユーザーは自分の記事のみ閲覧可能
CREATE POLICY "Users can view own articles" ON articles
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分の記事のみ作成可能
CREATE POLICY "Users can insert own articles" ON articles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の記事のみ更新可能
CREATE POLICY "Users can update own articles" ON articles
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分の記事のみ削除可能
CREATE POLICY "Users can delete own articles" ON articles
  FOR DELETE USING (auth.uid() = user_id);

-- 記事セクションテーブルのRLS設定
ALTER TABLE article_sections ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Users can view own article sections" ON article_sections;
DROP POLICY IF EXISTS "Users can insert own article sections" ON article_sections;
DROP POLICY IF EXISTS "Users can update own article sections" ON article_sections;
DROP POLICY IF EXISTS "Users can delete own article sections" ON article_sections;

-- ユーザーは自分の記事のセクションのみ閲覧可能
CREATE POLICY "Users can view own article sections" ON article_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE id = article_sections.article_id 
      AND user_id = auth.uid()
    )
  );

-- ユーザーは自分の記事のセクションのみ作成可能
CREATE POLICY "Users can insert own article sections" ON article_sections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE id = article_sections.article_id 
      AND user_id = auth.uid()
    )
  );

-- ユーザーは自分の記事のセクションのみ更新可能
CREATE POLICY "Users can update own article sections" ON article_sections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE id = article_sections.article_id 
      AND user_id = auth.uid()
    )
  );

-- ユーザーは自分の記事のセクションのみ削除可能
CREATE POLICY "Users can delete own article sections" ON article_sections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM articles 
      WHERE id = article_sections.article_id 
      AND user_id = auth.uid()
    )
  );

-- ============================================
-- 完了メッセージ
-- ============================================
-- すべてのテーブルとRLS設定が完了しました！
-- 次のステップ: Supabase Dashboardの「Table Editor」でテーブルが作成されたことを確認してください。

