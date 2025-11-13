# 🚀 Step 3: データベーススキーマ実装 - 実行ガイド

## 📋 概要

このガイドでは、Supabase Dashboardでデータベーステーブルを作成する手順を説明します。

**所要時間**: 20-30分

---

## 🎯 実装手順

### Step 1: Supabase Dashboardにアクセス

1. **ブラウザでSupabase Dashboardを開く**
   - [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
   - ログインしていない場合は、GitHubアカウントでログイン

2. **プロジェクトを選択**
   - 作成済みのプロジェクトを選択
   - プロジェクトダッシュボードが表示されます

### Step 2: SQL Editorを開く

1. **左サイドバーから「SQL Editor」をクリック**
   - 画面左側のメニューから「SQL Editor」を選択

2. **「New query」をクリック**
   - 画面右上の「New query」ボタンをクリック
   - 新しいSQLクエリエディタが開きます

### Step 3: SQLファイルを開く

1. **プロジェクトフォルダを開く**
   - VS Codeで `blog-writer-app` フォルダを開く
   - `supabase/migrations/001_create_tables.sql` ファイルを開く

2. **SQLの内容をコピー**
   - ファイル全体を選択（`Ctrl + A`）
   - コピー（`Ctrl + C`）

### Step 4: SQLを実行

1. **Supabase DashboardのSQL Editorに貼り付け**
   - コピーしたSQLをSQL Editorに貼り付け（`Ctrl + V`）

2. **SQLを実行**
   - 画面右下の「Run」ボタンをクリック
   - または、`Ctrl + Enter` を押す

3. **実行結果を確認**
   - 画面下部に実行結果が表示されます
   - 「Success. No rows returned」と表示されれば成功です
   - エラーメッセージが表示された場合は、内容を確認してください

### Step 5: テーブルの確認

1. **Table Editorを開く**
   - 左サイドバーから「Table Editor」をクリック

2. **作成されたテーブルを確認**
   - 以下のテーブルが表示されることを確認：
     - ✅ `profiles`
     - ✅ `articles`
     - ✅ `article_sections`

3. **テーブル構造を確認**
   - 各テーブルをクリックして、カラムが正しく作成されているか確認

### Step 6: RLS設定の確認

1. **Authentication > Policies を確認**
   - 左サイドバーから「Authentication」をクリック
   - 「Policies」タブをクリック
   - 各テーブルのポリシーが表示されることを確認

2. **または、SQL Editorで確認**
   - 以下のSQLを実行して、RLSが有効になっているか確認：

```sql
-- RLS設定の確認
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'articles', 'article_sections');
```

**期待される結果:**
- `rowsecurity` が `true` になっていることを確認

---

## ✅ 確認チェックリスト

### テーブル作成の確認
- [ ] `profiles`テーブルが作成された
- [ ] `articles`テーブルが作成された
- [ ] `article_sections`テーブルが作成された
- [ ] 各テーブルのカラムが正しく設定されている

### トリガーの確認
- [ ] `handle_new_user`関数が作成された
- [ ] `update_updated_at_column`関数が作成された
- [ ] 各テーブルの`updated_at`トリガーが作成された

### RLS設定の確認
- [ ] `profiles`テーブルでRLSが有効になった
- [ ] `articles`テーブルでRLSが有効になった
- [ ] `article_sections`テーブルでRLSが有効になった
- [ ] 各テーブルのポリシーが作成された

---

## 🔧 トラブルシューティング

### 問題1: SQL実行時にエラーが発生する

**エラーメッセージ例:**
```
ERROR: relation "profiles" already exists
```

**原因**: テーブルが既に存在している

**解決方法:**
1. 既存のテーブルを削除する（開発環境の場合）
2. または、`CREATE TABLE IF NOT EXISTS`を使用しているため、エラーを無視して続行

**テーブルを削除する場合:**
```sql
-- 注意: このSQLは既存のデータをすべて削除します
DROP TABLE IF EXISTS article_sections CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
```

### 問題2: トリガーが作成できない

**エラーメッセージ例:**
```
ERROR: permission denied for function handle_new_user
```

**原因**: 権限不足

**解決方法:**
1. `SECURITY DEFINER`が設定されているか確認
2. Supabase Dashboardで管理者権限で実行しているか確認

### 問題3: RLSポリシーが動作しない

**原因**: ポリシーの設定ミス、認証状態の問題

**解決方法:**
1. ポリシーの構文を確認
2. 認証状態を確認（ログインしているか）
3. テストユーザーで動作確認

**テスト用SQL:**
```sql
-- 現在のユーザーIDを確認
SELECT auth.uid();

-- 自分のプロファイルを確認
SELECT * FROM profiles WHERE id = auth.uid();
```

### 問題4: 外部キー制約エラー

**エラーメッセージ例:**
```
ERROR: insert or update on table "articles" violates foreign key constraint
```

**原因**: 参照先のテーブルやデータが存在しない

**解決方法:**
1. `profiles`テーブルが先に作成されているか確認
2. ユーザーがログインしてプロファイルが作成されているか確認

---

## 📝 次のステップ

Step 3が完了したら、以下のステップに進みます：

### Step 7: 記事CRUD APIの実装

**実装内容:**
- 記事作成API
- 記事取得API
- 記事更新API
- 記事削除API
- 記事セクションAPI

### Step 8: 自動保存機能の実装

**実装内容:**
- 自動保存フックの改善
- 執筆画面への統合

### Step 9: 既存UIとの統合

**実装内容:**
- 記事一覧画面の更新
- 執筆画面の更新

---

## 🎉 完了確認

すべてのチェックリスト項目にチェックが入ったら、Step 3は完了です！

**次のステップ**: Step 7（記事CRUD APIの実装）に進みます。

---

**作成日**: 2025年1月27日  
**バージョン**: 1.0  
**所要時間**: 20-30分

