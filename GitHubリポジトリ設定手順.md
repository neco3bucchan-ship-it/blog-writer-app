# GitHubリポジトリ設定手順

## 現在の状況

Gitリポジトリはローカルに存在しますが、GitHubリモートリポジトリが設定されていません。

## 🔍 確認

既にGitHubにリポジトリがあるか確認してください：
- https://github.com にアクセス
- 「blog-generator」という名前のリポジトリがあるか確認

## 📋 設定手順

### ケース1: 既にGitHubリポジトリがある場合

1. GitHubでリポジトリURLを確認
   - 例: `https://github.com/あなたのユーザー名/blog-generator.git`

2. リモートリポジトリを設定

```bash
git remote add origin https://github.com/あなたのユーザー名/blog-generator.git
```

3. プッシュ

```bash
git push -u origin master
```

### ケース2: GitHubリポジトリがまだない場合

#### Step 1: GitHubでリポジトリを作成

1. https://github.com にアクセス
2. 「New repository」ボタンをクリック
3. リポジトリ名: `blog-generator`
4. 説明: `Blog Writer Application with AI`
5. Public または Private を選択
6. **「Initialize this repository with a README」のチェックを外す**（重要！）
7. 「Create repository」をクリック

#### Step 2: リモートリポジトリを設定

GitHubが表示するコマンドに従う：

```bash
git remote add origin https://github.com/あなたのユーザー名/blog-generator.git
git branch -M master
git push -u origin master
```

## ⚠️ 重要な注意点

### .envファイルが含まれないようにする

GitHubにプッシュする前に、`.gitignore` が正しく設定されているか確認：

```bash
cat .gitignore | grep ".env"
```

`.env*` が含まれていることを確認してください。

### 環境変数の扱い

- `.env.local` ファイルはGitHubにプッシュしない
- Vercelで環境変数を直接設定する
- 環境変数の値をGitHubに公開しない

## 🚀 次のステップ

GitHubにプッシュした後：

1. Vercelでプロジェクトを作成
2. GitHubリポジトリを選択
3. Root Directory を `blog-writer-app` に設定
4. 環境変数を設定
5. デプロイ

---

**作成日**: 2025年1月27日

