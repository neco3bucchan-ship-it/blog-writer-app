# 🚀 開発サーバー起動手順

## ⚡ 今すぐ起動する方法

### VS Codeの統合ターミナルを使用（推奨）

1. **VS Codeでターミナルを開く**
   - `Ctrl + Shift + `` (バッククォート) を押す
   - または、メニューから「ターミナル」>「新しいターミナル」

2. **以下のコマンドを実行**
   ```powershell
   cd blog-writer-app
   npm run dev
   ```

3. **サーバーが起動したら**
   - ブラウザで `http://localhost:3000` にアクセス
   - 以下のメッセージが表示されれば成功:
     ```
     ▲ Next.js 15.2.4
     - Local:        http://localhost:3000
     ```

## クイックスタート

### PowerShellで起動する場合

1. **ターミナルを開く**
   - VS Codeの統合ターミナルを使用
   - または、PowerShellを直接開く

2. **プロジェクトディレクトリに移動**
   ```powershell
   cd blog-writer-app
   ```

3. **開発サーバーを起動**
   ```powershell
   npm run dev
   ```

4. **サーバーが起動したら**
   - ブラウザで `http://localhost:3000` にアクセス
   - 以下のメッセージが表示されれば成功:
     ```
     ▲ Next.js 15.2.4
     - Local:        http://localhost:3000
     ```

## トラブルシューティング

### 問題1: ポート3000が既に使用されている

**エラーメッセージ**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解決方法**:
```powershell
# ポート3000を使用しているプロセスを確認
netstat -ano | findstr :3000

# プロセスを停止（PIDを確認してから）
taskkill /PID <PID番号> /F

# または、別のポートで起動
npm run dev -- -p 3001
```

### 問題2: 依存関係がインストールされていない

**エラーメッセージ**:
```
Error: Cannot find module 'xxx'
```

**解決方法**:
```powershell
cd blog-writer-app
npm install
npm run dev
```

### 問題3: 環境変数が読み込まれない

**確認事項**:
- `.env.local`ファイルが`blog-writer-app`ディレクトリに存在するか
- ファイルがUTF-8エンコーディングで保存されているか
- サーバーを再起動したか

**解決方法**:
1. `.env.local`ファイルを確認
2. サーバーを停止（Ctrl+C）
3. サーバーを再起動

## サーバーの停止方法

- **ターミナルで**: `Ctrl + C` を押す
- **強制終了**: タスクマネージャーでNodeプロセスを終了

## 確認事項

サーバーが正常に起動しているか確認:

```powershell
# ポート3000が使用されているか確認
netstat -ano | findstr :3000

# Nodeプロセスが実行中か確認
Get-Process -Name node
```

## 次のステップ

サーバーが起動したら:
1. ブラウザで `http://localhost:3000` にアクセス
2. アプリケーションが表示されることを確認
3. エラーがないかブラウザのコンソール（F12）で確認

