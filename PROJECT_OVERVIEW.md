# 📚 Blog Writer プロジェクト概要

このドキュメントでは、Blog Writerアプリケーションの完全な構造と理解をまとめています。

## 🎯 プロジェクト概要

**Blog Writer**は、AIを活用したブログ記事執筆支援Webアプリケーションです。

### 主な機能
1. **認証機能**: Supabaseを使用したユーザー認証
2. **記事管理**: 記事の作成・編集・削除・一覧表示
3. **AI生成機能**: Google Gemini APIを使用したコンテンツ生成
   - 見出し生成
   - アウトライン生成
   - セクションコンテンツ生成
4. **自動保存**: 執筆内容の自動保存機能

## 🏗️ 技術スタック

### フロントエンド
- **Next.js 15.2.4**: Reactフレームワーク（App Router）
- **TypeScript**: 型安全性
- **Tailwind CSS 4.x**: スタイリング
- **shadcn/ui**: UIコンポーネントライブラリ
- **React 19**: UIライブラリ

### バックエンド・サービス
- **Supabase**: データベース・認証サービス
- **Google Gemini API**: AIコンテンツ生成
- **Next.js API Routes**: サーバーサイドAPI

### 開発ツール
- **Vercel Analytics**: アナリティクス
- **next-themes**: テーマ管理（ダークモード対応）

## 📁 プロジェクト構造

```
blog-writer-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── ai/                   # AI生成API
│   │   │   ├── generate-headings/
│   │   │   ├── generate-outline/
│   │   │   ├── generate-content/
│   │   │   └── generate-section-content/
│   │   └── articles/             # 記事管理API
│   │       ├── [id]/
│   │       └── route.ts
│   ├── auth/                     # 認証ページ
│   │   ├── simple-login/
│   │   └── simple-signup/
│   ├── articles/                 # 記事一覧ページ
│   ├── theme-input/              # テーマ入力ページ
│   ├── heading-selection/        # 見出し選択ページ
│   ├── outline-editing/          # アウトライン編集ページ
│   ├── writing/                  # 記事執筆ページ
│   ├── layout.tsx                # ルートレイアウト
│   ├── page.tsx                  # ランディングページ
│   └── globals.css               # グローバルスタイル
├── components/                    # Reactコンポーネント
│   ├── ui/                       # shadcn/uiコンポーネント
│   ├── Header.tsx                # ヘッダーコンポーネント
│   ├── Footer.tsx                # フッターコンポーネント
│   └── ...
├── contexts/                      # React Context
│   └── SimpleSupabaseAuthContext.tsx
├── lib/                           # ライブラリ・ユーティリティ
│   ├── supabase.ts              # Supabaseクライアント
│   ├── gemini.ts                 # Gemini API連携
│   ├── article-service.ts        # 記事サービス
│   └── auth-helpers.ts           # 認証ヘルパー
├── hooks/                         # カスタムフック
│   └── useAutoSave.ts            # 自動保存フック
├── supabase/                      # Supabase設定
│   └── migrations/               # データベースマイグレーション
├── public/                        # 静的ファイル
├── package.json                   # 依存関係
├── next.config.mjs                # Next.js設定
├── tsconfig.json                  # TypeScript設定
└── vercel.json                    # Vercel設定
```

## 🔑 環境変数

### 必要な環境変数

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini API設定
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

### 環境変数の説明

- **NEXT_PUBLIC_SUPABASE_URL**: SupabaseプロジェクトのURL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Supabaseの匿名キー（公開可能）
- **NEXT_PUBLIC_GEMINI_API_KEY**: Google Gemini APIキー（公開可能）

**注意**: `NEXT_PUBLIC_`プレフィックスが付いている環境変数は、クライアントサイドで使用可能です。

## 🗄️ データベース構造

### Supabaseテーブル

#### 1. profiles（ユーザープロファイル）
```sql
- id: UUID (主キー, auth.users参照)
- email: TEXT
- display_name: TEXT
- avatar_url: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 2. articles（記事）
```sql
- id: UUID (主キー)
- user_id: UUID (profiles参照)
- title: TEXT
- theme: TEXT
- target_audience: TEXT ('beginner' | 'intermediate' | 'advanced')
- heading: TEXT
- status: TEXT ('draft' | 'published' | 'archived')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 3. article_sections（記事セクション）
```sql
- id: UUID (主キー)
- article_id: UUID (articles参照)
- section_number: INTEGER
- title: TEXT
- description: TEXT
- content: TEXT
- word_count: INTEGER
- is_completed: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Row Level Security (RLS)

すべてのテーブルでRLSが有効になっており、ユーザーは自分のデータのみアクセス可能です。

## 🔄 データフロー

### 記事執筆フロー

1. **テーマ入力** (`/theme-input`)
   - ユーザーがテーマとターゲット読者を入力
   - AIが見出し候補を生成

2. **見出し選択** (`/heading-selection`)
   - 生成された見出しから選択
   - 選択した見出しでアウトライン生成

3. **アウトライン編集** (`/outline-editing`)
   - 生成されたアウトラインを編集
   - 記事を作成してデータベースに保存

4. **記事執筆** (`/writing`)
   - セクションごとにコンテンツを執筆
   - AI生成機能でセクションコンテンツを生成
   - 自動保存機能で定期的に保存

## 🔌 APIエンドポイント

### AI生成API

#### POST `/api/ai/generate-headings`
見出し候補を生成

**リクエスト:**
```json
{
  "theme": "React.jsの基礎",
  "targetAudience": "beginner"
}
```

**レスポンス:**
```json
{
  "headings": [
    {
      "id": "1",
      "title": "見出しタイトル",
      "description": "見出しの説明"
    }
  ]
}
```

#### POST `/api/ai/generate-outline`
アウトラインを生成

**リクエスト:**
```json
{
  "heading": "見出しタイトル",
  "targetAudience": "beginner"
}
```

**レスポンス:**
```json
{
  "outline": [
    {
      "id": "1",
      "section": 1,
      "title": "セクションタイトル",
      "description": "セクションの説明"
    }
  ]
}
```

#### POST `/api/ai/generate-section-content`
セクションコンテンツを生成

**リクエスト:**
```json
{
  "sectionTitle": "セクションタイトル",
  "sectionDescription": "セクションの説明",
  "theme": "テーマ",
  "targetAudience": "beginner",
  "heading": "見出し"
}
```

**レスポンス:**
```json
{
  "content": "生成されたMarkdownコンテンツ"
}
```

### 記事管理API

#### GET `/api/articles`
記事一覧を取得

**レスポンス:**
```json
{
  "success": true,
  "articles": [
    {
      "id": "uuid",
      "title": "記事タイトル",
      "theme": "テーマ",
      "targetAudience": "beginner",
      "heading": "見出し",
      "status": "draft",
      "progress": 50,
      "createdAt": "2025-01-27T00:00:00Z",
      "updatedAt": "2025-01-27T00:00:00Z"
    }
  ]
}
```

#### POST `/api/articles`
記事を作成

**リクエスト:**
```json
{
  "title": "記事タイトル",
  "theme": "テーマ",
  "targetAudience": "beginner",
  "heading": "見出し",
  "outline": [...]
}
```

#### PUT `/api/articles/[id]`
記事を更新

#### DELETE `/api/articles/[id]`
記事を削除

#### PUT `/api/articles/[id]/sections/[sectionId]`
記事セクションを更新

## 🔐 認証フロー

### Supabase認証

1. **サインアップ** (`/auth/simple-signup`)
   - メールアドレスとパスワードで登録
   - Supabase Authでユーザー作成
   - プロファイルテーブルに自動的にレコード作成

2. **ログイン** (`/auth/simple-login`)
   - メールアドレスとパスワードでログイン
   - セッションを取得

3. **認証状態管理**
   - `SimpleSupabaseAuthContext`で認証状態を管理
   - セッション変更を監視
   - 認証が必要なページは`SimpleSupabaseAuthGuard`で保護

## 🎨 UIコンポーネント

### shadcn/uiコンポーネント

プロジェクトでは、shadcn/uiのコンポーネントを使用しています：

- Button
- Card
- Input
- Textarea
- Dialog
- Toast
- その他多数

### カスタムコンポーネント

- `SimpleSupabaseHeader`: 認証状態に応じたヘッダー
- `SimpleSupabaseAuthGuard`: 認証保護コンポーネント
- `AutoSaveIndicator`: 自動保存状態表示

## 🚀 デプロイ

### Vercelデプロイ

詳細は `VERCEL_DEPLOY.md` を参照してください。

### デプロイ前の確認事項

1. ✅ ローカルでビルドが成功する
2. ✅ 環境変数が準備されている
3. ✅ Supabaseプロジェクトが設定されている
4. ✅ Gemini APIキーが取得されている

## 📝 開発ガイド

### 開発サーバーの起動

```bash
cd blog-writer-app
npm install
npm run dev
```

### ビルド

```bash
npm run build
npm start
```

### 型チェック

```bash
npm run lint
```

## 🔍 トラブルシューティング

### よくある問題

1. **環境変数が読み込まれない**
   - `.env.local`ファイルが正しい場所にあるか確認
   - 環境変数名が`NEXT_PUBLIC_`で始まっているか確認

2. **Supabase接続エラー**
   - SupabaseプロジェクトのURLとキーが正しいか確認
   - RLSポリシーが正しく設定されているか確認

3. **Gemini APIエラー**
   - APIキーが有効か確認
   - APIの使用制限に達していないか確認

## 📚 参考ドキュメント

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**作成日**: 2025年1月27日  
**バージョン**: 1.0

