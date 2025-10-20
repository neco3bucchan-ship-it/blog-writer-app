# 🚀 Supabase統合実装ガイド

## 📋 プロジェクト概要

**Blog Writer**アプリケーションにSupabaseを統合し、以下の機能を追加します：
- ユーザー認証（登録・ログイン）
- 記事の永続化保存
- ユーザー別記事管理
- 自動保存機能

## 🎯 実装目標

### 現在の状況
- ✅ Next.js 15 + React 19 + TypeScript
- ✅ AI連携（Google Gemini API）
- ✅ 完全なUI/UX実装
- ❌ データベース未使用（ローカルストレージのみ）
- ❌ ユーザー認証なし
- ❌ 記事永続化なし

### 実装後の状況
- ✅ ユーザー認証システム
- ✅ 記事の永続化保存
- ✅ ユーザー別記事管理
- ✅ 自動保存機能
- ✅ 既存AI機能の維持

## 📊 データベース設計

### テーブル構成

#### 1. profiles（プロファイル）
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. articles（記事）
```sql
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('beginner', 'intermediate', 'advanced')),
  heading TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. article_sections（記事セクション）
```sql
CREATE TABLE article_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  section_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  word_count INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### RLS（Row Level Security）設定
```sql
-- プロファイルのRLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 記事のRLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own articles" ON articles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own articles" ON articles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own articles" ON articles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own articles" ON articles FOR DELETE USING (auth.uid() = user_id);

-- 記事セクションのRLS
ALTER TABLE article_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own article sections" ON article_sections FOR SELECT USING (
  EXISTS (SELECT 1 FROM articles WHERE id = article_sections.article_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own article sections" ON article_sections FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM articles WHERE id = article_sections.article_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own article sections" ON article_sections FOR UPDATE USING (
  EXISTS (SELECT 1 FROM articles WHERE id = article_sections.article_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own article sections" ON article_sections FOR DELETE USING (
  EXISTS (SELECT 1 FROM articles WHERE id = article_sections.article_id AND user_id = auth.uid())
);
```

## 🚀 実装手順（10ステップ）

### ✅ Step 1: Supabaseプロジェクト作成と環境設定
**目的**: Supabase基盤の構築
**所要時間**: 15-20分
**ステータス**: ✅ 完了

#### 完了項目
- [x] Supabaseプロジェクト作成
- [x] 環境変数設定（.env.local）
- [x] データベース接続確認

#### 設定内容
```env
NEXT_PUBLIC_SUPABASE_URL=https://kudecylbgzehdtromjja.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyBOSrnJSr_sCEV24L1X31mo9_xOYB-ZAt0
```

### ✅ Step 2: 必要な依存関係のインストール
**目的**: Supabaseクライアントライブラリの導入
**所要時間**: 5-10分
**ステータス**: ✅ 完了

#### インストール済みパッケージ
```json
{
  "@supabase/supabase-js": "^2.75.1",
  "@supabase/ssr": "^0.7.0",
  "uuid": "^13.0.0",
  "@types/uuid": "^10.0.0"
}
```

### 🔄 Step 3: データベーススキーマの実装
**目的**: 記事保存用のテーブル構造構築
**所要時間**: 20-30分
**ステータス**: 🔄 次のステップ

#### 実装内容
1. **プロファイルテーブル作成**
2. **記事テーブル作成**
3. **記事セクションテーブル作成**
4. **RLS（Row Level Security）設定**
5. **セキュリティテスト実行**

### ⏳ Step 4: 認証コンテキストの作成
**目的**: アプリ全体での認証状態管理
**所要時間**: 30-40分
**ステータス**: ⏳ 待機中

#### 実装内容
1. **Supabaseクライアント設定**
   - `lib/supabase.ts`作成
   - クライアントサイド・サーバーサイド設定
   - 型定義の作成

2. **認証コンテキスト作成**
   - `contexts/AuthContext.tsx`作成
   - 認証状態の管理
   - ログイン・ログアウト関数実装

3. **プロバイダー設定**
   - `app/layout.tsx`にAuthProvider追加
   - 認証状態の初期化
   - エラーハンドリング実装

### ⏳ Step 5: 認証UI画面の実装
**目的**: ユーザー登録・ログイン画面の作成
**所要時間**: 45-60分
**ステータス**: ⏳ 待機中

#### 実装内容
1. **ログイン画面作成**
   - `app/auth/login/page.tsx`作成
   - メール・パスワード入力フォーム
   - バリデーション実装
   - エラー表示機能

2. **サインアップ画面作成**
   - `app/auth/signup/page.tsx`作成
   - ユーザー登録フォーム
   - メール確認機能
   - 成功・エラー状態表示

3. **認証ナビゲーション**
   - ヘッダーに認証状態表示
   - ログイン・ログアウトボタン
   - プロファイル表示

### ⏳ Step 6: プロテクテッドルートの実装
**目的**: 認証が必要なページの保護
**所要時間**: 20-30分
**ステータス**: ⏳ 待機中

#### 実装内容
1. **認証ガード作成**
   - `components/AuthGuard.tsx`作成
   - 認証チェック機能
   - リダイレクト処理

2. **既存ページの保護**
   - 執筆関連ページに認証ガード追加
   - 未認証時のリダイレクト
   - ローディング状態表示

3. **認証状態に応じたUI**
   - 認証状態による表示切り替え
   - ユーザー情報表示
   - ログアウト機能

### ⏳ Step 7: 記事CRUD APIの実装
**目的**: 記事の保存・取得・更新・削除機能
**所要時間**: 60-90分
**ステータス**: ⏳ 待機中

#### 実装内容
1. **記事作成API**
   - `app/api/articles/route.ts`作成
   - POST: 新規記事作成
   - バリデーション実装
   - エラーハンドリング

2. **記事取得API**
   - GET: ユーザー記事一覧取得
   - 記事詳細取得
   - フィルタリング機能

3. **記事更新API**
   - PUT: 記事内容更新
   - セクション別更新
   - 自動保存機能

4. **記事削除API**
   - DELETE: 記事削除
   - 関連データの削除
   - 確認ダイアログ

### ⏳ Step 8: 自動保存機能の実装
**目的**: 執筆中の自動保存機能
**所要時間**: 40-50分
**ステータス**: ⏳ 待機中

#### 実装内容
1. **自動保存フック作成**
   - `hooks/useAutoSave.ts`作成
   - デバウンス機能
   - 保存状態管理

2. **執筆画面への統合**
   - 執筆画面に自動保存追加
   - 保存状態表示
   - エラー処理

3. **オフライン対応**
   - オフライン検知
   - ローカル保存
   - 同期機能

### ⏳ Step 9: 既存UIとの統合
**目的**: 既存機能とSupabase機能の統合
**所要時間**: 60-80分
**ステータス**: ⏳ 待機中

#### 実装内容
1. **記事一覧画面の更新**
   - ダミーデータをSupabaseデータに置換
   - ユーザー別記事表示
   - 検索・フィルタリング機能

2. **執筆画面の更新**
   - 記事データの永続化
   - セクション別保存
   - 進捗管理

3. **ナビゲーションの更新**
   - 認証状態に応じたメニュー
   - ユーザープロファイル表示
   - ログアウト機能

### ⏳ Step 10: テストとデバッグ
**目的**: 機能の動作確認とバグ修正
**所要時間**: 60-90分
**ステータス**: ⏳ 待機中

#### 実装内容
1. **機能テスト**
   - 認証フローのテスト
   - 記事CRUD操作のテスト
   - 自動保存機能のテスト

2. **エラーハンドリング**
   - ネットワークエラー対応
   - 認証エラー対応
   - データベースエラー対応

3. **パフォーマンス最適化**
   - ローディング状態の最適化
   - キャッシュ機能の実装
   - レスポンス時間の改善

## 🎯 実装のポイント

### ⚠️ 注意事項
1. **段階的実装**: 各ステップを順番に実行
2. **テスト重視**: 各ステップ後に動作確認
3. **既存機能保持**: 現在のAI連携機能は維持
4. **エラーハンドリング**: 各段階でエラー処理を実装

### 🔧 開発環境の準備
- Node.js 18以上
- Supabase CLI（オプション）
- ブラウザ開発者ツール

### 📊 成功指標
- [ ] ユーザー登録・ログインが正常動作
- [ ] 記事の作成・保存・取得が正常動作
- [ ] 自動保存機能が正常動作
- [ ] 既存のAI機能が正常動作

## 🚀 次のステップ

**Step 3: データベーススキーマの実装** を開始します。

### Step 3で実行する内容
1. Supabaseダッシュボードでテーブル作成
2. プロファイルテーブルの作成
3. 記事テーブルの作成
4. 記事セクションテーブルの作成
5. RLS（Row Level Security）の設定

---

**作成日**: 2025年10月20日
**バージョン**: 1.0
**ステータス**: Step 2完了、Step 3準備中
