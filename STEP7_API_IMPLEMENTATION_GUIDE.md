# 🛠️ Step 7: 記事CRUD API実装ガイド

## 🎯 目的

記事データをSupabaseデータベースとやり取りするためのAPIを整備し、フロントエンドからはAPI経由で操作するように変更しました。これにより、クライアントから直接データベースへアクセスするのではなく、Next.jsのAPIルートで安全に処理できるようになります。

---

## ✅ 実装内容

### 1. APIルートの整備

| HTTPメソッド | エンドポイント | 説明 |
|--------------|-----------------|------|
| `POST` | `/api/articles` | 新しい記事を作成します |
| `GET` | `/api/articles` | 記事一覧を取得します |
| `GET` | `/api/articles/:id` | 記事の詳細とセクションを取得します |
| `PUT` | `/api/articles/:id` | 記事情報とセクションを更新します |
| `DELETE` | `/api/articles/:id` | 記事を削除します |
| `PUT` | `/api/articles/:id/sections/:sectionId` | セクションの内容を更新します |
| `DELETE` | `/api/articles/:id/sections/:sectionId` | セクションを削除します |

- すべてのエンドポイントで、リクエストヘッダーに`Authorization: Bearer <アクセストークン>`が必要です
- RLS（Row Level Security）により、ログイン中のユーザー自身のデータのみ操作できます

### 2. 共通処理

- `lib/auth-helpers.ts`にサーバーサイド用Supabaseクライアントと認証ヘルパーを集約
- APIルートではヘルパーを利用して認証とエラーレスポンスを統一

### 3. クライアント側（`lib/article-service.ts`）の更新

- Supabaseクライアントから直接アクセスする方式を廃止
- `fetch('/api/articles', { headers: { Authorization: 'Bearer ...' }})`形式でAPIルートを呼び出すよう変更
- 取得・作成・更新・削除など、既存の関数インターフェースは維持

---

## 🔍 動作確認手順

1. **開発サーバーを起動**
   ```powershell
   cd blog-writer-app
   npm run dev
   ```

2. **ブラウザでログイン**
   - `http://localhost:3000/auth/simple-login` にアクセス
   - Supabaseで作成したユーザーでログイン

3. **記事操作の確認**
   - `http://localhost:3000/theme-input` から記事作成を実行
   - `http://localhost:3000/articles` で一覧の表示・削除を確認
   - 記事詳細画面でセクションを編集し、自動保存が反映されることを確認

4. **Supabase Dashboardでデータを確認**
   - Table Editorで`articles`、`article_sections`テーブルを開き、データが更新されているか確認

---

## 🧪 API単体テスト（任意）

アクセストークンが必要ですが、以下は`curl`での例です。

```bash
# 記事一覧取得（<TOKEN>は実際のアクセストークンに置き換え）
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/articles
```

---

## 📝 メモ

- エラーレスポンスは `{ success: false, error: 'メッセージ' }` 形式で統一しています
- 成功レスポンスは `{ success: true, ... }` 形式で、既存のUIに必要なフィールドだけを返却
- フロントエンドの処理はすべてAPI経由となるため、将来的に外部クライアントからのアクセスを追加する場合も柔軟に対応できます

---

これでStep 7の実装が完了です。次のステップでは、自動保存機能の改善やUIとのさらなる統合を進めてください。
