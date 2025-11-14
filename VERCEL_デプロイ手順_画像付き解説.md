# 🚀 Vercel デプロイ手順（画像付き解説）

## ✅ 準備完了

- GitHubリポジトリ: `https://github.com/neco3bucchan-ship-it/blog-generator`
- コードはGitHubにプッシュ済み

---

## 📋 Vercelデプロイ手順（非エンジニア向け）

### Step 1: Vercelにアクセス

1. ブラウザで新しいタブを開く
2. `https://vercel.com` にアクセス
3. GitHubアカウントでログイン（既にログイン済みの場合はスキップ）

### Step 2: 新しいプロジェクトを作成

1. **Vercelのダッシュボード（ホーム画面）に移動**
   - 左上の「Vercel」ロゴをクリック

2. **「Add New...」ボタンをクリック**
   - ダッシュボードの右上にあります

3. **「Project」を選択**
   - ドロップダウンメニューから選択

### Step 3: GitHubリポジトリを選択

1. **「Import Git Repository」セクションで検索**
   - 検索ボックスに `blog-generator` と入力

2. **「blog-generator」リポジトリを見つける**
   - リポジトリ名の横に「Import」ボタンがあります

3. **「Import」ボタンをクリック**

### Step 4: Root Directory を設定（最重要！）

「Configure Project」画面が表示されます。

#### 4-1: Root Directory セクションを見つける

画面を下にスクロールして「Root Directory」というセクションを探します。

#### 4-2: 「Edit」ボタンをクリック

「Root Directory」の右側に「Edit」ボタンがあります。クリックしてください。

#### 4-3: フォルダ選択画面が表示される

以前見た画面が表示されます：

```
Root Directory
Select the directory where your source code is located...

blog-generator
  ▶ Documents
    ▶ いまにゅClaud AI Cording202507
      ▶ cord4biz AI cording_20250821から
        ▶ Webアプリ開発
```

#### 4-4: フォルダを選択

**重要な操作手順：**

1. **何もクリックせずに、一番上の `blog-generator` の左にある丸（○）をクリック**
   - フォルダを展開する必要はありません
   - `blog-generator` 自体を選択します

2. **画面が次のように変わります：**
   ```
   Root Directory
   
   ● blog-generator  ← 黒い点になる
   ```

3. **画面右下の「Continue」ボタンをクリック**

#### 4-5: Root Directory テキストフィールドを変更

「Continue」をクリックした後、元の「Configure Project」画面に戻ります。

「Root Directory」のテキストフィールドに `./` と表示されているはずです。

**このテキストフィールドを以下のように変更してください：**

1. テキストフィールドをクリック
2. 既存の内容を削除（`./` を削除）
3. `blog-writer-app` と入力
4. テキストフィールドは `blog-writer-app` になります

### Step 5: 環境変数を設定

「Configure Project」画面を下にスクロールして、「Environment Variables」セクションを探します。

#### 5-1: 1つ目の環境変数

1. **Name (名前) のテキストフィールド:**
   ```
   NEXT_PUBLIC_SUPABASE_URL
   ```

2. **Value (値) のテキストフィールド:**
   ```
   あなたのSupabaseプロジェクトURL
   ```
   例: `https://xxxxxxxxxxxxx.supabase.co`

3. **「Add」ボタンをクリック**

#### 5-2: 2つ目の環境変数

1. **Name:**
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Value:**
   ```
   あなたのSupabase匿名キー
   ```
   例: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (長い文字列)

3. **「Add」ボタンをクリック**

#### 5-3: 3つ目の環境変数

1. **Name:**
   ```
   NEXT_PUBLIC_GEMINI_API_KEY
   ```

2. **Value:**
   ```
   あなたのGemini APIキー
   ```
   例: `AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **「Add」ボタンをクリック**

### Step 6: デプロイを実行

1. **画面を一番下までスクロール**

2. **「Deploy」ボタンをクリック**
   - 青い大きなボタンです

3. **ビルドプロセスが開始されます**
   - 画面にビルドログが表示されます
   - 2-5分かかります

### Step 7: デプロイ完了を確認

#### デプロイが成功すると：

1. **「Congratulations!」画面が表示される**
   - 花火のアニメーションが表示されます

2. **URLが表示される**
   - 例: `https://blog-generator-xxxx.vercel.app`

3. **「Visit」ボタンをクリック**
   - またはURLをクリックしてアプリにアクセス

#### デプロイが失敗した場合：

1. **「Build Logs」タブをクリック**
2. **エラーメッセージを確認**
3. **エラー内容をコピーして、AIアシスタント（私）に共有**

---

## 🔍 よくある問題と解決方法

### 問題1: Root Directory の設定がわからない

**解決方法:**
- 「Edit」ボタンをクリック
- 一番上の `blog-generator` の丸（○）をクリック
- 「Continue」をクリック
- テキストフィールドに `blog-writer-app` と入力

### 問題2: 環境変数がわからない

**解決方法:**

環境変数は以下のファイルで確認できます：
- ローカルの `.env.local` ファイル
- Supabaseダッシュボード（Settings > API）
- Google AI Studio（Gemini API）

### 問題3: ビルドエラーが発生する

**よくあるエラー:**
```
npm error ERESOLVE could not resolve
```

**解決方法:**
1. Vercel Settings > Build and Deployment に移動
2. 「Install Command」を `npm install --legacy-peer-deps` に変更
3. 再デプロイ

### 問題4: 404エラーが表示される

**原因:** Root Directory が正しく設定されていない

**解決方法:**
1. Vercel Settings > Build and Deployment に移動
2. 「Root Directory」を `blog-writer-app` に設定
3. 再デプロイ

---

## ✅ 成功のチェックリスト

デプロイ前に確認：
- [ ] GitHubリポジトリにコードがプッシュされている
- [ ] Root Directory を `blog-writer-app` に設定した
- [ ] 環境変数を3つすべて設定した
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `NEXT_PUBLIC_GEMINI_API_KEY`
- [ ] 「Deploy」ボタンをクリックした

デプロイ後に確認：
- [ ] ビルドが成功した（「Congratulations!」が表示される）
- [ ] URLにアクセスできる
- [ ] ランディングページが表示される
- [ ] ログインページにアクセスできる

---

## 💡 環境変数の確認方法

### Supabase URL と ANON KEY

1. https://supabase.com にアクセス
2. プロジェクトを選択
3. 左サイドバー「Settings」→「API」をクリック
4. 「Project URL」が `NEXT_PUBLIC_SUPABASE_URL`
5. 「anon public」キーが `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Gemini API Key

1. https://aistudio.google.com/app/apikey にアクセス
2. 「Create API Key」をクリック（既に作成済みの場合は表示される）
3. APIキーをコピー

---

## 🎉 デプロイ成功後

アプリケーションが公開されました！

**次にできること:**
1. URLをブックマーク
2. 友人とURLを共有
3. カスタムドメインを設定（オプション）
4. Vercel Analyticsで訪問者を確認

---

**作成日**: 2025年1月27日  
**バージョン**: 1.0

