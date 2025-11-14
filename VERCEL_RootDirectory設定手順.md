# 📍 Vercel Root Directory設定の場所

## 現在の状況

「General」タブには「Root Directory」の設定が表示されていません。
これは、Vercelの設定によって「Root Directory」が別の場所にあるためです。

## ✅ 正しい場所

「Root Directory」は **「Build and Deployment」** タブにあります。

## 🔍 設定手順（詳細）

### Step 1: 「Build and Deployment」タブを開く

1. **左サイドバーを確認**
   - 現在「General」が選択されている状態です
   - 左サイドバーの一覧を確認してください

2. **「Build and Deployment」をクリック**
   - 左サイドバーの「Build and Deployment」をクリック
   - または、左サイドバーの上部にある「Build and Deployment」を探してクリック

### Step 2: Root Directoryを設定

「Build and Deployment」ページを開くと、以下のような設定項目が表示されます：

1. **「Root Directory」セクションを探す**
   - ページの上部または中央付近に「Root Directory」というセクションがあります
   - 「Edit」ボタンまたは入力フィールドがあります

2. **Root Directoryを入力**
   - テキストボックスに `blog-writer-app` を入力
   - または「Edit」ボタンをクリックして編集モードにする

3. **保存**
   - 「Save」ボタンをクリック
   - または、変更を保存するボタンをクリック

### Step 3: 再デプロイ

1. **自動再デプロイ**
   - 設定を保存すると、自動的に再デプロイが開始される場合があります

2. **手動再デプロイ**
   - 自動再デプロイが開始されない場合は：
     - 上部のナビゲーションバーから「Deployments」タブをクリック
     - 最新のデプロイの右側にある「⋯」（三点リーダー）をクリック
     - 「Redeploy」を選択

## 📸 確認方法

「Build and Deployment」ページで確認できる項目：

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` または空白
- **Install Command**: `npm install`
- **Root Directory**: `blog-writer-app` ← **ここを設定！**

## 🔄 代替方法：Generalタブで確認

もしまだ「General」タブにいる場合：

1. **ページを下にスクロール**
   - 「Root Directory」がページの下部にある可能性があります
   - スクロールバーを使って下にスクロールしてください

2. **「Build and Deployment」に移動**
   - 左サイドバーの「Build and Deployment」をクリック
   - こちらに確実に「Root Directory」の設定があります

## ⚠️ 注意事項

- 「Root Directory」は空欄のままにしないでください
- `blog-writer-app` と入力する際、前後にスペースを入れないでください
- 設定を変更した後は、必ず「Save」ボタンをクリックしてください

## 📝 確認チェックリスト

設定が完了したら、以下を確認：

- [ ] 「Build and Deployment」タブを開いた
- [ ] 「Root Directory」セクションを見つけた
- [ ] `blog-writer-app` を入力した
- [ ] 「Save」ボタンをクリックした
- [ ] 再デプロイが開始された（または手動で再デプロイした）
- [ ] デプロイが完了した
- [ ] URLにアクセスしてランディングページが表示された

---

**作成日**: 2025年1月27日  
**バージョン**: 1.0

