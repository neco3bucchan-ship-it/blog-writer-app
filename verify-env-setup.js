// 環境変数設定確認スクリプト
// このスクリプトは、.env.localファイルの存在と内容を確認します

const fs = require('fs');
const path = require('path');

console.log('🔍 環境変数設定状況の確認\n');
console.log('='.repeat(50));

const envLocalPath = path.join(__dirname, '.env.local');
const envPath = path.join(__dirname, '.env');

// 必要な環境変数
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_GEMINI_API_KEY'
];

// 環境変数ファイルの存在確認
console.log('\n📁 環境変数ファイルの確認:');
const envLocalExists = fs.existsSync(envLocalPath);
const envExists = fs.existsSync(envPath);

console.log(`  .env.local: ${envLocalExists ? '✅ 存在' : '❌ 存在しない'}`);
console.log(`  .env: ${envExists ? '✅ 存在' : '❌ 存在しない'}`);

// .env.localファイルの内容確認
if (envLocalExists) {
  console.log('\n📄 .env.localファイルの内容確認:');
  try {
    const content = fs.readFileSync(envLocalPath, 'utf-8');
    const lines = content.split('\n');
    
    // 環境変数の抽出
    const envVars = {};
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          envVars[key.trim()] = value;
        }
      }
    });
    
    // 必要な環境変数の確認
    console.log('\n🔑 環境変数の設定状況:');
    let allSet = true;
    let hasPlaceholder = false;
    
    requiredEnvVars.forEach(envVar => {
      const value = envVars[envVar];
      if (value) {
        // プレースホルダーのチェック
        const isPlaceholder = 
          value.includes('your-') || 
          value.includes('placeholder') ||
          value === 'your_gemini_api_key_here' ||
          value === 'your_supabase_project_url';
        
        if (isPlaceholder) {
          console.log(`  ⚠️  ${envVar}: プレースホルダーが設定されています`);
          console.log(`     値: ${value.substring(0, 50)}...`);
          hasPlaceholder = true;
        } else {
          // 値の一部のみ表示（セキュリティのため）
          const displayValue = value.length > 30 
            ? value.substring(0, 30) + '...' 
            : value;
          console.log(`  ✅ ${envVar}: 設定済み (${displayValue})`);
        }
      } else {
        console.log(`  ❌ ${envVar}: 設定されていません`);
        allSet = false;
      }
    });
    
    // 総合評価
    console.log('\n📊 確認結果:');
    if (allSet && !hasPlaceholder) {
      console.log('  ✅ すべての環境変数が正しく設定されています');
      console.log('  ✅ プレースホルダーは見つかりませんでした');
    } else if (hasPlaceholder) {
      console.log('  ⚠️  プレースホルダーが残っています');
      console.log('     実際の値に置き換えてください');
    } else {
      console.log('  ❌ 一部の環境変数が設定されていません');
    }
    
  } catch (error) {
    console.log(`  ❌ ファイルの読み込みエラー: ${error.message}`);
  }
} else {
  console.log('\n⚠️  .env.localファイルが見つかりません');
  console.log('     以下の手順でファイルを作成してください:');
  console.log('\n1. blog-writer-appフォルダに.env.localファイルを作成');
  console.log('2. 以下の内容を記述:');
  console.log('\n# Supabase設定');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here');
  console.log('\n# Google Gemini API設定');
  console.log('NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key-here');
  console.log('\n3. 実際の値に置き換える');
  console.log('4. ファイルを保存（UTF-8エンコーディング）');
}

console.log('\n' + '='.repeat(50));
console.log('\n📝 参考情報:');
console.log('  - Supabase設定: Docs/05_Supabase設定手順書.md');
console.log('  - Gemini API設定: Docs/09_Gemini_API設定手順書.md');
console.log('  - 環境変数レポート: ENV_STATUS_REPORT.md');



