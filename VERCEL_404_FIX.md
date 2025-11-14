# 🔧 Vercel 404エラー修正ガイド

## 問題の原因

Vercelで404エラーが発生している場合、主な原因は以下のいずれかです：

1. **Root Directoryの設定が間違っている**
   - Vercelが`blog-writer-app`フォルダを認識していない
   - リポジトリのルートから`blog-writer-app`を指定する必要がある

2. **ビルド設定の問題**
   - ビルドコマンドが正しく実行されていない
   - 出力ディレクトリが間違っている

3. **環境変数の設定不足**
   - 必要な環境変数が設定されていない

## ✅ 修正手順

### Step 1: VercelダッシュボードでのRoot Directory設定（重要）

**これが最も重要な修正です！**

1. **Vercelダッシュボードにアクセス**
   - [vercel.com](https://vercel.com)にログイン
   - プロジェクト「blog-generator」を選択

2. **Settings > General を開く**
   - ページ下部の「Root Directory」セクションを探す
   - 「Edit」ボタンをクリック

3. **Root Directoryを設定**
   - 「Root Directory」に `blog-writer-app` を入力
   - 「Save」をクリック

4. **再デプロイ**
   - 設定を保存すると、自動的に再デプロイが開始されます
   - または、「Deployments」タブから手動で「Redeploy」をクリック

### Step 2: ビルド設定の確認

1. **Vercelダッシュボードにアクセス**
   - [vercel.com](https://vercel.com)にログイン
   - プロジェクトを選択

2. **Settings > General を確認**
   - **Root Directory**: `blog-writer-app` に設定されているか確認
   - 設定されていない場合は、手動で設定

3. **Build & Development Settings を確認**
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`（または空白のまま）
   - **Install Command**: `npm install`

### Step 3: 環境変数の確認

**Settings > Environment Variables**で以下が設定されているか確認：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GEMINI_API_KEY`

**重要**: すべての環境（Production、Preview、Development）に設定されていることを確認してください。

### Step 4: 再デプロイ

1. **GitHubに変更をプッシュ**
   ```bash
   git add blog-writer-app/vercel.json
   git commit -m "Fix: Add rootDirectory to vercel.json"
   git push
   ```

2. **Vercelで自動再デプロイを待つ**
   - GitHubにプッシュすると、自動的に再デプロイが開始されます
   - または、Vercelダッシュボードで「Redeploy」をクリック

3. **デプロイログを確認**
   - ビルドが成功しているか確認
   - エラーがないか確認

### Step 5: 動作確認

デプロイが完了したら、以下を確認：

1. **ルートURLにアクセス**
   - `https://blog-generator-umber.vercel.app` にアクセス
   - ランディングページが表示されることを確認

2. **主要なページを確認**
   - `/auth/simple-login` - ログインページ
   - `/auth/simple-signup` - サインアップページ
   - `/theme-input` - テーマ入力ページ（認証後）

## 🔍 トラブルシューティング

### まだ404エラーが表示される場合

1. **ビルドログを確認**
   - Vercelダッシュボード > Deployments > 最新のデプロイ > Build Logs
   - エラーメッセージを確認

2. **Root Directoryの再確認**
   - Vercelダッシュボード > Settings > General
   - Root Directoryが`blog-writer-app`になっているか確認
   - 変更した場合は、再デプロイが必要

3. **package.jsonの確認**
   - `blog-writer-app/package.json`が存在するか確認
   - `build`スクリプトが正しく定義されているか確認

4. **Next.jsの設定確認**
   - `blog-writer-app/next.config.mjs`が存在するか確認
   - 設定が正しいか確認

### ビルドエラーが発生する場合

1. **TypeScriptエラー**
   - `next.config.mjs`で`ignoreBuildErrors: true`が設定されているため、通常は問題ありません
   - 重大なエラーのみ修正してください

2. **依存関係のエラー**
   - `package-lock.json`を削除して再インストール
   ```bash
   cd blog-writer-app
   rm package-lock.json
   npm install
   ```

3. **環境変数のエラー**
   - すべての環境変数が設定されているか確認
   - 値にスペースや特殊文字が含まれていないか確認

## 📝 確認チェックリスト

デプロイ前に以下を確認：

- [ ] `vercel.json`に`rootDirectory: "blog-writer-app"`が追加されている
- [ ] VercelダッシュボードでRoot Directoryが`blog-writer-app`に設定されている
- [ ] 環境変数がすべて設定されている（Production、Preview、Development）
- [ ] GitHubに変更がプッシュされている
- [ ] ビルドログにエラーがない
- [ ] デプロイが成功している

## 🚀 次のステップ

404エラーが解決したら：

1. **アプリケーションの動作確認**
   - 認証機能をテスト
   - AI生成機能をテスト
   - 記事管理機能をテスト

2. **パフォーマンスの確認**
   - ページの読み込み速度を確認
   - エラーログを確認

3. **カスタムドメインの設定**（オプション）
   - Vercelダッシュボード > Settings > Domains
   - カスタムドメインを追加

---

**作成日**: 2025年1月27日  
**バージョン**: 1.0

