# 🔍 Vercelデプロイ確認手順

## 現在の状況

Vercelにデプロイは成功していますが、404エラーが発生しています。
URL: `https://blog-generator-umber.vercel.app`

## 問題の原因

**Root Directoryの設定が不足しています。**

リポジトリの構造：
```
blog-generator/          ← GitHubリポジトリのルート
└── blog-writer-app/     ← Next.jsアプリケーション（ここがルート）
    ├── app/
    ├── components/
    ├── package.json
    └── ...
```

Vercelはデフォルトでリポジトリのルート（`blog-generator`）を探しますが、実際のNext.jsアプリケーションは`blog-writer-app`フォルダ内にあります。

## ✅ 修正方法

### 方法1: Vercelダッシュボードで設定（推奨）

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com にログイン
   - プロジェクト「blog-generator」を選択

2. **Settings > General を開く**
   - 左側のメニューから「Settings」をクリック
   - 「General」タブを選択

3. **Root Directoryを設定**
   - ページを下にスクロール
   - 「Root Directory」セクションを見つける
   - 「Edit」ボタンをクリック
   - テキストボックスに `blog-writer-app` を入力
   - 「Save」をクリック

4. **再デプロイ**
   - 設定を保存すると、自動的に再デプロイが開始されます
   - デプロイが完了するまで待機（通常2-5分）

5. **動作確認**
   - デプロイが完了したら、URLにアクセス
   - ランディングページが表示されることを確認

### 方法2: プロジェクトを再インポート

1. **既存のプロジェクトを削除**（オプション）
   - Vercelダッシュボードでプロジェクトを削除

2. **新しいプロジェクトを作成**
   - 「Add New...」→「Project」をクリック
   - GitHubリポジトリを選択

3. **プロジェクト設定**
   - **Framework Preset**: Next.js（自動検出）
   - **Root Directory**: `blog-writer-app` ← **重要！**
   - **Build Command**: `npm run build`（デフォルト）
   - **Output Directory**: `.next`（デフォルト）
   - **Install Command**: `npm install`（デフォルト）

4. **環境変数の設定**
   - 「Environment Variables」セクションで以下を追加：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_GEMINI_API_KEY`
   - すべての環境（Production、Preview、Development）に適用

5. **デプロイの実行**
   - 「Deploy」ボタンをクリック

## 🔍 確認事項

### デプロイが成功したか確認

1. **Vercelダッシュボードで確認**
   - 「Deployments」タブを開く
   - 最新のデプロイのステータスが「Ready」になっているか確認
   - ビルドログにエラーがないか確認

2. **URLにアクセス**
   - `https://blog-generator-umber.vercel.app` にアクセス
   - ランディングページが表示されることを確認

### 環境変数の確認

1. **Vercelダッシュボード > Settings > Environment Variables**
   - 以下の環境変数が設定されているか確認：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_GEMINI_API_KEY`

2. **すべての環境に適用されているか確認**
   - Production
   - Preview
   - Development

### ビルドログの確認

1. **Vercelダッシュボード > Deployments > 最新のデプロイ**
   - 「Build Logs」をクリック
   - エラーメッセージがないか確認
   - ビルドが成功しているか確認

## ⚠️ よくある問題

### 問題1: Root Directoryを設定しても404エラーが続く

**解決方法:**
1. 設定を保存した後、必ず再デプロイを実行
2. ブラウザのキャッシュをクリア（Ctrl+Shift+R）
3. ビルドログを確認してエラーがないか確認

### 問題2: ビルドエラーが発生する

**解決方法:**
1. ビルドログを確認
2. エラーメッセージに従って修正
3. ローカルで`npm run build`を実行してエラーを確認

### 問題3: 環境変数が読み込まれない

**解決方法:**
1. 環境変数が正しく設定されているか確認
2. すべての環境（Production、Preview、Development）に設定されているか確認
3. 環境変数名が`NEXT_PUBLIC_`で始まっているか確認
4. 再デプロイを実行

## 📝 チェックリスト

修正が完了したら、以下を確認：

- [ ] VercelダッシュボードでRoot Directoryが`blog-writer-app`に設定されている
- [ ] 再デプロイが完了している
- [ ] ビルドログにエラーがない
- [ ] URLにアクセスしてランディングページが表示される
- [ ] 環境変数がすべて設定されている
- [ ] 認証機能が動作する
- [ ] AI生成機能が動作する

## 🚀 次のステップ

404エラーが解決したら：

1. **アプリケーションの動作確認**
   - 各ページが正常に表示されるか確認
   - 認証機能をテスト
   - AI生成機能をテスト

2. **パフォーマンスの確認**
   - ページの読み込み速度を確認
   - エラーログを確認

3. **カスタムドメインの設定**（オプション）
   - Vercelダッシュボード > Settings > Domains
   - カスタムドメインを追加

---

**作成日**: 2025年1月27日  
**バージョン**: 1.0

