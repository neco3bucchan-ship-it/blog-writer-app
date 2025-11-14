# 🔧 Vercel Install Command設定手順

## 現在の状況

「Production Overrides」セクションが展開されていて、「Install Command」のテキストフィールドが空欄になっています。
「Project Settings」セクションは折りたたまれています。

## ✅ 設定手順

### 方法1: 「Production Overrides」で設定（推奨・確実）

「Production Overrides」セクションが展開されているので、こちらで設定する方が確実です。

#### Step 1: 「Production Overrides」の「Install Command」に入力

1. **「Production Overrides」セクションを確認**
   - 既に展開されているはずです
   - 「Install Command」というラベルの付いたテキストフィールドを探してください

2. **「Install Command」テキストフィールドに入力**
   - テキストフィールドをクリック
   - 以下を入力：
     ```
     npm install --legacy-peer-deps
     ```

3. **入力できない場合の対処**
   - テキストフィールドがグレーアウトされている場合：
     - テキストフィールドの右側に「Override」トグルスイッチがあるか確認
     - 「Override」トグルをオン（青）にする
     - その後、テキストフィールドに入力できるようになります

4. **保存**
   - ページ下部の「Save」ボタンをクリック
   - または、セクション内の「Save」ボタンをクリック

### 方法2: 「Project Settings」で設定

#### Step 1: 「Project Settings」セクションを展開

1. **「Project Settings」セクションを探す**
   - 「Production Overrides」セクションの下にあります
   - 右向きの矢印アイコン（▶）が表示されているはずです

2. **セクションをクリックして展開**
   - 「Project Settings」というタイトルをクリック
   - セクションが展開され、下向きの矢印アイコン（▼）に変わります

#### Step 2: 「Build and Development Settings」を探す

1. **展開されたセクション内を確認**
   - 「Framework Preset」「Build Command」「Output Directory」などの設定項目が表示されます

2. **「Install Command」を探す**
   - 「Build and Development Settings」セクション内に「Install Command」があるはずです
   - 見つからない場合は、さらに下にスクロールしてください

#### Step 3: 「Install Command」を設定

1. **「Install Command」テキストフィールドを探す**
   - 「Install Command」というラベルの付いたテキストフィールドを探してください

2. **テキストフィールドに入力**
   - テキストフィールドをクリック
   - 以下を入力：
     ```
     npm install --legacy-peer-deps
     ```

3. **入力できない場合の対処**
   - テキストフィールドがグレーアウトされている場合：
     - テキストフィールドの右側に「Override」トグルスイッチがあるか確認
     - 「Override」トグルをオン（青）にする
     - その後、テキストフィールドに入力できるようになります

4. **保存**
   - ページ下部の「Save」ボタンをクリック
   - または、セクション内の「Save」ボタンをクリック

## 🔍 トラブルシューティング

### 問題1: テキストフィールドが入力できない

**原因:** 「Override」トグルがオフになっている

**解決方法:**
1. テキストフィールドの右側にある「Override」トグルスイッチを探す
2. トグルをオン（青）にする
3. その後、テキストフィールドに入力できるようになります

### 問題2: 「Project Settings」セクションが見つからない

**解決方法:**
1. ページを下にスクロール
2. 「Production Overrides」セクションの下に「Project Settings」セクションがあるはずです
3. セクションタイトルをクリックして展開

### 問題3: 「Install Command」が見つからない

**解決方法:**
1. 「Build and Development Settings」セクションを探す
2. セクション内を下にスクロール
3. 「Install Command」は「Build Command」や「Output Directory」の近くにあるはずです

### 問題4: 「Save」ボタンがグレーアウトしている

**原因:** 変更が保存されていない、または変更がない

**解決方法:**
1. テキストフィールドに値を入力
2. テキストフィールドの外をクリック（フォーカスを外す）
3. 「Save」ボタンが有効（青）になるはずです

## 📝 推奨される手順

1. **「Production Overrides」セクションで設定（推奨）**
   - 既に展開されているので、こちらで設定する方が簡単です
   - 「Install Command」テキストフィールドに `npm install --legacy-peer-deps` を入力
   - 「Override」トグルがオンになっていることを確認
   - 「Save」ボタンをクリック

2. **再デプロイ**
   - 「Deployments」タブで再デプロイを実行
   - ビルドログで `npm install --legacy-peer-deps` が実行されることを確認

## ⚠️ 重要なポイント

- **「Production Overrides」で設定した場合:**
  - プロダクション環境でのみ適用されます
  - 警告バナーが表示される場合がありますが、問題ありません

- **「Project Settings」で設定した場合:**
  - すべての環境（Production、Preview、Development）に適用されます
  - ただし、「Production Overrides」で上書きされている場合は、プロダクション環境では上書き設定が優先されます

## 🚀 次のステップ

設定を保存した後：

1. **再デプロイを実行**
   - 「Deployments」タブで再デプロイ

2. **ビルドログを確認**
   - `Running "install" command: npm install --legacy-peer-deps` が表示されることを確認

3. **ビルドが成功することを確認**
   - エラーが解消されていることを確認

---

**作成日**: 2025年1月27日  
**バージョン**: 1.0

