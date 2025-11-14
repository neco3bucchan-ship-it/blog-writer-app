# 🚀 Vercelデプロイ前チェックリスト

## 📋 プロジェクト概要

**Blog Writer** - AIを活用したブログ記事執筆支援Webアプリケーション

### 技術スタック
- **フレームワーク**: Next.js 15.2.4 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS 4.x
- **UIコンポーネント**: shadcn/ui
- **認証・データベース**: Supabase
- **AI生成**: Google Gemini API
- **デプロイ先**: Vercel

---

## ✅ デプロイ前チェックリスト

### 1. プロジェクト構造の確認

- [x] `package.json`が存在し、必要な依存関係が定義されている
- [x] `next.config.mjs`が存在し、適切に設定されている
- [x] `tsconfig.json`が存在し、TypeScript設定が適切
- [x] `vercel.json`が存在し、Vercel設定が適切
- [x] `.gitignore`が存在し、不要なファイルが除外されている

### 2. ビルド設定の確認

**next.config.mjs**の設定:
```javascript
- typescript.ignoreBuildErrors: true (ビルドエラーを無視)
- images.unoptimized: true (画像最適化を無効化)
```

**vercel.json**の設定:
```json
- buildCommand: "npm run build"
- devCommand: "npm run dev"
- installCommand: "npm install"
- framework: "nextjs"
- regions: ["nrt1"] (東京リージョン)
```

### 3. 環境変数の準備

Vercelに設定する必要がある環境変数:

| 環境変数名 | 説明 | 取得方法 |
|-----------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトURL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名キー | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini APIキー | Google AI Studio |

**重要**: すべての環境（Production、Preview、Development）に設定する必要があります。

### 4. 依存関係の確認

**主要な依存関係**:
- `next`: 15.2.4
- `react`: ^19
- `@supabase/supabase-js`: ^2.75.1
- `@google/generative-ai`: ^0.24.1
- `tailwindcss`: ^4.1.9

### 5. データベース設定の確認

**Supabaseテーブル**:
- [ ] `profiles`テーブルが作成されている
- [ ] `articles`テーブルが作成されている
- [ ] `article_sections`テーブルが作成されている
- [ ] RLS（Row Level Security）が有効になっている
- [ ] 必要なポリシーが設定されている

**マイグレーションファイル**: `supabase/migrations/001_create_tables.sql`

### 6. APIルートの確認

**APIエンドポイント**:
- `/api/articles` - 記事管理（GET, POST）
- `/api/articles/[id]` - 記事詳細（GET, PUT, DELETE）
- `/api/articles/[id]/sections/[sectionId]` - セクション管理
- `/api/ai/generate-headings` - 見出し生成
- `/api/ai/generate-outline` - アウトライン生成
- `/api/ai/generate-content` - コンテンツ生成
- `/api/ai/generate-section-content` - セクションコンテンツ生成

すべてのAPIルートで認証が必要です。

### 7. 認証フローの確認

- [x] Supabase認証が実装されている
- [x] 認証コンテキスト（`SimpleSupabaseAuthContext`）が設定されている
- [x] 認証ガード（`SimpleSupabaseAuthGuard`）が実装されている
- [x] APIルートで認証チェックが実装されている

---

## 🔧 デプロイ前の準備手順

### Step 1: ローカルビルドテスト

```bash
cd blog-writer-app
npm install
npm run build
```

**確認事項**:
- [ ] ビルドが成功する
- [ ] エラーが発生しない
- [ ] `.next`フォルダが作成される

### Step 2: 環境変数の準備

1. SupabaseプロジェクトのURLとキーを取得
2. Google Gemini APIキーを取得
3. Vercelダッシュボードで環境変数を設定する準備

### Step 3: GitHubリポジトリへのプッシュ

```bash
# Gitリポジトリの初期化（まだの場合）
git init

# リモートリポジトリの追加
git remote add origin https://github.com/あなたのユーザー名/blog-writer-app.git

# ファイルをコミット
git add .
git commit -m "Initial commit: Blog Writer app"

# GitHubにプッシュ
git push -u origin main
```

**確認事項**:
- [ ] コードがGitHubにプッシュされている
- [ ] `.env.local`ファイルが`.gitignore`で除外されている
- [ ] 機密情報がコミットされていない

---

## 🚀 Vercelデプロイ手順

### 方法1: Vercelダッシュボードからデプロイ（推奨）

1. **Vercelにログイン**
   - [vercel.com](https://vercel.com)にアクセス
   - GitHubアカウントでログイン

2. **プロジェクトのインポート**
   - 「Add New...」→「Project」をクリック
   - GitHubリポジトリを選択

3. **プロジェクト設定**
   - **Framework Preset**: Next.js（自動検出）
   - **Root Directory**: `blog-writer-app`（プロジェクトがルートにある場合は空白）
   - **Build Command**: `npm run build`（デフォルト）
   - **Output Directory**: `.next`（デフォルト）
   - **Install Command**: `npm install`（デフォルト）

4. **環境変数の設定**
   - 「Environment Variables」セクションで以下を追加:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_GEMINI_API_KEY`
   - すべての環境（Production、Preview、Development）に適用

5. **デプロイの実行**
   - 「Deploy」ボタンをクリック
   - ビルドログを確認
   - デプロイが完了するまで待機（通常2-5分）

### 方法2: Vercel CLIからデプロイ

```bash
# Vercel CLIのインストール
npm install -g vercel

# ログイン
vercel login

# プロジェクトディレクトリに移動
cd blog-writer-app

# デプロイ
vercel

# 環境変数の設定
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_GEMINI_API_KEY

# 本番環境へのデプロイ
vercel --prod
```

---

## 🔍 デプロイ後の確認事項

### 1. アプリケーションの動作確認

- [ ] アプリケーションが正常に表示される
- [ ] ランディングページが表示される
- [ ] エラーログに問題がない

### 2. 認証機能の確認

- [ ] サインアップページで新規ユーザー登録ができる
- [ ] ログインページでログインができる
- [ ] ログアウトが正常に動作する

### 3. AI生成機能の確認

- [ ] テーマ入力ページでテーマを入力できる
- [ ] 見出し生成が動作する
- [ ] アウトライン生成が動作する
- [ ] セクションコンテンツ生成が動作する

### 4. 記事管理機能の確認

- [ ] 記事の作成ができる
- [ ] 記事の編集ができる
- [ ] 記事の削除ができる
- [ ] 記事一覧が表示される

### 5. データベース接続の確認

- [ ] Supabaseへの接続が正常
- [ ] データの保存・取得が正常
- [ ] RLSが正常に動作している

---

## ⚠️ トラブルシューティング

### ビルドエラーが発生する場合

1. **TypeScriptエラー**:
   - `next.config.mjs`で`ignoreBuildErrors: true`が設定されているため、通常は問題ありません
   - 重大なエラーのみ修正してください

2. **依存関係のエラー**:
   ```bash
   rm package-lock.json
   npm install
   ```

3. **環境変数のエラー**:
   - Vercelダッシュボードで環境変数が正しく設定されているか確認
   - 値にスペースや特殊文字が含まれていないか確認

### デプロイ後の動作確認

1. **環境変数が読み込まれない**:
   - 環境変数名が`NEXT_PUBLIC_`で始まっているか確認
   - デプロイ後に環境変数を追加した場合は、再デプロイが必要

2. **Supabase接続エラー**:
   - SupabaseプロジェクトのURLとキーが正しいか確認
   - Supabase Dashboardでプロジェクトがアクティブか確認
   - RLSポリシーが正しく設定されているか確認

3. **Gemini APIエラー**:
   - APIキーが有効か確認
   - Google Cloud ConsoleでAPIが有効になっているか確認
   - APIの使用制限に達していないか確認

---

## 📚 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)

---

**作成日**: 2025年1月27日  
**バージョン**: 1.0

