# 🗄️ Supabaseデータベース実装ステップ

## 📋 現在の状況

### ✅ 完了しているステップ

1. **Step 1: Supabaseプロジェクト作成と環境設定** ✅
   - Supabaseプロジェクト作成
   - 環境変数設定（.env.local）
   - データベース接続確認

2. **Step 2: 必要な依存関係のインストール** ✅
   - @supabase/supabase-js
   - @supabase/ssr
   - uuid, @types/uuid

3. **Step 3: データベーススキーマの実装** ✅
   - `profiles` / `articles` / `article_sections` テーブル作成
   - updated_atトリガー・プロフィール生成トリガー設定
   - RLS（Row Level Security）ポリシー適用

4. **Step 4: 認証コンテキストの作成** ✅
   - SimpleSupabaseAuthContext実装
   - 認証状態管理
   - ログイン・ログアウト機能

5. **Step 5: 認証UI画面の実装** ✅
   - ログイン画面（/auth/simple-login）
   - サインアップ画面（/auth/simple-signup）
   - エラーハンドリング

6. **Step 6: プロテクテッドルートの実装** ✅
   - SimpleSupabaseAuthGuard実装
   - 認証ガード機能
   - リダイレクト処理

7. **Step 7: 記事CRUD APIの実装** ✅
   - 記事作成（POST）
   - 記事一覧取得（GET）
   - 記事詳細取得（GET）
   - 記事更新（PUT）
   - 記事削除（DELETE）
   - セクション更新（PUT）
   - セクション削除（DELETE）

8. **Step 8: 自動保存機能の高度化とUI統合** ✅
   - リトライ機能（最大3回）
   - オフライン検知と復帰時の自動再開
   - 状態表示の改善（保存中／再試行中／オフライン）
   - 手動再試行ボタン

9. **Step 9: 記事編集機能の実装** ✅
   - 「続きから執筆」機能
   - 既存記事の復元
   - 記事情報と進捗率の表示
   - 成功メッセージの自動非表示

### 🔄 次のステップ（これから実装）

**Step 10: 記事エクスポート機能（任意）**

> Step 3～9は完了しました。以下は実行した内容の記録として残しています。

---

## 🎯 Step 3: データベーススキーマの実装

### 目的
記事保存用のテーブル構造を構築し、RLS（Row Level Security）を設定します。

### 所要時間
20-30分

### 実装内容

#### 3.1 プロファイルテーブルの作成

**Supabase Dashboardでの操作手順:**

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択
3. 左サイドバーの「SQL Editor」をクリック
4. 「New query」をクリック
5. 以下のSQLをコピー＆ペーストして実行：

```sql
-- プロファイルテーブル
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
```

**確認事項:**
- [ ] テーブルが正常に作成された
- [ ] エラーメッセージが表示されていない

#### 3.2 記事テーブルの作成

**SQL Editorで以下のSQLを実行:**

```sql
-- 記事テーブル
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

-- updated_atを自動更新するトリガー
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 記事テーブルのupdated_atトリガー
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

**確認事項:**
- [ ] テーブルが正常に作成された
- [ ] トリガーが正常に作成された

#### 3.3 記事セクションテーブルの作成

**SQL Editorで以下のSQLを実行:**

```sql
-- 記事セクションテーブル
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
```

**確認事項:**
- [ ] テーブルが正常に作成された
- [ ] トリガーが正常に作成された
- [ ] UNIQUE制約が設定された

#### 3.4 RLS（Row Level Security）の設定

**SQL Editorで以下のSQLを実行:**

```sql
-- ============================================
-- プロファイルテーブルのRLS設定
-- ============================================
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

-- ユーザーは自分のプロファイルのみ作成可能（トリガーで自動作成されるため通常は不要だが、念のため）
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 記事テーブルのRLS設定
-- ============================================
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

-- ============================================
-- 記事セクションテーブルのRLS設定
-- ============================================
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
```

**確認事項:**
- [ ] すべてのテーブルでRLSが有効になった
- [ ] すべてのポリシーが正常に作成された
- [ ] エラーメッセージが表示されていない

#### 3.5 データベース構造の確認

**Supabase Dashboardでの確認手順:**

1. 左サイドバーの「Table Editor」をクリック
2. 以下のテーブルが表示されることを確認：
   - `profiles`
   - `articles`
   - `article_sections`
3. 各テーブルの構造を確認：
   - カラムが正しく作成されているか
   - データ型が正しいか
   - 制約が設定されているか

**確認チェックリスト:**
- [ ] `profiles`テーブルが存在する
- [ ] `articles`テーブルが存在する
- [ ] `article_sections`テーブルが存在する
- [ ] 各テーブルのカラムが正しく設定されている
- [ ] 外部キー制約が設定されている
- [ ] RLSが有効になっている

---

## 🚀 次のステップ（Step 3完了後）

### Step 7: 記事CRUD APIの実装

**目的**: 記事の保存・取得・更新・削除機能を実装

**実装内容:**
1. 記事作成API（`app/api/articles/route.ts`）
2. 記事取得API（記事一覧・詳細）
3. 記事更新API（`app/api/articles/[id]/route.ts`）
4. 記事削除API
5. 記事セクションAPI（`app/api/articles/[id]/sections/[sectionId]/route.ts`）

### Step 8: 自動保存機能の実装

**目的**: 執筆中の自動保存機能

**実装内容:**
1. 自動保存フック（`hooks/useAutoSave.ts`）の改善
2. 執筆画面への統合
3. 保存状態表示

### Step 9: 既存UIとの統合

**目的**: 既存機能とSupabase機能の統合

**実装内容:**
1. 記事一覧画面の更新（Supabaseデータを使用）
2. 執筆画面の更新（データベース保存）
3. ナビゲーションの更新

### Step 10: テストとデバッグ

**目的**: 機能の動作確認とバグ修正

**実装内容:**
1. 機能テスト
2. エラーハンドリング
3. パフォーマンス最適化

---

## 📝 実装のポイント

### ⚠️ 注意事項

1. **段階的実装**: 各SQLを順番に実行
2. **エラー確認**: 各SQL実行後にエラーメッセージを確認
3. **バックアップ**: 本番環境では事前にバックアップを取得
4. **テスト**: 各ステップ後に動作確認

### 🔧 トラブルシューティング

#### 問題1: テーブルが作成できない

**原因**: SQLの構文エラー、権限不足

**解決方法:**
- SQLの構文を確認
- エラーメッセージを確認
- 段階的に実行

#### 問題2: RLSポリシーが動作しない

**原因**: ポリシーの設定ミス、認証状態の問題

**解決方法:**
- ポリシーの構文を確認
- 認証状態を確認
- テストユーザーで動作確認

#### 問題3: トリガーが動作しない

**原因**: 関数の定義ミス、権限不足

**解決方法:**
- 関数の定義を確認
- 権限設定を確認
- ログで動作確認

---

## ✅ 完了チェックリスト

### データベース構造
- [ ] `profiles`テーブルが作成された
- [ ] `articles`テーブルが作成された
- [ ] `article_sections`テーブルが作成された
- [ ] すべてのトリガーが作成された
- [ ] 外部キー制約が設定された

### セキュリティ設定
- [ ] すべてのテーブルでRLSが有効になった
- [ ] プロファイルテーブルのポリシーが設定された
- [ ] 記事テーブルのポリシーが設定された
- [ ] 記事セクションテーブルのポリシーが設定された

### 動作確認
- [ ] テーブル構造が正しい
- [ ] RLSが正常に動作する
- [ ] エラーメッセージが表示されない

---

**作成日**: 2025年1月27日  
**バージョン**: 1.0  
**ステータス**: Step 3準備完了

