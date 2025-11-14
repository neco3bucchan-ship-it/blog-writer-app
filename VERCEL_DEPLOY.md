# 🚀 Vercelデプロイ手順書

このドキュメントでは、Blog WriterアプリケーションをVercelにデプロイする手順を説明します。

## 📋 前提条件

### 1. 必要なアカウント
- ✅ **Vercelアカウント**: [vercel.com](https://vercel.com) で無料アカウントを作成
- ✅ **GitHubアカウント**: コードをGitHubにプッシュする必要があります
- ✅ **Supabaseアカウント**: データベースと認証用
- ✅ **Google Cloudアカウント**: Gemini API用

### 2. 必要な情報
- SupabaseプロジェクトのURLと匿名キー
- Google Gemini APIキー
- GitHubリポジトリ（コードをプッシュ済み）

## 🔧 デプロイ前の準備

### Step 1: プロジェクトのビルド確認

ローカルでビルドが成功することを確認します：

```bash
cd blog-writer-app
npm install
npm run build
```

**確認事項:**
- [ ] ビルドエラーが発生していない
- [ ] `.next`フォルダが作成されている
- [ ] TypeScriptのエラーがない（`ignoreBuildErrors: true`が設定されているため、警告は無視可能）

### Step 2: 環境変数の準備

Vercelに設定する環境変数を準備します：

```env
NEXT_PUBLIC_SUPABASE_URL=あなたのSupabaseプロジェクトURL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabase匿名キー
NEXT_PUBLIC_GEMINI_API_KEY=あなたのGemini APIキー
```

**重要:** これらの値は後でVercelダッシュボードで設定します。

### Step 3: GitHubリポジトリへのプッシュ

コードをGitHubにプッシュします：

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

## 🚀 Vercelデプロイ手順

### 方法1: Vercelダッシュボードからデプロイ（推奨）

#### Step 1: Vercelにログイン

1. [Vercel](https://vercel.com) にアクセス
2. 「Sign Up」または「Log In」をクリック
3. GitHubアカウントでログイン（推奨）

#### Step 2: プロジェクトのインポート

1. ダッシュボードで「Add New...」→「Project」をクリック
2. GitHubリポジトリを選択
3. リポジトリが表示されない場合は、「Adjust GitHub App Permissions」で権限を設定

#### Step 3: プロジェクト設定

**Framework Preset:**
- Next.js（自動検出されるはずです）

**Root Directory:**
- `blog-writer-app`（プロジェクトがルートにある場合は空白のまま）

**Build and Output Settings:**
- Build Command: `npm run build`（デフォルト）
- Output Directory: `.next`（デフォルト）
- Install Command: `npm install`（デフォルト）

#### Step 4: 環境変数の設定

「Environment Variables」セクションで以下を追加：

| 名前 | 値 |
|------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | あなたのSupabaseプロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | あなたのSupabase匿名キー |
| `NEXT_PUBLIC_GEMINI_API_KEY` | あなたのGemini APIキー |

**重要:**
- すべての環境（Production、Preview、Development）に適用することを確認
- 値の前後にスペースや引用符がないことを確認

#### Step 5: デプロイの実行

1. 「Deploy」ボタンをクリック
2. ビルドログを確認
3. デプロイが完了するまで待機（通常2-5分）

#### Step 6: デプロイの確認

1. デプロイが完了したら、提供されたURLにアクセス
2. アプリケーションが正常に動作することを確認
3. 認証機能をテスト
4. AI生成機能をテスト

### 方法2: Vercel CLIからデプロイ

#### Step 1: Vercel CLIのインストール

```bash
npm install -g vercel
```

#### Step 2: ログイン

```bash
vercel login
```

#### Step 3: プロジェクトディレクトリに移動

```bash
cd blog-writer-app
```

#### Step 4: デプロイ

```bash
vercel
```

初回デプロイ時は、対話形式で設定を確認します：

- **Set up and deploy?** → `Y`
- **Which scope?** → あなたのアカウントを選択
- **Link to existing project?** → `N`（新規プロジェクトの場合）
- **What's your project's name?** → `blog-writer-app`
- **In which directory is your code located?** → `./`

#### Step 5: 環境変数の設定

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_GEMINI_API_KEY
```

各環境変数の値を入力します。

#### Step 6: 本番環境へのデプロイ

```bash
vercel --prod
```

## 🔍 トラブルシューティング

### ビルドエラーが発生する場合

1. **TypeScriptエラー:**
   - `next.config.mjs`で`ignoreBuildErrors: true`が設定されているため、通常は問題ありません
   - 重大なエラーのみ修正してください

2. **依存関係のエラー:**
   ```bash
   # package-lock.jsonを削除して再インストール
   rm package-lock.json
   npm install
   ```

3. **環境変数のエラー:**
   - Vercelダッシュボードで環境変数が正しく設定されているか確認
   - 値にスペースや特殊文字が含まれていないか確認

### デプロイ後の動作確認

1. **認証機能:**
   - サインアップページで新規ユーザー登録
   - ログインページでログイン

2. **AI生成機能:**
   - テーマ入力ページでテーマを入力
   - 見出し生成が動作するか確認
   - アウトライン生成が動作するか確認

3. **記事管理機能:**
   - 記事の作成
   - 記事の編集
   - 記事の削除

### よくある問題

#### 問題1: 環境変数が読み込まれない

**解決方法:**
- 環境変数名が`NEXT_PUBLIC_`で始まっているか確認
- Vercelダッシュボードで環境変数が正しく設定されているか確認
- デプロイ後に環境変数を追加した場合は、再デプロイが必要

#### 問題2: Supabase接続エラー

**解決方法:**
- SupabaseプロジェクトのURLとキーが正しいか確認
- Supabase Dashboardでプロジェクトがアクティブか確認
- RLS（Row Level Security）ポリシーが正しく設定されているか確認

#### 問題3: Gemini APIエラー

**解決方法:**
- APIキーが有効か確認
- Google Cloud ConsoleでAPIが有効になっているか確認
- APIの使用制限に達していないか確認

## 📝 デプロイ後の設定

### カスタムドメインの設定（オプション）

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Domains」をクリック
3. カスタムドメインを追加
4. DNS設定を更新

### 環境変数の更新

環境変数を更新する場合：

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Environment Variables」をクリック
3. 環境変数を編集
4. 再デプロイが必要な場合は、手動で再デプロイを実行

### 自動デプロイの設定

GitHubリポジトリと連携している場合、自動的にデプロイされます：

- `main`ブランチへのプッシュ → 本番環境にデプロイ
- その他のブランチへのプッシュ → プレビュー環境にデプロイ

## ✅ デプロイチェックリスト

デプロイ前に以下を確認してください：

- [ ] ローカルでビルドが成功する
- [ ] 環境変数が準備されている
- [ ] GitHubリポジトリにコードがプッシュされている
- [ ] Supabaseプロジェクトが設定されている
- [ ] Gemini APIキーが取得されている
- [ ] Vercelアカウントが作成されている

デプロイ後に以下を確認してください：

- [ ] アプリケーションが正常に表示される
- [ ] 認証機能が動作する
- [ ] AI生成機能が動作する
- [ ] 記事管理機能が動作する
- [ ] エラーログに問題がない

## 📚 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)

---

**作成日**: 2025年1月27日  
**バージョン**: 1.0

