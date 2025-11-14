# 🚀 Vercel 正しいデプロイ手順（完全版）

## 変更を元に戻しました

デプロイのために加えた変更を元に戻しました：

1. ✅ `package.json` から `overrides` と `postinstall` を削除
2. ✅ `.gitignore` を元に戻す
3. ✅ `vercel.json` の `installCommand` を元に戻す
4. ✅ `.npmrc` ファイルを削除

## 📋 Vercelデプロイの正しい手順（1から）

### 前提条件

- [ ] ローカルでアプリケーションが正常に動作している
- [ ] GitHubリポジトリにコードがプッシュされている
- [ ] Supabaseプロジェクトが設定されている
- [ ] Gemini APIキーを取得している

### 環境変数の準備

以下の環境変数を準備してください：

```
NEXT_PUBLIC_SUPABASE_URL=あなたのSupabaseプロジェクトURL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabase匿名キー
NEXT_PUBLIC_GEMINI_API_KEY=あなたのGemini APIキー
```

---

## 🚀 デプロイ手順

### Step 1: 変更をGitHubにプッシュ

```bash
cd blog-writer-app
git add .
git commit -m "Restore to working state before deployment"
git push
```

### Step 2: Vercelでプロジェクトを削除して再作成（推奨）

既存のプロジェクトをクリーンな状態から始めるため、削除して再作成します。

#### 2-1: 既存のプロジェクトを削除

1. Vercelダッシュボードにアクセス
   - https://vercel.com にログイン

2. プロジェクト「blog-generator」を選択

3. Settings > General を開く
   - 左サイドバー「Settings」→「General」

4. ページ下部の「Delete Project」セクション
   - 「Delete Project」ボタンをクリック
   - プロジェクト名を入力して確認
   - 削除を実行

#### 2-2: 新しいプロジェクトを作成

1. Vercelダッシュボードのホームに戻る

2. 「Add New...」→「Project」をクリック

3. GitHubリポジトリを選択
   - 「Import Git Repository」セクションでリポジトリを探す
   - 「blog-generator」リポジトリの「Import」ボタンをクリック

### Step 3: プロジェクト設定（最重要！）

#### 3-1: Configure Project 画面で設定

**Project Name:**
```
blog-generator
```

**Framework Preset:**
```
Next.js (自動検出されるはず)
```

**Root Directory:**
```
blog-writer-app
```

**重要:** 「Root Directory」の右側にある「Edit」ボタンをクリックして、`blog-writer-app` を入力してください。これが最も重要な設定です。

**Build and Output Settings:**
- Build Command: `npm run build` (デフォルトのまま)
- Output Directory: `.next` (デフォルトのまま)
- Install Command: `npm install` (デフォルトのまま)

#### 3-2: 環境変数を設定

「Environment Variables」セクションで以下を追加：

1. **Name:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** あなたのSupabaseプロジェクトURL
   - **Environment:** Production, Preview, Development (すべてにチェック)

2. **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** あなたのSupabase匿名キー
   - **Environment:** Production, Preview, Development (すべてにチェック)

3. **Name:** `NEXT_PUBLIC_GEMINI_API_KEY`
   - **Value:** あなたのGemini APIキー
   - **Environment:** Production, Preview, Development (すべてにチェック)

### Step 4: デプロイを実行

1. 「Deploy」ボタンをクリック

2. ビルドプロセスを監視
   - ビルドログを確認
   - エラーがないか確認

3. デプロイ完了を待つ
   - 通常2-5分かかります

### Step 5: デプロイ後の確認

1. **URLにアクセス**
   - Vercelが提供するURLにアクセス
   - 例: `https://blog-generator-xxxx.vercel.app`

2. **ランディングページが表示されることを確認**

3. **認証機能をテスト**
   - サインアップページにアクセス
   - ログインページにアクセス

4. **AI生成機能をテスト**（認証後）
   - テーマ入力
   - 見出し生成
   - アウトライン生成

---

## 🔍 トラブルシューティング

### 問題1: ビルドエラーが発生する

**エラー内容:** `npm error ERESOLVE could not resolve`

**原因:** `pnpm-lock.yaml` が検出されている、または依存関係の競合

**解決方法:**

1. **GitHubリポジトリで `pnpm-lock.yaml` を確認**
   - 存在する場合は削除

2. **Vercelダッシュボードで設定を変更**
   - Settings > Build and Deployment
   - 「Install Command」を `npm install --legacy-peer-deps` に変更
   - 「Save」をクリック
   - 再デプロイ

### 問題2: 404エラーが表示される

**原因:** Root Directoryが設定されていない

**解決方法:**

1. Settings > Build and Deployment
2. 「Root Directory」に `blog-writer-app` を入力
3. 「Save」をクリック
4. 再デプロイ

### 問題3: 環境変数が読み込まれない

**原因:** 環境変数が設定されていない、または間違っている

**解決方法:**

1. Settings > Environment Variables
2. 環境変数を確認・修正
3. 再デプロイ（環境変数を変更した場合は必須）

---

## 📝 重要なポイント

### 1. Root Directory の設定

**これが最も重要です！**

- Root Directory: `blog-writer-app`
- これを設定しないと、404エラーが発生します

### 2. 環境変数の設定

すべての環境（Production、Preview、Development）に設定してください。

### 3. pnpm-lock.yaml の扱い

- `pnpm-lock.yaml` が存在すると、Vercelがpnpmを使おうとします
- npmを使用する場合は、`pnpm-lock.yaml` を削除してください

### 4. ビルドエラーが発生した場合

- ビルドログを確認
- エラーメッセージに従って対処
- 必要に応じて `npm install --legacy-peer-deps` を使用

---

## ✅ デプロイ成功のチェックリスト

- [ ] GitHubにコードがプッシュされている
- [ ] Vercelで新しいプロジェクトを作成した
- [ ] Root Directoryを `blog-writer-app` に設定した
- [ ] 環境変数をすべて設定した（3つ）
- [ ] デプロイが成功した
- [ ] URLにアクセスしてランディングページが表示される
- [ ] 認証機能が動作する
- [ ] AI生成機能が動作する

---

## 🚀 次のステップ

デプロイが成功したら：

1. **カスタムドメインの設定**（オプション）
   - Settings > Domains
   - カスタムドメインを追加

2. **Analytics の確認**
   - Analytics タブでアクセス状況を確認

3. **継続的デプロイの設定**
   - mainブランチへのプッシュで自動デプロイ
   - Pull Requestでプレビュー環境が自動作成

---

**作成日**: 2025年1月27日  
**バージョン**: 1.0

## 📌 まとめ

最も重要な設定は **Root Directory: `blog-writer-app`** です。

これを設定すれば、ほとんどの問題は解決します。

ビルドエラーが発生した場合のみ、`npm install --legacy-peer-deps` を使用してください。

