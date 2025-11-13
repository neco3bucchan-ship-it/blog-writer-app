# 🔧 Supabase接続エラー修正ガイド

## ❌ 発生しているエラー

### エラー1: `TypeError: Failed to fetch`
### エラー2: `AuthRetryableFetchError: Failed to fetch`

**原因**: `.env.local`ファイルが存在しない、または正しく設定されていないため、Supabaseへの接続ができません。

---

## 🛠️ 修正手順

### Step 1: `.env.local`ファイルの作成

1. **VS Codeで`blog-writer-app`フォルダを開く**

2. **新しいファイルを作成**
   - ファイル名: `.env.local`
   - **重要**: ファイル名の最初にドット（`.`）が必要です

3. **ファイルが見えない場合**
   - VS Codeのエクスプローラーで「表示」→「隠しファイルを表示」にチェック

### Step 2: Supabase Dashboardから設定値を取得

1. **[Supabase Dashboard](https://supabase.com/dashboard)にアクセス**
   - ログインしていない場合は、GitHubアカウントでログイン

2. **プロジェクトを選択**
   - 既存のプロジェクトがある場合は選択
   - ない場合は新規プロジェクトを作成

3. **Settings > API を開く**

4. **以下の値をコピー**
   - **Project URL** → これは `NEXT_PUBLIC_SUPABASE_URL` に設定します
   - **anon public** → これは `NEXT_PUBLIC_SUPABASE_ANON_KEY` に設定します

### Step 3: `.env.local`ファイルに設定を記述

`.env.local`ファイルに以下の内容を記述してください（実際の値に置き換えてください）:

```env
# Supabase settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**例**（実際の値に置き換えてください）:
```env
# Supabase settings
NEXT_PUBLIC_SUPABASE_URL=https://vzvcuttanmzsrvhkqofc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dmN1dHRhbm16c3J2aGtxb2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk5OTk5OTksImV4cCI6MjAxNTc3NTk5OX0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 4: ファイルの保存

1. **ファイルを保存**（`Ctrl + S`）
2. **文字コードを確認**: UTF-8で保存されていることを確認
3. **ファイル名を確認**: `.env.local`（ドットで始まる）

### Step 5: 開発サーバーの再起動

**重要**: 環境変数を変更した後は、必ず開発サーバーを再起動してください。

1. **現在のサーバーを停止**
   - ターミナルで `Ctrl + C` を押す

2. **サーバーを再起動**
   ```powershell
   cd blog-writer-app
   npm run dev
   ```

3. **ブラウザをリロード**
   - `Ctrl + Shift + R` でハードリロード
   - または、ブラウザを閉じて再度開く

---

## ✅ 動作確認

1. **ブラウザで `http://localhost:3000` にアクセス**

2. **ログインまたは新規登録を試す**
   - エラーメッセージが表示されないことを確認
   - 正常にログイン/登録できることを確認

3. **ブラウザのコンソールを確認**（F12）
   - エラーメッセージがないことを確認

---

## 🔍 トラブルシューティング

### 問題1: まだエラーが表示される

**確認事項**:
- [ ] `.env.local`ファイルが正しい場所にあるか（`blog-writer-app/.env.local`）
- [ ] ファイル名が正しいか（`.env.local`、ドットで始まる）
- [ ] サーバーを再起動したか
- [ ] ブラウザをリロードしたか

**解決方法**:
1. サーバーを完全に停止（`Ctrl + C`）
2. ターミナルを閉じて再度開く
3. `cd blog-writer-app` で移動
4. `npm run dev` で再起動

### 問題2: Supabaseプロジェクトがない

**解決方法**:
1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. 「New Project」をクリック
3. プロジェクト名とデータベースパスワードを設定
4. リージョンを選択（推奨: Northeast Asia (Tokyo)）
5. プロジェクトを作成（2-3分かかります）
6. Settings > API から設定値を取得

### 問題3: ファイルが見つからない

**Windowsエクスプローラーで作成する場合**:
1. `blog-writer-app`フォルダを開く
2. 新規テキストファイルを作成
3. ファイル名を `.env.local` に変更（ドットで始まる）
4. 警告が表示されたら「はい」をクリック

**VS Codeで作成する場合**:
1. VS Codeで`blog-writer-app`フォルダを開く
2. エクスプローラーで右クリック → 「新しいファイル」
3. ファイル名を `.env.local` と入力

---

## 📚 参考ドキュメント

- **Supabase接続確認レポート**: `SUPABASE_CONNECTION_CHECK.md`
- **Supabase設定手順書**: `Docs/05_Supabase設定手順書.md`
- **簡単Supabase認証機能実装手順書**: `Docs/08_簡単Supabase認証機能実装手順書.md`

---

## 🎯 次のステップ

`.env.local`ファイルを設定してサーバーを再起動したら:
1. ✅ ログイン機能が動作する
2. ✅ 新規登録機能が動作する
3. ✅ データベースへの保存が可能になる

---

**修正完了後**: エラーが解消され、正常にログイン/登録できるようになります。


