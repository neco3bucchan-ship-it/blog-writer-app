# 🔧 セクション順序の修正レポート

## 問題の概要

執筆画面で、セクション1が5番目に表示されるなど、セクションの順序が正しく表示されない問題がありました。

## 問題の原因

### データベースからの取得順序

PostgreSQL（Supabase）からデータを取得する際、明示的にソート順を指定しないと、順序が保証されません。

**問題のコード**:
```typescript
const { data: article } = await supabase
  .from('articles')
  .select(`
    id,
    title,
    article_sections (
      id,
      section_number,
      title,
      content
    )
  `)
  .eq('id', id)
  .single()

// article.article_sections の順序が不定
// → section_number: 5, 4, 3, 2, 1 のような順序になることがある
```

### なぜこうなったか

1. **データベースの特性**
   - PostgreSQLは、`ORDER BY`句がない場合、行の順序を保証しない
   - 内部的な格納順序や、インデックスの順序で返される可能性がある

2. **外部テーブルのソート**
   - Supabaseの`.order()`は主テーブルのみに適用される
   - 外部テーブル（`article_sections`）の順序は指定が複雑

3. **フロントエンドでのソート不足**
   - APIから受け取ったデータをそのまま使用していた
   - セクション番号でソートする処理がなかった

## 修正内容

### API側でセクションをソート

記事詳細取得API（`/api/articles/[id]`）で、セクションを`section_number`でソートしてから返すようにしました。

```typescript:blog-writer-app/app/api/articles/[id]/route.ts
// セクションをsection_numberでソート
const sortedSections = article.article_sections
  ? [...article.article_sections].sort((a: any, b: any) => a.section_number - b.section_number)
  : []

return NextResponse.json({
  success: true,
  article: {
    id: article.id,
    title: article.title,
    // ...
    outline: sortedSections.map((section: any) => ({
      id: section.id,
      section: section.section_number,
      title: section.title,
      description: section.description,
      content: section.content,
      wordCount: section.word_count,
      isCompleted: section.is_completed
    }))
  }
})
```

### 修正箇所

1. **`app/api/articles/[id]/route.ts`** - GET メソッド
   - セクションを`section_number`で昇順ソート
   - ソートされたセクションをレスポンスに含める

## 修正後の動作

### 執筆画面

1. **セクション順序**
   - セクション1が1番目に表示される
   - セクション2が2番目に表示される
   - ...という正しい順序で表示される

2. **ナビゲーション**
   - 「前のセクション」「次のセクション」ボタンが正しく機能
   - セクション番号の表示が正しい（例：「1 / 5」）

### 記事一覧画面

- 進捗率の計算は順序に依存しないため、影響なし

## テスト手順

### 1. 既存記事の確認

1. 記事一覧（`/articles`）で既存の記事を開く
2. 「続きから執筆」をクリック
3. セクション番号が正しく表示されることを確認
   - 左下の「1 / 5」などの表示
   - セクションタイトルの「1. ○○」などの番号

### 2. セクション切り替え

1. 「次のセクション」をクリック
2. 次のセクションに移動することを確認
3. 「前のセクション」をクリック
4. 前のセクションに戻ることを確認

### 3. 新規記事作成

1. 新規記事を作成
2. AI生成後、セクション順序が正しいことを確認
3. 記事を保存して再度開く
4. セクション順序が保持されていることを確認

### 4. ページリロード

1. 執筆画面でページをリロード（`F5`）
2. セクション順序が変わらないことを確認

## 技術的な詳細

### ソート方法

```typescript
// 配列のコピーを作成してソート（元の配列を変更しない）
const sortedSections = [...article.article_sections].sort((a, b) => 
  a.section_number - b.section_number
)
```

- **昇順ソート**: `section_number`が小さい順（1, 2, 3, ...）
- **安全なソート**: 元の配列を変更せず、コピーをソート
- **数値比較**: `a - b`で数値として比較

### なぜAPI側でソートするか

1. **一貫性**: どのクライアントから呼ばれても同じ順序
2. **パフォーマンス**: サーバー側で1回ソートすれば、クライアント側で不要
3. **信頼性**: データの正確性をサーバー側で保証

### Supabaseのソート制限

Supabaseの`.order()`で外部テーブルをソートする方法:
```typescript
.order('section_number', { foreignTable: 'article_sections', ascending: true })
```

しかし、これは以下の問題があるため、JavaScript側でソートする方が確実:
- 複雑な設定が必要
- バージョンによって動作が異なる可能性
- ドキュメントが不十分

## 影響範囲

### 修正したファイル

- `blog-writer-app/app/api/articles/[id]/route.ts`
  - GET メソッドでセクションのソート処理を追加

### 影響を受ける機能

- ✅ 記事詳細表示（執筆画面）
- ✅ セクション切り替え
- ✅ セクション番号表示

### 影響を受けない機能

- 記事一覧表示
- 記事作成
- 記事削除
- 自動保存機能

## 今後の改善案

### 優先度：低

1. **データベース側でのソート保証**
   - マイグレーションでインデックスを追加
   - `CREATE INDEX idx_sections_order ON article_sections(article_id, section_number)`
   - ただし、アプリケーション側でのソートで十分

2. **セクション番号の自動採番**
   - 現在は手動で`section_number`を指定
   - トリガーで自動採番すると、番号の重複を防げる

---

**修正日**: 2025年11月13日  
**バージョン**: 1.1  
**ステータス**: ✅ 完了

